<template>
  <div class="admin-page-container">
    <header class="dashboard-header">
      <div class="header-text">
        <h2 class="section-title">Admin Dashboard</h2>
        <p class="section-subtitle">
          Real-time overview of platform performance and financials.
        </p>
      </div>
      <div class="date-display">
        <i class="bi bi-calendar-event"></i> <span>{{ currentDate }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading live data...</p>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card card-blue">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Total Users</p>
              <h3 class="stat-value">{{ stats.totalUsers }}</h3>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-people-fill"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-purple">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Total Vehicles</p>
              <h3 class="stat-value">{{ stats.totalVehicles }}</h3>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-car-front-fill"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-orange">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Pending Apps</p>
              <h3 class="stat-value">{{ stats.pendingApplications }}</h3>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-file-earmark-person-fill"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-green">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Active Bookings</p>
              <h3 class="stat-value">{{ stats.activeBookings }}</h3>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-key-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <h3 class="section-header-title">Financial Performance</h3>
      <div class="stats-grid financial-grid">
        <div class="stat-card card-gold">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Total Revenue (Verified)</p>
              <h3 class="stat-value">
                {{ formatCurrency(financialStats.totalRevenue) }}
              </h3>
              <p class="stat-sub">Platform fees collected</p>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-cash-stack"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-red">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Pending Revenue</p>
              <h3 class="stat-value">
                {{ formatCurrency(financialStats.pendingRevenue) }}
              </h3>
              <p class="stat-sub">Fees awaiting verification</p>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-hourglass-split"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-dark">
          <div class="card-content">
            <div class="text-wrapper">
              <p class="stat-label">Total Booking Volume</p>
              <h3 class="stat-value">
                {{ formatCurrency(financialStats.totalVolume) }}
              </h3>
              <p class="stat-sub">Gross value of confirmed trips</p>
            </div>
            <div class="icon-wrapper">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
          </div>
        </div>
      </div>

      <section class="history-section">
        <div class="section-header-row">
          <h3>Recent Booking History</h3>
          <router-link to="/dashboard/admin/bookings" class="view-all-btn">
            View All <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>

        <div class="table-wrapper">
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Renter</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in recentBookings" :key="booking.id">
                  <td class="fw-bold">
                    <router-link
                      :to="`/dashboard/my-bookings/${booking.id}`"
                      class="id-link"
                    >
                      #{{ booking.id.substring(0, 8) }}...
                    </router-link>
                  </td>
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">
                        {{ getInitials(booking.resolvedRenterName) }}
                      </div>
                      <span class="user-name">{{
                        booking.resolvedRenterName
                      }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="vehicle-info">
                      {{ booking.vehicle?.make }}
                      {{ booking.vehicle?.model || 'Vehicle' }}
                    </span>
                  </td>
                  <td>{{ formatDate(booking.createdAt) }}</td>
                  <td class="amount-cell">
                    {{ formatCurrency(booking.resolvedAmount) }}
                  </td>
                  <td>
                    <span
                      :class="[
                        'status-badge',
                        getStatusClass(booking.resolvedStatus),
                      ]"
                    >
                      {{ formatStatus(booking.resolvedStatus) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="recentBookings.length === 0">
                  <td colspan="6" class="text-center empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No bookings found.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AdminDashboardView',
  setup() {
    const store = useStore();
    const isLoading = ref(true);
    const pendingAppsCount = ref(0);

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // --- FETCH REAL DATA ---
    const fetchDashboardData = async () => {
      isLoading.value = true;
      try {
        // Fetch ALL required collections from Firebase via Vuex
        const [_users, _vehicles, _bookings, hostApps, driveApps, _fees] =
          await Promise.all([
            store.dispatch('fetchAllUsers'),
            store.dispatch('fetchAllVehicles'),
            store.dispatch('fetchAllBookings'),
            store.dispatch('fetchHostApplications'),
            store.dispatch('fetchDriveApplications'),
            store.dispatch('fetchAllPlatformFees'), // Critical for financial stats
          ]);

        // Calculate pending applications from the returned data
        const pendingHosts = (hostApps || []).filter(
          (app) => app.status === 'pending'
        ).length;
        const pendingDrives = (driveApps || []).filter(
          (app) => app.status === 'pending'
        ).length;
        pendingAppsCount.value = pendingHosts + pendingDrives;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        isLoading.value = false;
      }
    };

    // --- OPERATIONAL STATS ---
    const stats = computed(() => {
      const users = store.state.allUsers || [];
      const vehicles = store.state.allVehicles || [];
      const bookings = store.state.allBookings || [];

      const activeBookingsCount = bookings.filter((b) => {
        const s = (b.status || b.paymentStatus || '').toLowerCase();
        return [
          'approved',
          'ongoing',
          'active',
          'confirmed',
          'paid',
          'downpayment_verified',
        ].includes(s);
      }).length;

      return {
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        pendingApplications: pendingAppsCount.value,
        activeBookings: activeBookingsCount,
      };
    });

    // --- FINANCIAL STATS (REAL DATA) ---
    const financialStats = computed(() => {
      const fees = store.state.allPlatformFees || [];
      const bookings = store.state.allBookings || [];

      // 1. Verified Revenue (Status = 'verified')
      const totalRevenue = fees
        .filter((f) => f.status === 'verified')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      // 2. Pending Revenue (Status != 'verified')
      const pendingRevenue = fees
        .filter((f) => f.status !== 'verified')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      // 3. Total Booking Volume (GMV of confirmed trips)
      const totalVolume = bookings
        .filter((b) =>
          [
            'confirmed',
            'completed',
            'returned',
            'downpayment_verified',
          ].includes(b.paymentStatus)
        )
        .reduce((sum, b) => sum + (Number(b.totalCost) || 0), 0);

      return { totalRevenue, pendingRevenue, totalVolume };
    });

    // --- RECENT BOOKINGS TABLE ---
    const recentBookings = computed(() => {
      const bookings = store.state.allBookings || [];
      const users = store.state.allUsers || [];

      const processed = bookings.map((booking) => {
        let renterName = 'Unknown User';
        if (booking.renter && booking.renter.fullName) {
          renterName = booking.renter.fullName;
        } else {
          const userId = booking.userId || booking.renterId;
          if (userId) {
            const foundUser = users.find(
              (u) => u.id === userId || u.uid === userId
            );
            if (foundUser)
              renterName =
                foundUser.fullName || foundUser.name || foundUser.email;
          }
        }

        let rawAmount =
          booking.totalPrice ??
          booking.amount ??
          booking.price ??
          booking.totalCost ??
          0;
        const amount = parseFloat(rawAmount);
        const finalAmount = isNaN(amount) ? 0 : amount;

        let finalStatus =
          booking.status ||
          booking.bookingStatus ||
          booking.paymentStatus ||
          'Pending';

        return {
          ...booking,
          resolvedRenterName: renterName,
          resolvedAmount: finalAmount,
          resolvedStatus: finalStatus,
        };
      });

      return processed
        .sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 10);
    });

    // --- HELPERS ---
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      let dateObj = new Date(dateString);
      if (typeof dateString === 'object' && dateString.seconds) {
        dateObj = new Date(dateString.seconds * 1000);
      }
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const formatCurrency = (value) => {
      return `₱${Number(value).toLocaleString()}`;
    };

    const getInitials = (name) => {
      return name ? name.charAt(0).toUpperCase() : '?';
    };

    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      return status
        .toString()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const getStatusClass = (status) => {
      if (!status) return '';
      const s = status.toString().toLowerCase();
      if (
        s.includes('active') ||
        s.includes('approved') ||
        s.includes('confirmed') ||
        s.includes('paid') ||
        s.includes('verified')
      )
        return 'status-active';
      if (s.includes('completed')) return 'status-completed';
      if (
        s.includes('pending') ||
        s.includes('review') ||
        s.includes('processing')
      )
        return 'status-pending';
      if (
        s.includes('cancelled') ||
        s.includes('declined') ||
        s.includes('rejected') ||
        s.includes('failed')
      )
        return 'status-cancelled';
      return 'status-pending';
    };

    onMounted(fetchDashboardData);

    return {
      store, // Expose store if needed
      isLoading,
      stats,
      financialStats,
      recentBookings,
      currentDate,
      formatDate,
      formatCurrency,
      getInitials,
      getStatusClass,
      formatStatus,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

$text-muted: #6c757d;
$border-color: #e9ecef;
$bg-light: #f8f9fa;

* {
  box-sizing: border-box;
}

.admin-page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: $text-muted;

  .spinner {
    display: inline-block;
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid rgba($primary-color, 0.2);
    border-radius: 50%;
    border-top-color: $primary-color;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 2rem;
  }
}

.header-text {
  .section-title {
    font-size: 2rem;
    font-weight: 800;
    color: $text-color-dark;
    margin: 0 0 0.5rem 0;

    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  .section-subtitle {
    color: $text-muted;
    margin: 0;
    font-size: 1rem;
  }
}

.date-display {
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text-color-medium;
  border: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  i {
    color: $primary-color;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}

/* STATS GRIDS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Financial Grid specific adjustments (3 cols instead of 4) */
.financial-grid {
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.section-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 5px solid transparent;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &.card-blue {
    border-left-color: #3b82f6;
    .icon-wrapper {
      background: rgba(#3b82f6, 0.1);
      color: #3b82f6;
    }
  }
  &.card-purple {
    border-left-color: #8b5cf6;
    .icon-wrapper {
      background: rgba(#8b5cf6, 0.1);
      color: #8b5cf6;
    }
  }
  &.card-orange {
    border-left-color: #f97316;
    .icon-wrapper {
      background: rgba(#f97316, 0.1);
      color: #f97316;
    }
  }
  &.card-green {
    border-left-color: #10b981;
    .icon-wrapper {
      background: rgba(#10b981, 0.1);
      color: #10b981;
    }
  }

  /* Financial Colors */
  &.card-gold {
    border-left-color: #eab308;
    .icon-wrapper {
      background: rgba(#eab308, 0.1);
      color: #eab308;
    }
  }
  &.card-red {
    border-left-color: #ef4444;
    .icon-wrapper {
      background: rgba(#ef4444, 0.1);
      color: #ef4444;
    }
  }
  &.card-dark {
    border-left-color: #1f2937;
    .icon-wrapper {
      background: rgba(#1f2937, 0.1);
      color: #1f2937;
    }
  }

  .card-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    z-index: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: $text-muted;
    margin: 0 0 0.5rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 2.2rem;
    font-weight: 800;
    color: $text-color-dark;
    margin: 0;
    line-height: 1;
  }

  .stat-sub {
    font-size: 0.8rem;
    color: $text-muted;
    margin-top: 0.5rem;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
}

/* History Section */
.history-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: $text-color-dark;
  }

  .view-all-btn {
    color: $primary-color;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: rgba($primary-color, 0.05);
    }
  }
}

.table-wrapper {
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid $border-color;
}

.table-container {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;

  /* Thinner scrollbar to look cleaner */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;

  th {
    text-align: left;
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: $text-muted;
    background-color: #f8f9fa;
    border-bottom: 1px solid $border-color;
    white-space: nowrap;
  }

  td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $border-color;
    font-size: 0.95rem;
    color: $text-color-dark;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background-color: #fcfcfc;
  }

  .fw-bold {
    font-weight: 700;
  }

  .id-link {
    color: $primary-color;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .user-avatar {
      width: 32px;
      height: 32px;
      background-color: $primary-color;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .amount-cell {
    font-family: 'Roboto Mono', monospace;
    font-weight: 600;
  }

  .status-badge {
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
    white-space: nowrap;

    &.status-active {
      background: rgba(#10b981, 0.1);
      color: #059669;
    }
    &.status-completed {
      background: rgba(#3b82f6, 0.1);
      color: #2563eb;
    }
    &.status-pending {
      background: rgba(#f59e0b, 0.1);
      color: #d97706;
    }
    &.status-cancelled {
      background: rgba(#ef4444, 0.1);
      color: #dc2626;
    }
  }

  .empty-state {
    padding: 3rem;
    color: $text-muted;

    i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
      opacity: 0.5;
    }
    p {
      margin: 0;
      font-weight: 500;
    }
  }
}

.text-center {
  text-align: center;
}
</style>

<style>
main,
.dashboard-content,
.main-content {
  overflow: visible !important;
  height: auto !important;
}
</style>