<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Vehicle Official Receipt (OR)</h3>
      <p class="step-info-text">
        Please upload a clear photo of your vehicle's most recent Official Receipt.
      </p>

      <div class="form-group upload-section">
        <label for="or-upload">OR Photo</label>
        <div class="upload-area" @click="triggerFileInput" :class="{ 'has-image': imagePreview }">
          <div v-if="!imagePreview" class="upload-prompt">
            <i class="bi bi-cloud-arrow-up-fill"></i>
            <span>Click to upload image of OR</span>
            <span class="file-info">PNG, JPG, or JPEG (Max 2MB)</span>
          </div>
          <img v-else :src="imagePreview" alt="OR Preview" class="image-preview" />
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          accept="image/png, image/jpeg, image/jpg"
          class="hidden-file-input"
        />
        <!-- Add a remove button -->
        <button v-if="imagePreview" @click="removeImage" class="button remove-button" type="button">
            <i class="bi bi-x-lg"></i> Remove Image
        </button>
      </div>

      <div v-if="showNavigation" class="navigation-buttons">
        <button type="button" @click="$emit('prev')" class="nav-button secondary">Previous</button>
        <button type="button" @click="nextStep" class="nav-button primary">Next</button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'VehicleOR',
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
      localOR: { 
        orImage: this.modelValue?.orImage || null,
        // Add other OR fields here if needed, e.g., orNumber: this.modelValue?.orNumber || ''
      },
      imagePreview: this.modelValue?.orImage || null,
      error: '',
    };
  },
  watch: {
    // Watch for prop changes to update local data
    modelValue(newVal) {
      this.localOR.orImage = newVal.orImage || null;
      this.imagePreview = newVal.orImage || null;
    }
  },
  methods: {
    triggerFileInput() {
      // Only trigger if no image is present
      if (!this.imagePreview) {
          this.$refs.fileInput.click();
      }
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
        this.localOR.orImage = e.target.result; // This is the Base64 string
        this.emitUpdate();
      };
      reader.onerror = () => {
          this.error = "Failed to read file.";
      };
      reader.readAsDataURL(file);
    },
    removeImage() {
        this.imagePreview = null;
        this.localOR.orImage = null;
        this.$refs.fileInput.value = null; // Clear file input
        this.emitUpdate();
    },
    emitUpdate() {
      // Emit the full local data object back to the parent
      this.$emit('update:modelValue', this.localOR);
    },
    nextStep() {
      // Validate field before proceeding
      if (this.localOR.orImage) {
        this.$emit('next');
        this.error = '';
      } else {
        this.error = 'Please upload the OR photo to continue.';
      }
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
  padding: 1.5rem 0;
}
.form-group {
  margin-bottom: 1.5rem;
}
h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: $text-color-dark;
  font-size: 0.9rem;
}
.upload-area {
  border: 1px solid $border-color-light; /* Solid border */
  background-color: $background-light; /* Light background */
  border-radius: $border-radius-lg;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: #f0f0f0;
    border-color: $primary-color;
  }
  
  &.has-image {
    border-color: $primary-color;
    padding: 0; // Remove padding when image is shown
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
    font-weight: 600;
    font-size: 1rem;
  }
  .file-info {
      font-size: 0.8rem;
      font-weight: 400;
  }
}
.image-preview {
  width: 100%;
  height: 100%;
  max-height: 300px;
  border-radius: $border-radius-lg;
  object-fit: contain; // Use contain for documents
}
.hidden-file-input {
  display: none;
}
.remove-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: $admin-color;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
    padding: 0.25rem;
    font-size: 0.85rem;
    &:hover {
        text-decoration: underline;
    }
    i {
        font-size: 0.8rem;
    }
}
.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}
/* Updated to match parent form styles */
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
