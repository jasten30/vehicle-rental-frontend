<template>
  <div class="form-step-component">
    <h3 class="component-title">Selfie with ID</h3>
    <p class="component-description">
      Please upload a clear, well-lit photo of yourself holding your Driver's License next to your face. This helps us verify your identity.
    </p>
    <div class="image-uploader-box" @click="triggerFileInput">
      <input
        type="file"
        ref="fileInput"
        @change="onFileSelect"
        accept="image/png, image/jpeg"
        hidden
      />
      <img v-if="imagePreview" :src="imagePreview" alt="Selfie preview" class="image-preview" @error="setDefaultImage"/>
      <div v-else class="upload-placeholder">
        <i class="bi bi-person-badge-fill"></i>
        <span>Click to upload photo</span>
      </div>
    </div>
    <button
      v-if="imageBase64"
      type="button"
      @click.stop="removeImage"
      class="button-remove"
    >
      Remove Image
    </button>
  </div>
</template>

<script>
export default {
  name: 'SelfieWithID',
  props: {
    modelValue: { // v-model
      type: String,
      default: null,
    },
    // Used if pre-populating an existing application
    initialUrl: { 
        type: String,
        default: null
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      imageBase64: null,
      placeholderImage: 'https://placehold.co/400x300/e2e8f0/666666?text=Selfie+with+ID',
    };
  },
  computed: {
    imagePreview() {
      // Show the new Base64 preview if it exists,
      // otherwise show the initial URL (if editing),
      // otherwise show the placeholder.
      return this.imageBase64 || this.initialUrl || this.placeholderImage;
    },
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
         alert('Please select a valid image file.');
         return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
         alert('File is too large (Max 5MB).');
         return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageBase64 = e.target.result;
        this.$emit('update:modelValue', this.imageBase64); // Emit the base64 data
      };
      reader.readAsDataURL(file);
    },
    removeImage() {
      this.imageBase64 = null;
      this.$emit('update:modelValue', null); // Emit null to clear
      this.$refs.fileInput.value = null; // Clear file input
    },
    setDefaultImage(event) {
      event.target.src = this.placeholderImage;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-step-component {
  margin-bottom: 2rem;
}
.component-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
.component-description {
  font-size: 0.9rem;
  color: $text-color-medium;
  margin-bottom: 1rem;
}
.image-uploader-box {
  border: 2px dashed $border-color;
  border-radius: $border-radius-md;
  padding: 1rem;
  background-color: #fdfdfd;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px; // Fixed height for consistency
  
  &:hover {
    border-color: $primary-color;
    background-color: #fcfcff;
  }
}
.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: $border-radius-sm;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: $text-color-medium;
  
  i {
    font-size: 3rem;
    color: #cbd5e1;
  }
  span {
    font-weight: 500;
  }
}
.button-remove {
  background: none;
  border: none;
  color: $admin-color;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  padding: 0.25rem 0;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
