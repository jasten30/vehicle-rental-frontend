<template>
  <div class="admin-page-container">
    <div class="header-section">
      <h2 class="section-title">Manage All Bookings</h2>
      <p class="section-subtitle">
        Oversee all rental transactions and their current statuses.
      </p>
    </div>

    <!-- NEW: Tabbed filters for booking status -->
    <div class="booking-filters">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        class="filter-tab"
        :class="{ active: activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <div v-if="loading" class="info-state">
      <p>Loading all bookings...</p>
    </div>
    <div v-else-if="error" class="info-state error-state">
      <p>Failed to load bookings. Please try again.</p>
      <button @click="fetchData" class="button primary">Retry</button>
    </div>
    <div v-else-if="filteredBookings.length === 0" class="info-state empty-state">
      <p>No bookings found for the "{{ activeFilter }}" status.</p>
    </div>

    <!-- NEW: Grid layout for booking cards -->
    <div v-else class="bookings-grid">
      <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
        <div class="card-header">
            <h3 class="vehicle-name">{{ booking.vehicleName }}</h3>
            <span :class="['status-badge', getStatusClass(booking.paymentStatus)]">
              {{ formatStatus(booking.paymentStatus) }}
            </span>
        </div>
        <div class="card-body">
            <div class="detail-row">
                <i class="bi bi-person-circle"></i>
                <span>{{ booking.renterEmail }}</span>
            </div>
             <div class="detail-row">
                <i class="bi bi-calendar-range"></i>
                <span>{{ formatDate(booking.startDate) }} to {{ formatDate(booking.endDate) }}</span>
            </div>
             <div class="detail-row">
                <i class="bi bi-tag-fill"></i>
                <span>₱{{ booking.totalCost ? booking.totalCost.toLocaleString() : 'N/A' }}</span>
            </div>
        </div>
        <div class="card-footer">
            <span class="booking-id">ID: {{ booking.id }}</span>
            <button @click="viewBooking(booking)" class="button secondary">
                View Details
            </button>
        </div>
      </div>
    </div>

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
      activeFilter: 'all', // Default filter
      statusFilters: [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    };
  },
  computed: {
    ...mapGetters(['allBookings']),
    // NEW: Filters bookings based on the active tab
    filteredBookings() {
        if (this.activeFilter === 'all') {
            return this.allBookings;
        }
        if (this.activeFilter === 'pending') {
            const pendingStatuses = ['pending_owner_approval', 'pending_payment'];
            return this.allBookings.filter(b => pendingStatuses.includes(b.paymentStatus));
        }
         if (this.activeFilter === 'cancelled') {
            const cancelledStatuses = ['cancelled', 'declined_by_owner'];
            return this.allBookings.filter(b => cancelledStatuses.includes(b.paymentStatus));
        }
        if (this.activeFilter === 'completed') {
            const completedStatuses = ['completed', 'returned'];
            return this.allBookings.filter(b => completedStatuses.includes(b.paymentStatus));
        }
        return this.allBookings.filter(b => b.paymentStatus === this.activeFilter);
    }
  },
  methods: {
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
        case 'returned':
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
    viewBooking(booking) {
      this.selectedBooking = booking;
      this.isModalOpen = true;
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
  margin: 2rem auto;
  padding: 0 1rem;
}
.header-section {
    text-align: center;
    margin-bottom: 2rem;
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
.booking-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid $border-color;
}
.filter-tab {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: $text-color-medium;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;

    &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
    }
    &:hover:not(.active) {
        background-color: #f9fafb;
    }
}
.bookings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}
.booking-card {
    background-color: $card-background;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-light;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-medium;
    }
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid $border-color;
}
.vehicle-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
}
.card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.detail-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: $text-color-medium;

    i {
        font-size: 1.1rem;
        color: $primary-color;
    }
    span {
        font-weight: 500;
        color: $text-color-dark;
    }
}
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background-color: #f9fafb;
    border-top: 1px solid $border-color;
    margin-top: auto;
}
.booking-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: $text-color-medium;
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
.button {
    &.primary {
         padding: 0.6rem 1.2rem;
    }
    &.secondary {
        padding: 0.5rem 1rem;
    }
}
.info-state, .error-state, .empty-state {
    text-align: center;
    padding: 4rem 0;
}
</style>

