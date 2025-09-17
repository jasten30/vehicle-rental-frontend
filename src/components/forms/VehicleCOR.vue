<template>
  <div class="form-step-container">
    <div class="form-group">
      <label for="cor-upload">Vehicle Certificate of Registration (CR)</label>
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
        accept="image/*"
        class="hidden-file-input"
      />
    </div>

    <div v-if="showNavigation" class="navigation-buttons">
      <button type="button" @click="$emit('prev')" class="nav-button secondary">Previous</button>
      <button type="button" @click="$emit('next')" class="nav-button primary">Next</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleCOR',
  props: {
    modelValue: Object,
    // Add the new prop to control button visibility
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'next', 'prev'],
  data() {
    return {
      imagePreview: this.modelValue?.corImage || null,
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
        this.$emit('update:modelValue', {
          ...this.modelValue,
          corImage: e.target.result,
        });
      };
      reader.readAsDataURL(file);
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
</style>