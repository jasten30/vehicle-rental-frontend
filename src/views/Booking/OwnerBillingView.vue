<template>
  <div class="owner-dashboard-container">
    <div class="header-section">
      <h1 class="page-title">Owner Dashboard</h1>
      <p class="page-subtitle">
        Track your monthly usage and manage incoming booking requests.
      </p>
    </div>

    <div v-if="userLoading" class="info-state">
      <p>Loading dashboard...</p>
    </div>

    <div v-else class="billing-summary-grid">
      <div class="summary-card">
        <div class="card-icon"><i class="bi bi-calendar-check"></i></div>
        <div class="card-content">
          <p class="card-label">Bookings This Month ({{ currentMonthName }})</p>
          <p class="card-value">{{ currentMonthBookings }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon"><i class="bi bi-gift-fill"></i></div>
        <div class="card-content">
          <p class="card-label">Free Bookings Remaining</p>
          <p class="card-value">{{ freeBookingsRemaining }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon"><i class="bi bi-wallet2"></i></div>
        <div class="card-content">
          <p class="card-label">Billable Bookings</p>
          <p class="card-value">{{ billableBookings }}</p>
        </div>
      </div>
    </div>

    <hr class="section-divider" />

    <div class="bookings-section">
      <h2 class="section-heading">Booking Requests</h2>
      <div v-if="bookingsLoading" class="info-state"><p>Loading bookings...</p></div>
      <div v-else-if="bookingsError" class="info-state error-state"><p>{{ bookingsError }}</p></div>
      <div v-else-if="bookings.length === 0" class="info-state"><p>You have no bookings for your vehicles yet.</p></div>
      <div v-else class="table-wrapper">
        <table class="bookings-table">
          <thead class="table-header">
            <tr>
              <th>Renter</th>
              <th>Vehicle</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Total Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="booking in bookings" :key="booking.id" class="table-row">
              <td>{{ booking.renterDetails?.username || 'N/A' }}</td>
              <td>{{ booking.vehicleDetails?.make }} {{ booking.vehicleDetails?.model }}</td>
              <td>{{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}</td>
              <td>
                <span :class="getStatusBadgeClass(booking.paymentStatus)">
                  {{ formatStatus(booking.paymentStatus) }}
                </span>
              </td>
              <td>{{ formatPrice(booking.totalCost) }}</td>
              <td class="action-cell">
                <div v-if="booking.paymentStatus === 'pending_owner_approval'" class="action-buttons">
                  <button @click="handleApproval(booking.id, 'approve')" class="button approve">Accept</button>
                  <button @click="handleApproval(booking.id, 'decline')" class="button decline">Decline</button>
                </div>
                <button v-else @click="viewBookingDetails(booking.id)" class="button view">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'OwnerBillingView',
  computed: {
    ...mapGetters(['user']),
    ...mapState('owner', {
      bookings: state => state.ownerBookings,
      bookingsLoading: state => state.ownerBookingsStatus === 'loading',
      bookingsError: state => state.ownerBookingsError,
    }),
    userLoading() {
      return !this.user;
    },
    currentMonthKey() {
      return DateTime.now().toFormat('yyyy-MM');
    },
    currentMonthName() {
      return DateTime.now().toFormat('MMMM yyyy');
    },
    currentMonthBookings() {
      if (this.user?.monthlyBookingCounts) {
        return this.user.monthlyBookingCounts[this.currentMonthKey] || 0;
      }
      return 0;
    },
    freeBookingsRemaining() {
      const remaining = 10 - this.currentMonthBookings;
      return remaining > 0 ? remaining : 0;
    },
    billableBookings() {
      const billable = this.currentMonthBookings - 10;
      return billable > 0 ? billable : 0;
    },
  },
  async created() {
    this.fetchOwnerBookings();
    if (!this.user) {
        await this.fetchUserProfile();
    }
  },
  methods: {
    ...mapActions(['fetchUserProfile']),
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
          alert(`Failed to ${action} booking.`);
        }
      }
    },
    viewBookingDetails(bookingId) {
      this.$router.push({ name: 'BookingDetails', params: { bookingId } });
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_SHORT);
    },
    formatPrice(price) {
      return typeof price === 'number' ? `₱${price.toFixed(2)}` : 'N/A';
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

.owner-dashboard-container {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.header-section {
  text-align: center;
  margin-bottom: 3rem;
}
.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: $text-color-dark;
}
.page-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-top: 0.5rem;
}
.billing-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.summary-card {
  background-color: $card-background;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.card-icon {
  background-color: lighten($primary-color, 40%);
  color: $primary-color;
  font-size: 1.75rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: $text-color-medium;
  margin-bottom: 0.25rem;
  text-align: left;
}
.card-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: $text-color-dark;
  line-height: 1;
  text-align: left;
}
.section-divider {
  border: 0;
  height: 1px;
  background-color: $border-color;
  margin: 3rem 0;
}
.bookings-section {
  text-align: center;
}
.section-heading {
  font-size: 1.75rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 2rem;
}
.info-state {
  text-align: center;
  padding: 3rem 0;
  color: $text-color-medium;
}
.table-wrapper {
  overflow-x: auto;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
}
.bookings-table {
  min-width: 100%;
  border-collapse: collapse;
}
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
  padding: 1rem;
  white-space: nowrap;
  font-size: 0.9rem;
  color: $text-color-dark;
  text-align: left;
}
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: $border-radius-pill;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1;
  &.status-confirmed {
    background-color: #d1fae5;
    color: #065f46;
  }
  &.status-pending {
    background-color: #fffbeb;
    color: #92400e;
  }
  &.status-cancelled {
    background-color: #fee2e2;
    color: #991b1b;
  }
  &.status-default {
    background-color: #f3f4f6;
    color: #374151;
  }
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
    &:hover {
      background-color: darken($secondary-color, 10%);
    }
  }
  &.decline {
    background-color: lighten($admin-color, 40%);
    color: $admin-color;
    &:hover {
      background-color: lighten($admin-color, 35%);
    }
  }
  &.view {
    background-color: #e0f2fe;
    color: #0284c7;
    &:hover {
      background-color: darken(#e0f2fe, 5%);
    }
  }
}
</style>

