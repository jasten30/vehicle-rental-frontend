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
                <!-- Changed to a button that navigates to BookingDetailView -->
                <button
                  @click="viewBookingDetails(booking.id)"
                  class="action-button view-details-button"
                >
                  View Details
                </button>
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
import { DateTime } from 'luxon'; // Import Luxon for date formatting

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
    ...mapActions('owner', ['fetchOwnerBookings']), // Removed 'confirmBookingDownpayment' as it's now on detail page
    
    // New method to navigate to BookingDetailView
    viewBookingDetails(bookingId) {
      this.$router.push({ name: 'BookingDetails', params: { bookingId: bookingId } });
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = DateTime.fromISO(dateString); // Use Luxon
      return date.toLocaleString(DateTime.DATE_SHORT); // Format for table display
    },
    formatPrice(price) {
      return price ? `₱${price.toFixed(2)}` : 'N/A';
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    // Removed isPendingConfirmation as it's no longer needed here
    getStatusBadgeClass(status) {
      switch (status) {
        case 'downpayment_received':
        case 'full_payment_received':
          return 'status-badge status-confirmed';
        case 'pending_cash_downpayment':
        case 'awaiting_qr_downpayment': // Added for badge styling
        case 'qr_downpayment_confirmed_by_user': // Added for badge styling
          return 'status-badge status-pending';
        case 'cancelled':
        case 'cancelled_no_downpayment':
        case 'cancelled_by_user_after_grace_period':
        case 'cancelled_within_grace_period':
          return 'status-badge status-cancelled';
        case 'refunded':
          return 'status-badge status-refunded'; // Added for badge styling
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
  &.status-refunded {
    background-color: #e0f2fe; // very light blue
    color: #0284c7; // medium blue
  }
  &.status-default {
    background-color: #f3f4f6; // gray-100
    color: #374151; // gray-800
  }
}

.action-button {
  background-color: #2563eb; /* Use primary color for view details */
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 150ms ease-in-out;
  border: none; /* Ensure no default button border */
  cursor: pointer; /* Indicate it's clickable */

  &:hover {
    background-color: darken(#2563eb, 10%); /* Darken on hover */
  }
}

.no-action-text {
  color: #9ca3af;
}
</style>
