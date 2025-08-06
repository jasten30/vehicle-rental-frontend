<template>
  <div class="booking-detail-container">
    <h2 class="section-title">Booking Details</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading booking details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBooking" class="button primary-button">Retry Load Booking</button>
    </div>

    <div v-else-if="booking" class="booking-details-card">
      <div class="card-header">
        <h3 class="booking-id">Booking ID: {{ booking.id }}</h3>
        <span class="booking-status" :class="getStatusClass(booking.paymentStatus)">
          {{ formatStatus(booking.paymentStatus) }}
        </span>
      </div>

      <div class="card-body">
        <div class="vehicle-info-section">
          <img :src="booking.vehicle.imageUrl || getPlaceholderImage(200, 150, 'cccccc', '333333', 'No Image')"
               :alt="`${booking.vehicle.make} ${booking.vehicle.model}`"
               class="vehicle-image"
               @error="booking.vehicle.imageUrl = getPlaceholderImage(200, 150, 'cccccc', '333333', 'No Image')">
          <div class="vehicle-details-summary">
            <h4>{{ booking.vehicle.make }} {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</h4>
            <p>License Plate: {{ booking.vehicle.licensePlate || 'N/A' }}</p>
            <p>Location: {{ booking.vehicle.location }}</p>
            <p>Daily Rate: ₱{{ booking.vehicle.rentalPricePerDay }}</p>
          </div>
        </div>

        <!-- Booking Summary Toggle Button -->
        <button @click="toggleBookingSummary" class="button primary-button toggle-summary-button">
          {{ showBookingSummary ? 'Hide Booking Summary' : 'Show Booking Summary' }}
        </button>

        <!-- Booking Summary Section (conditionally rendered) -->
        <div v-if="showBookingSummary" class="booking-summary-section">
          <h4>Booking Summary</h4>
          <p>Pickup Date: {{ formatDate(booking.startDate) }}</p>
          <p>Return Date: {{ formatDate(booking.endDate) }}</p>
          <p>Booked On: {{ formatDateTime(booking.createdAt) }}</p>
          <p>Total Cost: {{ formatPrice(booking.totalCost) }}</p>
          <p>Downpayment: {{ formatPrice(booking.downpaymentAmount) }}</p>
          <p>Remaining Due: {{ formatPrice(booking.fullPaymentAmount) }}</p>
          <p v-if="booking.downpaymentDueDate">Downpayment Due By: {{ formatDate(booking.downpaymentDueDate) }}</p>
          <p v-if="booking.cancellationGracePeriodEnd">Cancellation Grace Period Ends: {{ formatDateTime(booking.cancellationGracePeriodEnd) }}</p>
        </div>

        <!-- Owner/Admin Action Section -->
        <!-- TEMPORARILY SIMPLIFIED V-IF FOR DEBUGGING -->
        <div v-if="booking && user" class="admin-actions debug-admin-actions-border">
          <p class="debug-text">--- DEBUG: ADMIN ACTIONS SECTION IS VISIBLE ---</p>
          <p class="debug-text">User Role: {{ userRole }}</p>
          <p class="debug-text">User UID: {{ user.uid }}</p>
          <p class="debug-text">Booking Payment Status: {{ booking.paymentStatus }}</p>
          <p class="debug-text">Booking Vehicle Owner ID: {{ booking.vehicle ? booking.vehicle.ownerId : 'N/A' }}</p>

          <h4>Owner/Admin Actions</h4>
          <!-- Actual button, still conditional on original logic -->
          <button v-if="(userRole === 'admin' || (userRole === 'owner' && booking.vehicle && booking.vehicle.ownerId === user.uid)) && (booking.paymentStatus === 'pending_cash_downpayment' || booking.paymentStatus === 'awaiting_qr_downpayment' || booking.paymentStatus === 'qr_downpayment_confirmed_by_user')"
                  @click="markDownpaymentReceived" :disabled="confirmingDownpayment" class="button success-button">
            <span v-if="confirmingDownpayment">Confirming...</span>
            <span v-else>Mark Downpayment Received</span>
          </button>
          <div v-if="adminActionMessage" :class="{'success-message': adminActionSuccess, 'error-message': !adminActionSuccess}">
            {{ adminActionMessage }}
          </div>
        </div>

        <button @click="goBack" class="button secondary-button">Back to My Bookings</button>
        <button v-if="canCancelBooking" @click="cancelBooking" :disabled="cancellingBooking" class="button danger-button">
          <span v-if="cancellingBooking">Cancelling...</span>
          <span v-else>Cancel Booking</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'BookingDetailView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
      cancellingBooking: false,
      confirmingDownpayment: false,
      adminActionMessage: null,
      adminActionSuccess: false,
      showBookingSummary: false, // Controls visibility of the summary section
    };
  },
  computed: {
    ...mapGetters(['userRole', 'user']),
    canCancelBooking() {
      if (!this.booking) return false;
      const cancellableStatuses = [
        'pending_payment_selection',
        'pending_cash_downpayment',
        'awaiting_qr_downpayment',
        'qr_downpayment_confirmed_by_user',
        'downpayment_received'
      ];
      return cancellableStatuses.includes(this.booking.paymentStatus);
    },
    // Removed canShowAdminActions computed property for this debug step
  },
  watch: {
    bookingId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          console.log('[BookingDetailView] bookingId watcher triggered. New ID:', newId);
          this.fetchBooking();
        }
      },
    },
  },
  created() {
    console.log('[BookingDetailView] Component created.');
  },
  methods: {
    ...mapActions(['getBookingById', 'cancelBooking', 'updateBookingStatusAdmin']),

    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    async fetchBooking() {
      this.loading = true;
      this.errorMessage = null;
      this.booking = null;
      console.log('[BookingDetailView] fetchBooking called for ID:', this.bookingId);
      try {
        const fetchedBooking = await this.getBookingById(this.bookingId);
        console.log('[BookingDetailView] Fetched booking details (for inspection):', fetchedBooking);
        
        if (fetchedBooking && fetchedBooking.vehicleDetails) {
            fetchedBooking.vehicle = fetchedBooking.vehicleDetails;
            delete fetchedBooking.vehicleDetails;
        }

        this.booking = fetchedBooking;

        // --- DIRECT DEBUG LOGS AFTER BOOKING IS SET ---
        console.log('--- Direct Admin Action Debugging ---');
        console.log(`[Direct Debug] Current User Role: "${this.userRole}"`);
        console.log(`[Direct Debug] Current User UID: "${this.user ? this.user.uid : 'User object not available'}"`);
        console.log(`[Direct Debug] Booking Payment Status: "${this.booking ? this.booking.paymentStatus : 'Booking not available'}"`);
        console.log(`[Direct Debug] Booking Vehicle Owner ID: "${this.booking && this.booking.vehicle ? this.booking.vehicle.ownerId : 'Vehicle or ownerId not available'}"`);
        console.log('-------------------------------------');

      } catch (error) {
        console.error('[BookingDetailView] Error fetching booking details:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load booking details.';
      } finally {
        this.loading = false;
        console.log('[BookingDetailView] fetchBooking finished. Loading state:', this.loading);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = DateTime.fromISO(dateString);
      if (!date.isValid) {
        console.warn(`[formatDate] Invalid date string: ${dateString}`);
        return 'Invalid Date';
      }
      return date.toLocaleString(DateTime.DATE_FULL);
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = DateTime.fromISO(dateString);
      if (!date.isValid) {
        console.warn(`[formatDateTime] Invalid date string: ${dateString}`);
        return 'Invalid Date/Time';
      }
      return date.toLocaleString(DateTime.DATETIME_SHORT);
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    },
    getStatusClass(status) {
      switch (status) {
        case 'pending_payment_selection':
        case 'pending_cash_downpayment':
        case 'awaiting_qr_downpayment':
        case 'qr_downpayment_confirmed_by_user':
          return 'status-pending';
        case 'downpayment_received':
          return 'status-downpayment-received';
        case 'full_payment_received':
          return 'status-full-payment-received';
        case 'cancelled_no_downpayment':
        case 'cancelled_by_user_after_grace_period':
        case 'cancelled_within_grace_period':
          return 'status-cancelled';
        case 'refunded':
          return 'status-refunded';
        default:
          return 'status-unknown';
      }
    },
    formatPrice(price) {
      if (typeof price !== 'number' || isNaN(price)) {
        console.warn(`[formatPrice] Invalid price value: ${price}`);
        return 'N/A';
      }
      return `₱${price.toFixed(2)}`;
    },
    async cancelBooking() {
      if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
      }
      this.cancellingBooking = true;
      try {
        await this.cancelBooking(this.bookingId);
        alert('Booking cancelled successfully!');
        this.fetchBooking();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking: ' + (error.response?.data?.message || error.message));
      } finally {
        this.cancellingBooking = false;
      }
    },
    async markDownpaymentReceived() {
      if (!confirm('Are you sure you want to mark this downpayment as RECEIVED? This action cannot be undone.')) {
        return;
      }

      this.confirmingDownpayment = true;
      this.adminActionMessage = null;
      this.adminActionSuccess = false;
      try {
        console.log(`[BookingDetailView] Attempting to mark downpayment received for booking ID: ${this.bookingId}`);
        await this.updateBookingStatusAdmin({
          bookingId: this.bookingId,
          newStatus: 'downpayment_received'
        });
        this.adminActionMessage = 'Downpayment successfully marked as received!';
        this.adminActionSuccess = true;
        this.fetchBooking(); // Re-fetch booking to update status in UI
        console.log('[BookingDetailView] Downpayment marked received and booking re-fetched.');
      } catch (error) {
        console.error('[BookingDetailView] Error marking downpayment received:', error);
        this.adminActionMessage = 'Failed to mark downpayment received: ' + (error.response?.data?.message || error.message);
        this.adminActionSuccess = false;
      } finally {
        this.confirmingDownpayment = false;
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    toggleBookingSummary() {
      this.showBookingSummary = !this.showBookingSummary;
      console.log('[BookingDetailView] Toggled Booking Summary visibility to:', this.showBookingSummary);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.booking-detail-container {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: $text-color-medium;
}

.error-message {
  color: #ef4444;
  font-weight: 600;
  background-color: #fee2e2;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.success-message {
  color: #22c55e;
  font-weight: 600;
  background-color: #dcfce7;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.booking-details-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
}

.card-header {
  background-color: lighten($primary-color, 45%);
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.booking-id {
  font-size: 1.5rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0;
}

.booking-status {
  padding: 0.4rem 0.8rem;
  border-radius: $border-radius-sm;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.status-pending {
  background-color: #fffbe6; /* light yellow */
  color: #d97706; /* dark yellow */
}

.status-downpayment-received {
  background-color: #dcfce7; /* light green */
  color: #16a34a; /* dark green */
}

.status-full-payment-received {
  background-color: #eff6ff; /* light blue */
  color: #2563eb; /* dark blue */
}

.status-cancelled {
  background-color: #fee2e2; /* light red */
  color: #dc2626; /* dark red */
}

.status-refunded {
  background-color: #e0f2fe; /* very light blue */
  color: #0284c7; /* medium blue */
}

.status-unknown {
  background-color: #e5e7eb;
  color: #4b5563;
}

.card-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.vehicle-info-section {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  padding: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.vehicle-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: $border-radius-sm;
  box-shadow: $shadow-light;
  flex-shrink: 0;
}

.vehicle-details-summary {
  flex-grow: 1;
  h4 {
    font-size: 1.25rem;
    color: $primary-color;
    margin-bottom: 0.75rem;
  }
  p {
    font-size: 0.95rem;
    color: $text-color-dark;
    margin-bottom: 0.4rem;
  }
}

.booking-summary-section {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  padding: 1.5rem;

  h4 {
    font-size: 1.25rem;
    color: $primary-color;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
  }

  p {
    display: block !important;
    font-size: 1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
  }

  strong {
    font-weight: 600;
  }
}

.admin-actions {
  background-color: #f0fdf4; /* Light green background for admin actions */
  border: 1px solid #dcfce7;
  border-radius: $border-radius-md;
  padding: 1.5rem;
  text-align: center;
  margin-top: 1.5rem;

  h4 {
    font-size: 1.2rem;
    color: #16a34a; /* Dark green for admin action title */
    margin-bottom: 1rem;
  }
}

.debug-admin-actions-border {
  border: 2px dashed blue !important;
  background-color: rgba(0, 0, 255, 0.1) !important;
}

.debug-text {
  color: blue !important;
  font-weight: bold !important;
  margin-bottom: 10px !important;
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
  width: auto;
  min-width: 150px;
  margin-top: 1rem;
  margin-right: 1rem; /* Space between buttons */

  &:last-child {
    margin-right: 0;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: #6b7280;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#6b7280, 10%);
  }
}

.success-button {
  background-color: #22c55e;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#22c55e, 10%);
  }
}

.danger-button {
  background-color: #ef4444;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#ef4444, 10%);
  }
}

.toggle-summary-button {
  margin-top: 1rem;
  align-self: flex-start; // Align to the left
  min-width: 200px; // Ensure enough width for the text
  background-color: #60a5fa; // A distinct color for the toggle button
  &:hover {
    background-color: darken(#60a5fa, 10%);
  }
}
</style>
