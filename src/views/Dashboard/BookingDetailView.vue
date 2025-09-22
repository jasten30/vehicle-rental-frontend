<template>
  <div class="page-container">
    <div v-if="loading" class="loading-state">
      <p>Loading booking details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="booking" class="booking-details-layout">
      <div class="main-content">
        <div class="header">
          <span
            class="booking-status"
            :class="getStatusClass(booking.paymentStatus)"
          >
            {{ formatStatus(booking.paymentStatus) }}
          </span>
          <h1 class="booking-id">Booking #{{ booking.id }}</h1>
        </div>

        <div class="info-card">
          <div class="vehicle-summary">
            <img
              :src="getVehicleImageUrl(booking.vehicleDetails)"
              alt="Vehicle"
              class="vehicle-image"
            />
            <div class="vehicle-info">
              <h2 class="vehicle-name">
                {{ booking.vehicleDetails.make }}
                {{ booking.vehicleDetails.model }}
              </h2>
              <p class="vehicle-year">{{ booking.vehicleDetails.year }}</p>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3 class="card-title">Trip Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Pickup</span>
              <span class="value">{{ formatDate(booking.startDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Return</span>
              <span class="value">{{ formatDate(booking.endDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Total Cost</span>
              <span class="value price"
                >₱{{ booking.totalCost.toLocaleString() }}</span
              >
            </div>
            <div class="detail-item">
              <span class="label">Booked On</span>
              <span class="value">{{
                formatDateTime(booking.createdAt)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="info-card">
          <h3 class="card-title">Host Information</h3>
          <p>{{ booking.ownerDetails.name }}</p>
          <p class="email">{{ booking.ownerDetails.email }}</p>
        </div>

        <div class="info-card">
          <h3 class="card-title">Renter Information</h3>
          <p>{{ booking.renterDetails.name }}</p>
          <p class="email">{{ booking.renterDetails.email }}</p>
        </div>

        <div class="info-card actions-card">
          <h3 class="card-title">Actions</h3>
          
          <!-- UPDATED: Logic for showing and disabling the cancel button -->
          <div v-if="showCancelAction">
            <button class="button danger" :disabled="isCancellationWindowClosed">
              Cancel Booking
            </button>
            <p v-if="isCancellationWindowClosed" class="cancellation-info">
              Cancellation is only available within 48 hours of booking.
            </p>
          </div>
          
          <button v-if="canConfirmPayment" class="button primary">
            Confirm Payment
          </button>
          
          <button @click="goBack" class="button secondary">Go Back</button>
        </div>
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
    };
  },
  computed: {
    ...mapGetters(['userRole', 'user']),
    // NEW: Determines if the cancel action section should be shown at all
    showCancelAction() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      const cancellableStatuses = ['pending_verification', 'confirmed', 'pending_owner_approval', 'pending_payment'];
      return isRenter && cancellableStatuses.includes(this.booking.paymentStatus);
    },
    // NEW: Determines if the 48-hour cancellation window has passed
    isCancellationWindowClosed() {
        if (!this.booking?.createdAt) return true; // Disable if no creation date
        const bookedOn = DateTime.fromISO(this.booking.createdAt);
        const now = DateTime.now();
        const hoursSinceBooking = now.diff(bookedOn, 'hours').toObject().hours;
        return hoursSinceBooking > 48;
    },
    canConfirmPayment() {
      if (!this.booking || !this.user) return false;
      const isOwner = this.user.uid === this.booking.vehicleDetails.ownerId;
      const isAdmin = this.userRole === 'admin';
      return (
        (isOwner || isAdmin) &&
        this.booking.paymentStatus === 'pending_verification'
      );
    },
  },
  methods: {
    ...mapActions(['getBookingById']),
    async fetchBooking() {
      this.loading = true;
      this.errorMessage = null;
      try {
        this.booking = await this.getBookingById(this.bookingId);
      } catch (error) {
        this.errorMessage = 'Failed to load booking details.';
      } finally {
        this.loading = false;
      }
    },
    getVehicleImageUrl(vehicle) {
      if (vehicle?.exteriorPhotos?.length > 0) {
        return vehicle.exteriorPhotos[0];
      }
      return 'https://placehold.co/200x150/e2e8f0/666666?text=No+Image';
    },
    formatDate(dateStr) {
      return DateTime.fromISO(dateStr).toFormat('DDD');
    },
    formatDateTime(dateStr) {
      return DateTime.fromISO(dateStr).toFormat('ff');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      if (['confirmed', 'completed'].includes(status)) return 'status-success';
      if (['pending_verification', 'pending_owner_approval', 'pending_payment'].includes(status)) return 'status-warning';
      if (status?.includes('cancelled')) return 'status-danger';
      return 'status-default';
    },
    goBack() {
      this.$router.go(-1);
    },
  },
  created() {
    this.fetchBooking();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.booking-details-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}
.header {
  margin-bottom: 2rem;
}
.booking-id {
  font-size: 2.5rem;
  font-weight: 700;
  color: $text-color-dark;
  margin: 0;
  line-height: 1.2;
}
.booking-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.info-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid $border-color;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}
.vehicle-summary {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.vehicle-image {
  width: 150px;
  height: 110px;
  object-fit: cover;
  border-radius: $border-radius-md;
  flex-shrink: 0;
}
.vehicle-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}
.vehicle-year {
  font-size: 1rem;
  color: $text-color-medium;
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.label {
  font-size: 0.9rem;
  color: $text-color-medium;
  margin-bottom: 0.25rem;
}
.value {
  font-size: 1.1rem;
  font-weight: 500;
  &.price {
    font-weight: 700;
    color: $primary-color;
  }
}
.sidebar-content p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  &.email {
    font-size: 0.9rem;
    color: $text-color-medium;
    font-weight: 400;
  }
}
.actions-card .button {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  font-size: 1rem;
  &:last-child {
    margin-bottom: 0;
  }
  &:disabled {
      background-color: #e5e7eb;
      border-color: #e5e7eb;
      color: $text-color-medium;
      cursor: not-allowed;
  }
}
.cancellation-info {
    font-size: 0.8rem;
    color: $text-color-medium;
    text-align: center;
    margin-top: 0.5rem;
}

/* Status badge colors */
.status-success { background-color: lighten($secondary-color, 35%); color: darken($secondary-color, 20%); }
.status-warning { background-color: lighten($accent-color, 35%); color: darken($accent-color, 20%); }
.status-danger { background-color: lighten($admin-color, 40%); color: darken($admin-color, 20%); }
.status-default { background-color: #e5e7eb; color: #4b5568; }

</style>
