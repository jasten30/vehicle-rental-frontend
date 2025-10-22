<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">{{ modalTitle }}</h3>

      <p v-if="booking" class="modal-subtitle">
        Scan the QR code to pay <strong>₱{{ amountToPay }}</strong>.
      </p>

      <div class="payment-content">
        <img src="https://placehold.co/250x250/e2e8f0/666666?text=Sample+GCash+QR" alt="QR Code" class="qr-code-image" />
        <p class="qr-instructions">
          After paying, please enter the transaction reference number below, check the box, and confirm.
        </p>

        <div class="input-group">
          <label for="referenceNumber">Reference Number:</label>
          <input
            type="text"
            id="referenceNumber"
            v-model="referenceNumber"
            placeholder="Enter transaction reference"
          />
        </div>
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
          :disabled="!isReadyToConfirm || isSubmitting"
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
    booking: Object, // Still needed for booking.id
    // 3. Added new props to control the modal's behavior
    paymentType: {
      type: String,
      default: 'downpayment', // 'downpayment' or 'extension'
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
    }
  },
  emits: ['close', 'payment-confirmed'],
  data() {
    return {
      termsAccepted: false,
      referenceNumber: '',
      isSubmitting: false,
      errorMessage: '',
    };
  },
  computed: {
    isReadyToConfirm() {
        return this.termsAccepted && this.referenceNumber.trim() !== '';
    },
    // 4. Added computed properties for dynamic text
    modalTitle() {
      return this.paymentType === 'extension'
        ? 'Confirm Extension Payment'
        : 'Confirm Downpayment';
    },
    amountToPay() {
      return this.amountDue ? this.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.termsAccepted = false;
        this.referenceNumber = '';
        this.isSubmitting = false;
        this.errorMessage = '';
      }
    }
  },
  methods: {
    // 5. Mapped the new action for confirming extension payment
    ...mapActions(['confirmDownpaymentByUser', 'confirmExtensionPayment']),

    async handleConfirmPayment() {
      if (!this.termsAccepted) {
        this.errorMessage = "You must accept the terms and conditions.";
        return;
      }
      if (!this.referenceNumber.trim()) {
          this.errorMessage = "Please enter the transaction reference number.";
          return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';
      try {
        const payload = {
            bookingId: this.booking.id,
            referenceNumber: this.referenceNumber.trim(),
            // Pass the amount in case the backend needs it
            amount: this.amountDue 
        };

        // 6. Use v-if (or ternary) to call the correct action
        if (this.paymentType === 'extension') {
          // Call the action for paying an extension
          await this.confirmExtensionPayment(payload); 
        } else {
          // Call the original action for the downpayment
          await this.confirmDownpaymentByUser(payload);
        }
        
        this.$emit('payment-confirmed'); // Emit generic success event
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

.input-group {
    margin-top: 1rem;
    text-align: left;
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 0.9rem;
    }
    input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid $border-color;
        border-radius: $border-radius-md;
        font-size: 1rem;
    }
}

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

