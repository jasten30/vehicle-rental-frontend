<template>
  <div class="booking-payment-container">
    <h2 class="section-title">Payment for Your Booking</h2>
    <div v-if="loading" class="loading-message">
      <p>Loading booking details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBookingDetails" class="button primary-button">Retry</button>
    </div>
    <div v-else class="payment-card">
      <div class="booking-summary">
        <h4>Booking Summary</h4>
        <!-- Debug info for v-if conditions -->
        <p class="debug-info">Debug: booking is {{ !!booking }}, booking.vehicle is {{ !!(booking && booking.vehicle) }}</p>
        
        <!-- Primary display using booking.vehicle -->
        <p v-if="booking && booking.vehicle" class="summary-line">
          <strong>Vehicle:</strong> {{ booking.vehicle.make }} {{ booking.vehicle.model }} ({{ booking.vehicle.year }})
        </p>
        <!-- Fallback display using booking.vehicleDetails if vehicle isn't directly mapped -->
        <p v-else-if="booking && booking.vehicleDetails" class="summary-line">
          <strong>Vehicle (Fallback):</strong> {{ booking.vehicleDetails.make }} {{ booking.vehicleDetails.model }} ({{ booking.vehicleDetails.year }})
        </p>
        <p v-else class="summary-line"><strong>Vehicle:</strong> Loading vehicle details...</p>

        <p v-if="booking" class="summary-line"><strong>Dates:</strong> {{ formatDate(booking.startDate) }} to {{ formatDate(booking.endDate) }}</p>
        <p v-else class="summary-line"><strong>Dates:</strong> Loading dates...</p>
        <p v-if="booking" class="summary-line"><strong>Total Cost:</strong> ₱{{ booking.totalCost }}</p>
        <p v-else class="summary-line"><strong>Total Cost:</strong> Loading cost...</p>
        <p v-if="booking" class="summary-line"><strong>Downpayment:</strong> ₱{{ booking.downpaymentAmount }}</p>
        <p v-else class="summary-line"><strong>Downpayment:</strong> Loading downpayment...</p>
      </div>

      <div class="payment-options">
        <h4>Choose a Payment Method</h4>
        <div class="payment-buttons">
          <button @click="selectPaymentMethod('cash')" class="button payment-button" :class="{ 'selected': selectedMethod === 'cash' }">
            Pay in Cash (upon pick-up)
          </button>
          <button @click="selectPaymentMethod('qr_manual')" class="button payment-button" :class="{ 'selected': selectedMethod === 'qr_manual' }">
            Pay with QR Code (G-Cash)
          </button>
        </div>
      </div>
      
      <div v-if="selectedMethod" class="payment-action">
        <div v-if="selectedMethod === 'qr_manual'">
          <div class="qr-code-section">
            <p v-if="booking" class="summary-line"><strong>Scan this QR code to pay your downpayment of ₱{{ booking.downpaymentAmount }}:</strong></p>
            <img :src="gcashQrCode" alt="G-Cash QR Code" class="qr-code-image">
            <p class="qr-instructions">
              Please send a screenshot of your payment to the owner for verification. Your booking will be confirmed once payment is verified.
            </p>
          </div>
        </div>
        <button @click="confirmPayment" :disabled="confirmingPayment" class="button primary-button">
          <span v-if="confirmingPayment">Confirming...</span>
          <span v-else>Confirm Booking & Payment</span>
        </button>
        <div v-if="paymentMessage" :class="{'success-message': paymentSuccess, 'error-message': !paymentSuccess}">
          {{ paymentMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { mapActions } from 'vuex';
import gcashQrCode from '@/assets/images/gcash_qr_placeholder.png'; // Make sure you have this image in your assets folder.

export default {
  name: 'BookingPaymentView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: { // Initialize with empty nested objects to ensure reactivity from the start
        vehicle: null, // Will be populated by vehicleDetails
        vehicleDetails: null, // Raw from API
        startDate: null,
        endDate: null,
        totalCost: null,
        downpaymentAmount: null,
        // Add other expected properties here if they are always present
      }, 
      selectedMethod: null,
      confirmingPayment: false,
      paymentMessage: null,
      paymentSuccess: false,
      gcashQrCode: gcashQrCode, // Assign the imported image
    };
  },
  created() {
    console.log('[BookingPaymentView] Component created. Booking ID from route:', this.bookingId);
    if (this.bookingId) {
      this.fetchBookingDetails();
    } else {
      this.errorMessage = 'No booking ID provided. Cannot display payment options.';
      this.loading = false;
      console.error('[BookingPaymentView] No booking ID found in route params.');
    }
  },
  methods: {
    ...mapActions(['getBookingById', 'updateBookingPaymentMethod', 'confirmManualPayment']),

    async fetchBookingDetails() {
      this.loading = true;
      this.errorMessage = null;
      // Do NOT set this.booking = null here, as we initialized it with nested objects
      // Instead, reset its properties
      this.booking = { // Reset to initial empty state to clear old data
        vehicle: null,
        vehicleDetails: null,
        startDate: null,
        endDate: null,
        totalCost: null,
        downpaymentAmount: null,
      }; 

      console.log('[BookingPaymentView] Attempting to fetch booking details for ID:', this.bookingId);
      try {
        const bookingDetails = await this.getBookingById(this.bookingId);
        console.log('[BookingPaymentView] Raw booking details fetched from API:', bookingDetails);
        console.log('[BookingPaymentView] Type of bookingDetails:', typeof bookingDetails);
        console.log('[BookingPaymentView] Keys of bookingDetails:', Object.keys(bookingDetails));
        console.log('[BookingPaymentView] bookingDetails.vehicleDetails:', bookingDetails.vehicleDetails);
        console.log('[BookingPaymentView] bookingDetails.totalCost:', bookingDetails.totalCost);
        
        // Assign fetched data to this.booking, allowing Vue to update reactively
        // Use Object.assign or spread to merge properties, maintaining reactivity
        Object.assign(this.booking, bookingDetails);

        // Ensure vehicleDetails is mapped to vehicle if it exists
        if (this.booking.vehicleDetails) { // Access directly from this.booking now
            this.booking.vehicle = this.booking.vehicleDetails;
            // Optionally: delete this.booking.vehicleDetails; if you want to clean up
        } else {
            console.warn('[BookingPaymentView] No vehicleDetails found in bookingDetails. Check backend response.');
        }
        
        console.log('[BookingPaymentView] Booking data assigned to component (this.booking):', this.booking);

        // Use nextTick to ensure reactivity updates are processed before checking
        this.$nextTick(() => {
            console.log('[BookingPaymentView] Inside $nextTick: this.booking:', this.booking);
            console.log('[BookingPaymentView] Inside $nextTick: this.booking.vehicle:', this.booking?.vehicle);
            console.log('[BookingPaymentView] Inside $nextTick: Condition (booking && booking.vehicle) evaluates to:', !!(this.booking && this.booking.vehicle));

            // Final checks for data after assignment
            if (!this.booking || !this.booking.id) { // Check for booking.id to confirm data presence
                this.errorMessage = 'Booking data is empty after fetch.';
                console.error('[BookingPaymentView] Booking data is null/empty after fetch.');
            } else if (!this.booking.vehicle) {
                this.errorMessage = 'Vehicle details are missing from booking data.';
                console.error('[BookingPaymentView] Vehicle details missing after assignment:', this.booking);
            } else {
                console.log('[BookingPaymentView] Booking and vehicle details successfully loaded and ready for display.');
            }
        });

      } catch (error) {
        console.error('[BookingPaymentView] Error fetching booking details:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load booking details.';
      } finally {
        this.loading = false;
        console.log('[BookingPaymentView] fetchBookingDetails finished. Loading state:', this.loading);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('[BookingPaymentView] Invalid date string provided to formatDate:', dateString);
        return 'Invalid Date';
      }
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    },
    selectPaymentMethod(method) {
      this.selectedMethod = method;
      this.paymentMessage = null; // Clear previous messages
      console.log('[BookingPaymentView] Selected payment method:', method);
    },
    async confirmPayment() {
      if (!this.selectedMethod) {
        this.paymentMessage = 'Please select a payment method.';
        this.paymentSuccess = false;
        console.log('[BookingPaymentView] No payment method selected.');
        return;
      }

      this.confirmingPayment = true;
      this.paymentMessage = null;
      console.log(`[BookingPaymentView] Confirming payment for booking ${this.bookingId} with method: ${this.selectedMethod}`);
      
      // Determine the new payment status based on the selected method
      let newPaymentStatus;
      if (this.selectedMethod === 'cash') {
          newPaymentStatus = 'pending_cash_downpayment';
      } else if (this.selectedMethod === 'qr_manual') {
          newPaymentStatus = 'awaiting_qr_downpayment';
      } else {
          // Fallback or error if an unexpected method is selected
          this.paymentMessage = 'Invalid payment method selected.';
          this.paymentSuccess = false;
          this.confirmingPayment = false;
          console.error('[BookingPaymentView] Unexpected payment method:', this.selectedMethod);
          return;
      }

      try {
        // Call updateBookingPaymentMethod to update the status in the backend
        console.log(`[BookingPaymentView] Calling updateBookingPaymentMethod with bookingId: ${this.bookingId}, paymentMethod: ${this.selectedMethod}, newStatus: ${newPaymentStatus}`);
        await this.updateBookingPaymentMethod({
          bookingId: this.bookingId,
          paymentMethod: this.selectedMethod,
          newStatus: newPaymentStatus, // Pass the new status
        });

        this.paymentMessage = 'Booking confirmed! Please wait for the owner to verify your payment.';
        this.paymentSuccess = true;
        console.log('[BookingPaymentView] Payment method and status updated successfully. Redirecting to summary...');
        
        setTimeout(() => {
            this.$router.push({ name: 'BookingSummary', params: { bookingId: this.bookingId } });
        }, 3000);

      } catch (error) {
        console.error('[BookingPaymentView] Error confirming payment method:', error);
        this.paymentMessage = error.response?.data?.message || 'Failed to confirm booking. Please try again.';
        this.paymentSuccess = false;
      } finally {
        this.confirmingPayment = false;
        console.log('[BookingPaymentView] confirmPayment process finished.');
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/variables.scss';

.booking-payment-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: $background-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: $primary-color;
  margin-bottom: 2rem;
}

.payment-card {
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
}

.booking-summary, .payment-options, .payment-action {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  h4 {
    font-size: 1.25rem;
    color: $text-color-dark;
    margin-bottom: 1rem;
    border-bottom: 2px solid $primary-color;
    display: inline-block;
    padding-bottom: 0.5rem;
  }

  // FIXED: Ensure summary paragraphs are always displayed
  p.summary-line { 
    display: block !important; /* Force display block */
    margin-bottom: 0.5rem; /* Keep original margin */
  }

  .debug-info {
    font-size: 0.8em;
    color: #888;
    margin-top: 0;
    margin-bottom: 1rem;
  }
}

.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-button {
  width: 100%;
  padding: 1rem;
  border: 2px solid $primary-color;
  background-color: transparent;
  color: $primary-color;
  font-weight: 600;
  font-size: 1rem;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: $primary-color;
    color: white;
  }

  &.selected {
    background-color: $primary-color;
    color: white;
  }
}

.qr-code-section {
  text-align: center;
  margin-top: 1.5rem;

  .qr-code-image {
    width: 200px;
    height: 200px;
    border: 1px solid #e0e0e0;
    padding: 0.5rem;
    background-color: white;
    border-radius: $border-radius-sm;
    margin: 1rem 0;
  }
  
  .qr-instructions {
    font-size: 0.9rem;
    color: $text-color-medium;
  }
}

.button.primary-button {
  margin-top: 1.5rem;
}

.success-message, .error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: $border-radius-md;
  text-align: center;
}

.success-message {
  background-color: #dcfce7;
  color: #22c55e;
}

.error-message {
  background-color: #fee2e2;
  color: #ef4444;
}

.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: $text-color-medium;
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
  width: 100%;
}
</style>
