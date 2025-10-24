<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Vehicle Photos</h3>
      <p class="step-info-text">
        Upload clear photos of your vehicle to attract renters. A profile photo and at least one of each other type is required.
      </p>

      <!-- Profile Photo Section -->
      <div class="photo-upload-section">
        <label>Vehicle Profile Photo</label>
        <p class="section-description">
          This will be the main image for your vehicle listing.
        </p>
        <div
          class="profile-upload-area"
          @click="openFilePicker('profile')"
          :class="{ 'has-image': profilePhotoUrl }"
        >
          <input
            ref="profilePhotoInput"
            type="file"
            @change="handleFileUpload($event, 'profile')"
            accept="image/png, image/jpeg, image/jpg"
            class="hidden-file-input"
          />
          <img
            v-if="profilePhotoUrl"
            :src="profilePhotoUrl"
            alt="Profile Photo Preview"
            class="profile-photo-preview"
          />
          <div v-else class="upload-prompt">
            <i class="bi bi-camera-fill"></i>
            <span>Click to upload a profile photo</span>
            <span class="file-info">PNG, JPG, or JPEG (Max 2MB)</span>
          </div>
          <button
            v-if="profilePhotoUrl"
            @click.stop="removePhoto('profile')"
            class="remove-btn top-right"
            type="button"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Exterior Photos Section -->
      <div class="photo-upload-section">
        <label>Exterior Photos</label>
        <p class="section-description">
          Upload at least one photo of your car's exterior.
        </p>
        <div class="gallery-grid">
          <div
            v-for="(photo, index) in exteriorPhotos"
            :key="`ext-${index}`"
            class="photo-card"
          >
            <img :src="photo" alt="Exterior Photo" class="photo-preview" />
            <button
              @click.stop="removePhoto('exterior', index)"
              class="remove-btn"
              type="button"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="gallery-upload-box" @click="openFilePicker('exterior')">
            <input
              ref="exteriorPhotoInput"
              type="file"
              @change="handleFileUpload($event, 'exterior')"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              class="hidden-file-input"
            />
            <div class="upload-prompt-small">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Add Photos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Interior Photos Section -->
      <div class="photo-upload-section">
        <label>Interior Photos</label>
        <p class="section-description">
          Upload at least one photo of your car's interior.
        </p>
        <div class="gallery-grid">
          <div
            v-for="(photo, index) in interiorPhotos"
            :key="`int-${index}`"
            class="photo-card"
          >
            <img :src="photo" alt="Interior Photo" class="photo-preview" />
            <button
              @click.stop="removePhoto('interior', index)"
              class="remove-btn"
              type="button"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="gallery-upload-box" @click="openFilePicker('interior')">
            <input
              ref="interiorPhotoInput"
              type="file"
              @change="handleFileUpload($event, 'interior')"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              class="hidden-file-input"
            />
            <div class="upload-prompt-small">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Add Photos</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Navigation Buttons -->
      <div v-if="showNavigation" class="navigation-buttons">
        <button
          type="button"
          @click="$emit('prev')"
          class="nav-button secondary"
        >
          Previous
        </button>
        <button
          type="button"
          @click="nextStep"
          class="nav-button primary"
          :disabled="!isStepComplete"
        >
          Next
        </button>
      </div>

    </div>
  </transition>
</template>

