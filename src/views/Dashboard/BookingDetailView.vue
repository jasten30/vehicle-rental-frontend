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

        <div v-if="!isTripFinished" class="info-card actions-card">
          <h3 class="card-title">Actions</h3>
          
          <div v-if="showCancelAction">
            <button class="button danger" :disabled="isCancellationWindowClosed">
              Cancel Booking
            </button>
            <p v-if="isCancellationWindowClosed" class="cancellation-info">
              Cancellation is only available within 48 hours of booking.
            </p>
          </div>
          
          <button v-if="canMarkAsReturned" @click="handleMarkAsReturned" class="button primary">
            Mark as Returned
          </button>
          
          <button @click="goBack" class="button secondary">Go Back</button>
        </div>

        <div v-else class="info-card completed-card">
            <i class="bi bi-patch-check-fill"></i>
            <h3 class="card-title">Trip Completed</h3>
            <p>This trip was successfully completed. Thank you for using RentCycle!</p>
            
            <button v-if="canSubmitReview" @click="isReviewModalOpen = true" class="button review-button">
                Write a Review
            </button>
        </div>
      </div>
    </div>
    
    <!-- *** FIX: The :vehicle prop is now bound to the full 'vehicle' object *** -->
    <SubmitReviewModal
        v-if="booking && vehicle"
        :is-open="isReviewModalOpen"
        :booking="booking"
        :vehicle="vehicle" 
        @close="isReviewModalOpen = false"
        @review-submitted="handleReviewSubmission"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import SubmitReviewModal from '@/components/modals/SubmitReviewModal.vue';

export default {
  name: 'BookingDetailView',
  components: { SubmitReviewModal },
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
      vehicle: null, // *** FIX: Added a new data property to hold the full vehicle object ***
      isReviewModalOpen: false,
    };
  },
  computed: {
    ...mapGetters(['userRole', 'user']),
    showCancelAction() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      const cancellableStatuses = ['pending_verification', 'confirmed', 'pending_owner_approval', 'pending_payment'];
      return isRenter && cancellableStatuses.includes(this.booking.paymentStatus);
    },
    isCancellationWindowClosed() {
        if (!this.booking?.createdAt) return true;
        const bookedOn = DateTime.fromISO(this.booking.createdAt);
        const now = DateTime.now();
        const hoursSinceBooking = now.diff(bookedOn, 'hours').toObject().hours;
        return hoursSinceBooking > 48;
    },
    canMarkAsReturned() {
        if (!this.booking || !this.user) return false;
        const isOwner = this.user.uid === this.booking.vehicleDetails.ownerId;
        const isConfirmed = this.booking.paymentStatus === 'confirmed';
        const returnDate = DateTime.fromISO(this.booking.endDate);
        const hasTripEnded = DateTime.now() > returnDate;
        return isOwner && isConfirmed && hasTripEnded;
    },
    isTripFinished() {
        if (!this.booking) return false;
        return ['completed', 'returned'].includes(this.booking.paymentStatus);
    },
    canSubmitReview() {
        if (!this.booking || !this.user) return false;
        const isRenter = this.user.uid === this.booking.renterId;
        const isFinished = ['completed', 'returned'].includes(this.booking.paymentStatus);
        const hasNotReviewed = !this.booking.reviewSubmitted;

        return isRenter && isFinished && hasNotReviewed;
    }
  },
  methods: {
    // *** FIX: Mapped the getVehicleById action from the Vuex store ***
    ...mapActions(['getBookingById', 'updateBookingStatus', 'getVehicleById']),
    
    async fetchBooking() {
      this.loading = true;
      this.errorMessage = null;
      try {
        // Step 1: Fetch the booking data
        const bookingData = await this.getBookingById(this.bookingId);
        this.booking = bookingData;

        // *** FIX: Use the vehicleId from the booking to fetch the full vehicle object ***
        if (this.booking && this.booking.vehicleId) {
          // Step 2: Fetch the complete vehicle object and store it
          this.vehicle = await this.getVehicleById(this.booking.vehicleId);
        } else {
          // If the booking doesn't have a vehicleId, we can't proceed
          throw new Error("Vehicle ID not found in booking details.");
        }

      } catch (error) {
        console.error("Failed to load booking or vehicle details:", error);
        this.errorMessage = 'Failed to load booking details.';
      } finally {
        this.loading = false;
      }
    },
    async handleMarkAsReturned() {
        if (!confirm("Are you sure you want to mark this vehicle as returned? This will complete the trip.")) return;
        try {
            await this.updateBookingStatus({
                bookingId: this.booking.id,
                newStatus: 'returned'
            });
            await this.fetchBooking();
        } catch (error) {
            alert("Failed to update booking status. Please try again.");
            console.error("Error marking as returned:", error);
        }
    },
    handleReviewSubmission() {
        this.isReviewModalOpen = false;
        if (this.booking) {
            this.booking.reviewSubmitted = true;
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
      if (['confirmed', 'completed', 'returned'].includes(status)) return 'status-success';
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
.completed-card {
    text-align: center;
    background-color: lighten($secondary-color, 40%);
    border-color: lighten($secondary-color, 30%);

    i {
        font-size: 2.5rem;
        color: $secondary-color;
        margin-bottom: 1rem;
    }
    h3 {
        color: darken($secondary-color, 15%);
    }
    p {
        color: darken($secondary-color, 10%);
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0;
    }
}
.review-button {
    margin-top: 1rem;
    background-color: #fff;
    color: darken($secondary-color, 15%);
    border: 1px solid darken($secondary-color, 15%);
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    &:hover {
        background-color: lighten($secondary-color, 35%);
    }
}

.status-success { background-color: lighten($secondary-color, 35%); color: darken($secondary-color, 20%); }
.status-warning { background-color: lighten($accent-color, 35%); color: darken($accent-color, 20%); }
.status-danger { background-color: lighten($admin-color, 40%); color: darken($admin-color, 20%); }
.status-default { background-color: #e5e7eb; color: #4b5568; }

</style>

