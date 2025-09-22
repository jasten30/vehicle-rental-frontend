<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <h3 class="modal-title">Report Listing</h3>
      <p class="modal-subtitle">
        Please provide details about your report for the {{ vehicle.make }} {{ vehicle.model }}.
      </p>

      <div v-if="!reportSent" class="form-step">
        <!-- Email Input with Validation -->
        <div class="input-group">
          <label for="report-email">Your Email Address</label>
          <input
            id="report-email"
            v-model="reportForm.email"
            @blur="validateEmail"
            type="email"
            placeholder="you@example.com"
          />
          <p v-if="emailError" class="validation-error">{{ emailError }}</p>
        </div>

        <!-- Phone Number Input with Validation -->
        <div class="input-group">
          <label for="report-phone">Your Phone Number</label>
          <input
            id="report-phone"
            v-model="reportForm.phone"
            @blur="validatePhone"
            type="tel"
            placeholder="+639171234567"
          />
           <p v-if="phoneError" class="validation-error">{{ phoneError }}</p>
        </div>

        <!-- Subject Input -->
        <div class="input-group">
          <label for="report-subject">Subject</label>
          <input
            id="report-subject"
            v-model="reportForm.subject"
            type="text"
            placeholder="e.g., Inaccurate listing details"
          />
        </div>

        <!-- Reason Textarea -->
         <div class="input-group">
          <label for="report-reason">Reason for Report</label>
          <textarea
            id="report-reason"
            v-model="reportForm.reason"
            rows="4"
            placeholder="Please describe the issue in detail..."
          ></textarea>
        </div>
        
        <button @click="submitReport" :disabled="isLoading" class="action-button">
          <span v-if="isLoading">Submitting...</span>
          <span v-else>Submit Report</span>
        </button>
      </div>
      
      <!-- Success Message -->
       <div v-if="reportSent" class="success-message">
            <h4>Thank You!</h4>
            <p>Your report has been submitted. Our team will review it shortly.</p>
            <button @click="closeModal" class="action-button">Close</button>
        </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ReportListingModal',
  props: {
    isOpen: Boolean,
    vehicle: Object,
  },
  emits: ['close'],
  data() {
    return {
      reportForm: {
        email: '',
        phone: '',
        subject: '',
        reason: '',
      },
      isLoading: false,
      errorMessage: '',
      emailError: '',
      phoneError: '',
      reportSent: false,
    };
  },
  computed: {
    ...mapGetters(['user']),
  },
  watch: {
    // When the modal opens, pre-fill the form with user data
    isOpen(newVal) {
      if (newVal && this.user) {
        this.reportForm.email = this.user.email || '';
        this.reportForm.phone = this.user.phoneNumber || '';
        // Reset validation and success states
        this.resetValidation();
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    resetValidation() {
        this.errorMessage = '';
        this.emailError = '';
        this.phoneError = '';
        this.reportSent = false;
    },
    validateEmail() {
        if (this.reportForm.email !== this.user.email) {
            this.emailError = "Email does not match your profile email.";
        } else {
            this.emailError = '';
        }
    },
     validatePhone() {
        if (this.reportForm.phone !== this.user.phoneNumber) {
            this.phoneError = "Phone number does not match your profile.";
        } else {
            this.phoneError = '';
        }
    },
    async submitReport() {
        this.resetValidation();
        this.validateEmail();
        this.validatePhone();

        // Check for empty fields and validation errors
        if (!this.reportForm.subject || !this.reportForm.reason) {
            this.errorMessage = "Subject and Reason fields cannot be empty.";
            return;
        }
        if (this.emailError || this.phoneError) {
             this.errorMessage = "Please correct the errors before submitting.";
            return;
        }

        this.isLoading = true;
      try {
        // In a real application, you would dispatch a Vuex action here
        // await this.$store.dispatch('submitListingReport', { ... });
        console.log('Submitting report:', {
            reporterId: this.user.uid,
            vehicleId: this.vehicle.id,
            ...this.reportForm
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.reportSent = true;
      } catch (error) {
        this.errorMessage = 'Failed to submit report. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 0.75rem;
  width: 90%; max-width: 500px;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem; text-align: center;
}
.modal-subtitle {
  margin: 0 0 1.5rem; color: #64748b; text-align: center;
}
.input-group {
  margin-bottom: 1.25rem;
}
.input-group label {
    display: block; margin-bottom: 0.5rem; font-weight: 500;
}
.input-group input, .input-group textarea {
    width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1;
    border-radius: 0.5rem; box-sizing: border-box;
}
.validation-error {
    color: #ef4444;
    font-size: 0.8rem;
    margin-top: 0.25rem;
}
.action-button {
  width: 100%; padding: 0.75rem; background-color: #3b82f6;
  color: white; border: none; border-radius: 0.5rem;
  font-weight: 600; cursor: pointer;
}
.action-button:disabled { background-color: #93c5fd; cursor: not-allowed; }
.error-message {
  color: #ef4444; background-color: #fee2e2; padding: 0.75rem;
  border-radius: 0.5rem; text-align: center; margin-top: 1rem;
}
.success-message {
    text-align: center; padding: 1rem;
}
.success-message h4 {
    font-size: 1.25rem; margin: 0 0 0.5rem;
}
</style>