<script>
export default {
  name: 'VehiclePhotos',
  props: {
    // UPDATED: Changed to match parent v-model
    profilePhotoUrl: String,
    exteriorPhotos: Array,
    interiorPhotos: Array,
    showNavigation: { type: Boolean, default: true },
  },
  // UPDATED: Emits to match parent v-model
  emits: ['update:profilePhotoUrl', 'update:exteriorPhotos', 'update:interiorPhotos', 'next', 'prev', 'error'],
  data() {
    return {
      error: '',
    };
  },
  computed: {
    isStepComplete() {
      // Validation now reads from props
      return (
        this.profilePhotoUrl &&
        this.exteriorPhotos.length > 0 &&
        this.interiorPhotos.length > 0
      );
    },
  },
  methods: {
    openFilePicker(type) {
      if (type === 'profile') this.$refs.profilePhotoInput.click();
      else if (type === 'exterior') this.$refs.exteriorPhotoInput.click();
      else if (type === 'interior') this.$refs.interiorPhotoInput.click();
    },

    handleFileUpload(event, type) {
      const files = event.target.files;
      if (!files) return;
      this.error = ''; // Clear old errors

      // Helper function to validate and read a file
      const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
            return reject(new Error(`File ${file.name} is too large (Max 2MB).`));
          }
          if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            return reject(new Error(`File ${file.name} is not a valid image type.`));
          }
          
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          // 👇 UPDATED: Changed 'e' to '_e' to fix ESLint error
          reader.onerror = (_e) => reject(new Error("Failed to read file."));
          reader.readAsDataURL(file);
        });
      };
      
      // Process profile photo
      if (type === 'profile') {
        readFileAsBase64(files[0]).then(base64 => {
          this.$emit('update:profilePhotoUrl', base64);
        }).catch(err => { this.error = err.message; });
      } 
      
      // Process gallery photos
      else {
        Promise.all(Array.from(files).map(readFileAsBase64))
          .then(base64Array => {
            if (type === 'exterior') {
              this.$emit('update:exteriorPhotos', [...this.exteriorPhotos, ...base64Array]);
            } else if (type === 'interior') {
              this.$emit('update:interiorPhotos', [...this.interiorPhotos, ...base64Array]);
            }
          }).catch(err => { this.error = err.message; });
      }

      // Clear the file input
      event.target.value = null;
    },

    removePhoto(type, index = null) {
      if (type === 'profile') {
        this.$emit('update:profilePhotoUrl', null);
      } else if (type === 'exterior') {
        const newPhotos = [...this.exteriorPhotos];
        newPhotos.splice(index, 1);
        this.$emit('update:exteriorPhotos', newPhotos);
      } else if (type === 'interior') {
        const newPhotos = [...this.interiorPhotos];
        newPhotos.splice(index, 1);
        this.$emit('update:interiorPhotos', newPhotos);
      }
    },
    
    nextStep() {
      if (!this.isStepComplete) {
        this.error = 'Please upload at least one profile, exterior, and interior photo to continue.';
        return;
      }
      this.error = '';
      this.$emit('next');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* --- Entrance Animation --- */
.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.form-step-fade-enter-from,
.form-step-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.form-step-container {
  padding: 1rem 0;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.step-info-text, .section-description {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.section-description {
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.photo-upload-section {
  margin-bottom: 2.5rem;
  label {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: $text-color-dark;
  }
}

.profile-upload-area {
  width: 100%;
  height: 250px;
  border: 1px solid $border-color-light;
  background-color: $background-light;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  &:hover {
    border-color: $primary-color;
    background-color: #f0f0f0;
  }
  &.has-image {
    border-style: solid;
  }
}

.profile-photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: $text-color-medium;
  i {
    font-size: 2.5rem;
    color: $primary-color;
  }
  span {
    font-weight: 600;
    font-size: 1rem;
  }
  .file-info {
      font-size: 0.8rem;
      font-weight: 400;
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.photo-card {
  position: relative;
  width: 100%;
  padding-top: 100%; // 1:1 Aspect ratio for gallery thumbs
  border-radius: $border-radius-md;
  overflow: hidden;
  box-shadow: $shadow-light;
  border: 1px solid $border-color-light;
}

.photo-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-upload-box {
  width: 100%;
  padding-top: 100%; // 1:1 Aspect ratio
  border-radius: $border-radius-md;
  border: 2px dashed $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 120px; // Ensure it's tall enough
  &:hover {
    border-color: $primary-color;
    background-color: #f9fafb;
  }
}

.upload-prompt-small {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: $text-color-medium;
  i {
    font-size: 1.75rem;
    color: $primary-color;
  }
  span {
      font-size: 0.8rem;
      font-weight: 500;
  }
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background-color 0.2s;
  z-index: 10;
  i {
    font-size: 0.8rem;
  }
  &:hover {
    background-color: $admin-color;
  }
  &.top-right { // For the main profile photo
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    font-size: 1.25rem;
     i { font-size: 1rem; }
  }
}

.hidden-file-input {
  display: none;
}

.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}

.nav-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px;
  text-align: center;
  
  &.primary {
    background-color: $primary-color;
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
      box-shadow: $shadow-medium;
    }
  }
  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $border-color;
    &:hover {
      color: $text-color-dark;
      background-color: $background-light;
    }
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.error-message {
  color: $admin-color;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>

