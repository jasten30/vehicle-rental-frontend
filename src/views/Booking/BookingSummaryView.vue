<template>
  <transition name="fade-up" appear>
    <div class="container">
      <h1>Booking Summary</h1>
      <p class="subtitle">Your booking request has been submitted successfully!</p>

      <div v-if="loading" class="loading-message">
        <p>Loading booking details...</p>
        </div>
      <div v-else-if="errorMessage" class="error-message">
        <i class="bi bi-exclamation-triangle-fill icon"></i>
        <p>{{ errorMessage }}</p>
        <button @click="fetchBookingDetails" class="button primary">Retry</button>
      </div>
      <div v-else-if="booking" class="booking-details-card">
        <div class="card-header">
          <h4>Booking #{{ bookingId }}</h4>
          <span class="status-badge" :class="getStatusClass(booking.paymentStatus)">
            {{ formatStatus(booking.paymentStatus) }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Vehicle</span>
            <span v-if="booking.vehicle" class="value">
              {{ booking.vehicle.make }} {{ booking.vehicle.model }} ({{ booking.vehicle.year }})
            </span>
             <span v-else class="value">Vehicle details loading...</span>
          </div>
          <div class="info-item">
            <span class="label">Pickup Date & Time</span>
            <span class="value">{{ formatDateTime(booking.startDate) }}</span>
          </div>
           <div class="info-item">
            <span class="label">Return Date & Time</span>
            <span class="value">{{ formatDateTime(booking.endDate) }}</span>
          </div>
        </div>

        <hr class="divider"/>

        <div class="price-summary">
          <h5>Payment Overview</h5>
          <div class="price-row">
            <span>Total Trip Price</span>
            <span class="price-value">₱{{ booking.totalCost ? booking.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
          </div>
          <div class="price-row downpayment">
            <span>Amount Due for Downpayment (20%)</span>
            <span class="price-value highlight">₱{{ booking.downPayment ? booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
          </div>
          <div class="price-row remaining-balance">
            <span>Remaining Balance (due at pickup)</span>
            <span class="price-value">₱{{ booking.remainingBalance ? booking.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
          </div>
        </div>

        <div v-if="booking.paymentDetails && booking.paymentDetails.method === 'qr_manual' && booking.paymentDetails.qrCodeInfo" class="qr-info-section">
           <hr class="divider"/>
           <h5>QR Payment Details</h5>
           <div class="qr-content">
             <img :src="booking.paymentDetails.qrCodeInfo.qrImageUrl" alt="QR Code" class="qr-image">
             <p><strong>Instructions:</strong> {{ booking.paymentDetails.qrCodeInfo.instructions }}</p>
           </div>
        </div>

      </div>
      <router-link to="/dashboard/my-bookings" class="button secondary view-bookings-btn">
         <i class="bi bi-arrow-left"></i> View My Bookings
      </router-link>
    </div>
  </transition>
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
        // Normalize vehicle data
        if (fetchedBooking && fetchedBooking.vehicleDetails) {
          fetchedBooking.vehicle = fetchedBooking.vehicleDetails;
        }
        this.booking = fetchedBooking;
      } catch (error) {
        console.error("Error fetching booking summary:", error); // Log the full error
        this.errorMessage = error.response?.data?.message || 'Failed to load booking summary.';
      } finally {
        this.loading = false;
      }
    },
    // Updated to show Date + Time
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const date = DateTime.fromISO(dateString);
      // Example format: Oct 22, 2025, 9:00 AM
      return date.isValid ? date.toLocaleString(DateTime.DATETIME_MED) : 'Invalid Date';
    },
     // Added for status formatting and styling
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-default';
      if (['confirmed', 'completed', 'returned', 'downpayment_verified'].includes(status)) return 'status-success';
      if (['pending_owner_approval', 'pending_payment', 'downpayment_pending_verification'].includes(status)) return 'status-warning';
      if (status?.includes('cancelled') || status?.includes('declined')) return 'status-danger';
      return 'status-default';
    },
  },
};
</script>

<style lang="scss" scoped>
/* --- Import Variables --- */
@import '@/assets/styles/variables.scss';

/* --- Container and General Styles --- */
.container {
  max-width: 800px; /* Wider container */
  margin: 3rem auto; /* More margin */
  padding: 2.5rem; /* More padding */
  background-color: #ffffff;
  border-radius: $border-radius-xl; /* More rounded */
  box-shadow: $shadow-subtle;
  text-align: center;
  border: 1px solid $border-color-light; /* Subtle border */
}

h1 {
  color: $text-color-dark;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: $text-color-medium;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* --- Loading and Error States --- */
.loading-message, .error-message {
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-radius: $border-radius-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-message {
  color: $text-color-medium;
  font-size: 1.1rem;
}

.error-message {
  background-color: lighten($admin-color, 45%);
  border: 1px solid lighten($admin-color, 35%);
  color: darken($admin-color, 15%);
  .icon {
    font-size: 1.5rem;
    color: $admin-color;
  }
}

/* --- Booking Details Card --- */
.booking-details-card {
  background-color: $background-light; /* Very light gray */
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: 2rem;
  margin-top: 1.5rem;
  text-align: left;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $border-color-light;

  h4 {
    margin: 0;
    color: $text-color-dark;
    font-weight: 600;
  }
}

/* --- Status Badge --- */
.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: $border-radius-pill;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize; /* Cleaner look */
}

.status-success { background-color: lighten($secondary-color, 40%); color: darken($secondary-color, 25%); border: 1px solid lighten($secondary-color, 30%); }
.status-warning { background-color: lighten($accent-color, 40%); color: darken($accent-color, 25%); border: 1px solid lighten($accent-color, 30%); }
.status-danger { background-color: lighten($admin-color, 45%); color: darken($admin-color, 25%); border: 1px solid lighten($admin-color, 35%); }
.status-default { background-color: $background-medium; color: $text-color-medium; border: 1px solid $border-color; }

/* --- Info Grid --- */
.info-grid {
  display: grid;
  grid-template-columns: 1fr; /* Default to single column */
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 576px) { /* Two columns on small screens and up */
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.8rem;
  color: $text-color-light;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
}

.value {
  font-size: 1rem;
  color: $text-color-dark;
  font-weight: 500;
}

/* --- Divider --- */
.divider {
  border: 0;
  border-top: 1px solid $border-color-light;
  margin: 1.5rem 0;
}

/* --- Price Summary --- */
.price-summary {
  margin-top: 1.5rem;
  h5 {
    font-weight: 600;
    color: $text-color-dark;
    margin-bottom: 1rem;
  }
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline; /* Align text nicely */
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: $text-color-medium;

  span:first-child {
    flex-grow: 1; /* Allow label to take space */
    padding-right: 1rem;
  }
}

.price-value {
  font-weight: 600;
  color: $text-color-dark;
  white-space: nowrap; /* Prevent wrapping */

  &.highlight {
    color: $secondary-color; /* Use secondary color for emphasis */
    font-weight: 700;
    font-size: 1.1rem;
  }
}

.price-row.remaining-balance {
  font-size: 0.9rem;
  color: $text-color-light;
  .price-value {
     font-weight: 500;
     color: $text-color-medium;
  }
}

/* --- QR Code Section --- */
.qr-info-section {
  margin-top: 1.5rem;
  h5 {
    font-weight: 600;
    color: $text-color-dark;
    margin-bottom: 1rem;
  }
}
.qr-content {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center QR content */
    gap: 1rem;
    text-align: center;
     p {
        font-size: 0.9rem;
        color: $text-color-medium;
        max-width: 400px; /* Limit instruction width */
        line-height: 1.5;
     }
}

.qr-image {
  max-width: 160px; /* Slightly smaller QR */
  height: auto;
  border: 1px solid $border-color-light;
  padding: 0.5rem;
  background-color: white; /* Ensure white background */
  border-radius: $border-radius-md;
}

/* --- Buttons --- */
.button {
  display: inline-flex; /* Use flex for icon alignment */
  align-items: center;
  gap: 0.5rem; /* Space between icon and text */
  padding: 10px 20px; /* Slightly smaller padding */
  border-radius: $border-radius-md; /* Consistent rounding */
  margin-top: 2.5rem; /* More space above button */
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none; /* Remove underline from router-link */
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;

  &:hover {
     transform: translateY(-2px); /* Subtle lift on hover */
  }
  &:active {
     transform: translateY(0);
  }
}

.button.primary {
  background-color: $primary-color;
  color: white;
  &:hover { background-color: darken($primary-color, 10%); }
}

.button.secondary {
  background-color: transparent;
  color: $primary-color;
  border: 1px solid $primary-color;
  &:hover { background-color: lighten($primary-color, 45%); }
}

/* Specific button margin if needed */
.view-bookings-btn {
  margin-top: 2rem;
}


/* --- Entrance Animation --- */
/* 2. Define the transition classes */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px); /* Start slightly lower */
}
</style>