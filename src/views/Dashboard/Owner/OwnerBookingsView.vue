<template>
  <div class="owner-bookings-page">
    <div class="page-container">
      <h1 class="page-title">Bookings For My Vehicles</h1>

      <!-- Loading state -->
      <div v-if="loadingStatus === 'loading'" class="info-state">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading bookings...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="loadingStatus === 'error'" class="info-state error-state">
        <p>Failed to load bookings: {{ error }}</p>
        <p>Please try again later.</p>
      </div>

      <!-- No bookings state -->
      <div v-else-if="bookings.length === 0" class="info-state">
        <p>You currently have no bookings for your vehicles.</p>
      </div>

      <!-- Bookings table -->
      <div v-else class="table-wrapper">
        <table class="bookings-table">
          <thead class="table-header">
            <tr>
              <th scope="col" class="table-header-cell rounded-tl">Renter</th>
              <th scope="col" class="table-header-cell">Vehicle</th>
              <th scope="col" class="table-header-cell">Dates</th>
              <th scope="col" class="table-header-cell">Status</th>
              <th scope="col" class="table-header-cell">Total Price</th>
              <th scope="col" class="table-header-cell rounded-tr">Actions</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="booking in bookings" :key="booking.id" class="table-row">
              <td class="table-data">{{ booking.renterDetails?.username || 'N/A' }}</td>
              <td class="table-data">{{ booking.vehicleDetails?.make }} {{ booking.vehicleDetails?.model }}</td>
              <td class="table-data">{{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}</td>
              <td class="table-data">
                <span :class="getStatusBadgeClass(booking.paymentStatus)">
                  {{ formatStatus(booking.paymentStatus) }}
                </span>
              </td>
              <td class="table-data">{{ formatPrice(booking.totalCost) }}</td>
              <td class="table-data action-cell">
                <button
                  v-if="isPendingConfirmation(booking.paymentStatus)"
                  @click="confirmDownpayment(booking.id)"
                  class="action-button"
                >
                  Confirm Payment
                </button>
                <span v-else class="no-action-text">No action needed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'OwnerBookings',
  computed: {
    ...mapState('owner', {
      bookings: state => state.ownerBookings,
      loadingStatus: state => state.ownerBookingsStatus,
      error: state => state.ownerBookingsError,
    }),
  },
  async created() {
    console.log("[OwnerBookingsView] Component created, dispatching fetchOwnerBookings action.");
    await this.fetchOwnerBookings();
    console.log("[OwnerBookingsView] fetchOwnerBookings action completed.");
  },
  methods: {
    ...mapActions('owner', ['fetchOwnerBookings', 'confirmBookingDownpayment']),
    
    async confirmDownpayment(bookingId) {
      try {
        await this.confirmBookingDownpayment(bookingId);
        await this.fetchOwnerBookings();
        console.log(`Downpayment confirmed for booking ID: ${bookingId}`);
      } catch (error) {
        console.error("Error confirming downpayment:", error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    formatPrice(price) {
      return price ? `₱${price.toFixed(2)}` : 'N/A';
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    isPendingConfirmation(status) {
      return status === 'pending_cash_downpayment';
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case 'downpayment_received':
        case 'full_payment_received':
          return 'status-badge status-confirmed';
        case 'pending_cash_downpayment':
          return 'status-badge status-pending';
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
.owner-bookings-page {
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.page-container {
  max-width: 56rem;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.info-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #6b7280;
  
  &.error-state {
    color: #ef4444;
  }
  
  p {
    margin-top: 1rem;
  }
}

.spinner {
  animation: spin 1s linear infinite;
  height: 2rem;
  width: 2rem;
  color: #3b82f6;
  margin: 0 auto;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.table-wrapper {
  overflow-x: auto;
}

.bookings-table {
  min-width: 100%;
  border-collapse: collapse;
  
  .table-header {
    background-color: #2563eb;
    color: #ffffff;

    .table-header-cell {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.rounded-tl {
        border-top-left-radius: 0.5rem;
      }
      &.rounded-tr {
        border-top-right-radius: 0.5rem;
      }
    }
  }

  .table-body {
    background-color: #ffffff;
    
    .table-row {
      border-top: 1px solid #e5e7eb;

      &:hover {
        background-color: #f9fafb;
        transition: background-color 150ms ease-in-out;
      }
    }

    .table-data {
      padding: 1rem 1rem;
      white-space: nowrap;
      font-size: 0.875rem;
      color: #1f2937;

      &.action-cell {
        font-weight: 500;
      }
    }
  }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px; // full-rounded
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1;

  &.status-confirmed {
    background-color: #d1fae5; // green-100
    color: #065f46; // green-800
  }
  &.status-pending {
    background-color: #fffbeb; // yellow-100
    color: #92400e; // yellow-800
  }
  &.status-cancelled {
    background-color: #fee2e2; // red-100
    color: #991b1b; // red-800
  }
  &.status-default {
    background-color: #f3f4f6; // gray-100
    color: #374151; // gray-800
  }
}

.action-button {
  background-color: #22c55e;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 150ms ease-in-out;

  &:hover {
    background-color: #16a34a;
  }
}

.no-action-text {
  color: #9ca3af;
}
</style>
