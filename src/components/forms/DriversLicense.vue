<template>
  <div class="form-section">
    <h3>Driver's License Details</h3>
    <p class="step-info-text">
      Please provide your name as it appears on your license, your license number, and upload a clear photo.
    </p>

    <!-- 👇 ADDED First Name and Last Name inputs -->
    <div class="name-grid">
      <div class="form-group">
        <label for="dl-firstName">First Name (on License)</label>
        <input
          type="text"
          id="dl-firstName"
          v-model="localDriversLicense.firstName"
          placeholder="e.g., Juan"
          required
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label for="dl-lastName">Last Name (on License)</label>
        <input
          type="text"
          id="dl-lastName"
          v-model="localDriversLicense.lastName"
          placeholder="e.g., Dela Cruz"
          required
          @input="emitUpdate"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="licenseNumber">Driver's License Number</label>
      <input
        type="text"
        id="licenseNumber"
        v-model="localDriversLicense.licenseNumber"
        placeholder="e.g., L12-34-567890"
        required
        @input="emitUpdate"
      />
    </div>

    <div class="form-group upload-section">
      <label>Upload Driver's License Photo</label>
      <input
        type="file"
        ref="licensePhotoInput"
        @change="handleLicensePhotoUpload"
        accept="image/png, image/jpeg, image/jpg"
        class="hidden-input"
        required
      />
      <div
        class="upload-box"
        @click="triggerLicensePhotoInput"
        :class="{ 'has-image': localDriversLicense.imageUrl }"
      >
        <div v-if="!localDriversLicense.imageUrl" class="upload-placeholder">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p>Click to upload photo</p>
        </div>
        <img
          v-else
          :src="localDriversLicense.imageUrl"
          alt="Driver's License Preview"
          class="uploaded-image"
        />
      </div>
    </div>

    <div v-if="showNavigation" class="button-group-step">
      <button
        type="button"
        @click="$emit('prev')"
        class="button secondary-button"
      >
        Previous
      </button>
      <button type="button" @click="nextStep" class="button primary-button">
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
  name: 'DriversLicense',
  props: {
    // This prop name matches what BecomeOwnerApplication.vue provides
    initialDriversLicense: {
      type: Object,
      required: true,
    },
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  // 👇 UPDATED: Emit the correct event name
  emits: ['update:driversLicense', 'next', 'prev', 'error'],
  data() {
    return {
      // Clone the prop to local data to avoid mutating prop
      localDriversLicense: { ...this.initialDriversLicense },
      error: '',
    };
  },
  watch: {
    // Keep local data in sync if the prop changes (e.g., parent form reset)
    initialDriversLicense(newVal) {
      this.localDriversLicense = { ...newVal };
    }
  },
  methods: {
    triggerLicensePhotoInput() {
      this.$refs.licensePhotoInput.click();
    },
    handleLicensePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Validation for size (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.error = "File is too large (Max 2MB).";
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          // This is the Base64 string
          this.localDriversLicense.imageUrl = e.target.result;
          this.emitUpdate();
        };
        reader.onerror = () => {
            this.error = "Failed to read file.";
        };
        reader.readAsDataURL(file);
      }
    },
    emitUpdate() {
      // Emit the full local data object back to the parent
      this.$emit('update:driversLicense', this.localDriversLicense);
    },
    nextStep() {
      // Validate all new fields
      if (
        this.localDriversLicense.firstName &&
        this.localDriversLicense.lastName &&
        this.localDriversLicense.licenseNumber &&
        this.localDriversLicense.imageUrl
      ) {
        this.$emit('next');
        this.error = '';
      } else {
        this.error =
          'Please fill in all fields (Name, License #) and upload a photo to continue.';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* Added styles for the new name grid */
.name-grid {
  display: flex;
  gap: 1rem;
  flex-direction: column;

  @media (min-width: 576px) {
    flex-direction: row;
  }
}

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
  flex: 1; // Allows fields in name-grid to share space

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }
}

input[type='text'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: $border-radius-sm;
  font-size: 1rem;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: #ffffff;
  box-sizing: border-box; // Ensures padding doesn't break layout

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
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
