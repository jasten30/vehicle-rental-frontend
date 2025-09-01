<template>
  <div class="my-bookings-container">
    <h2 class="section-title">My Bookings</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading your bookings...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBookings" class="button primary-button">
        Retry Load Bookings
      </button>
    </div>

    <div v-else-if="bookings.length === 0" class="no-bookings-message">
      <p>You have no active or past bookings.</p>
      <router-link to="/vehicles" class="button primary-button"
        >Browse Vehicles</router-link
      >
    </div>

    <div v-else class="bookings-list">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="card-header">
          <h3 class="booking-id">Booking ID: {{ booking.id }}</h3>
          <span :class="getStatusClass(booking.paymentStatus)">{{
            formatStatus(booking.paymentStatus)
          }}</span>
        </div>
        <div class="card-body">
          <!-- ADDED v-if="booking.vehicleDetails" here -->
          <div v-if="booking.vehicleDetails" class="vehicle-summary">
            <img
              :src="
                booking.vehicleDetails.imageUrl ||
                getPlaceholderImage(100, 75, 'cccccc', '333333', 'No Image')
              "
              :alt="`${booking.vehicleDetails.make} ${booking.vehicleDetails.model}`"
              class="vehicle-thumbnail"
              @error="
                booking.vehicleDetails.imageUrl = getPlaceholderImage(
                  100,
                  75,
                  'cccccc',
                  '333333',
                  'No Image'
                )
              "
            />
            <div class="vehicle-text">
              <h4>
                {{ booking.vehicleDetails.make }}
                {{ booking.vehicleDetails.model }} ({{
                  booking.vehicleDetails.year
                }})
              </h4>
              <p>
                <strong>Dates:</strong> {{ formatDate(booking.startDate) }} -
                {{ formatDate(booking.endDate) }}
              </p>
              <p><strong>Total Cost:</strong> ₱{{ booking.totalCost }}</p>
            </div>
          </div>
          <!-- Optional: Add an else block here if vehicleDetails might genuinely be missing and you want to display a message -->
          <div v-else class="vehicle-summary-missing">
            <p>Vehicle details not available.</p>
          </div>
        </div>
        <div class="card-actions">
          <button
            @click="viewDetails(booking.id)"
            class="button secondary-button"
          >
            View Details
          </button>
          <!-- Conditional actions based on status -->
          <button
            v-if="canCancel(booking.paymentStatus)"
            @click="attemptCancelBooking(booking.id)"
            :disabled="cancellingBooking === booking.id"
            class="button cancel-button"
          >
            <span v-if="cancellingBooking === booking.id">Cancelling...</span>
            <span v-else>Cancel Booking</span>
          </button>
          <button
            v-if="booking.paymentStatus === 'awaiting_qr_downpayment'"
            @click="confirmQrPayment(booking.id)"
            :disabled="confirmingQr === booking.id"
            class="button primary-button"
          >
            <span v-if="confirmingQr === booking.id">Confirming...</span>
            <span v-else>I Have Paid (QR)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "MyBookingsView",
  data() {
    return {
      loading: true,
      errorMessage: null,
      bookings: [],
      cancellingBooking: null, // Stores ID of booking being cancelled
      confirmingQr: null, // Stores ID of booking being QR confirmed
    };
  },
  computed: {
    ...mapGetters(["user"]), // Access the current user from Vuex
  },
  watch: {
    // Watch for changes to the 'user' getter from the Vuex store
    user(newUser) {
      // When the user object is not null and has a UID, we can fetch the bookings
      if (newUser && newUser.uid) {
        this.fetchBookings();
      }
    },
  },
  created() {
    // We no longer fetch immediately. The `watch` will handle the initial fetch
    // once the user object is populated by the authentication listener.
    // If the user is already authenticated on page load, the watcher will trigger.
    // Otherwise, it will wait for the user to be signed in.
  },
  methods: {
    ...mapActions([
      "fetchBookingsByUser",
      "cancelBooking",
      "confirmManualQrPayment",
    ]),

    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    formatDate(isoString) {
      if (!isoString) return "N/A";
      const date = DateTime.fromISO(isoString);
      return date.toLocaleString(DateTime.DATE_FULL);
    },
    formatStatus(status) {
      switch (status) {
        case "pending_cash_downpayment":
          return "Pending Cash Downpayment";
        case "awaiting_qr_downpayment":
          return "Awaiting QR Downpayment";
        case "qr_downpayment_confirmed_by_user":
          return "QR Downpayment Confirmed (Awaiting Verification)";
        case "downpayment_received":
          return "Downpayment Received";
        case "full_payment_received":
          return "Full Payment Received";
        case "cancelled_no_downpayment":
          return "Cancelled (No Downpayment)";
        case "cancelled_by_user_after_grace_period":
          return "Cancelled (Downpayment Forfeited)";
        case "cancelled_within_grace_period":
          return "Cancelled (Refund Eligible)";
        case "refunded":
          return "Refunded";
        default:
          return status;
      }
    },
    getStatusClass(status) {
      switch (status) {
        case "downpayment_received":
        case "full_payment_received":
          return "status-success";
        case "pending_cash_downpayment":
        case "awaiting_qr_downpayment":
        case "qr_downpayment_confirmed_by_user":
          return "status-pending";
        case "cancelled_no_downpayment":
        case "cancelled_by_user_after_grace_period":
          return "status-cancelled";
        case "cancelled_within_grace_period":
        case "refunded":
          return "status-info";
        default:
          return "status-default";
      }
    },
    canCancel(status) {
      const cancellableStatuses = [
        "pending_cash_downpayment",
        "awaiting_qr_downpayment",
        "qr_downpayment_confirmed_by_user",
        "downpayment_received",
      ];
      return cancellableStatuses.includes(status);
    },
    async fetchBookings() {
      this.loading = true;
      this.errorMessage = null;
      this.bookings = [];
      try {
        if (!this.user || !this.user.uid) {
          // This case should now be handled by the watcher, but it's good practice
          // to keep a check here as a guardrail.
          throw new Error("User not authenticated or UID not available.");
        }
        const fetchedBookings = await this.fetchBookingsByUser(this.user.uid);
        this.bookings = fetchedBookings;
        console.log("[MyBookings] Fetched bookings:", this.bookings);
      } catch (error) {
        console.error("[MyBookings] Error fetching bookings:", error);
        this.errorMessage =
          error.message || "Failed to load your bookings. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    viewDetails(bookingId) {
      console.log(
        `[MyBookings] Navigating to booking details for ID: ${bookingId}`
      );
      this.$router.push({
        name: "BookingDetails",
        params: { bookingId: bookingId },
      });
    },
    async attemptCancelBooking(bookingId) {
      // In a real application, you would replace this with a custom modal UI.
      console.log("Attempting to cancel booking:", bookingId);
      this.cancellingBooking = bookingId;
      this.errorMessage = null;
      try {
        const response = await this.cancelBooking(bookingId);
        console.log("Booking cancelled:", response.message);
        this.fetchBookings(); // Re-fetch bookings to update status
      } catch (error) {
        console.error("[MyBookings] Error cancelling booking:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Failed to cancel booking. Please try again.";
      } finally {
        this.cancellingBooking = null;
      }
    },
    async confirmQrPayment(bookingId) {
      // In a real application, you would replace this with a custom modal UI.
      console.log("Attempting to confirm QR payment for booking:", bookingId);
      this.confirmingQr = bookingId;
      this.errorMessage = null;
      try {
        const response = await this.confirmManualQrPayment(bookingId);
        console.log("QR payment confirmed:", response.message);
        this.fetchBookings(); // Re-fetch bookings to update status
      } catch (error) {
        console.error("[MyBookings] Error confirming QR payment:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Failed to confirm QR payment. Please try again.";
      } finally {
        this.confirmingQr = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/variables.scss";

.my-bookings-container {
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

.loading-message,
.error-message,
.no-bookings-message {
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

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.booking-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  background-color: lighten($primary-color, 45%);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.booking-id {
  font-size: 1.2rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.vehicle-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.vehicle-thumbnail {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: $border-radius-sm;
  box-shadow: $shadow-light;
  flex-shrink: 0;
}

.vehicle-text {
  flex-grow: 1;
  h4 {
    font-size: 1.1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 0.9rem;
    color: $text-color-medium;
    margin-bottom: 0.3rem;
    strong {
      font-weight: 600;
    }
  }
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-end;
  }
}

.button {
  padding: 0.6rem 1.2rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
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
