<!-- frontend/src/views/Dashboard/BookingDetailView.vue -->
<template>
  <div class="booking-detail-container">
    <h2 class="section-title">Booking Details</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading booking details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBooking" class="button primary-button">Retry</button>
    </div>

    <div v-else-if="booking" class="booking-details-card" :key="booking.id">
      <div class="card-header">
        <h3 class="booking-id">Booking ID: {{ booking.id }}</h3>
        <span :class="getStatusClass(booking.paymentStatus)">{{ formatStatus(booking.paymentStatus) }}</span>
      </div>

      <div class="card-body">
        <div v-if="booking.vehicleDetails" class="vehicle-info">
          <img :src="booking.vehicleDetails.imageUrl || getPlaceholderImage(200, 150, 'cccccc', '333333', 'No Image')"
               :alt="`${booking.vehicleDetails.make} ${booking.vehicleDetails.model}`"
               class="vehicle-image"
               @error="booking.vehicleDetails.imageUrl = getPlaceholderImage(200, 150, 'cccccc', '333333', 'No Image')">
          <div class="vehicle-details-text">
            <h4>{{ booking.vehicleDetails.make }} {{ booking.vehicleDetails.model }} ({{ booking.vehicleDetails.year }})</h4>
            <!-- Changed from p to div for robust styling -->
            <div class="detail-line"><strong>License Plate:</strong> {{ booking.licensePlate || 'N/A' }}</div>
            <div class="detail-line"><strong>Location:</strong> {{ booking.vehicleDetails.location }}</div>
            <div class="detail-line"><strong>Daily Rate:</strong> ₱{{ booking.vehicleDetails.rentalPricePerDay }}</div>
          </div>
        </div>

        <div class="booking-summary-details">
          <h4>Booking Summary</h4>
          <!-- Changed from p to div for robust styling -->
          <div v-if="booking.startDate" class="detail-line"><strong>Pickup Date:</strong> {{ formatDate(booking.startDate) }}</div>
          <div v-if="booking.endDate" class="detail-line"><strong>Return Date:</strong> {{ formatDate(booking.endDate) }}</div>
          <div v-if="booking.createdAt" class="detail-line"><strong>Booked On:</strong> {{ formatDate(booking.createdAt) }}</div>
          <div v-if="booking.totalCost" class="detail-line"><strong>Total Cost:</strong> ₱{{ booking.totalCost }}</div>
          <div v-if="booking.downpaymentAmount" class="detail-line"><strong>Downpayment Paid:</strong> ₱{{ booking.downpaymentAmount }}</div>
          <div v-if="booking.fullPaymentAmount" class="detail-line"><strong>Remaining Due:</strong> ₱{{ booking.fullPaymentAmount }}</div>
          <div v-if="booking.paymentDetails?.method" class="detail-line"><strong>Payment Method:</strong> {{ formatPaymentMethod(booking.paymentDetails.method) }}</div>
        </div>

        <div v-if="booking.paymentStatus === 'awaiting_qr_downpayment' && booking.paymentDetails?.qrCodeInfo" class="qr-payment-section">
          <h4>QR Payment Instructions</h4>
          <div class="qr-code-display">
            <img :src="booking.paymentDetails.qrCodeInfo.qrCodeImageUrl" alt="QR Code" class="qr-image">
            <p class="qr-instructions">{{ booking.paymentDetails.qrCodeInfo.instructions }}</p>
            <p class="qr-account">
              <strong>Account Name:</strong> RentCycle PH <br>
              <strong>GCash/Maya Number:</strong> 0917-XXX-XXXX (Example)
            </p>
          </div>
          <button @click="confirmQrPayment" :disabled="confirmingQr" class="button secondary-button confirm-qr-button">
            <span v-if="confirmingQr">Confirming...</span>
            <span v-else>I Have Paid via QR</span>
          </button>
          <p class="note">Your booking will be confirmed after we manually verify your QR payment.</p>
        </div>

        <div v-if="booking.downpaymentDueDate" class="payment-due-info">
          <p class="detail-line"><strong>Downpayment Due By:</strong> {{ formatDate(booking.downpaymentDueDate) }}</p>
        </div>

        <div v-if="booking.cancellationGracePeriodEnd" class="grace-period-info">
          <p class="detail-line"><strong>Cancellation Grace Period Ends:</strong> {{ formatDate(booking.cancellationGracePeriodEnd) }}</p>
          <p class="note">You may be eligible for a refund if cancelled within this period.</p>
        </div>

      </div>

      <div class="card-actions">
        <button
          v-if="canCancel(booking.paymentStatus)"
          @click="attemptCancelBooking(booking.id)"
          :disabled="cancellingBooking"
          class="button cancel-button"
        >
          <span v-if="cancellingBooking">Cancelling...</span>
          <span v-else>Cancel Booking</span>
        </button>
        <button @click="goBack" class="button secondary-button">Back to My Bookings</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'BookingDetailView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      booking: null,
      errorMessage: null,
      cancellingBooking: false,
      confirmingQr: false,
    };
  },
  // Add beforeRouteEnter guard
  beforeRouteEnter(to, from, next) {
    console.log(`[BookingDetailView] beforeRouteEnter: Navigating from ${from.path} to ${to.path}`);
    next();
  },
  created() {
    console.log('[BookingDetailView] Component created.');
    // The watch handler for bookingId will trigger fetchBooking
  },
  watch: {
    bookingId: {
      immediate: true,
      handler(newId) {
        console.log(`[BookingDetailView] bookingId watcher triggered. New ID: ${newId}`);
        if (newId) {
          this.fetchBooking();
        } else {
          // If bookingId becomes null/undefined, reset state
          this.booking = null;
          this.errorMessage = 'No booking ID provided.';
          this.loading = false;
          console.warn('[BookingDetailView] No booking ID provided to watcher.');
        }
      },
    },
  },
  methods: {
    ...mapActions(['getBookingById', 'cancelBooking', 'confirmManualQrPayment']),

    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    formatDate(isoString) {
      // console.log(`[formatDate] Input:`, isoString, `Type:`, typeof isoString); // Removed debug log
      if (!isoString) return 'N/A';
      const date = typeof isoString === 'string' ? DateTime.fromISO(isoString) : DateTime.fromJSDate(isoString);
      if (!date.isValid) {
        console.error(`[formatDate] Invalid date after parsing:`, isoString);
        return 'Invalid Date';
      }
      return date.toLocaleString(DateTime.DATE_FULL);
    },
    formatPaymentMethod(method) {
      // console.log(`[formatPaymentMethod] Input:`, method, `Type:`, typeof method); // Removed debug log
      if (method === 'cash') return 'Cash on Pickup';
      if (method === 'qr_manual') return 'GCash/Maya QR Scan & Pay (Manual Verification)';
      return method;
    },
    formatStatus(status) {
      switch (status) {
        case 'pending_cash_downpayment': return 'Pending Cash Downpayment';
        case 'awaiting_qr_downpayment': return 'Awaiting QR Downpayment';
        case 'qr_downpayment_confirmed_by_user': return 'QR Downpayment Confirmed (Awaiting Verification)';
        case 'downpayment_received': return 'Downpayment Received';
        case 'full_payment_received': return 'Full Payment Received';
        case 'cancelled_no_downpayment': return 'Cancelled (No Downpayment)';
        case 'cancelled_by_user_after_grace_period': return 'Cancelled (Downpayment Forfeited)';
        case 'cancelled_within_grace_period': return 'Cancelled (Refund Eligible)';
        case 'refunded': return 'Refunded';
        default: return status;
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 'downpayment_received':
        case 'full_payment_received': return 'status-success';
        case 'pending_cash_downpayment':
        case 'awaiting_qr_downpayment':
        case 'qr_downpayment_confirmed_by_user': return 'status-pending';
        case 'cancelled_no_downpayment':
        case 'cancelled_by_user_after_grace_period': return 'status-cancelled';
        case 'cancelled_within_grace_period':
        case 'refunded': return 'status-info';
        default: return 'status-default';
      }
    },
    canCancel(status) {
      const cancellableStatuses = [
        'pending_cash_downpayment',
        'awaiting_qr_downpayment',
        'qr_downpayment_confirmed_by_user',
        'downpayment_received'
      ];
      return cancellableStatuses.includes(status);
    },
    async fetchBooking() {
      console.log(`[BookingDetailView] fetchBooking called for ID: ${this.bookingId}`);
      this.loading = true;
      this.errorMessage = null;
      this.booking = null; // Reset booking to null to ensure reactivity
      try {
        const fetchedBooking = await this.getBookingById(this.bookingId);
        this.booking = fetchedBooking;
        console.log('[BookingDetailView] Fetched booking details (for inspection):', this.booking);
      } catch (error) {
        console.error('[BookingDetailView] Error fetching booking details:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load booking details. Please try again.';
        // If it fails, consider redirecting back or showing a prominent error
        // this.$router.push('/dashboard/my-bookings'); // Only if severe error and cannot recover
      } finally {
        this.loading = false;
        console.log('[BookingDetailView] fetchBooking finished. Loading state:', this.loading);
      }
    },
    async attemptCancelBooking() {
      if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        this.cancellingBooking = true;
        this.errorMessage = null;
        try {
          const response = await this.cancelBooking(this.booking.id);
          alert(response.message);
          this.fetchBooking();
        } catch (error) {
          console.error('[BookingDetailView] Error cancelling booking:', error);
          this.errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
        } finally {
          this.cancellingBooking = false;
        }
      }
    },
    async confirmQrPayment() {
      if (confirm('Are you sure you want to confirm you have paid via QR? This will be subject to verification.')) {
        this.confirmingQr = true;
        this.errorMessage = null;
        try {
          const response = await this.confirmManualQrPayment(this.booking.id);
          alert(response.message);
          this.fetchBooking();
        } catch (error) {
          console.error('[BookingDetailView] Error confirming QR payment:', error);
          this.errorMessage = error.response?.data?.message || 'Failed to confirm QR payment. Please try again.';
        } finally {
          this.confirmingQr = false;
        }
      }
    },
    goBack() {
      console.log('[BookingDetailView] Going back to My Bookings.');
      this.$router.push('/dashboard/my-bookings'); // Explicitly push to the list view
    },
  },
};
</script>

