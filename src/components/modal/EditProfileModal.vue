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
          <div v-if="currentStep === 1">
            <p class="step-info-text">Update your name.</p>
            <div class="name-grid">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  id="firstName"
                  v-model="editableProfile.firstName"
                  type="text"
                  placeholder="Enter your first name"
                />
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  id="lastName"
                  v-model="editableProfile.lastName"
                  type="text"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          <div v-if="currentStep === 2">
            <p class="step-info-text">Update your address.</p>
            <div class="form-group">
              <label for="address-brgy">Barangay</label>
              <input
                id="address-brgy"
                v-model="editableProfile.address.barangay"
                type="text"
                placeholder="e.g., Apas"
              />
            </div>
            <div class="form-group">
              <label for="address-city">City</label>
              <input
                id="address-city"
                v-model="editableProfile.address.city"
                type="text"
                placeholder="e.g., Cebu City"
              />
            </div>
          </div>

          <div v-if="currentStep === 3">
            <p class="step-info-text">
              Tell potential renters a little about yourself.
            </p>
            <div class="form-group">
              <label for="about">About</label>
              <textarea
                id="about"
                v-model="editableProfile.about"
                rows="5"
                placeholder="e.g., I'm a car enthusiast and keep my vehicles in top condition..."
              ></textarea>
            </div>
          </div>

          <div v-if="currentStep === 4">
            <p class="step-info-text">
              Verify your phone number for added security.
            </p>
            <div class="form-group">
              <label for="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                v-model="editableProfile.phoneNumber"
                type="text"
                placeholder="e.g., 09171234567"
              />
            </div>
            <div v-if="otpSent" class="form-group">
              <label for="otp-code">Verification Code</label>
              <input
                id="otp-code"
                v-model="otpCode"
                type="text"
                placeholder="123456"
                maxlength="6"
              />
            </div>
            <button
              v-if="!otpSent"
              @click="sendSmsOtp"
              class="action-button"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Sending...' : 'Send Verification Code' }}
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <p v-if="successMessage" class="success-message">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>
          <div class="navigation-controls">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="nav-button secondary"
            >
              Back
            </button>
            <button
              @click="nextStep"
              class="nav-button primary"
              :disabled="isSaving"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>{{ nextButtonText }}</span>
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
    isOpen: {
      type: Boolean,
      required: true,
    },
    profileData: {
      type: Object,
      required: true,
    },
  },
  emits: ['close', 'profile-updated'],
  data() {
    return {
      currentStep: 1,
      otpSent: false,
      otpCode: '',
      editableProfile: {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: {
          barangay: '',
          city: '',
        },
        about: '',
      },
      isSaving: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  computed: {
    nextButtonText() {
      if (this.currentStep === 4) {
        return 'Save Changes';
      }
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
        this.otpSent = false;
        this.otpCode = '';
      }
    },
  },
  methods: {
    ...mapActions(['updateUserProfile']),
    populateEditForm(data) {
      this.editableProfile.firstName = data.firstName || '';
      this.editableProfile.lastName = data.lastName || '';
      this.editableProfile.phoneNumber = data.phoneNumber || '';
      this.editableProfile.about = data.about || '';
      if (typeof data.address === 'object' && data.address !== null) {
        this.editableProfile.address.barangay = data.address.barangay || '';
        this.editableProfile.address.city = data.address.city || '';
      } else {
        this.editableProfile.address.barangay = '';
        this.editableProfile.address.city = '';
      }
    },
    nextStep() {
      if (this.currentStep < 4) {
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
    async sendSmsOtp() {
      this.isSaving = true;
      this.errorMessage = '';
      try {
        console.log(`Simulating sending SMS to ${this.editableProfile.phoneNumber}`);
        this.otpSent = true;
      } catch (error) {
        this.errorMessage = 'Failed to send SMS code.';
      } finally {
        this.isSaving = false;
      }
    },
    async saveProfile() {
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        console.log(`Simulating verifying OTP ${this.otpCode}`);

        const profileUpdate = {
          firstName: this.editableProfile.firstName,
          lastName: this.editableProfile.lastName,
          phoneNumber: this.editableProfile.phoneNumber,
          address: {
            barangay: this.editableProfile.address.barangay,
            city: this.editableProfile.address.city,
          },
          about: this.editableProfile.about,
        };

        await this.updateUserProfile(profileUpdate);
        this.successMessage = 'Profile updated successfully!';
        this.$emit('profile-updated');
        setTimeout(() => this.$emit('close'), 1500);
      } catch (error) {
        this.errorMessage = 'Failed to update profile. Please try again.';
        console.error('Error updating profile:', error);
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid $border-color;
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
}
.close-modal-button {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: $text-color-medium;
  cursor: pointer;
  &:hover {
    color: $text-color-dark;
  }
}
.modal-body {
  padding: 1.5rem;
}
.modal-footer {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid $border-color;
}
.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
  text-align: center;
}
.name-grid {
  display: flex;
  gap: 1rem;
}
.form-group {
  margin-bottom: 1.25rem;
  flex: 1;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    font-family: inherit;
  }
  textarea {
    resize: vertical;
    min-height: 120px;
  }
}
#otp-code {
  text-align: center;
  letter-spacing: 0.5em;
  font-size: 1.25rem;
}
.action-button {
  width: 100%;
  padding: 0.85rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.nav-button {
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  flex: 1;
  &.primary {
    background-color: $primary-color;
    color: white;
  }
  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
.success-message,
.error-message {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 500;
}
.success-message {
  color: $secondary-color;
}
.error-message {
  color: $admin-color;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>