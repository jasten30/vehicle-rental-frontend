<template>
  <div class="container">
    <h1>Booking Summary</h1>
    <p>Your booking request has been submitted. Details for booking ID: {{ bookingId }}</p>

    <div v-if="loading" class="loading-message">
      <p>Loading booking details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBookingDetails" class="button primary-button">Retry</button>
    </div>
    <div v-else-if="booking">
      <div class="booking-details-card">
        <h4>Booking Information</h4>
        <p class="summary-line"><strong>Status:</strong> {{ booking.paymentStatus.replace(/_/g, ' ') }}</p>
        <p v-if="booking.vehicle" class="summary-line">
          <strong>Vehicle:</strong> {{ booking.vehicle.make }} {{ booking.vehicle.model }} ({{ booking.vehicle.year }})
        </p>
        <p class="summary-line"><strong>Dates:</strong> {{ formatDate(booking.startDate) }} to {{ formatDate(booking.endDate) }}</p>

        
        <div class="price-summary">
          <div class="price-row">
            <span>Total Trip Price</span>
            <span>₱{{ booking.totalCost ? booking.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
          </div>
          <hr />
          <div class="price-row downpayment">
            <span>Amount Due for Downpayment (20%)</span>
            <span>₱{{ booking.downPayment ? booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
          </div>
          <div class="price-row remaining-balance">
            <span>Remaining Balance (due at pickup)</span>
            <span>₱{{ booking.remainingBalance ? booking.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
          </div>
        </div>
        

        <p v-if="booking.cancellationGracePeriodEnd" class="summary-line small-text">
          <strong>Cancellation Grace Period Ends:</strong> {{ formatDate(booking.cancellationGracePeriodEnd) }}
        </p>

        <div v-if="booking.paymentDetails && booking.paymentDetails.method === 'qr_manual' && booking.paymentDetails.qrCodeInfo" class="qr-info-section">
          <h5>QR Payment Details</h5>
          <img :src="booking.paymentDetails.qrCodeInfo.qrImageUrl" alt="QR Code" class="qr-image">
          <p><strong>Instructions:</strong> {{ booking.paymentDetails.qrCodeInfo.instructions }}</p>
        </div>
      </div>
    </div>
    <router-link to="/dashboard/my-bookings" class="button primary-button">Go to My Bookings</router-link>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'BookingSummaryView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
    };
  },
  created() {
    if (this.bookingId) {
      this.fetchBookingDetails();
    } else {
      this.errorMessage = 'No booking ID provided.';
      this.loading = false;
    }
  },
  methods: {
    ...mapActions(['getBookingById']),

    async fetchBookingDetails() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const fetchedBooking = await this.getBookingById(this.bookingId);
        if (fetchedBooking && fetchedBooking.vehicleDetails) {
          fetchedBooking.vehicle = fetchedBooking.vehicleDetails;
        }
        this.booking = fetchedBooking;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to load booking summary.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = DateTime.fromISO(dateString);
      return date.isValid ? date.toLocaleString(DateTime.DATE_FULL) : 'Invalid Date';
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  padding: 2rem;
  max-width: 700px;
  margin: 2rem auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

.loading-message, .error-message {
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 5px;
  font-size: 1.1rem;
}

.error-message {
  background-color: #ffe0e0;
  color: #cc0000;
}

.booking-details-card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  text-align: left;
}

.booking-details-card h4 {
  color: #333;
  margin-bottom: 1rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.summary-line {
  margin-bottom: 0.75rem;
  color: #555;
}

.summary-line.small-text {
    font-size: 0.8rem;
    color: #777;
    margin-top: 1rem;
}

.summary-line strong {
  font-weight: 600;
  color: #333;
}

/* --- NEW: Styles for Price Breakdown --- */
.price-summary {
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.price-row span:last-child {
  font-weight: 600;
}

.price-row.downpayment span:last-child {
  color: #28a745;
  font-weight: 700;
  font-size: 1.1rem;
}

.price-row.remaining-balance {
    font-size: 0.9rem;
    color: #6c757d;
}
/* --- End of New Styles --- */

.qr-info-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #ccc;
  text-align: center;
}

.qr-image {
  width: 180px;
  height: 180px;
  border: 1px solid #ddd;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.button:hover {
  background-color: #0056b3;
}
</style>
