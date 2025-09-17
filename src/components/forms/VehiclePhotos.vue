<template>
  <div class="form-section">
    <h3 class="step-title">Vehicle Photos</h3>
    <p class="step-info-text">
      Upload clear photos of your vehicle to attract renters. A profile photo is
      required.
    </p>

    <div class="photo-upload-section">
      <label>Vehicle Profile Photo</label>
      <p class="section-description">
        This will be the main image for your vehicle listing.
      </p>
      <div
        class="profile-upload-area"
        @click="openFilePicker('profile')"
        :class="{ 'has-image': localVehicle.profilePhotoUrl }"
      >
        <input
          ref="profilePhotoInput"
          type="file"
          @change="handleFileUpload($event, 'profile')"
          accept="image/*"
          class="hidden-file-input"
        />
        <img
          v-if="localVehicle.profilePhotoUrl"
          :src="localVehicle.profilePhotoUrl"
          alt="Profile Photo Preview"
          class="profile-photo-preview"
        />
        <div v-else class="upload-prompt">
          <i class="bi bi-camera-fill"></i>
          <span>Click to upload a profile photo</span>
        </div>
        <button
          v-if="localVehicle.profilePhotoUrl"
          @click.stop="removePhoto('profile')"
          class="remove-btn top-right"
        >
          &times;
        </button>
      </div>
    </div>

    <div class="photo-upload-section">
      <label>Exterior Photos</label>
      <p class="section-description">
        Upload at least one photo of your car's exterior.
      </p>
      <div class="gallery-grid">
        <div
          v-for="(photo, index) in localVehicle.exteriorPhotos"
          :key="`ext-${index}`"
          class="photo-card"
        >
          <img :src="photo" alt="Exterior Photo" class="photo-preview" />
          <button
            @click.stop="removePhoto('exterior', index)"
            class="remove-btn"
          >
            &times;
          </button>
        </div>
        <div class="gallery-upload-box" @click="openFilePicker('exterior')">
          <input
            ref="exteriorPhotoInput"
            type="file"
            @change="handleFileUpload($event, 'exterior')"
            accept="image/*"
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

    <div class="photo-upload-section">
      <label>Interior Photos</label>
      <p class="section-description">
        Upload at least one photo of your car's interior.
      </p>
      <div class="gallery-grid">
        <div
          v-for="(photo, index) in localVehicle.interiorPhotos"
          :key="`int-${index}`"
          class="photo-card"
        >
          <img :src="photo" alt="Interior Photo" class="photo-preview" />
          <button
            @click.stop="removePhoto('interior', index)"
            class="remove-btn"
          >
            &times;
          </button>
        </div>
        <div class="gallery-upload-box" @click="openFilePicker('interior')">
          <input
            ref="interiorPhotoInput"
            type="file"
            @change="handleFileUpload($event, 'interior')"
            accept="image/*"
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

    <div v-if="showNavigation" class="button-group">
      <button
        type="button"
        @click="$emit('prev')"
        class="button secondary-button"
      >
        Previous
      </button>
      <button
        type="button"
        @click="nextStep"
        class="button primary-button"
        :disabled="!isStepComplete"
      >
        Next
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehiclePhotos',
  props: {
    modelValue: { type: Object, required: true },
    // NEW: Prop to control button visibility
    showNavigation: { type: Boolean, default: true },
  },
  // NEW: Emits for navigation
  emits: ['next', 'prev', 'update:modelValue'],
  data() {
    return {
      localVehicle: {
        profilePhotoUrl: null,
        exteriorPhotos: [],
        interiorPhotos: [],
      },
      error: '',
    };
  },
  computed: {
    // NEW: Computed property to validate the step
    isStepComplete() {
      return (
        this.localVehicle.profilePhotoUrl &&
        this.localVehicle.exteriorPhotos.length > 0 &&
        this.localVehicle.interiorPhotos.length > 0
      );
    },
  },
  watch: {
    modelValue: {
      handler(newVal) {
        if (newVal) {
          this.localVehicle.profilePhotoUrl = newVal.profilePhotoUrl || null;
          this.localVehicle.exteriorPhotos = newVal.exteriorPhotos || [];
          this.localVehicle.interiorPhotos = newVal.interiorPhotos || [];
        }
      },
      deep: true,
      immediate: true,
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

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (type === 'profile') {
            this.localVehicle.profilePhotoUrl = e.target.result;
          } else if (type === 'exterior') {
            this.localVehicle.exteriorPhotos.push(e.target.result);
          } else if (type === 'interior') {
            this.localVehicle.interiorPhotos.push(e.target.result);
          }
          this.emitUpdate();
        };
        reader.readAsDataURL(file);
      });
    },
    removePhoto(type, index = null) {
      if (type === 'profile') {
        this.localVehicle.profilePhotoUrl = null;
      } else if (type === 'exterior') {
        this.localVehicle.exteriorPhotos.splice(index, 1);
      } else if (type === 'interior') {
        this.localVehicle.interiorPhotos.splice(index, 1);
      }
      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit('update:modelValue', this.localVehicle);
    },
    // NEW: Method to handle validation and emit 'next'
    nextStep() {
      if (!this.isStepComplete) {
        this.error = 'Please upload a profile, exterior, and interior photo.';
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

.form-section {
  padding-bottom: 1.5rem;
}
.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.step-info-text {
  color: $text-color-medium;
  margin-bottom: 2rem;
}
.photo-upload-section {
  margin-bottom: 2.5rem;
  label {
    display: block;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
}
.section-description {
  color: $text-color-medium;
  margin-bottom: 1rem;
}
.profile-upload-area {
  width: 100%;
  height: 250px;
  border: 2px dashed $border-color;
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
    background-color: #f9fafb;
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
  padding-top: 75%;
  border-radius: $border-radius-md;
  overflow: hidden;
  box-shadow: $shadow-light;
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
  padding-top: 75%;
  border-radius: $border-radius-md;
  border: 2px dashed $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
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
  }
}
.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(239, 68, 68, 0.8);
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
  &:hover {
    background-color: #ef4444;
  }
  &.top-right {
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    font-size: 1.25rem;
  }
}
.hidden-file-input {
  display: none;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.primary-button {
  background-color: $primary-color;
  color: white;
}
.secondary-button {
  background-color: #6b7280;
  color: white;
}
.error-message {
  color: $admin-color;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>