<template>
  <div class="form-section">
    <p class="step-info-text">
      Please provide your payout details. This information will be used to send you your earnings.
    </p>

    <!-- Payout Method Selection -->
    <div class="form-group">
      <label>Payout Method</label>
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" :value="'gcash'" v-model="localDetails.payoutType" @change="emitUpdate">
          <span class="radio-label">GCash</span>
        </label>
        <label class="radio-option">
          <input type="radio" :value="'maya'" v-model="localDetails.payoutType" @change="emitUpdate">
          <span class="radio-label">Maya</span>
        </label>
      </div>
    </div>

    <!-- Dynamic Fields (Shared by GCash and Maya) -->
    <div>
      <div class="form-group">
        <label :for="accountNameId">{{ accountNameLabel }}</label>
        <input
          type="text"
          :id="accountNameId"
          v-model="localDetails.accountName"
          :placeholder="accountNamePlaceholder"
          required
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label :for="accountNumberId">{{ accountNumberLabel }}</label>
        <input
          type="text"
          :id="accountNumberId"
          v-model="localDetails.accountNumber"
          :placeholder="accountNumberPlaceholder"
          required
          @input="emitUpdate"
        />
      </div>
      <!-- QR Code Uploader -->
      <div class="form-group upload-section">
        <label>{{ qrCodeLabel }}</label>
        <input
          type="file"
          ref="qrCodeInput"
          @change="handleQrCodeUpload"
          accept="image/png, image/jpeg, image/jpg"
          class="hidden-input"
        />
        <div
          class="upload-box"
          @click="triggerQrCodeInput"
          :class="{ 'has-image': qrCodePreview }"
        >
          <div v-if="!qrCodePreview" class="upload-placeholder">
            <i class="bi bi-qr-code-scan"></i>
            <p>Click to upload QR Code</p>
          </div>
          <img
            v-else
            :src="qrCodePreview"
            alt="QR Code Preview"
            class="uploaded-image"
          />
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayoutDetails',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localDetails: { ...this.modelValue },
      qrCodePreview: null, // Holds the local preview URL
      error: '',
    };
  },
  computed: {
    // --- Computed labels to dynamically change text ---
    accountNameLabel() {
      return this.localDetails.payoutType === 'gcash' ? 'Account Name (GCash)' : 'Account Name (Maya)';
    },
    accountNumberLabel() {
      return this.localDetails.payoutType === 'gcash' ? 'Account Number (GCash Phone)' : 'Account Number (Maya Phone)';
    },
    accountNamePlaceholder() {
      return 'e.g., Juan dela Cruz';
    },
    accountNumberPlaceholder() {
      return 'e.g., 09171234567';
    },
    qrCodeLabel() {
      return this.localDetails.payoutType === 'gcash' ? 'Upload GCash QR Code' : 'Upload Maya QR Code';
    },
    // --- Unique IDs for accessibility ---
    accountNameId() {
      return this.localDetails.payoutType === 'gcash' ? 'gcashName' : 'mayaName';
    },
    accountNumberId() {
      return this.localDetails.payoutType === 'gcash' ? 'gcashNumber' : 'mayaNumber';
    }
  },
  watch: {
    // When the prop changes, update local data
    modelValue(newVal) {
      this.localDetails = { ...newVal };
      // Note: This won't update the preview, as base64 is not stored in parent
    },
    // When payoutType changes, clear the fields
    'localDetails.payoutType'() {
      this.localDetails.accountName = '';
      this.localDetails.accountNumber = '';
      this.localDetails.qrCodeImageBase64 = null;
      this.qrCodePreview = null;
      this.error = '';
      this.emitUpdate();
    }
  },
  methods: {
    triggerQrCodeInput() {
      this.$refs.qrCodeInput.click();
    },
    handleQrCodeUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

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
        // This is the Base64 string for upload
        this.localDetails.qrCodeImageBase64 = e.target.result;
        // This is for local preview
        this.qrCodePreview = e.target.result; 
        this.emitUpdate();
      };
      reader.onerror = () => {
        this.error = "Failed to read file.";
      };
      reader.readAsDataURL(file);
    },
    emitUpdate() {
      // Emit the full local data object back to the parent
      this.$emit('update:modelValue', this.localDetails);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* Basic Form Styles (from DriversLicense.vue for consistency) */
h3 {
  font-size: 1.5rem;
  color: $primary-color;
  margin-bottom: 1rem;
}
.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
  line-height: 1.6;
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
input[type='text'], select {
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

/* Radio Button Styles */
.radio-group {
    display: flex;
    gap: 1rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    padding: 0.5rem;
}
.radio-option {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    input[type="radio"] {
        width: 1.15em;
        height: 1.15em;
        accent-color: $primary-color;
    }
    .radio-label {
        font-size: 0.95rem;
        font-weight: 500;
    }
    &:has(input:checked) {
        background-color: lighten($primary-color, 45%);
    }
    &:hover {
        background-color: #f9fafb;
    }
}

/* Upload Box Styles (from DriversLicense.vue) */
.upload-section {
  .hidden-input { display: none; }
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
    &:hover { border-color: $primary-color; }
    &.has-image { border: 2px solid $primary-color; }
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #9ca3af;
      i { font-size: 2.5rem; margin-bottom: 0.5rem; }
    }
    .uploaded-image {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
      border-radius: $border-radius-sm;
    }
  }
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>

