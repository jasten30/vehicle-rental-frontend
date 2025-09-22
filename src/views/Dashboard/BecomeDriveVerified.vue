<template>
  <div class="application-container">
    <div class="application-card">
      <div class="header-section">
        <h1 class="page-title">Driver Application</h1>
        <p class="page-subtitle">To rent or list a vehicle, please submit your documents for verification.</p>
      </div>

      <div v-if="successMessage" class="success-message-box">
          <h4><i class="bi bi-check-circle-fill"></i> Application Submitted</h4>
          <p>{{ successMessage }}</p>
          <button @click="$router.push({ name: 'ProfileSettings' })" class="button primary">Back to Profile</button>
      </div>

      <div v-else class="form-content">
        <!-- Driver's License Section -->
        <div class="form-section">
            <label class="form-section-label">1. Driver's License</label>
            <div class="form-group">
              <label for="licenseNumber">Driver's License Number</label>
              <input
                type="text"
                id="licenseNumber"
                v-model="applicationForm.licenseNumber"
                placeholder="e.g., L12-34-567890"
              />
            </div>
            <div class="form-group">
                <label>Photo of Driver's License</label>
                <div class="id-upload-box" @click="$refs.licenseInput.click()">
                    <img v-if="licensePreview" :src="licensePreview" alt="License Preview" class="id-preview" />
                    <div v-else class="upload-placeholder">
                        <i class="bi bi-person-vcard"></i>
                        <span>Click to upload photo</span>
                    </div>
                </div>
                <input type="file" ref="licenseInput" @change="handleFileChange($event, 'license')" accept="image/*" class="file-input" />
            </div>
        </div>

        <hr class="divider" />

        <!-- Other Primary ID Section -->
        <div class="form-section">
            <label class="form-section-label">2. Other Primary ID</label>
            <div class="form-group">
                <label for="other-id-type">Select an ID Type</label>
                <select id="other-id-type" v-model="applicationForm.otherIdType">
                    <option disabled value="">-- Please choose an option --</option>
                    <option v-for="idType in philippinePrimaryIDs" :key="idType" :value="idType">{{ idType }}</option>
                </select>
            </div>
             <div class="form-group" v-if="applicationForm.otherIdType">
                <label>Photo of {{ applicationForm.otherIdType }}</label>
                 <div class="id-upload-box" @click="$refs.otherIdInput.click()">
                    <img v-if="otherIdPreview" :src="otherIdPreview" alt="Other ID Preview" class="id-preview" />
                     <div v-else class="upload-placeholder">
                        <i class="bi bi-card-image"></i>
                        <span>Click to upload photo</span>
                    </div>
                </div>
                <input type="file" ref="otherIdInput" @change="handleFileChange($event, 'otherId')" accept="image/*" class="file-input" />
            </div>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button @click="submitApplication" :disabled="isSubmitting" class="submit-button">
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit Application</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'BecomeDriveVerified',
    data() {
        return {
            applicationForm: {
                licenseNumber: '',
                otherIdType: '',
                licenseImageBase64: null,
                otherIdImageBase64: null,
            },
            licensePreview: null,
            otherIdPreview: null,
            philippinePrimaryIDs: [
                'Philippine National ID (PhilSys)',
                'Passport',
                'Social Security System (SSS) Card',
                'Unified Multi-Purpose ID (UMID)',
                'Professional Regulation Commission (PRC) ID',
                "Voter's ID",
            ],
            isSubmitting: false,
            errorMessage: '',
            successMessage: '',
        };
    },
    methods: {
        ...mapActions(['submitDriveApplication']),
        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        },
        async handleFileChange(event, type) {
            const file = event.target.files[0];
            if (!file) return;
            try {
                const base64String = await this.fileToBase64(file);
                if (type === 'license') {
                    this.applicationForm.licenseImageBase64 = base64String;
                    this.licensePreview = base64String;
                } else if (type === 'otherId') {
                    this.applicationForm.otherIdImageBase64 = base64String;
                    this.otherIdPreview = base64String;
                }
            } catch (error) {
                this.errorMessage = "Failed to process image file.";
            }
        },
        async submitApplication() {
            this.errorMessage = '';
            const { licenseNumber, licenseImageBase64, otherIdType, otherIdImageBase64 } = this.applicationForm;
            if (!licenseNumber || !licenseImageBase64 || !otherIdType || !otherIdImageBase64) {
                this.errorMessage = "Please complete all fields and upload both ID photos.";
                return;
            }

            this.isSubmitting = true;
            try {
                await this.submitDriveApplication(this.applicationForm);
                this.successMessage = "Your application has been submitted successfully. Our team will review it within 24-48 hours.";
            } catch (error) {
                this.errorMessage = error.response?.data?.message || "An error occurred during submission. Please try again.";
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.application-container {
    max-width: 700px;
    margin: 2rem auto;
    padding: 1rem;
}
.application-card {
    background-color: #fff;
    padding: 2.5rem;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-light;
}
.header-section {
    text-align: center;
    margin-bottom: 2rem;
}
.page-title {
    font-size: 2rem;
    font-weight: 700;
}
.page-subtitle {
    font-size: 1rem;
    color: $text-color-medium;
    margin-top: 0.5rem;
}
.divider {
    border: none;
    height: 1px;
    background-color: $border-color;
    margin: 2.5rem 0;
}
.form-section-label {
    display: block;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $border-color;
}
.form-group {
  margin-bottom: 1.5rem;
  label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
  input[type="text"], select {
    width: 100%; padding: 0.75rem; border: 1px solid $border-color;
    border-radius: $border-radius-sm; font-size: 1rem; font-family: inherit;
    background-color: white;
  }
}
.file-input { display: none; }
.id-upload-box {
    border: 2px dashed $border-color; border-radius: $border-radius-md;
    padding: 1rem; display: flex; align-items: center;
    justify-content: center; cursor: pointer; min-height: 180px;
    transition: background-color 0.2s ease;
    &:hover { background-color: #f9fafb; }
}
.upload-placeholder {
    display: flex; flex-direction: column; align-items: center;
    gap: 0.5rem; color: $text-color-medium;
    i { font-size: 2.5rem; }
}
.id-preview {
    max-width: 100%; max-height: 220px; border-radius: $border-radius-sm;
}
.submit-button {
    width: 100%;
    padding: 0.85rem;
    border: none;
    border-radius: $border-radius-md;
    background-color: $primary-color;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
}
.error-message {
  color: $admin-color; text-align: center;
  margin-top: 1rem; font-weight: 500;
}
.success-message-box {
    text-align: center;
    padding: 2rem;
    h4 {
        font-size: 1.5rem;
        color: $secondary-color;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    p {
        margin-bottom: 2rem;
    }
    .button {
        margin: 0 auto;
    }
}
</style>