<style lang="scss"> /* No 'scoped' attribute */
@import '../../assets/styles/variables.scss';

.booking-detail-container {
  padding: 1.5rem;
  max-width: 800px;
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

.booking-details-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  background-color: lighten($primary-color, 45%);
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.booking-id {
  font-size: 1.4rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0;
}

.card-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.vehicle-info {
  display: flex;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e0e0e0;
  align-items: flex-start;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.vehicle-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  flex-shrink: 0;
}

.vehicle-details-text {
  flex-grow: 1;
  h4 {
    font-size: 1.5rem;
    color: $text-color-dark;
    margin-bottom: 0.75rem;
  }
  .detail-line { /* New class for detail lines */
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: $text-color-dark;
    strong {
      font-weight: 600;
    }
  }
}

.booking-summary-details, .qr-payment-section, .payment-due-info, .grace-period-info {
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
  .detail-line { /* New class for detail lines */
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: $text-color-dark;
    strong {
      font-weight: 600;
    }
  }
  .note {
    font-size: 0.9rem;
    color: $text-color-medium;
    font-style: italic;
    margin-top: 1rem;
  }
}

.qr-code-display {
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  background-color: white;
  border: 1px dashed #ccc;
  border-radius: $border-radius-sm;
}

.qr-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 1rem;
  border: 1px solid #eee;
  border-radius: $border-radius-sm;
}

