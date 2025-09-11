<template>
  <div class="my-bookings-container">
    <h2 class="section-title">My Trips</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading your bookings...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBookings" class="button primary-button">
        Retry
      </button>
    </div>

    <div v-else-if="bookings.length === 0" class="no-bookings-message">
      <p>You have no active or past trips.</p>
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
          <div v-if="booking.vehicleDetails" class="vehicle-summary">
            <img
              :src="getVehicleImageUrl(booking.vehicleDetails)"
              :alt="`${booking.vehicleDetails.make} ${booking.vehicleDetails.model}`"
              class="vehicle-thumbnail"
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
              <p>
                <strong>Total Cost:</strong> ₱{{
                  booking.totalCost.toLocaleString()
                }}
              </p>
            </div>
          </div>
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
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'MyBookingsView',
  data() {
    return {
      loading: true,
      errorMessage: null,
      bookings: [],
    };
  },
  computed: {
    ...mapGetters(['user']),
  },
  watch: {
    user(newUser) {
      // If the user logs in after the component is created, fetch bookings.
      if (newUser && newUser.uid) {
        this.fetchBookings();
      }
    },
  },
  created() {
    // If user is already available when the component is created, fetch immediately.
    if (this.user && this.user.uid) {
      this.fetchBookings();
    }
  },
  methods: {
    ...mapActions(['fetchBookingsByUser']),

    async fetchBookings() {
      this.loading = true;
      this.errorMessage = null;
      try {
        if (!this.user || !this.user.uid) {
          throw new Error('User is not authenticated.');
        }
        const fetchedBookings = await this.fetchBookingsByUser(this.user.uid);
        this.bookings = fetchedBookings;
      } catch (error) {
        this.errorMessage = 'Failed to load your bookings. Please try again.';
        console.error('[MyBookingsView] Error fetching bookings:', error);
      } finally {
        this.loading = false;
      }
    },
    getVehicleImageUrl(vehicle) {
      if (vehicle && vehicle.exteriorPhotos && vehicle.exteriorPhotos.length > 0) {
        return vehicle.exteriorPhotos[0];
      }
      return 'https://placehold.co/100x75/e2e8f0/666666?text=No+Image';
    },
    viewDetails(bookingId) {
      this.$router.push({
        name: 'BookingDetails',
        params: { bookingId: bookingId },
      });
    },
    formatDate(isoString) {
      if (!isoString) return 'N/A';
      return DateTime.fromISO(isoString).toLocaleString(DateTime.DATE_FULL);
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
    getStatusClass(status) {
      if (['confirmed', 'completed', 'downpayment_received', 'full_payment_received'].includes(status)) {
        return 'status-success';
      }
      if (['pending_cash_downpayment', 'awaiting_qr_downpayment', 'pending_verification'].includes(status)) {
        return 'status-pending';
      }
      if (status?.includes('cancelled')) {
        return 'status-cancelled';
      }
      if (status === 'refunded') {
        return 'status-info';
      }
      return 'status-default';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

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
  background-color: #f9fafb;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
}

.booking-id {
  font-size: 1.1rem;
  font-weight: 600;
  color: $text-color-dark;
  margin: 0;
  font-family: monospace;
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
    margin: 0 0 0.5rem 0;
  }
  p {
    font-size: 0.9rem;
    color: $text-color-medium;
    margin: 0.3rem 0;
    strong {
      font-weight: 600;
      color: $text-color-dark;
    }
  }
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid $border-color;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.button {
  padding: 0.6rem 1.2rem;
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

/* Status Badges */
[class^='status-'] {
  padding: 0.3em 0.7em;
  border-radius: $border-radius-pill;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-success {
  background-color: #dcfce7;
  color: #166534;
}
.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}
.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-info {
  background-color: #eff6ff;
  color: #1d4ed8;
}
.status-default {
  background-color: #e5e7eb;
  color: #374151;
}
</style>