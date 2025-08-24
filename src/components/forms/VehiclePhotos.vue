<template>
  <div class="form-section step-11">
    <h3>Step 11: Vehicle Photos</h3>
    <p class="step-info-text">Upload clear photos of your vehicle's exterior and interior to attract more renters. You can upload multiple images.</p>
    
    <div class="photo-gallery-container">
      <!-- Existing Photos Gallery -->
      <div v-if="localVehicle.photos && localVehicle.photos.length > 0" class="photo-gallery">
        <div v-for="(photo, index) in localVehicle.photos" :key="index" class="photo-card">
          <img :src="photo" alt="Vehicle Photo" class="photo-preview" />
          <button @click.stop="removePhoto(index)" class="remove-btn">
            &times;
          </button>
        </div>
      </div>
      
      <!-- Upload Area -->
      <div class="upload-area" :class="{ 'has-image': localVehicle.photos && localVehicle.photos.length > 0 }" @click="openFilePicker">
        <input 
          ref="photoInput" 
          type="file" 
          id="vehiclePhotos" 
          @change="handleFileUpload" 
          accept="image/*" 
          multiple 
          class="hidden"
        >
        <div class="upload-placeholder" v-if="!localVehicle.photos || localVehicle.photos.length === 0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="upload-text">Click to upload photos</span>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="button-group">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button 
        type="button" 
        @click="nextStep" 
        class="button primary-button" 
        :disabled="!localVehicle.photos || localVehicle.photos.length === 0"
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
  },
  emits: ['next', 'prev', 'update:vehicle', 'error'],
  data() {
    return {
      localVehicle: {
        ...this.initialVehicle,
        photos: this.initialVehicle.photos || [],
      },
      error: '',
    };
  },
  watch: {
    initialVehicle: {
      handler(newVal) {
        this.localVehicle = { ...newVal, photos: newVal.photos || [] };
      },
      deep: true,
    },
  },
  created() {
    // Check if the old exterior/interior photo URLs exist and add them to the new photos array
    if (this.initialVehicle.exteriorPhotoUrl && (!this.localVehicle.photos || !this.localVehicle.photos.includes(this.initialVehicle.exteriorPhotoUrl))) {
      this.localVehicle.photos = [...this.localVehicle.photos, this.initialVehicle.exteriorPhotoUrl];
    }
    if (this.initialVehicle.interiorPhotoUrl && (!this.localVehicle.photos || !this.localVehicle.photos.includes(this.initialVehicle.interiorPhotoUrl))) {
      this.localVehicle.photos = [...this.localVehicle.photos, this.initialVehicle.interiorPhotoUrl];
    }
  },
  methods: {
    openFilePicker() {
      this.$refs.photoInput.click();
    },
    handleFileUpload(event) {
      this.error = '';
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.localVehicle.photos.push(e.target.result);
          this.emitUpdate(); // Emit the update after each file is loaded
        };
        reader.readAsDataURL(file);
      });
    },
    removePhoto(index) {
      this.localVehicle.photos.splice(index, 1);
      this.emitUpdate(); // Emit the update after a photo is removed
    },
    emitUpdate() {
      // Update the exterior and interior photo URLs before emitting
      const updatedVehicle = { ...this.localVehicle };
      updatedVehicle.exteriorPhotoUrl = this.localVehicle.photos[0] || '';
      updatedVehicle.interiorPhotoUrl = this.localVehicle.photos[1] || '';

      this.$emit('update:vehicle', updatedVehicle);
    },
    nextStep() {
      // Add the console.log here to check the photos array
      console.log('VehiclePhotos data before validation:', this.localVehicle.photos);

      if (!this.localVehicle.photos || this.localVehicle.photos.length === 0) {
        this.error = 'Please upload at least one photo to proceed.';
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

h3 {
  font-size: 1.5rem;
  color: $primary-color;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid $primary-color;
  padding-bottom: 0.5rem;
}

.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.photo-gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  height: 150px;
  
  &:hover {
    border-color: $primary-color;
  }
  
  &.has-image {
    border: 2px solid $primary-color;
  }
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