.qr-instructions {
  font-size: 0.95rem;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.qr-account {
  font-size: 0.9rem;
  color: $text-color-medium;
  line-height: 1.4;
}

.confirm-qr-button {
  margin-top: 1rem;
  width: auto;
  padding: 0.75rem 1.5rem;
}

.card-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  border: 1px solid $primary-color;
  &:hover {
    background-color: darken($primary-color, 10%);
    transform: translateY(-2px);
  }
}

.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border: 1px solid $primary-color;
  &:hover {
    background-color: lighten($primary-color, 40%);
    transform: translateY(-2px);
  }
}

.cancel-button {
  background-color: #ef4444;
  color: white;
  border: 1px solid #ef4444;
  &:hover:not(:disabled) {
    background-color: darken(#ef4444, 10%);
    transform: translateY(-2px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

/* Status Badges */
.status-success {
  background-color: #dcfce7;
  color: #22c55e;
  padding: 0.3em 0.7em;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-pending {
  background-color: #fef3c7;
  color: #f59e0b;
  padding: 0.3em 0.7em;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #ef4444;
  padding: 0.3em 0.7em;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-info {
  background-color: #eff6ff;
  color: #3b82f6;
  padding: 0.3em 0.7em;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-default {
  background-color: #e5e7eb;
  color: $text-color-dark;
  padding: 0.3em 0.7em;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
