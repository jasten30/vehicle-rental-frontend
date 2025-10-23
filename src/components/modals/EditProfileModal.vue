<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Your Profile</h2>
          <button @click="$emit('close')" class="close-modal-button">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <!-- Step 1: Name & Profile Photo -->
          <div v-if="currentStep === 1">
            <p class="step-info-text">Update your name and profile picture.</p>
            
            <!-- NEW: Profile Photo Uploader -->
            <div class="form-group">
              <label>Profile Picture</label>
              <div class="profile-photo-uploader">
                <img :src="profilePhotoPreview" alt="Profile preview" class="photo-preview" @error="setDefaultAvatar"/>
                <div class="photo-buttons">
                  <input type="file" ref="fileInput" @change="onFileSelected" accept="image/png, image/jpeg" hidden>
                  <button type="button" @click="triggerFileInput" class="button-upload">
                    <i class="bi bi-camera-fill"></i> Change
                  </button>
                  <button v-if="profilePhotoPreview" type="button" @click="removeImage" class="button-remove">
                    <i class="bi bi-trash-fill"></i> Remove
                  </button>
                </div>
              </div>
            </div>
            <!-- END NEW -->

            <div class="name-grid">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input id="firstName" v-model="editableProfile.firstName" type="text" placeholder="Enter your first name" />
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input id="lastName" v-model="editableProfile.lastName" type="text" placeholder="Enter your last name" />
              </div>
            </div>
          </div>

          <!-- Step 2: Address -->
          <div v-if="currentStep === 2">
            <p class="step-info-text">Update your address.</p>
            <div class="form-group">
              <label for="address-brgy">Barangay</label>
              <input id="address-brgy" v-model="editableProfile.address.barangay" type="text" placeholder="e.g., Apas" />
            </div>
            <div class="form-group">
              <label for="address-city">City</label>
              <input id="address-city" v-model="editableProfile.address.city" type="text" placeholder="e.g., Cebu City" />
            </div>
          </div>

          <!-- Step 3: About -->
          <div v-if="currentStep === 3">
            <p class="step-info-text">Tell potential renters a little about yourself.</p>
            <div class="form-group">
              <label for="about">About</label>
              <textarea id="about" v-model="editableProfile.about" rows="5" placeholder="e.g., I'm a car enthusiast..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <div class="navigation-controls">
            <button v-if="currentStep > 1" @click="prevStep" class="nav-button secondary">Back</button>
            <button
              @click="nextStep"
              class="nav-button primary"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : nextButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'EditProfileModal',
  props: {
    isOpen: { type: Boolean, required: true },
    profileData: { type: Object, required: true },
  },
  emits: ['close', 'profile-updated'],
  data() {
    return {
      currentStep: 1,
      editableProfile: {
        firstName: '',
        lastName: '',
        address: { barangay: '', city: '' },
        about: '',
        profilePhotoUrl: null, // Track the URL (or null if removed)
      },
      profilePhotoPreview: null, // For displaying the image
      profilePhotoBase64: null, // For sending the new file data
      isSaving: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  computed: {
    nextButtonText() {
      if (this.currentStep === 3) return 'Save Changes';
      return 'Next';
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.populateEditForm(this.profileData);
        this.successMessage = '';
        this.errorMessage = '';
        this.currentStep = 1;
      }
    },
  },
  methods: {
    ...mapActions(['updateUserProfile']),
    
    getDefaultAvatar() {
        return 'https://placehold.co/150x150/e2e8f0/666666?text=User'; // Default placeholder
    },
    
    setDefaultAvatar(event) {
        event.target.src = this.getDefaultAvatar();
    },

    populateEditForm(profileData) {
      this.editableProfile.firstName = profileData.firstName || '';
      this.editableProfile.lastName = profileData.lastName || '';
      this.editableProfile.about = profileData.about || '';
      this.editableProfile.profilePhotoUrl = profileData.profilePhotoUrl || null;

      // Set initial preview
      this.profilePhotoPreview = profileData.profilePhotoUrl || this.getDefaultAvatar();
      this.profilePhotoBase64 = null; // Clear any staged file

      if (typeof profileData.address === 'object' && profileData.address !== null) {
        this.editableProfile.address.barangay = profileData.address.barangay || '';
        this.editableProfile.address.city = profileData.address.city || '';
      } else {
        this.editableProfile.address = { barangay: '', city: '' };
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate type and size (e.g., 2MB limit)
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file.';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'File is too large (Max 2MB).';
        return;
      }
      
      this.errorMessage = '';

      // Create local preview URL
      this.profilePhotoPreview = URL.createObjectURL(file);

      // Convert to Base64 for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhotoBase64 = e.target.result;
        this.editableProfile.profilePhotoUrl = null; // Clear old URL, new one will be sent
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
        this.profilePhotoPreview = this.getDefaultAvatar(); // Set to default placeholder
        this.profilePhotoBase64 = null; // Clear staged file
        this.editableProfile.profilePhotoUrl = null; // Mark for removal on save
    },

    nextStep() {
      this.successMessage = '';
      this.errorMessage = '';
      if (this.currentStep < 3) {
        this.currentStep++;
      } else {
        this.saveProfile();
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async saveProfile() {
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';

      // Prepare payload
      const payload = { ...this.editableProfile };
      
      if (this.profilePhotoBase64) {
        // If a new image was staged, send it
        payload.profilePhotoBase64 = this.profilePhotoBase64;
      }
      // 'payload.profilePhotoUrl' is already set to the original URL or 'null' (if removed)
      // The backend will handle this.
      
      try {
        await this.updateUserProfile(payload);
        this.successMessage = 'Profile updated successfully!';
        this.$emit('profile-updated'); // Tell parent to refetch profile
        
        // Reset base64 data after successful save
        this.profilePhotoBase64 = null; 
        
        setTimeout(() => this.$emit('close'), 1500);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to update profile.';
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  width: 100%; max-width: 500px; background: white;
  border-radius: $border-radius-lg; box-shadow: $shadow-medium;
  overflow: hidden; display: flex; flex-direction: column;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem; border-bottom: 1px solid $border-color;
  h2 { margin: 0; font-size: 1.5rem; }
}
.close-modal-button {
  background: none; border: none; font-size: 2rem;
  line-height: 1; color: $text-color-medium; cursor: pointer;
  &:hover { color: $text-color-dark; }
}
.modal-body {
  padding: 1.5rem;
}
.modal-footer {
  padding: 1.5rem; background-color: #f9fafb;
  border-top: 1px solid $border-color;
}
.step-info-text {
  font-size: 1rem; color: $text-color-medium;
  margin-bottom: 1.5rem; text-align: center;
}
.name-grid {
  display: flex; gap: 1rem;
}
.form-group {
  margin-bottom: 1.25rem; flex: 1;
  label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
  input, textarea {
    width: 100%; padding: 0.75rem; border: 1px solid $border-color;
    border-radius: $border-radius-sm; font-size: 1rem; font-family: inherit;
  }
  textarea { resize: vertical; min-height: 120px; }
}

/* --- New Profile Photo Styles --- */
.profile-photo-uploader {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.photo-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $border-color;
  background-color: $background-light;
}
.photo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.button-upload, .button-remove {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}
.button-upload {
  background-color: $card-background;
  color: $text-color-dark;
  &:hover {
    background-color: #f3f4f6;
  }
}
.button-remove {
  background: none;
  border: none;
  color: $text-color-medium;
  padding: 0.25rem;
  &:hover {
    color: $admin-color;
  }
}
/* --- End New Styles --- */

.navigation-controls {
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
}
.nav-button {
  padding: 0.75rem; font-size: 1rem; font-weight: 600;
  border: none; border-radius: $border-radius-md; cursor: pointer; flex: 1;
  &.primary { background-color: $primary-color; color: white; }
  &.secondary { background-color: #e5e7eb; color: $text-color-dark; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
}
.success-message, .error-message {
  text-align: center; margin-bottom: 1rem; font-weight: 500;
}
.success-message { color: $secondary-color; }
.error-message { color: $admin-color; }
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
