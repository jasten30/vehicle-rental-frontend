<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button @click="$emit('close')" class="close-modal-button">
            &times;
          </button>
        </div>

        <div v-if="booking" class="modal-body">
          <div class="payment-status-header" :class="statusClass">
            <i class="bi" :class="statusIcon"></i>
            <span>{{ formatStatus(booking.paymentStatus) }}</span>
          </div>

          <div class="details-grid">
            <div class="detail-section">
              <h4>Renter Information</h4>
              <p><strong>Email:</strong> {{ booking.renterEmail }}</p>
              <p><strong>Renter ID:</strong> {{ booking.renterId }}</p>
            </div>

            <div class="detail-section">
              <h4>Vehicle Information</h4>
              <p><strong>Vehicle:</strong> {{ booking.vehicleName }}</p>
              <p><strong>Vehicle ID:</strong> {{ booking.vehicleId }}</p>
            </div>
          </div>

          <div class="detail-section">
            <h4>Booking Information</h4>
            <p><strong>Booking ID:</strong> {{ booking.id }}</p>
            <p>
              <strong>Dates:</strong> {{ formatDate(booking.startDate) }} to
              {{ formatDate(booking.endDate) }}
            </p>
            <p>
              <strong>Total Cost:</strong> ₱{{
                booking.totalCost.toLocaleString()
              }}
            </p>
            <p>
              <strong>Payment Method:</strong>
              {{ booking.paymentMethod || 'N/A' }}
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button
            v-if="booking.paymentStatus === 'pending_verification'"
            @click="$emit('confirm-payment', booking.id)"
            class="button primary"
          >
            Confirm Payment
          </button>
          <p v-else class="footer-note">
            This booking's payment has been confirmed or is not pending
            verification.
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'AdminBookingDetailsModal',
  props: {
    isOpen: Boolean,
    booking: Object,
  },
  emits: ['close', 'confirm-payment'],
  computed: {
    statusClass() {
      if (!this.booking) return '';
      switch (this.booking.paymentStatus) {
        case 'confirmed':
        case 'completed':
          return 'status-success';
        case 'pending_verification':
          return 'status-warning';
        case 'cancelled':
          return 'status-danger';
        default:
          return 'status-default';
      }
    },
    statusIcon() {
      if (!this.booking) return '';
      switch (this.booking.paymentStatus) {
        case 'confirmed':
        case 'completed':
          return 'bi-check-circle-fill';
        case 'pending_verification':
          return 'bi-hourglass-split';
        case 'cancelled':
          return 'bi-x-circle-fill';
        default:
          return 'bi-info-circle-fill';
      }
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.modal-overlay {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid $border-color;
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
}
.close-modal-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}
.modal-body {
  padding: 1.5rem;
}
.modal-footer {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid $border-color;
  text-align: center;
}
.payment-status-header {
  padding: 1rem;
  border-radius: $border-radius-md;
  margin-bottom: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  i {
    font-size: 1.25rem;
  }
}
.status-success {
  background-color: lighten($secondary-color, 35%);
  color: darken($secondary-color, 20%);
}
.status-warning {
  background-color: lighten($accent-color, 35%);
  color: darken($accent-color, 20%);
}
.status-danger {
  background-color: lighten($admin-color, 40%);
  color: darken($admin-color, 20%);
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.detail-section {
  h4 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: $text-color-medium;
    margin: 0 0 0.75rem 0;
  }
  p {
    margin: 0.25rem 0;
    color: $text-color-dark;
    strong {
      font-weight: 600;
    }
  }
}
.footer-note {
  color: $text-color-medium;
  font-style: italic;
  margin: 0;
}
.button.primary {
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>