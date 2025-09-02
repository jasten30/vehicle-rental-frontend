<template>
  <div>
    <h3>Official Receipt (OR)</h3>
    <p class="step-info-text">
      Please provide the necessary details from your vehicle's Official Receipt.
    </p>

    <div class="form-group">
      <label for="orNumber">OR Number</label>
      <input type="text" id="orNumber" v-model="or.orNumber" required />
    </div>

    <div class="form-group">
      <label for="dateIssued">Date Issued</label>
      <input type="date" id="dateIssued" v-model="or.dateIssued" required />
    </div>

    <div class="form-group upload-section">
      <label>Upload Image of OR</label>
      <input
        type="file"
        ref="fileInput"
        @change="handleImageUpload"
        accept="image/*"
        class="hidden-input"
        required
      />
      <div
        class="upload-box"
        @click="triggerFileInput"
        :class="{ 'has-image': or.orImageUrl }"
      >
        <div v-if="!or.orImageUrl" class="upload-placeholder">
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
          <p>Click to upload image</p>
        </div>
        <img
          v-else
          :src="or.orImageUrl"
          alt="OR Preview"
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
  name: 'VehicleOR',
  props: {
    orDetails: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    // Added this new prop to control button visibility
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:orDetails', 'next', 'prev', 'error'],
  data() {
    return {
      error: '',
    };
  },
  computed: {
    or: {
      get() {
        return this.orDetails;
      },
      set(value) {
        this.$emit('update:orDetails', value);
      },
    },
    isValid() {
      return this.or.orNumber && this.or.dateIssued && this.or.orImageUrl;
    },
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$emit('update:orDetails', {
            ...this.or,
            orImageUrl: e.target.result,
            orImageFile: file,
          });
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
        this.error =
          'Please fill in all Official Receipt details and upload an image.';
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

  input[type='text'],
  input[type='date'],
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
    }
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