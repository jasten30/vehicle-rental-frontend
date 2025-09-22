<template>
  <div class="admin-page-container">
    <h2 class="section-title">Manage All Bookings</h2>
    <p class="section-subtitle">
      Oversee all rental transactions and their current statuses.
    </p>

    <div v-if="loading" class="loading-state">
      <p>Loading all bookings...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>Failed to load bookings. Please try again.</p>
      <button @click="fetchData" class="button primary">Retry</button>
    </div>
    <div v-else-if="allBookings.length === 0" class="empty-state">
      <p>No bookings have been made yet.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Vehicle</th>
            <th>Renter</th>
            <th>Dates</th>
            <th>Total Cost</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in allBookings" :key="booking.id">
            <td class="booking-id">{{ booking.id }}</td>
            <td>{{ booking.vehicleName }}</td>
            <td>{{ booking.renterEmail }}</td>
            <td>
              {{ formatDate(booking.startDate) }} to
              {{ formatDate(booking.endDate) }}
            </td>
            <td>
              <span v-if="typeof booking.totalCost === 'number'">
                ₱{{ booking.totalCost.toLocaleString() }}
              </span>
              <span v-else> N/A </span>
            </td>
            <td>
              <span
                :class="['status-badge', getStatusClass(booking.paymentStatus)]"
              >
                {{ formatStatus(booking.paymentStatus) }}
              </span>
            </td>
            <td>
              <button @click="viewBooking(booking)" class="button secondary">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- The modal no longer needs to handle payment confirmation -->
    <AdminBookingDetailsModal
      :is-open="isModalOpen"
      :booking="selectedBooking"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { DateTime } from 'luxon';
import AdminBookingDetailsModal from '@/components/admin/AdminBookingDetailsModal.vue';

export default {
  name: 'AdminBookingsView',
  components: {
    AdminBookingDetailsModal,
  },
  data() {
    return {
      loading: true,
      error: null,
      isModalOpen: false,
      selectedBooking: null,
    };
  },
  computed: {
    ...mapGetters(['allBookings']),
  },
  methods: {
    // REMOVED: `confirmBookingPayment` is no longer needed
    ...mapActions(['fetchAllBookings']),
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchAllBookings();
      } catch (err) {
        this.error = 'An error occurred while fetching booking data.';
        console.error('[AdminBookingsView] Fetch error:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      switch (status) {
        case 'confirmed':
        case 'completed':
        case 'returned': // Added returned status
          return 'status-success';
        case 'pending_owner_approval': // Added pending status
        case 'pending_payment':
          return 'status-warning';
        case 'cancelled':
        case 'declined_by_owner': // Added declined status
          return 'status-danger';
        default:
          return 'status-default';
      }
    },
    viewBooking(booking) {
      this.selectedBooking = booking;
      this.isModalOpen = true;
    },
    // REMOVED: The handleConfirmPayment method is no longer needed
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.section-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-bottom: 2.5rem;
}
.table-container {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th,
td {
  padding: 1rem;
  border-bottom: 1px solid $border-color;
  vertical-align: middle;
}
thead th {
  font-size: 0.9rem;
  font-weight: 600;
  color: $text-color-medium;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
tbody tr:last-child td {
  border-bottom: none;
}
tbody tr:hover {
  background-color: lighten($primary-color, 45%);
}
.booking-id {
  font-family: monospace;
  font-size: 0.85rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.button.secondary {
  padding: 0.5rem 1rem;
}
</style>
