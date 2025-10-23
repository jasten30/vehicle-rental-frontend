<template>
  <div class="application-container">
    <div class="form-wrapper">
      <h1 class="main-title">Become a Host</h1>
      <p class="main-subtitle">
        Let's get you verified. We'll guide you through the necessary steps.
      </p>

      <div class="step-content">
        <!-- Step 1: Your Information -->
        <div v-if="currentStep === 1" :key="1">
          <h2 class="step-title">Step 1: Identity Verification</h2>
          
          <DriversLicense
            :initial-drivers-license="applicationForm.driversLicense"
            @update:driversLicense="applicationForm.driversLicense = $event"
            :show-navigation="false"
          />
          
          <SelfieWithID
            v-model="applicationForm.selfieWithID"
          />
        </div>

        <!-- Step 2: Payout Information -->
        <div v-if="currentStep === 2" :key="2">
          <h2 class="step-title">Step 2: Payout Information</h2>
          <PayoutDetails
            v-model="applicationForm.payoutDetails"
          />
        </div>
      </div>

      <div class="navigation-controls">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="nav-button secondary"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="nav-button primary"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">{{ submissionStatus }}</span>
          <span v-else>{{ nextButtonText }}</span>
        </button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <!-- NEW: Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showConfirmationModal" class="confirmation-modal-overlay" @click.self="cancelSubmission">
        <div class="confirmation-modal" @click.stop>
          <h3 class="modal-title">Confirm Submission</h3>
          <div class="modal-body">
            <p>Please review and confirm the following:</p>
            <ul class="terms-list">
              <li>
                <i class="bi bi-check-circle-fill"></i>
                I certify that all information provided (including my Driver's License and Selfie) is true and belongs to me.
              </li>
              <li>
                <i class="bi bi-check-circle-fill"></i>
                I understand that providing false information will result in immediate account suspension.
              </li>
              <li>
                <i class="bi bi-check-circle-fill"></i>
                I agree to RentCycle's Terms of Service and Host Policies.
              </li>
            </ul>
            <label class="checkbox-container">
              <input type="checkbox" v-model="agreedToTerms" />
              <span class="checkmark"></span>
              I have read and agree to the terms above.
            </label>
          </div>
          <div class="modal-actions">
            <button @click="cancelSubmission" class="nav-button secondary">Cancel</button>
            <button 
              @click="handleFinalSubmit" 
              class="nav-button primary" 
              :disabled="!agreedToTerms || isSubmitting"
            >
              <span v-if="isSubmitting">{{ submissionStatus }}</span>
              <span v-else>Confirm & Submit</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- END NEW -->

  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { uploadBase64Image } from '@/utils/imageUploader';
import DriversLicense from '@/components/forms/DriversLicense.vue';
import SelfieWithID from '@/components/forms/SelfieWithID.vue';
import PayoutDetails from '@/components/forms/PayoutDetails.vue';

export default {
  name: 'BecomeOwnerApplication',
  components: {
    DriversLicense,
    SelfieWithID,
    PayoutDetails,
  },
  data() {
    return {
      currentStep: 1,
      isSubmitting: false,
      errorMessage: null,
      submissionStatus: 'Submitting...',
      applicationForm: {
        driversLicense: {
            firstName: '',
            lastName: '',
            licenseNumber: '',
            imageUrl: null
        },
        selfieWithID: null,
        payoutDetails: {
          payoutType: 'gcash',
          accountName: '',
          accountNumber: '',
          bankName: '',
          branchName: '',
          qrCodeImageBase64: null,
        },
      },
      showConfirmationModal: false,
      agreedToTerms: false,
    };
  },
  computed: {
    nextButtonText() {
      return this.currentStep === 2 ? 'Submit Application' : 'Next';
    },
  },
  methods: {
    ...mapActions(['submitHostApplication']),
    
    // --- UPDATED with more validation ---
    nextStep() {
      this.errorMessage = null; // Clear error on each step
      
      // Validate Step 1
      if (this.currentStep === 1) {
          const dl = this.applicationForm.driversLicense;
          if (!dl.firstName || !dl.lastName) {
              this.errorMessage = "Please enter your first and last name from your license.";
              return;
          }
          if (!dl.licenseNumber) {
              this.errorMessage = "Please enter your Driver's License number.";
              return;
          }
          if (!dl.imageUrl) {
              this.errorMessage = "Please upload a photo of your Driver's License.";
              return;
          }
          if (!this.applicationForm.selfieWithID) {
              this.errorMessage = "Please upload your Selfie with ID.";
              return;
          }
      }
      
      // Validate Step 2 and Show Modal
      if (this.currentStep === 2) {
        const payout = this.applicationForm.payoutDetails;
        if (!payout.accountName || !payout.accountNumber) {
            this.errorMessage = "Payout Account Name and Number are required.";
            return;
        }
        if (payout.payoutType === 'bank' && (!payout.bankName || !payout.branchName)) {
            this.errorMessage = "Bank Name and Branch Name are required for bank payouts.";
            return;
        }
        
        // All checks passed, show confirmation modal
        this.agreedToTerms = false;
        this.showConfirmationModal = true; 
      } else {
        // Not on last step, just go to next step
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
          this.currentStep--;
      }
    },

    cancelSubmission() {
      this.showConfirmationModal = false;
      this.agreedToTerms = false;
    },
    
    // --- UPDATED with more validation ---
    async handleFinalSubmit() { 
      if (!this.agreedToTerms) {
        this.errorMessage = "You must agree to the terms to submit.";
        return;
      }
      
      // --- ADDED: Final validation check ---
      const dl = this.applicationForm.driversLicense;
      const payout = this.applicationForm.payoutDetails;
      if (!dl.firstName || !dl.lastName || !dl.licenseNumber || !dl.imageUrl || !this.applicationForm.selfieWithID) {
          this.errorMessage = "Identity verification (Step 1) is incomplete. Please go back.";
          this.cancelSubmission();
          return;
      }
      if (!payout.accountName || !payout.accountNumber) {
          this.errorMessage = "Payout Account Name and Number are required. Please go back.";
          this.cancelSubmission();
          return;
      }
      if (payout.payoutType === 'bank' && (!payout.bankName || !payout.branchName)) {
          this.errorMessage = "Bank Name and Branch Name are required. Please go back.";
          this.cancelSubmission();
          return;
      }
      // --- END of validation ---

      this.isSubmitting = true;
      this.errorMessage = null;
      try {
        this.submissionStatus = "Uploading images (1/3)...";
        const licenseUrl = await uploadBase64Image(this.applicationForm.driversLicense.imageUrl, 'documents');
        
        this.submissionStatus = "Uploading images (2/3)...";
        const selfieUrl = await uploadBase64Image(this.applicationForm.selfieWithID, 'documents');
        
        this.submissionStatus = "Uploading images (3/3)...";
        const qrCodeUrl = await uploadBase64Image(this.applicationForm.payoutDetails.qrCodeImageBase64, 'payout_qrs');

        if (!licenseUrl) throw new Error("Driver's License image failed to upload.");
        if (!selfieUrl) throw new Error("Selfie with ID image failed to upload.");
        
        this.submissionStatus = "Finalizing application...";
        
        const finalApplicationData = {
          driversLicense: { 
            firstName: this.applicationForm.driversLicense.firstName,
            lastName: this.applicationForm.driversLicense.lastName,
            licenseNumber: this.applicationForm.driversLicense.licenseNumber,
            licenseImageUrl: licenseUrl 
          },
          selfieImageUrl: selfieUrl,
          payoutDetails: {
            payoutType: this.applicationForm.payoutDetails.payoutType,
            accountName: this.applicationForm.payoutDetails.accountName,
            accountNumber: this.applicationForm.payoutDetails.accountNumber,
            bankName: this.applicationForm.payoutDetails.bankName,
            branchName: this.applicationForm.payoutDetails.branchName,
            qrCodeUrl: qrCodeUrl || null,
          },
        };

        await this.submitHostApplication(finalApplicationData);
        
        this.submissionStatus = "Success!";
        this.showConfirmationModal = false;
        this.$router.push({ name: 'ApplicationSubmitted' });

      } catch (error) {
        this.errorMessage = `Failed to submit application: ${error.message || 'Please check your inputs.'}`;
        console.error("Submission Error:", error);
        this.showConfirmationModal = false;
      } finally {
        this.isSubmitting = false;
        this.submissionStatus = 'Submitting...';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.application-container {
  background-color: #f7fafc;
  min-height: 100vh;
  padding: 4rem 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.form-wrapper {
  width: 100%;
  max-width: 700px;
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
}
.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
.main-subtitle {
  font-size: 1.1rem;
  text-align: center;
  color: $text-color-medium;
  margin-bottom: 3rem;
}
.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 1rem;
  border-bottom: 1px solid $border-color;
  padding-bottom: 1rem;
}
.step-description {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  line-height: 1.6;
}
.navigation-controls {
  display: flex;
  justify-content: space-between; /* This will position Back and Next correctly */
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color;
}
.nav-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px; // Give buttons a min width
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
    &:hover {
      color: $text-color-dark;
    }
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
.error-message {
  margin-top: 1rem;
  color: $admin-color;
  font-weight: 500;
  text-align: center;
}

/* --- Confirmation Modal Styles --- */
.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}
.confirmation-modal {
  background: white;
  padding: 2rem;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 550px;
  text-align: left;
  box-shadow: $shadow-large;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: $text-color-dark;
}
.modal-body {
  margin-bottom: 1.5rem;
  p {
    font-size: 1rem;
    color: $text-color-medium;
    margin-bottom: 1.5rem;
  }
}
.terms-list {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: $text-color-dark;
    i {
      color: $secondary-color;
      font-size: 1.1rem;
      margin-top: 2px;
    }
  }
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color-light;
}

/* Checkbox (from PayoutDetails.vue) */
.checkbox-container {
  display: block;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 1rem;
  user-select: none;
  color: $text-color-dark;
  font-weight: 500;
}
.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}
.checkbox-container input:checked ~ .checkmark {
  background-color: $primary-color;
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}
.checkbox-container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

/* Modal Fade Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

