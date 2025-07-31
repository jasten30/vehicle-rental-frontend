<template>
  <div class="container">
    <h1>Booking Summary</h1>
    <p>Your booking has been processed. Details for booking ID: {{ bookingId }}</p>

    <div v-if="loading" class="loading-message">
      <p>Loading booking details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBookingDetails" class="button primary-button">Retry Load Booking</button>
    </div>
    <div v-else-if="booking">
      <div class="booking-details-card">
        <h4>Booking Information</h4>
        <!-- Debug info for v-if conditions -->
        <p class="debug-info">Debug: booking is {{ !!booking }}, booking.vehicle is {{ !!(booking && booking.vehicle) }}</p>

        <p class="summary-line"><strong>Status:</strong> {{ booking.paymentStatus }}</p>
        <p v-if="booking.vehicle" class="summary-line">
          <strong>Vehicle:</strong> {{ booking.vehicle.make }} {{ booking.vehicle.model }} ({{ booking.vehicle.year }})
        </p>
        <p v-else class="summary-line"><strong>Vehicle:</strong> Details not available</p>
        <p class="summary-line"><strong>Dates:</strong> {{ formatDate(booking.startDate) }} to {{ formatDate(booking.endDate) }}</p>
        <p class="summary-line"><strong>Total Cost:</strong> ₱{{ booking.totalCost }}</p>
        <p class="summary-line"><strong>Downpayment:</strong> ₱{{ booking.downpaymentAmount }}</p>
        <p class="summary-line"><strong>Full Payment Due:</strong> ₱{{ booking.fullPaymentAmount }}</p>
        <p v-if="booking.downpaymentDueDate" class="summary-line">
          <strong>Downpayment Due By:</strong> {{ formatDate(booking.downpaymentDueDate) }}
        </p>
        <p v-if="booking.cancellationGracePeriodEnd" class="summary-line">
          <strong>Cancellation Grace Period Ends:</strong> {{ formatDate(booking.cancellationGracePeriodEnd) }}
        </p>

        <!-- Display QR code info if applicable and payment method was QR -->
        <div v-if="booking.paymentDetails && booking.paymentDetails.method === 'qr_manual' && booking.paymentDetails.qrCodeInfo" class="qr-info-section">
          <h5>QR Payment Details</h5>
          <img :src="booking.paymentDetails.qrCodeInfo.qrImageUrl" alt="QR Code" class="qr-image">
          <p class="summary-line"><strong>Amount to Pay:</strong> ₱{{ booking.paymentDetails.qrCodeInfo.amountToPay }}</p>
          <p class="summary-line"><strong>Instructions:</strong> {{ booking.paymentDetails.qrCodeInfo.instructions }}</p>
          <p class="summary-line"><strong>Reference ID:</strong> {{ booking.paymentDetails.qrCodeInfo.qrRefId }}</p>
        </div>
      </div>
    </div>
    <router-link to="/dashboard/my-bookings" class="button primary-button">Go to My Bookings</router-link>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon'; // Import DateTime for date formatting

export default {
  name: 'BookingSummaryView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null, // Initialize booking as null
    };
  },
  created() {
    console.log('[BookingSummaryView] Component created. Booking ID from route:', this.bookingId);
    if (this.bookingId) {
      this.fetchBookingDetails();
    } else {
      this.errorMessage = 'No booking ID provided. Cannot display summary.';
      this.loading = false;
      console.error('[BookingSummaryView] No booking ID found in route params.');
    }
  },
  methods: {
    ...mapActions(['getBookingById']), // Map the action to fetch booking details

    async fetchBookingDetails() {
      this.loading = true;
      this.errorMessage = null;
      this.booking = null; // Clear previous booking data
      console.log('[BookingSummaryView] Attempting to fetch booking details for ID:', this.bookingId);
      try {
        const fetchedBooking = await this.getBookingById(this.bookingId);
        console.log('[BookingSummaryView] Raw booking details fetched:', fetchedBooking);

        // Ensure vehicleDetails is mapped to vehicle if it exists
        if (fetchedBooking && fetchedBooking.vehicleDetails) {
            fetchedBooking.vehicle = fetchedBooking.vehicleDetails;
            delete fetchedBooking.vehicleDetails; // Clean up if you prefer 'vehicle'
        }

        this.booking = fetchedBooking;
        console.log('[BookingSummaryView] Booking data assigned to component:', this.booking);

        if (!this.booking) {
            this.errorMessage = 'Booking data is empty after fetch.';
            console.error('[BookingSummaryView] Booking data is null/empty after fetch.');
        } else if (!this.booking.vehicle) {
            this.errorMessage = 'Vehicle details are missing from booking data.';
            console.error('[BookingSummaryView] Vehicle details missing:', this.booking);
        } else {
            console.log('[BookingSummaryView] Booking and vehicle details successfully loaded.');
        }

      } catch (error) {
        console.error('[BookingSummaryView] Error fetching booking details:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load booking summary. Please try again.';
      } finally {
        this.loading = false;
        console.log('[BookingSummaryView] fetchBookingDetails finished. Loading state:', this.loading);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = DateTime.fromISO(dateString);
      if (!date.isValid) {
        console.warn('[BookingSummaryView] Invalid date string provided to formatDate:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleString(DateTime.DATE_FULL); // e.g., "September 14, 2023"
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  padding: 2rem;
  max-width: 700px; /* Increased max-width for better layout */
  margin: 2rem auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #007bff;
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
  text-align: left; /* Align text left within the card */
}

.booking-details-card h4 {
  color: #007bff;
  margin-bottom: 1rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  display: inline-block; /* Make border-bottom only as wide as text */
}

/* FIXED: Ensure summary paragraphs are always displayed */
.booking-details-card p.summary-line { 
  display: block !important; /* Force display block */
  margin-bottom: 0.5rem; /* Keep original margin */
  color: #333; /* Ensure text color is visible */
}

.booking-details-card strong {
  font-weight: 600;
}

.qr-info-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #ccc;
  text-align: center; /* Center QR code and its info */
}

.qr-info-section h5 {
  color: #007bff;
  margin-bottom: 1rem;
}

.qr-image {
  width: 180px;
  height: 180px;
  border: 1px solid #ddd;
  padding: 0.5rem;
  background-color: white;
  margin-bottom: 1rem;
}

.button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 2rem; /* More space below details */
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.button:hover {
  background-color: #0056b3;
}

.primary-button {
    /* Inherits from .button, no need to redefine */
}

.debug-info {
    font-size: 0.8em;
    color: #888;
    margin-top: 0;
    margin-bottom: 1rem;
}
</style>
