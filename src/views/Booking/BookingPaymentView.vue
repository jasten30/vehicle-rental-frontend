<template>
  <div class="booking-payment-container">
    <div class="booking-payment-card">
      <!-- Left Column: All Steps -->
      <div class="left-section">
        <!-- Step 1: Add Payment Method -->
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
          <hr class="divider" />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="payment-logo"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect
                    x="2"
                    y="3"
                    width="20"
                    height="18"
                    rx="2"
                    ry="2"
                    fill="#00a859"
                    stroke="none"
                  />
                  <path d="M7 12h10" stroke="#fff" />
                  <path d="M12 7v10" stroke="#fff" />
                </svg>
                <span>G-Cash</span>
              </button>
              <button
                @click="selectPaymentMethod('maya')"
                class="payment-button"
                :class="{ selected: selectedMethod === 'maya' }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="payment-logo"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" fill="#0072b2" stroke="none" />
                  <path d="M8 12h8" stroke="#fff" />
                  <path d="M12 8v8" stroke="#fff" />
                </svg>
                <span>Maya</span>
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

        <!-- Step 2: Confirm Payment -->
        <div class="step" :class="{ hidden: currentStep < 2 }">
          <div class="step-header">
            <div
              class="step-circle"
              :class="{ 'step-active': currentStep >= 2 }"
            >
              2
            </div>
            <h2 class="step-title">Confirm Payment</h2>
          </div>
          <hr class="divider" />
          <div v-if="currentStep === 2" class="step-content">
            <div v-if="loading" class="loading-state">
              Loading payment details...
            </div>
            <div v-else-if="booking" class="summary-box payment-details">
              <p class="summary-description">
                Please scan the QR code to complete your payment of
                <span class="downpayment-amount">₱{{ booking.totalPrice }}</span
                >.
              </p>
              <!-- Mockup QR Code using SVG -->
              <svg
                class="payment-qr-code"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" width="100" height="100" fill="#fff" />
                <rect
                  x="10"
                  y="10"
                  width="20"
                  height="20"
                  fill="currentColor"
                />
                <rect
                  x="70"
                  y="10"
                  width="20"
                  height="20"
                  fill="currentColor"
                />
                <rect
                  x="10"
                  y="70"
                  width="20"
                  height="20"
                  fill="currentColor"
                />
                <rect
                  x="40"
                  y="40"
                  width="20"
                  height="20"
                  fill="currentColor"
                />
                <rect
                  x="25"
                  y="40"
                  width="10"
                  height="10"
                  fill="currentColor"
                />
                <rect
                  x="45"
                  y="20"
                  width="10"
                  height="10"
                  fill="currentColor"
                />
                <rect
                  x="70"
                  y="55"
                  width="15"
                  height="15"
                  fill="currentColor"
                />
                <rect
                  x="50"
                  y="80"
                  width="10"
                  height="10"
                  fill="currentColor"
                />
              </svg>
              <p class="qr-info">
                Once paid, the owner will verify the transaction.
              </p>
            </div>
            <div v-else class="error-message-box">
              Failed to load booking details.
            </div>
            <button
              @click="confirmPayment"
              :disabled="confirmingPayment || !booking"
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

      <!-- Right Column: Booking Summary -->
      <div class="right-section">
        <div class="summary-box-container">
          <div class="step-header">
            <h2 class="step-title">Booking Summary</h2>
          </div>
          <hr class="divider" />
          <div class="summary-details">
            <div v-if="loading" class="loading-state">
              Loading booking details...
            </div>
            <div v-else-if="errorMessage" class="error-message-box">
              {{ errorMessage }}
            </div>
            <div v-else-if="booking">
              <div class="vehicle-info">
                <img
                  :src="booking.vehicle.vehicleImageUrl"
                  alt="Vehicle Image"
                  class="vehicle-image"
                />
                <h3 class="vehicle-name">
                  {{ booking.vehicle.year }} {{ booking.vehicle.make }}
                  {{ booking.vehicle.model }}
                </h3>
                <p class="location">{{ booking.vehicle.location }}</p>
              </div>
              <div class="booking-info">
                <div class="info-item">
                  <span class="info-label">Rental Dates:</span>
                  <span class="info-value"
                    >{{ booking.startDate }} to {{ booking.endDate }}</span
                  >
                </div>
                <div class="info-item">
                  <span class="info-label">Total Price:</span>
                  <span class="info-value">₱{{ booking.totalPrice }}</span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="paymentMessage"
            :class="{
              'success-message': paymentSuccess,
              'error-message': !paymentSuccess,
            }"
            class="message-box"
          >
            {{ paymentMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "BookingPaymentView",
  props: ["bookingId"],
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
    ...mapGetters(["isAuthReady"]),
  },
  watch: {
    isAuthReady: {
      immediate: true,
      handler(isReady) {
        if (isReady && this.bookingId) {
          console.log(
            `[BookingPaymentView] Auth state is ready. Fetching booking details for ID: ${this.bookingId}`
          );
          this.fetchBookingDetails();
        } else if (!isReady) {
          console.log(
            "[BookingPaymentView] Waiting for auth state to be ready..."
          );
        }
      },
    },
  },
  methods: {
    ...mapActions(["getBookingById", "updateBookingPaymentMethod"]),
    async fetchBookingDetails() {
      this.loading = true;
      this.errorMessage = null;
      this.booking = null;

      try {
        const bookingDetails = await this.getBookingById(this.bookingId);
        const fetchedBooking = { ...bookingDetails };
        if (fetchedBooking.vehicleDetails) {
          fetchedBooking.vehicle = fetchedBooking.vehicleDetails;
        }

        this.booking = fetchedBooking;

        if (!this.booking || !this.booking.id || !this.booking.vehicle) {
          this.errorMessage =
            "Booking data is incomplete or empty after fetch.";
        }
      } catch (error) {
        console.error(
          "[BookingPaymentView] Error fetching booking details:",
          error
        );
        this.errorMessage =
          error.response?.data?.message || "Failed to load booking details.";
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

      const newPaymentStatus = "pending_payment";

      try {
        await this.updateBookingPaymentMethod({
          bookingId: this.bookingId,
          paymentMethod: this.selectedMethod,
          newStatus: newPaymentStatus,
        });

        this.paymentMessage =
          "Booking confirmed! Please wait for the owner to verify your payment.";
        this.paymentSuccess = true;

        setTimeout(() => {
          this.$router.push({
            name: "BookingSummary",
            params: { bookingId: this.bookingId },
          });
        }, 3000);
      } catch (error) {
        console.error(
          "[BookingPaymentView] Error confirming payment method:",
          error
        );
        this.paymentMessage =
          error.response?.data?.message ||
          "Failed to confirm booking. Please try again.";
        this.paymentSuccess = false;
      } finally {
        this.confirmingPayment = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.booking-payment-container {
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.booking-payment-card {
  max-width: 64rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease-in-out;
  color: #333; // Default color for the QR code

  &:hover {
    transform: scale(1.02);
  }

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step.hidden {
  display: none;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: #9ca3af;
  color: #fff;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out;

  &.step-active {
    background-color: #4f46e5;
  }
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.divider {
  border-color: #d1d5db;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-description {
  color: #4b5563;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
  }
}

.payment-button {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid #d1d5db;
  background-color: #fff;
  color: #1f2937;
  font-weight: 500;
  cursor: pointer;
  transition:
    transform 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  flex: 1;

  &:hover {
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px #4f46e5;
  }

  &.selected {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px #4f46e5;
  }
}

.payment-logo {
  height: 2.5rem;
  width: 2.5rem;
  margin-right: 1rem;
  border-radius: 9999px;
}

.next-button,
.confirm-button,
.back-button {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out;
  cursor: pointer;
}

.next-button,
.confirm-button {
  border: 1px solid transparent;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 1rem;
  color: #fff;
  background-color: #4f46e5;
  &:hover {
    background-color: #4338ca;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.back-button {
  background-color: transparent;
  border: none;
  font-size: 0.875rem;
  color: #6b7280;
  &:hover {
    text-decoration: underline;
  }
}

.summary-box-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-state,
.error-message-box {
  text-align: center;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.loading-state {
  background-color: #e0f2fe;
  color: #0c4a6e;
}

.error-message-box {
  background-color: #fee2e2;
  color: #991b1b;
}

.vehicle-info {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #d1d5db;
}

.vehicle-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.vehicle-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.location {
  font-size: 0.875rem;
  color: #6b7280;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #4b5563;
}

.info-label {
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
}

.payment-details {
  text-align: center;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.downpayment-amount {
  font-weight: bold;
  font-size: 1.125rem;
  color: #4f46e5;
}

.payment-qr-code {
  display: block;
  margin: 1rem auto;
  width: 12rem;
  height: 12rem;
  border-radius: 0.5rem;
  border: 4px solid #fff;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.qr-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 1rem;
}

.message-box {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  text-align: center;

  &.success-message {
    color: #166534;
    background-color: #dcfce7;
  }

  &.error-message {
    color: #991b1b;
    background-color: #fee2e2;
  }
}
</style>
