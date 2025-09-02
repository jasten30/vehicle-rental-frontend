<template>
  <div class="form-section step-11">
    <h3>Vehicle Photos</h3>
    <p class="step-info-text">Upload clear photos of your vehicle's exterior and interior to attract more renters. A profile photo is required to display your vehicle in search results.</p>

    <div class="photo-section">
      <h4>Vehicle Profile Photo</h4>
      <p class="section-info">This photo will be the main image on your vehicle's listing card.</p>
      <div class="profile-photo-area upload-area" @click="openFilePicker('profile')">
        <input 
          ref="profilePhotoInput" 
          type="file" 
          id="profilePhoto" 
          @change="handleFileUpload($event, 'profile')" 
          accept="image/*" 
          class="hidden"
        >
        <div v-if="localVehicle.profilePhotoUrl" class="photo-card profile-photo-card">
          <img :src="localVehicle.profilePhotoUrl" alt="Vehicle Profile Photo" class="photo-preview profile-photo-preview" />
          <button @click.stop="removePhoto('profile')" class="remove-btn">&times;</button>
        </div>
        <div v-else class="upload-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="upload-text">Click to upload profile photo</span>
        </div>
      </div>
    </div>
    
    <div class="photo-section">
      <h4>Exterior Photos</h4>
      <p class="section-info">Upload photos of the car's exterior from different angles.</p>
      <div class="photo-gallery-container">
        <div v-if="localVehicle.exteriorPhotos && localVehicle.exteriorPhotos.length > 0" class="photo-gallery">
          <div v-for="(photo, index) in localVehicle.exteriorPhotos" :key="`ext-${index}`" class="photo-card">
            <img :src="photo" alt="Exterior Vehicle Photo" class="photo-preview" />
            <button @click.stop="removePhoto('exterior', index)" class="remove-btn">&times;</button>
          </div>
        </div>
        <div class="upload-area gallery-upload-area" @click="openFilePicker('exterior')">
          <input 
            ref="exteriorPhotoInput" 
            type="file" 
            id="exteriorPhotos" 
            @change="handleFileUpload($event, 'exterior')" 
            accept="image/*" 
            multiple 
            class="hidden"
          >
          <div class="upload-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="upload-text">Click to add exterior photos</span>
          </div>
        </div>
      </div>
    </div>

    <div class="photo-section">
      <h4>Interior Photos</h4>
      <p class="section-info">Upload photos of the car's interior, including the dashboard and seats.</p>
      <div class="photo-gallery-container">
        <div v-if="localVehicle.interiorPhotos && localVehicle.interiorPhotos.length > 0" class="photo-gallery">
          <div v-for="(photo, index) in localVehicle.interiorPhotos" :key="`int-${index}`" class="photo-card">
            <img :src="photo" alt="Interior Vehicle Photo" class="photo-preview" />
            <button @click.stop="removePhoto('interior', index)" class="remove-btn">&times;</button>
          </div>
        </div>
        <div class="upload-area gallery-upload-area" @click="openFilePicker('interior')">
          <input 
            ref="interiorPhotoInput" 
            type="file" 
            id="interiorPhotos" 
            @change="handleFileUpload($event, 'interior')" 
            accept="image/*" 
            multiple 
            class="hidden"
          >
          <div class="upload-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="upload-text">Click to add interior photos</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showNavigation" class="button-group">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button 
        type="button" 
        @click="nextStep" 
        class="button primary-button" 
        :disabled="!localVehicle.profilePhotoUrl || localVehicle.exteriorPhotos.length === 0 || localVehicle.interiorPhotos.length === 0"
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
    initialVehicle: {
      type: Object,
      required: true,
    },
    // Add the prop here
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['next', 'prev', 'update:vehicle', 'error'],
  data() {
    const initialVehicle = this.initialVehicle || {};
    return {
      localVehicle: {
        ...initialVehicle,
        profilePhotoUrl: initialVehicle.profilePhotoUrl || '',
        exteriorPhotos: initialVehicle.exteriorPhotos || [],
        interiorPhotos: initialVehicle.interiorPhotos || [],
      },
      error: '',
    };
  },
  watch: {
    initialVehicle: {
      handler(newVal) {
        const updatedVehicle = newVal || {};
        this.localVehicle = {
          ...updatedVehicle,
          profilePhotoUrl: updatedVehicle.profilePhotoUrl || '',
          exteriorPhotos: updatedVehicle.exteriorPhotos || [],
          interiorPhotos: updatedVehicle.interiorPhotos || [],
        };
      },
      deep: true,
    },
  },
  methods: {
    openFilePicker(type) {
      if (type === 'profile') {
        this.$refs.profilePhotoInput.click();
      } else if (type === 'exterior') {
        this.$refs.exteriorPhotoInput.click();
      } else if (type === 'interior') {
        this.$refs.interiorPhotoInput.click();
      }
    },
    handleFileUpload(event, type) {
      this.error = '';
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      Array.from(files).forEach(file => {
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
        this.localVehicle.profilePhotoUrl = '';
      } else if (type === 'exterior' && index !== null) {
        this.localVehicle.exteriorPhotos.splice(index, 1);
      } else if (type === 'interior' && index !== null) {
        this.localVehicle.interiorPhotos.splice(index, 1);
      }
      this.emitUpdate();
    },
    emitUpdate() {
      const updatedVehicle = {
        ...this.localVehicle,
        profilePhotoUrl: this.localVehicle.profilePhotoUrl,
        exteriorPhotos: this.localVehicle.exteriorPhotos,
        interiorPhotos: this.localVehicle.interiorPhotos,
      };
      this.$emit('update:vehicle', updatedVehicle);
    },
    nextStep() {
      if (!this.localVehicle.profilePhotoUrl) {
        this.error = 'Please upload a profile photo.';
      } else if (this.localVehicle.exteriorPhotos.length === 0) {
        this.error = 'Please upload at least one exterior photo.';
      } else if (this.localVehicle.interiorPhotos.length === 0) {
        this.error = 'Please upload at least one interior photo.';
      } else {
        this.$emit('next');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-section {
  padding: 1.5rem;
  border-radius: $border-radius-md;
  background-color: #f9fafb;
}

h3, h4 {
  font-size: 1.5rem;
  color: $primary-color;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid $primary-color;
}

h4 {
  font-size: 1.25rem;
  border-bottom: 1px solid lighten($primary-color, 30%);
}

.step-info-text, .section-info {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.photo-section {
  margin-bottom: 2rem;
}

.photo-gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.photo-card {
  position: relative;
  width: 100%;
  padding-top: 100%; // 1:1 Aspect Ratio
  border-radius: $border-radius-md;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
}

.photo-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-photo-area {
  height: 250px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: $border-radius-md;
  overflow: hidden;

  .profile-photo-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-top: 0;
    box-shadow: none;
    transform: none;
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
  width: 2rem;
  height: 2rem;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ef4444;
  }
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px dashed #d1d5db;
  border-radius: $border-radius-md;
  padding: 2rem;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    border-color: $primary-color;
  }
}

.gallery-upload-area {
  height: 150px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-text {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #6b7280;
}

.hidden {
  display: none;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: $border-radius-sm;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: #6b7280;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#6b7280, 10%);
  }
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>