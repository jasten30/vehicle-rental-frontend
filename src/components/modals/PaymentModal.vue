<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Confirm Downpayment</h3>
      <p v-if="booking" class="modal-subtitle">
        Scan the QR code to pay the <strong>₱{{ booking.downPayment ? booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</strong> downpayment.
      </p>

      <div class="payment-content">
        <img src="https://placehold.co/250x250/e2e8f0/666666?text=Sample+GCash+QR" alt="QR Code" class="qr-code-image" />
        <p class="qr-instructions">
          After paying, check the box below and confirm to notify the owner for verification.
        </p>
      </div>

      <div class="terms-section">
        <label class="checkbox-container">
          <input type="checkbox" v-model="termsAccepted" />
          <span class="checkmark"></span>
          I agree to the <a href="/terms" target="_blank">terms and conditions</a> and confirm that I have completed the payment.
        </label>
      </div>
      
       <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="modal-actions">
        <button @click="$emit('close')" class="button secondary-button">Cancel</button>
        <button 
          @click="handleConfirmPayment" 
          :disabled="!termsAccepted || isSubmitting" 
          class="button primary-button">
          <span v-if="isSubmitting">Confirming...</span>
          <span v-else>I Have Paid</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'PaymentModal',
  props: {
    isOpen: Boolean,
    booking: Object,
  },
  emits: ['close', 'payment-confirmed'],
  data() {
    return {
      termsAccepted: false,
      isSubmitting: false,
      errorMessage: '',
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.termsAccepted = false;
        this.isSubmitting = false;
        this.errorMessage = '';
      }
    }
  },
  methods: {
    ...mapActions(['confirmDownpaymentByUser']),
    async handleConfirmPayment() {
      if (!this.termsAccepted) {
        this.errorMessage = "You must accept the terms and confirm payment to continue.";
        return;
      }
      this.isSubmitting = true;
      this.errorMessage = '';
      try {
        await this.confirmDownpaymentByUser(this.booking.id);
        this.$emit('payment-confirmed');
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Failed to confirm payment. Please try again.";
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: $border-radius-lg;
  width: 90%; max-width: 450px;
  text-align: center;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem;
}
.modal-subtitle {
  margin: 0 0 1.5rem; color: $text-color-medium;
}
.payment-content {
  margin-bottom: 1.5rem;
}
.qr-code-image {
  width: 200px;
  height: 200px;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  padding: 0.5rem;
  background: white;
  margin: 0 auto 1rem;
  display: block;
}
.qr-instructions {
    font-size: 0.9rem;
    color: $text-color-medium;
}
.terms-section {
  text-align: left;
  margin-bottom: 1.5rem;
  a {
    color: $primary-color;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}
.checkbox-container {
  display: block;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  color: $text-color-dark;
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
.error-message {
  color: $admin-color;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
}
.primary-button {
  background-color: $primary-color;
  color: white;
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
  }
}
.secondary-button {
  background-color: #e2e8f0;
  color: #1f2937;
}
</style>

