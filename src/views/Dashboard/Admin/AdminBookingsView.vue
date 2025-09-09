<template>
  <div class="admin-page-container">
    <h2 class="section-title">Manage All Bookings</h2>
    <p class="section-subtitle">
      Oversee all rental transactions and their current statuses.
    </p>

    <div class="filter-controls">
      <div class="date-filter">
        <div class="form-group">
          <label for="startDate">Start Date</label>
          <input type="date" id="startDate" v-model="startDate" />
        </div>
        <div class="form-group">
          <label for="endDate">End Date</label>
          <input type="date" id="endDate" v-model="endDate" />
        </div>
      </div>
      <div class="button-group">
        <button @click="applyDateFilter" class="button primary">Filter</button>
        <button @click="clearDateFilter" class="button secondary">Clear</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading all bookings...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>Failed to load bookings. Please try again.</p>
      <button @click="fetchData()" class="button primary">Retry</button>
    </div>
    <div v-else-if="allBookings.length === 0" class="empty-state">
      <p>No bookings have been made for the selected criteria.</p>
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
            <td class="booking-id" :title="booking.id">{{ booking.id }}</td>
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
              <button @click="viewBooking(booking.id)" class="button secondary">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'AdminBookingsView',
  data() {
    return {
      loading: true,
      error: null,
      startDate: null,
      endDate: null,
    };
  },
  computed: {
    ...mapGetters(['allBookings']),
  },
  methods: {
    ...mapActions(['fetchAllBookings']),
    async fetchData(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchAllBookings(params);
      } catch (err) {
        this.error = 'An error occurred while fetching booking data.';
        console.error('[AdminBookingsView] Fetch error:', err);
      } finally {
        this.loading = false;
      }
    },
    applyDateFilter() {
      this.fetchData({
        startDate: this.startDate,
        endDate: this.endDate,
      });
    },
    clearDateFilter() {
      this.startDate = null;
      this.endDate = null;
      this.fetchData();
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
          return 'status-success';
        case 'pending_payment':
        case 'pending_verification':
          return 'status-warning';
        case 'cancelled':
          return 'status-danger';
        default:
          return 'status-default';
      }
    },
    viewBooking(bookingId) {
      this.$router.push({ name: 'BookingDetails', params: { bookingId } });
    },
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

.filter-controls {
  background-color: $card-background;
  padding: 1.5rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.date-filter {
  display: flex;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-color-medium;
    margin-bottom: 0.5rem;
  }
  input[type='date'] {
    padding: 0.5rem 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-family: inherit;
  }
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: $text-color-medium;
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
  white-space: nowrap;
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
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.8rem;

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

.button {
  padding: 0.6rem 1.2rem;
  border-radius: $border-radius-md;
  border: none;
  font-weight: 600;
  cursor: pointer;
  
  &.primary {
    background-color: $primary-color;
    color: white;
  }

  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
  }
}
</style>