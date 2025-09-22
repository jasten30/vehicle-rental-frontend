<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Booking Details</h3>
      <div v-if="booking" class="modal-content">
        <div class="detail-grid">
          <div class="detail-item">
            <label>Booking ID</label>
            <p>{{ booking.id }}</p>
          </div>
          <div class="detail-item">
            <label>Current Status</label>
            <p>
                <span :class="['status-badge', getStatusClass(booking.paymentStatus)]">
                    {{ formatStatus(booking.paymentStatus) }}
                </span>
            </p>
          </div>
          <div class="detail-item">
            <label>Vehicle</label>
            <p>{{ booking.vehicleName }}</p>
          </div>
          <div class="detail-item">
            <label>Renter</label>
            <p>{{ booking.renterEmail }}</p>
          </div>
          <div class="detail-item">
            <label>Trip Dates</label>
            <p>{{ formatDate(booking.startDate) }} to {{ formatDate(booking.endDate) }}</p>
          </div>
          <div class="detail-item">
            <label>Total Cost</label>
            <p>₱{{ booking.totalCost ? booking.totalCost.toLocaleString() : 'N/A' }}</p>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="$emit('close')" class="button primary">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'AdminBookingDetailsModal',
  props: {
    isOpen: Boolean,
    booking: Object,
  },
  emits: ['close'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      // Handles new statuses like 'returned' and 'pending_owner_approval'
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      switch (status) {
        case 'confirmed':
        case 'completed':
        case 'returned': // Added 'returned' as a success status
          return 'status-success';
        case 'pending_owner_approval':
        case 'pending_payment':
          return 'status-warning';
        case 'cancelled':
        case 'declined_by_owner':
          return 'status-danger';
        default:
          return 'status-default';
      }
    },
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 0.75rem;
  width: 90%; max-width: 600px;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem;
}
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}
.detail-item {
    label {
        font-weight: 600;
        font-size: 0.8rem;
        color: $text-color-medium;
        display: block;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
    }
    p {
        margin: 0;
        color: $text-color-dark;
        font-size: 1rem;
    }
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
}
.button.primary {
    padding: 0.6rem 1.5rem;
}
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: capitalize;

  &.status-success {
    background-color: lighten($secondary-color, 35%);
    color: darken($secondary-color, 20%);
  }
  &.status-warning {
    background-color: lighten($accent-color, 35%);
    color: darken($accent-color, 20%);
  }
  &.status-danger {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 20%);
  }
  &.status-default {
    background-color: #e5e7eb;
    color: #4b5568;
  }
}
</style>
