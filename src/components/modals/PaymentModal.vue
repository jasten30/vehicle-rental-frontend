<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <h3 class="modal-title">{{ modalTitle }}</h3>

        <!-- 1. Show payment options only for extensions (COMMENTED OUT) -->
        <!-- 
        <div v-if="paymentType === 'extension'" class="payment-options">
          <label class="radio-option">
            <input type="radio" v-model="paymentMethod" value="qr" />
            <span class="radio-label">Pay Now (QR)</span>
          </label>
          <label class="radio-option">
            <input type="radio" v-model="paymentMethod" value="cash" />
            <span class="radio-label">Pay Cash on Return</span>
          </label>
        </div>
        -->

        <!-- 2. Show QR/Reference flow -->
        <div class="payment-content">
          <p v-if="booking" class="modal-subtitle">
            Scan the QR code to pay <strong>₱{{ amountToPay }}</strong>.
          </p>
          
          <!-- UPDATED: Dynamic QR Code Image -->
          <img 
            :src="qrCodeUrl" 
            alt="QR Code" 
            class="qr-code-image"
            @error="onQrError"
          />
          <!-- Show message if QR is not available -->
          <p v-if="!hasQrCode" class="qr-instructions error">
            The host has not provided a QR code. Please contact them to arrange payment.
          </p>
          
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

        <!-- 3. Show "Pay Later" message (COMMENTED OUT) -->
        <!--
        <div v-if="paymentType === 'extension' && paymentMethod === 'cash'" class="payment-content">
           <p class="modal-subtitle">
             You have chosen to pay the extension fee of <strong>₱{{ amountToPay }}</strong> in cash upon returning the vehicle.
           </p>
           <p class="qr-instructions">
             The owner will be notified. This amount will be added to your remaining balance. Please check the box and confirm.
           </p>
        </div>
        -->

        <div class="terms-section">
          <label class="checkbox-container">
            <input type="checkbox" v-model="termsAccepted" />
            <span class="checkmark"></span>
            <!-- 4. Dynamic terms text -->
            <span>
              I agree to the <a href="/terms" target="_blank">terms and conditions</a> and confirm that I have completed the payment.
            </span>
          </label>
        </div>

        <!-- 5. New Extension Announcement -->
        <div class="extension-note">
           <i class="bi bi-info-circle-fill"></i>
           <p>Need to extend your trip? Please contact the host directly through our chat system to arrange an extension.</p>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button @click="$emit('close')" class="button secondary-button">Cancel</button>
          
          <!-- 6. Show "I Have Paid" button -->
          <button
            @click="handleConfirmPayment"
            :disabled="!isReadyToConfirmQr || isSubmitting"
            class="button primary-button">
            <span v-if="isSubmitting">Confirming...</span>
            <span v-else>I Have Paid</span>
          </button>

          <!-- 7. Show "Confirm & Pay Later" button (COMMENTED OUT) -->
          <!--
          <button
            v-if="paymentType === 'extension' && paymentMethod === 'cash'"
            @click="handlePayLater"
            :disabled="!isReadyToConfirmCash || isSubmitting"
            class="button primary-button">
            <span v-if="isSubmitting">Confirming...</span>
            <span v-else>Confirm & Pay Later</span>
          </button>
          -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'PaymentModal',
  props: {
    isOpen: Boolean,
    booking: Object,
    paymentType: {
      type: String,
      default: 'downpayment',
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
    },
    ownerDetails: {
        type: Object,
        default: () => ({})
    }
  },
  emits: ['close', 'payment-confirmed'],
  data() {
    return {
      termsAccepted: false,
      referenceNumber: '',
      isSubmitting: false,
      errorMessage: '',
      paymentMethod: 'qr', // Default to QR
    };
  },
  computed: {
    isReadyToConfirmQr() {
      // Must accept terms, have reference, AND have a QR code to pay to
      return this.termsAccepted && this.referenceNumber.trim() !== '' && this.hasQrCode;
    },
    // isReadyToConfirmCash() {
    //   return this.termsAccepted;
    // },
    modalTitle() {
      // Logic simplified to only show downpayment
      return 'Confirm Downpayment';
    },
    amountToPay() {
      return this.amountDue ? this.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
    },
    // showQrFlow() {
    //   // Logic simplified to always show QR flow
    //   return true;
    // },
    
    // ================================================
    //  UPDATED QR CODE LOGIC
    // ================================================
    qrCodeUrl() {
      // This now correctly points to the root property on ownerDetails
      // which is saved by your userController.
      return this.ownerDetails?.payoutQRCodeUrl || 'https://placehold.co/250x250/e2e8f0/666666?text=No+QR+Found';
    },
    hasQrCode() {
       return !!this.qrCodeUrl && !this.qrCodeUrl.includes('placehold.co');
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Reset state when modal opens
        this.termsAccepted = false;
        this.referenceNumber = '';
        this.isSubmitting = false;
        this.errorMessage = '';
        this.paymentMethod = 'qr'; // Always default to 'qr'
      }
    }
  },
  methods: {
    // Only need the downpayment action
    ...mapActions(['confirmDownpaymentByUser'/*, 'confirmExtensionPayment', 'deferExtensionPayment'*/]),

    async handleConfirmPayment() { // For QR / "I Have Paid"
      if (!this.isReadyToConfirmQr) {
           if (!this.hasQrCode) {
               this.errorMessage = "Cannot proceed without a valid QR code from the host.";
           } else if (!this.referenceNumber.trim()) {
               this.errorMessage = "Please enter your payment reference number.";
           } else if (!this.termsAccepted) {
               this.errorMessage = "You must agree to the terms and conditions.";
           }
           return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';
      try {
        // Payload is now only for downpayment
        const payload = {
            bookingId: this.booking.id,
            referenceNumber: this.referenceNumber.trim(),
            amount: this.amountDue,
            paymentMethod: 'qr' // Hardcoded as 'qr'
        };

        // All logic for extensions is commented out
        // if (this.paymentType === 'extension') {
        //   await this.confirmExtensionPayment(payload);
        // } else {
        //   await this.confirmDownpaymentByUser(payload);
        // }
        
        await this.confirmDownpaymentByUser(payload);
        
        this.$emit('payment-confirmed');
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Failed to confirm payment. Please try again.";
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // handlePayLater() { ... } // This method is no longer needed
    
    onQrError(event) {
        // If the owner's URL is broken, show a placeholder
        event.target.src = 'https://placehold.co/250x250/e2e8f0/666666?text=QR+Load+Error';
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* Removed .payment-options and .radio-option styles */
.payment-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  border-radius: $border-radius-md;
  border: 1px solid $border-color-light;
}
.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: $border-radius-md;
  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin: 0;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.15em;
    border: 1px solid $border-color;
    border-radius: 50%;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
    &::before {
      content: "";
      width: 0.65em;
      height: 0.65em;
      border-radius: 50%;
      transform: scale(0);
      transition: 120ms transform ease-in-out;
      box-shadow: inset 1em 1em $primary-color;
    }
    &:checked {
       border-color: $primary-color;
    }
    &:checked::before {
      transform: scale(1);
    }
  }
  .radio-label {
    font-size: 0.9rem;
    font-weight: 500;
  }
}

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
        box-sizing: border-box; // Added for consistent padding
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
  strong {
      color: $text-color-dark;
      font-weight: 700;
  }
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
    &.error {
      color: $admin-color;
      font-weight: 500;
    }
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
  font-weight: 500; // Make error stand out
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
  &:hover {
      background-color: darken(#e2e8f0, 5%);
  }
}

// NEW STYLE FOR EXTENSION NOTE
.extension-note {
    background-color: $background-light;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    padding: 1rem;
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
        font-size: 1.25rem;
        color: $primary-color;
    }
    p {
        margin: 0;
        font-size: 0.85rem;
        color: $text-color-medium;
        text-align: left;
        line-height: 1.5;
    }
}
</style>

