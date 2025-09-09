<template>
  <div class="left-section">
    <div class="step">
      <div class="step-header">
        <div class="step-circle" :class="{ 'step-active': currentStep >= 1 }">
          1
        </div>
        <h2 class="step-title">Add Payment Method</h2>
      </div>
      <div v-if="currentStep === 1" class="step-content">
        <p class="step-description">
          Please choose your preferred digital payment method for the booking
          fee.
        </p>
        <div class="payment-options">
          <button
            @click="selectPaymentMethod('gcash')"
            class="payment-button"
            :class="{ selected: selectedMethod === 'gcash' }"
          >
            <div class="payment-logo gcash-logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.37 2.52c5.44.4 9.63 5 9.63 10.48 0 5.79-4.71 10.5-10.5 10.5s-10.5-4.71-10.5-10.5c0-5.18 3.79-9.52 8.75-10.37l.22-.04.19-.04.2-.03h.01Z"
                  fill="#0057e7"
                ></path>
                <path
                  d="M14.99 11.23h-2.3v-2.3c0-.4-.32-.72-.72-.72h-.94c-.4 0-.72.32-.72.72v2.3H8.01c-.4 0-.72.32-.72.72v.94c0 .4.32.72.72.72h2.3v2.3c0 .4.32.72.72.72h.94c.4 0 .72-.32.72-.72v-2.3h2.3c.4 0 .72-.32.72-.72v-.94c0-.4-.32-.72-.72-.72Z"
                  fill="#fff"
                ></path>
              </svg>
            </div>
            <span class="payment-name">GCash</span>
            <div
              v-if="selectedMethod === 'gcash'"
              class="selected-checkmark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </button>
          <button
            @click="selectPaymentMethod('maya')"
            class="payment-button"
            :class="{ selected: selectedMethod === 'maya' }"
          >
            <div class="payment-logo maya-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="#17BF89"
                ></path>
                <path
                  d="M16.5 7.5L12 16.5L7.5 7.5"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </div>
            <span class="payment-name">Maya</span>
            <div v-if="selectedMethod === 'maya'" class="selected-checkmark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>
        <button
          @click="goToNextStep"
          :disabled="!selectedMethod"
          class="next-button"
        >
          Next
        </button>
      </div>
    </div>

    <div class="step">
      <div class="step-header">
        <div class="step-circle" :class="{ 'step-active': currentStep >= 2 }">
          2
        </div>
        <h2 class="step-title">Confirm Payment</h2>
      </div>
      <div v-if="currentStep === 2" class="step-content">
        <div class="payment-confirmation-box">
          <p class="step-description">
            Please scan the QR code to complete your payment of
            <span class="payment-amount">{{ formattedTotalPrice }}</span
            >.
          </p>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Example"
            alt="QR Code"
            class="qr-code-image"
          />
          <p class="qr-info">
            Once paid, the owner will verify the transaction.
          </p>
        </div>
        <button
          @click="confirmPayment"
          :disabled="confirmingPayment"
          class="confirm-button"
        >
          <span v-if="confirmingPayment">Confirming...</span>
          <span v-else>I Have Paid</span>
        </button>
        <button @click="goToPreviousStep" class="back-button">Go Back</button>
      </div>
    </div>
    <div
      v-if="paymentMessage"
      :class="paymentSuccess ? 'success-message' : 'error-message'"
      class="message-box"
    >
      {{ paymentMessage }}
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'PaymentSteps',
  props: {
    booking: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      currentStep: 1,
      selectedMethod: null,
      confirmingPayment: false,
      paymentMessage: null,
      paymentSuccess: false,
    };
  },
  computed: {
    formattedTotalPrice() {
      const price = this.booking?.totalCost;
      return typeof price === 'number' ? `₱${price.toLocaleString()}` : '...';
    },
  },
  methods: {
    ...mapActions(['updateBookingPaymentMethod']),
    selectPaymentMethod(method) {
      this.selectedMethod = method;
    },
    goToNextStep() {
      if (this.selectedMethod) {
        this.currentStep = 2;
      }
    },
    goToPreviousStep() {
      this.currentStep = 1;
    },
    async confirmPayment() {
      this.confirmingPayment = true;
      this.paymentMessage = null;
      try {
        await this.updateBookingPaymentMethod({
          bookingId: this.booking.id,
          paymentMethod: this.selectedMethod,
          newStatus: 'pending_verification',
        });
        
        // UPDATED: Redirect to the new waiting page instead of using a timer
        this.$router.push({
          name: 'PaymentVerification',
          params: { bookingId: this.booking.id },
        });

      } catch (error) {
        this.paymentSuccess = false;
        this.paymentMessage = 'Failed to submit payment. Please try again.';
      } finally {
        this.confirmingPayment = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.left-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
.step-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}
.step-circle {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: $text-color-medium;
  color: $text-color-light;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.step-circle.step-active {
  background-color: $primary-color;
}
.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
}
.step-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.step-description {
  color: $text-color-medium;
  line-height: 1.5;
}
.payment-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.payment-button {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  width: 100%;
  border: 2px solid $border-color;
  background-color: $card-background;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  &:hover {
    border-color: darken($border-color, 10%);
    box-shadow: $shadow-light;
  }
  &.selected {
    border-color: $primary-color;
    box-shadow: 0 0 0 2px lighten($primary-color, 35%);
  }
}
.payment-logo {
  width: 40px;
  height: 40px;
  margin-right: $spacing-md;
  svg {
    width: 100%;
    height: 100%;
  }
}
.payment-name {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-color-dark;
}
.selected-checkmark {
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  color: $primary-color;
}
.payment-confirmation-box {
  text-align: center;
  padding: $spacing-md;
  background-color: $background-color;
  border-radius: $border-radius-md;
  border: 1px solid $border-color;
}
.payment-amount {
  font-weight: 700;
  color: $primary-color;
}
.qr-code-image {
  display: block;
  margin: $spacing-md auto;
  border-radius: $border-radius-sm;
  max-width: 200px;
}
.qr-info {
  font-size: 0.875rem;
  color: $text-color-medium;
}
.confirm-button,
.next-button {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  font-weight: 500;
  border: none;
  font-size: $font-size-base;
  color: $text-color-light;
  background-color: $primary-color;
  cursor: pointer;
  &:hover {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.back-button {
  width: 100%;
  padding: $spacing-sm;
  background: none;
  border: none;
  color: $text-color-medium;
  text-align: center;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.message-box {
  margin-top: $spacing-md;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  font-weight: 500;
  text-align: center;
}
.success-message {
  color: darken($secondary-color, 20%);
  background-color: lighten($secondary-color, 45%);
}
.error-message {
  color: darken($admin-color, 20%);
  background-color: lighten($admin-color, 40%);
}
</style>