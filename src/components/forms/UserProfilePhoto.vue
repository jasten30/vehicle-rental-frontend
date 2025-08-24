<template>
  <div>
    <h3>Your Profile Photo</h3>
    <p class="step-info-text">Please upload a clear profile photo of yourself.</p>
    
    <!-- Profile Photo Upload Section -->
    <div class="form-group upload-section">
      <label>Upload Profile Photo</label>
      <input
        type="file"
        ref="profilePhotoInput"
        @change="handleProfilePhotoUpload"
        accept="image/*"
        class="hidden-input"
        required
      >
      <div 
        class="upload-box" 
        @click="triggerProfilePhotoInput"
        :class="{ 'has-image': profileImageUrl }"
      >
        <div v-if="!profileImageUrl" class="upload-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p>Click to upload photo</p>
        </div>
        <img v-else :src="profileImageUrl" alt="Profile Photo Preview" class="uploaded-image">
      </div>
    </div>
    <!-- End Profile Photo Upload Section -->
    
    <div class="button-group-step">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button 
        type="button" 
        @click="nextStep" 
        class="button primary-button" 
        :disabled="!isValid"
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
  name: 'UserProfilePhoto',
  props: {
    initialProfileImageUrl: {
      type: String,
      required: true,
    }
  },
  emits: ['update:profileImageUrl', 'next', 'prev', 'error'],
  data() {
    return {
      profileImageUrl: this.initialProfileImageUrl,
      error: '',
    };
  },
  computed: {
    isValid() {
      return !!this.profileImageUrl;
    }
  },
  watch: {
    initialProfileImageUrl(newVal) {
      this.profileImageUrl = newVal;
    }
  },
  methods: {
    triggerProfilePhotoInput() {
      this.$refs.profilePhotoInput.click();
    },
    handleProfilePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profileImageUrl = e.target.result;
          this.$emit('update:profileImageUrl', this.profileImageUrl);
          this.error = '';
        };
        reader.readAsDataURL(file);
      }
    },
    nextStep() {
      if (this.isValid) {
        this.$emit('next');
        this.error = '';
      } else {
        this.error = 'Please upload a profile photo before proceeding.';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

h3 {
  font-size: 1.5rem;
  color: $primary-color;
  margin-bottom: 1rem;
}

.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .hidden-input {
    display: none;
  }

  .upload-box {
    cursor: pointer;
    border: 2px dashed #d1d5db;
    border-radius: $border-radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    padding: 1rem;
    transition: border-color 0.2s ease;
    text-align: center;
    
    &:hover {
      border-color: $primary-color;
    }

    &.has-image {
      border: 2px solid $primary-color;
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #9ca3af;

      svg {
        width: 2.5rem;
        height: 2.5rem;
        margin-bottom: 0.5rem;
      }
    }
    
    .uploaded-image {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: $border-radius-sm;
    }
  }
}

.button-group-step {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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
