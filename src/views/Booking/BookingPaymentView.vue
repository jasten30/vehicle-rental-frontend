<template>
  <div class="booking-payment-container">
    <div class="booking-payment-card">
      <div class="left-section">
        <div class="step">
          <div class="step-header">
            <div
              class="step-circle"
              :class="{ 'step-active': currentStep >= 1 }"
            >
              1
            </div>
            <h2 class="step-title">Add Payment Method</h2>
          </div>
          <div v-if="currentStep === 1" class="step-content">
            <p class="step-description">
              Please choose your preferred digital payment method for the
              booking fee.
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
                <div
                  v-if="selectedMethod === 'maya'"
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
            <div
              class="step-circle"
              :class="{ 'step-active': currentStep >= 2 }"
            >
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
            <button @click="goToPreviousStep" class="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>

      <div class="right-section-redesigned">
        <h2 class="summary-title">Booking Summary</h2>
        <div class="summary-card">
          <div v-if="loading" class="loading-state">
            Loading booking details...
          </div>
          <div v-else-if="errorMessage" class="error-message-box">
            {{ errorMessage }}
          </div>
          <div v-else-if="booking" class="summary-content">
            <div class="vehicle-header">
              <img
                :src="vehicleProfileImageUrl"
                alt="Vehicle Image"
                class="summary-vehicle-image"
              />
              <div class="vehicle-details">
                <h3 class="summary-vehicle-name">
                  {{ booking.vehicle.year }} {{ booking.vehicle.make }}
                  {{ booking.vehicle.model }}
                </h3>
                <p class="summary-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                    ></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ formattedLocation }}</span>
                </p>
              </div>
            </div>

            <hr class="summary-divider" />

            <div class="rental-period">
              <div class="period-item">
                <span class="period-label">Pickup</span>
                <span class="period-value">{{
                  formatDate(booking.startDate)
                }}</span>
              </div>
              <div class="period-arrow">→</div>
              <div class="period-item">
                <span class="period-label">Return</span>
                <span class="period-value">{{
                  formatDate(booking.endDate)
                }}</span>
              </div>
            </div>

            <hr class="summary-divider" />

            <div class="price-total">
              <span class="price-label">Total Price</span>
              <span class="price-value">{{ formattedTotalPrice }}</span>
            </div>
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
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'BookingPaymentView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
      currentStep: 1,
      selectedMethod: null,
      confirmingPayment: false,
      paymentMessage: null,
      paymentSuccess: false,
    };
  },
  computed: {
    ...mapState(['authLoading']),
    vehicleProfileImageUrl() {
      const vehicle = this.booking?.vehicle;
      if (
        vehicle &&
        vehicle.exteriorPhotos &&
        vehicle.exteriorPhotos.length > 0
      ) {
        return vehicle.exteriorPhotos[0];
      }
      return 'https://placehold.co/80x80/e2e8f0/666666?text=No+Image';
    },
    formattedLocation() {
      const city = this.booking?.vehicle?.location?.city;
      return city || 'Location not available';
    },
    formattedTotalPrice() {
      const price = this.booking?.totalCost;
      if (typeof price === 'number') {
        return `₱${price.toLocaleString()}`;
      }
      return 'Calculating...';
    },
  },
  watch: {
    authLoading: {
      immediate: true,
      async handler(isLoading) {
        if (isLoading === false) {
          await this.fetchBookingDetails();
        }
      },
    },
  },
  methods: {
    ...mapActions([
      'getBookingById',
      'getVehicleById',
      'updateBookingPaymentMethod',
    ]),
    async fetchBookingDetails() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const bookingData = await this.getBookingById(this.bookingId);
        if (!bookingData || !bookingData.vehicleId) {
          throw new Error('Booking data or vehicle reference is missing.');
        }
        const vehicleData = await this.getVehicleById(bookingData.vehicleId);
        if (!vehicleData) {
          throw new Error('Vehicle details could not be found.');
        }
        this.booking = {
          ...bookingData,
          vehicle: vehicleData,
        };
      } catch (error) {
        console.error('Error fetching booking details:', error);
        this.errorMessage = 'Failed to load booking details. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    selectPaymentMethod(method) {
      this.selectedMethod = method;
      this.paymentMessage = null;
    },
    goToNextStep() {
      if (this.selectedMethod) {
        this.currentStep = 2;
      }
    },
    goToPreviousStep() {
      this.currentStep = 1;
      this.paymentMessage = null;
    },
    async confirmPayment() {
      this.confirmingPayment = true;
      this.paymentMessage = null;
      try {
        await this.updateBookingPaymentMethod({
          bookingId: this.bookingId,
          paymentMethod: this.selectedMethod,
          newStatus: 'pending_verification',
        });
        this.paymentSuccess = true;
        this.paymentMessage = 'Payment confirmed! Awaiting owner verification.';
        // Optional: Redirect after a few seconds
        setTimeout(() => {
          this.$router.push({
            name: 'BookingSummary',
            params: { bookingId: this.bookingId },
          });
        }, 3000);
      } catch (error) {
        this.paymentSuccess = false;
        this.paymentMessage = 'Failed to confirm payment. Please try again.';
        console.error('Error confirming payment:', error);
      } finally {
        this.confirmingPayment = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = dateString.toDate
        ? dateString.toDate()
        : new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.booking-payment-container {
  min-height: 100vh;
  background-color: $background-color;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-lg;
}

.booking-payment-card {
  max-width: 64rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;
  background-color: $card-background;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;

  @media (min-width: 1024px) {
    grid-template-columns: 1.2fr 1fr;
  }
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.right-section-redesigned {
  background-color: $background-color;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 1px solid $border-color;
  height: fit-content;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: $spacing-md;
}

.summary-card {
  background-color: $card-background;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  overflow: hidden;
}

.summary-content {
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.vehicle-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.summary-vehicle-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: $border-radius-md;
  flex-shrink: 0;
  border: 1px solid $border-color;
  background-color: #f8f9fa;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: $border-radius-sm;
}

.summary-vehicle-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-color-dark;
  line-height: 1.4;
}

.summary-location {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.875rem;
  color: $text-color-medium;

  svg {
    flex-shrink: 0;
  }
}

.summary-divider {
  border: 0;
  border-top: 1px solid $border-color;
  margin: 0;
}

.rental-period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.period-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  flex: 1;
}

.period-label {
  font-size: 0.75rem;
  color: $text-color-medium;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.period-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: $text-color-dark;
}

.period-arrow {
  font-size: 1.5rem;
  color: $text-color-medium;
  flex-shrink: 0;
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: $spacing-sm;
}

.price-label {
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-color-medium;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: $primary-color;
}

.loading-state,
.error-message-box {
  padding: $spacing-xl $spacing-md;
  text-align: center;
  color: $text-color-medium;
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

/* Payment Options Styles (Step 1) */
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

/* Payment Confirmation Styles (Step 2) */
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

/* Universal Message Box Styles */
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

.error-message,
.error-message-box {
  color: darken($admin-color, 20%);
  background-color: lighten($admin-color, 40%);
  border-radius: $border-radius-md;
}
</style>