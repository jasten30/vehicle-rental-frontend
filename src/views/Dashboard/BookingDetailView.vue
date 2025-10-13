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

        <div v-if="showOwnerActionCard" class="info-card action-required-card">
          <div class="card-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
          <div class="card-content">
            <h3 class="card-title">New Booking Request</h3>
            <p>A new request has been submitted for your vehicle. Please review the details and respond to the renter.</p>
            <div class="action-buttons">
              <button @click="handleApproval('decline')" class="button decline-button">Decline</button>
              <button @click="handleApproval('approve')" class="button approve-button">Approve</button>
            </div>
          </div>
        </div>

        <div v-if="showPaymentActionCard" class="info-card payment-action-card">
          <div class="card-icon"><i class="bi bi-credit-card"></i></div>
          <div class="card-content">
            <h3 class="card-title">Action Required</h3>
            <p>The owner has approved your request. Please proceed to pay the 20% downpayment to confirm your booking.</p>
            <button @click="isPaymentModalOpen = true" class="button pay-now-button">
              Pay Downpayment Now
            </button>
          </div>
        </div>

        <div v-if="showOwnerPaymentConfirmationCard" class="info-card payment-verification-card">
          <div class="card-icon"><i class="bi bi-check2-circle"></i></div>
          <div class="card-content">
            <h3 class="card-title">Verify Downpayment</h3>
            <p>The renter has marked the downpayment as paid. Please verify you have received <strong>₱{{ booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong> and confirm to finalize this booking.</p>
            <div class="action-buttons">
              <button @click="handleConfirmPayment" class="button approve-button">Confirm Payment Received</button>
            </div>
          </div>
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
                {{ booking.vehicleDetails?.make }}
                {{ booking.vehicleDetails?.model }}
              </h2>
              <p class="vehicle-year">{{ booking.vehicleDetails?.year }}</p>
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
              <span class="label">Booked On</span>
              <span class="value">{{
                formatDateTime(booking.createdAt)
              }}</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
            <h3 class="card-title">Payment Details</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="label">Total Cost</span>
                    <span class="value price">₱{{ booking.totalCost ? booking.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Amount Paid</span>
                    <span class="value">₱{{ booking.amountPaid ? booking.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Remaining Balance</span>
                    <span class="value">₱{{ booking.remainingBalance ? booking.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
                </div>
            </div>
        </div>

      </div>

      <div class="sidebar-content">
        <div class="info-card">
          <h3 class="card-title">Host Information</h3>
          <p>{{ booking.ownerDetails?.name || 'N/A' }}</p>
          <p class="email">{{ booking.ownerDetails?.email || 'No email available' }}</p>
        </div>

        <div class="info-card">
          <h3 class="card-title">Renter Information</h3>
          <p>{{ booking.renterDetails?.name || 'N/A' }}</p>
          <p class="email">{{ booking.renterDetails?.email || 'No email available' }}</p>
        </div>
        
        <div v-if="showPaymentActionCard" class="info-card pay-here-card">
            <h3 class="card-title">Secure Your Booking</h3>
            <p>Your request has been approved! Pay the downpayment now to finalize your trip.</p>
            <button @click="isPaymentModalOpen = true" class="button pay-now-button">
                Pay Here
            </button>
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
    
    <SubmitReviewModal
        v-if="booking && vehicle"
        :is-open="isReviewModalOpen"
        :booking="booking"
        :vehicle="vehicle" 
        @close="isReviewModalOpen = false"
        @review-submitted="handleReviewSubmission"
    />

    <PaymentModal
        v-if="booking"
        :is-open="isPaymentModalOpen"
        :booking="booking"
        @close="isPaymentModalOpen = false"
        @payment-confirmed="handlePaymentConfirmation"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import SubmitReviewModal from '@/components/modals/SubmitReviewModal.vue';
import PaymentModal from '@/components/modals/PaymentModal.vue';

export default {
  name: 'BookingDetailView',
  components: { SubmitReviewModal, PaymentModal },
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
      vehicle: null,
      isReviewModalOpen: false,
      isPaymentModalOpen: false,
    };
  },
  computed: {
    ...mapGetters(['userRole', 'user']),
    
    showOwnerActionCard() {
        if (!this.booking || !this.user) return false;
        const isOwner = this.user.uid === this.booking.ownerId;
        return isOwner && this.booking.paymentStatus === 'pending_owner_approval';
    },

    showPaymentActionCard() {
        if (!this.booking || !this.user) return false;
        const isRenter = this.user.uid === this.booking.renterId;
        return isRenter && this.booking.paymentStatus === 'pending_payment';
    },

    showOwnerPaymentConfirmationCard() {
        if (!this.booking || !this.user) return false;
        const isOwner = this.user.uid === this.booking.ownerId;
        return isOwner && this.booking.paymentStatus === 'downpayment_pending_verification';
    },

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
        if (!this.booking || !this.user || !this.booking.vehicleDetails) return false;
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
    // 1. Add 'confirmBookingPayment' to the list of actions
    ...mapActions([
        'getBookingById', 
        'updateBookingStatus', 
        'getVehicleById', 
        'approveBooking', 
        'declineBooking', 
        'confirmDownpaymentByUser', 
        'confirmOwnerPayment',
        'confirmBookingPayment'
    ]),
    
    async fetchBooking() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const bookingData = await this.getBookingById(this.bookingId);
        this.booking = bookingData;

        if (this.booking && this.booking.vehicleId) {
          this.vehicle = await this.getVehicleById(this.booking.vehicleId);
        } else {
          throw new Error("Vehicle ID not found in booking details.");
        }

      } catch (error) {
        console.error("Failed to load booking or vehicle details:", error);
        this.errorMessage = 'Failed to load booking details.';
      } finally {
        this.loading = false;
      }
    },
    async handleApproval(action) {
        const confirmMessage = action === 'approve'
            ? 'Are you sure you want to approve this booking request?'
            : 'Are you sure you want to decline this booking request?';

        if (window.confirm(confirmMessage)) {
            try {
                if (action === 'approve') {
                    await this.approveBooking(this.booking.id);
                } else {
                    await this.declineBooking(this.booking.id);
                }
                await this.fetchBooking();
            } catch (error) {
                alert(`Failed to ${action} booking.`);
            }
        }
    },
    async handlePaymentConfirmation() {
        this.isPaymentModalOpen = false;
        alert('Payment submitted for verification! The owner will confirm shortly.');
        await this.fetchBooking();
    },
    async handleConfirmPayment() {
        if (window.confirm('Are you sure you want to confirm receipt of the downpayment? This will finalize the booking.')) {
            try {
                // 2. Change the action called to the one that updates the amount
                await this.confirmBookingPayment(this.booking.id);
                alert('Payment confirmed! The booking is now finalized.');
                await this.fetchBooking();
            } catch (error) {
                alert('Failed to confirm payment.');
                console.error('Error confirming payment:', error);
            }
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
        if (!dateStr) return '';
        return DateTime.fromISO(dateStr).toFormat('DDD');
    },
    formatDateTime(dateStr) {
        if (!dateStr) return '';
        return DateTime.fromISO(dateStr).toFormat('ff');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      if (['confirmed', 'completed', 'returned'].includes(status)) return 'status-success';
      if (['pending_owner_approval', 'pending_payment', 'downpayment_pending_verification'].includes(status)) return 'status-warning';
      if (status?.includes('cancelled') || status?.includes('declined')) return 'status-danger';
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

.action-required-card, .payment-action-card, .payment-verification-card {
    border-left: 5px solid;
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.action-required-card {
    background-color: lighten($accent-color, 40%);
    border-left-color: $accent-color;
    .card-icon { color: $accent-color; }
    .card-title { color: darken($accent-color, 10%); }
    p { color: darken($accent-color, 20%); }
}

.payment-action-card {
    background-color: lighten($primary-color, 40%);
    border-left-color: $primary-color;
    .card-icon { color: $primary-color; }
    .card-title { color: darken($primary-color, 10%); }
    p { color: darken($primary-color, 20%); }
}

.payment-verification-card {
    background-color: lighten($secondary-color, 40%);
    border-left-color: $secondary-color;
    .card-icon { color: $secondary-color; }
    .card-title { color: darken($secondary-color, 15%); }
    p { color: darken($secondary-color, 20%); }
}

.pay-here-card {
    background-color: lighten($primary-color, 45%);
    border: 1px solid lighten($primary-color, 35%);
    text-align: center;
    p {
        color: darken($primary-color, 20%);
        margin: 0.5rem 0 1rem;
    }
    .pay-now-button {
        width: 100%;
    }
}

.card-icon {
    font-size: 2.5rem;
}
.card-content {
    flex-grow: 1;
}
.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}
.button {
  &.approve-button {
    background-color: $secondary-color;
    color: white;
    &:hover { background-color: darken($secondary-color, 10%); }
  }
  &.decline-button {
    background-color: #e5e7eb;
    color: $text-color-dark;
    &:hover { background-color: darken(#e5e7eb, 10%); }
  }
    &.pay-now-button {
    width: auto;
    padding: 0.75rem 1.5rem;
    background-color: $primary-color;
    color: white;
    font-weight: 600;
    border: none;
    border-radius: $border-radius-md;
    cursor: pointer;
    &:hover {
        background-color: darken($primary-color, 10%);
    }
  }
}

</style>