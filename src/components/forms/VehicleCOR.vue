<template>
  <div class="form-step-container">
    <h3>Vehicle Certificate of Registration (CR)</h3>
    
    <!-- ADDED: Plate Number Input -->
    <div class="form-group">
      <label for="plateNumber">Plate Number</label>
      <input
        type="text"
        id="plateNumber"
        v-model="localVehicleCOR.plateNumber"
        placeholder="e.g., ABC 1234"
        required
        @input="emitUpdate"
      />
    </div>

    <!-- Existing File Uploader -->
    <div class="form-group upload-section">
      <label for="cor-upload">Upload CR Photo</label>
      <div class="upload-area" @click="triggerFileInput">
        <div v-if="!imagePreview" class="upload-prompt">
          <i class="bi bi-cloud-arrow-up-fill"></i>
          <span>Click to upload image of CR</span>
        </div>
        <img v-else :src="imagePreview" alt="CR Preview" class="image-preview" />
      </div>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept="image/png, image/jpeg, image/jpg"
        class="hidden-file-input"
      />
    </div>

    <div v-if="showNavigation" class="navigation-buttons">
      <button type="button" @click="$emit('prev')" class="nav-button secondary">Previous</button>
      <button type="button" @click="nextStep" class="nav-button primary">Next</button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleCOR',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'next', 'prev', 'error'],
  data() {
    return {
      // Use local data to manage component state
      localVehicleCOR: { 
        plateNumber: this.modelValue?.plateNumber || '',
        corImage: this.modelValue?.corImage || null,
      },
      imagePreview: this.modelValue?.corImage || null,
      error: '',
    };
  },
  watch: {
    // Watch for prop changes to update local data
    modelValue(newVal) {
      this.localVehicleCOR.plateNumber = newVal.plateNumber || '';
      this.localVehicleCOR.corImage = newVal.corImage || null;
      this.imagePreview = newVal.corImage || null;
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Add file validation
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.error = "File is too large (Max 2MB).";
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        this.error = "Invalid file type. Please use PNG, JPG, or JPEG.";
        return;
      }
      this.error = '';

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
        this.localVehicleCOR.corImage = e.target.result; // This is the Base64 string
        this.emitUpdate();
      };
      reader.readAsDataURL(file);
    },
    emitUpdate() {
      // Emit the full local data object back to the parent
      this.$emit('update:modelValue', this.localVehicleCOR);
    },
    nextStep() {
      // Validate both fields before proceeding
      if (this.localVehicleCOR.plateNumber && this.localVehicleCOR.corImage) {
        this.$emit('next');
        this.error = '';
      } else {
        this.error = 'Please enter your plate number and upload the CR photo.';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-step-container {
  padding: 1.5rem 0;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: $text-color-dark;
}
.upload-area {
  border: 2px dashed $border-color;
  border-radius: $border-radius-lg;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #f9fafb;
    border-color: $primary-color;
  }
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
    font-weight: 500;
  }
}
.image-preview {
  max-width: 100%;
  max-height: 250px;
  border-radius: $border-radius-md;
  object-fit: contain;
}
.hidden-file-input {
  display: none;
}
.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.nav-button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  border: none;
  cursor: pointer;
  &.primary {
    background-color: $primary-color;
    color: white;
  }
  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
  }
}

/* Copied from DriversLicense.vue for consistency */
input[type='text'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: $border-radius-sm;
  font-size: 1rem;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}
.error-message {
  color: #ef4444;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>
