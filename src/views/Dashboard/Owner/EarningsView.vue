<template>
  <div class="owner-page-container">
    <div class="header-section">
      <h1 class="page-title">Earnings & Bookings</h1>
      <p class="page-subtitle">
        A history of all the trips taken in your vehicles.
      </p>
    </div>

    <div v-if="loadingStatus === 'loading'" class="info-state">
      <div class="spinner"></div>
      <p>Loading bookings...</p>
    </div>

    <div v-else-if="loadingStatus === 'error'" class="info-state error-state">
      <p>Failed to load bookings: {{ error }}</p>
      <p>Please try again later.</p>
    </div>

    <div v-else-if="bookings.length === 0" class="info-state">
      <p>You currently have no bookings for your vehicles.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="bookings-table">
        <thead class="table-header">
          <tr>
            <th scope="col">Renter</th>
            <th scope="col">Vehicle</th>
            <th scope="col">Dates</th>
            <th scope="col">Status</th>
            <th scope="col">Total Price</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="booking in bookings" :key="booking.id" class="table-row">
            <td>{{ booking.renterDetails?.username || 'N/A' }}</td>
            <td>
              {{ booking.vehicleDetails?.make }}
              {{ booking.vehicleDetails?.model }}
            </td>
            <td>
              {{ formatDate(booking.startDate) }} -
              {{ formatDate(booking.endDate) }}
            </td>
            <td>
              <span :class="getStatusBadgeClass(booking.paymentStatus)">
                {{ formatStatus(booking.paymentStatus) }}
              </span>
            </td>
            <td>{{ formatPrice(booking.totalCost) }}</td>
            <td class="action-cell">
              <div
                v-if="booking.paymentStatus === 'pending_owner_approval'"
                class="action-buttons"
              >
                <button
                  @click="handleApproval(booking.id, 'approve')"
                  class="button approve"
                >
                  Accept
                </button>
                <button
                  @click="handleApproval(booking.id, 'decline')"
                  class="button decline"
                >
                  Decline
                </button>
              </div>
              <button
                v-else
                @click="viewBookingDetails(booking.id)"
                class="button view"
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'EarningsView',
  computed: {
    ...mapState('owner', {
      bookings: (state) => state.ownerBookings,
      loadingStatus: (state) => state.ownerBookingsStatus,
      error: (state) => state.ownerBookingsError,
    }),
  },
  async created() {
    await this.fetchOwnerBookings();
  },
  methods: {
    ...mapActions('owner', [
      'fetchOwnerBookings',
      'approveBooking',
      'declineBooking',
    ]),
    async handleApproval(bookingId, action) {
      const confirmMessage =
        action === 'approve'
          ? 'Are you sure you want to approve this booking request?'
          : 'Are you sure you want to decline this booking request?';

      if (window.confirm(confirmMessage)) {
        try {
          if (action === 'approve') {
            await this.approveBooking(bookingId);
          } else {
            await this.declineBooking(bookingId);
          }
          await this.fetchOwnerBookings();
        } catch (error) {
          alert(`Failed to ${action} booking. Please try again.`);
        }
      }
    },
    viewBookingDetails(bookingId) {
      this.$router.push({
        name: 'BookingDetails',
        params: { bookingId: bookingId },
      });
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_SHORT);
    },
    formatPrice(price) {
      if (typeof price === 'number') {
        return `₱${price.toFixed(2)}`;
      }
      return 'N/A';
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case 'confirmed':
          return 'status-badge status-confirmed';
        case 'pending_owner_approval':
          return 'status-badge status-pending';
        case 'declined_by_owner':
        case 'cancelled':
          return 'status-badge status-cancelled';
        default:
          return 'status-badge status-default';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.owner-page-container {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: $text-color-dark;
}

.page-subtitle {
  color: $text-color-medium;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.info-state {
  text-align: center;
  padding: 3rem 0;
  color: $text-color-medium;

  &.error-state {
    color: $admin-color;
  }

  p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid $primary-color;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
}

.bookings-table {
  min-width: 100%;
  border-collapse: collapse;
  
  .table-header {
    background-color: #f9fafb;
    th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: $text-color-medium;
      text-transform: uppercase;
    }
  }

  .table-body .table-row {
    border-top: 1px solid $border-color;
    &:hover {
      background-color: lighten($primary-color, 45%);
    }
  }
  
  td {
    padding: 1rem 1rem;
    white-space: nowrap;
    font-size: 0.9rem;
    color: $text-color-dark;
  }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: $border-radius-pill;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1;

  &.status-confirmed { background-color: #d1fae5; color: #065f46; }
  &.status-pending { background-color: #fffbeb; color: #92400e; }
  &.status-cancelled { background-color: #fee2e2; color: #991b1b; }
  &.status-default { background-color: #f3f4f6; color: #374151; }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.button {
  padding: 0.4rem 0.8rem;
  border-radius: $border-radius-pill;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.approve { 
    background-color: $secondary-color; 
    color: white;
    &:hover { background-color: darken($secondary-color, 10%); }
  }
  &.decline { 
    background-color: lighten($admin-color, 40%); 
    color: $admin-color;
    &:hover { background-color: lighten($admin-color, 35%); }
  }
  &.view { 
    background-color: #e0f2fe; 
    color: #0284c7;
    &:hover { background-color: darken(#e0f2fe, 5%); }
  }
}
</style>