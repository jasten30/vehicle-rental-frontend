<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h2 class="section-title">Bookings Overview</h2>
        <p class="section-subtitle">Monitor rental transactions and manage reservation statuses.</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-val">{{ filteredBookings.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </header>

    <div class="control-bar">
      <div class="tabs-wrapper">
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

      <div class="search-wrapper">
        <i class="bi bi-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by renter, vehicle, or ID..." 
          class="search-input"
        />
      </div>
    </div>

    <div class="content-area">
      
      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Loading bookings...</p>
      </div>

      <div v-else-if="error" class="state-container error">
        <i class="bi bi-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchData" class="button primary-btn">Retry</button>
      </div>

      <div v-else-if="filteredBookings.length === 0" class="state-container empty">
        <i class="bi bi-calendar-x"></i>
        <p>No bookings found.</p>
      </div>

      <div v-else>
        <div class="desktop-view table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Renter</th>
                <th>Vehicle</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td class="id-cell">
                  <span class="id-text">#{{ booking.id.substring(0, 8) }}...</span>
                </td>
                <td>
                  <div class="user-info-cell">
                    <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(booking.resolvedRenterName) }">
                      {{ getInitials(booking.resolvedRenterName) }}
                    </div>
                    <div class="user-text">
                      <span class="name">{{ booking.resolvedRenterName }}</span>
                      <span class="email">{{ booking.resolvedRenterEmail }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="vehicle-info">
                    <span class="vehicle-name">{{ booking.vehicleName || 'Unknown Vehicle' }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-range">
                    <span>{{ formatDate(booking.startDate) }}</span>
                    <i class="bi bi-arrow-right-short"></i>
                    <span>{{ formatDate(booking.endDate) }}</span>
                  </div>
                </td>
                <td class="price-cell">₱{{ booking.totalCost ? Number(booking.totalCost).toLocaleString() : '0' }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(booking.paymentStatus)]">
                    {{ formatStatus(booking.paymentStatus) }}
                  </span>
                </td>
                <td>
                  <div class="actions-cell">
                    <button @click="viewBooking(booking)" class="action-btn view" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-view grid-layout">
          <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
            <div class="card-header">
              <div class="header-main">
                <h3 class="vehicle-title">{{ booking.vehicleName }}</h3>
                <span class="booking-ref">#{{ booking.id.substring(0, 8) }}</span>
              </div>
              <span :class="['status-badge', getStatusClass(booking.paymentStatus)]">
                {{ formatStatus(booking.paymentStatus) }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="info-row">
                <div class="user-mini">
                  <div class="avatar-sm" :style="{ backgroundColor: getAvatarColor(booking.resolvedRenterName) }">
                    {{ getInitials(booking.resolvedRenterName) }}
                  </div>
                  <div class="text-col">
                    <span class="name">{{ booking.resolvedRenterName }}</span>
                    <span class="email">{{ booking.resolvedRenterEmail }}</span>
                  </div>
                </div>
              </div>
              
              <div class="date-row">
                <div class="date-block">
                  <span class="label">From</span>
                  <span class="value">{{ formatDate(booking.startDate) }}</span>
                </div>
                <i class="bi bi-arrow-right"></i>
                <div class="date-block">
                  <span class="label">To</span>
                  <span class="value">{{ formatDate(booking.endDate) }}</span>
                </div>
              </div>

              <div class="cost-row">
                <span class="label">Total Cost</span>
                <span class="value">₱{{ booking.totalCost ? Number(booking.totalCost).toLocaleString() : '0' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button @click="viewBooking(booking)" class="btn-card secondary">
                View Details
              </button>
            </div>
          </div>
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
      activeFilter: 'all',
      searchQuery: '',
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
    ...mapGetters(['allBookings', 'allUsers']),
    
    processedBookings() {
      return this.allBookings.map(booking => {
        let resolvedRenterName = 'Unknown Renter';
        let resolvedRenterEmail = booking.renterEmail || 'No Email';
        
        // 1. Attempt to find user object from allUsers array
        if (this.allUsers && this.allUsers.length > 0) {
            // Check renterId, userId, or match email
            const targetId = booking.renterId || booking.userId;
            const renter = this.allUsers.find(u => 
              (targetId && (u.uid === targetId || u.id === targetId)) || 
              (booking.renterEmail && u.email === booking.renterEmail)
            );

            if (renter) {
                resolvedRenterName = renter.name || renter.fullName || 'No Name';
                resolvedRenterEmail = renter.email || booking.renterEmail;
            }
        }

        // 2. Fallback: If name is still unknown but email exists, use start of email as name
        if ((resolvedRenterName === 'Unknown Renter' || resolvedRenterName === 'No Name') && booking.renterEmail) {
            resolvedRenterName = booking.renterEmail.split('@')[0];
        }

        return { 
          ...booking, 
          resolvedRenterName, 
          resolvedRenterEmail 
        };
      });
    },

    filteredBookings() {
      let result = this.processedBookings;

      // 1. Filter by Status Tab
      if (this.activeFilter !== 'all') {
        if (this.activeFilter === 'pending') {
           const pendingStatuses = ['pending_owner_approval', 'pending_payment', 'downpayment_pending_verification'];
           result = result.filter(b => pendingStatuses.includes(b.paymentStatus));
        } else if (this.activeFilter === 'cancelled') {
           const cancelledStatuses = ['cancelled', 'declined_by_owner', 'cancelled_by_renter'];
           result = result.filter(b => cancelledStatuses.includes(b.paymentStatus));
        } else if (this.activeFilter === 'completed') {
           const completedStatuses = ['completed', 'returned'];
           result = result.filter(b => completedStatuses.includes(b.paymentStatus));
        } else {
           // Exact match for 'confirmed', etc.
           result = result.filter(b => b.paymentStatus === this.activeFilter);
        }
      }

      // 2. Filter by Search Query
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        result = result.filter(b => 
            b.id.toLowerCase().includes(lowerQuery) ||
            b.vehicleName?.toLowerCase().includes(lowerQuery) ||
            b.resolvedRenterName?.toLowerCase().includes(lowerQuery) ||
            b.resolvedRenterEmail?.toLowerCase().includes(lowerQuery)
        );
      }

      // 3. Sort by Date (Newest First)
      return result.sort((a, b) => {
          const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
          const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
          return dateB - dateA;
      });
    }
  },
  methods: {
    ...mapActions(['fetchAllBookings', 'fetchAllUsers']),
    
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
            this.fetchAllBookings(),
            this.fetchAllUsers() // Essential to link Renter IDs to Names
        ]);
      } catch (err) {
        this.error = 'An error occurred while fetching booking data.';
        console.error('[AdminBookingsView] Fetch error:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      if (typeof dateString === 'object' && dateString.seconds) {
          return DateTime.fromSeconds(dateString.seconds).toFormat('MMM dd, yyyy');
      }
      return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getInitials(name) {
      if (!name || name === 'Unknown Renter') return '?';
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    },
    getAvatarColor(name) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
      if (!name || name === 'Unknown Renter') return '#9ca3af';
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
    getStatusClass(status) {
      switch (status) {
        case 'confirmed':
        case 'completed':
        case 'returned':
        case 'paid':
        case 'downpayment_verified':
          return 'status-success';
        case 'pending_owner_approval':
        case 'pending_payment':
        case 'downpayment_pending_verification':
          return 'status-warning';
        case 'cancelled':
        case 'declined_by_owner':
        case 'cancelled_by_renter':
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

// --- Variables ---
$bg-color: #f8f9fa;
$text-main: #1f2937;
$text-light: #6b7280;
$border-color: #e5e7eb;
$card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: $text-main;

  @media(max-width: 768px) {
    padding: 1rem;
  }
}

// --- Header ---
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.025em;
  }
  .section-subtitle {
    color: $text-light;
    margin: 0;
    font-size: 1rem;
  }
  
  .header-stats {
    @media(max-width: 768px) { display: none; }
    .stat-item {
      text-align: center;
      background: white;
      padding: 0.5rem 1.5rem;
      border-radius: 12px;
      box-shadow: $card-shadow;
      .stat-val { display: block; font-weight: 800; font-size: 1.5rem; color: $primary-color; line-height: 1; }
      .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: $text-light; }
    }
  }
}

// --- Control Bar ---
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.5rem;
  border-radius: 16px;
  box-shadow: $card-shadow;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media(max-width: 992px) {
    flex-direction: column-reverse;
    align-items: stretch;
    padding: 1rem;
  }
}

.tabs-wrapper {
  display: flex;
  gap: 0.25rem;
  background: $bg-color;
  padding: 0.25rem;
  border-radius: 12px;
  overflow-x: auto;
  
  .filter-tab {
    border: none;
    background: none;
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: $text-light;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover { color: $text-main; }
    &.active {
      background: white;
      color: $primary-color;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
  }
}

.search-wrapper {
  position: relative;
  @media(max-width: 992px) { width: 100%; }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-light;
  }
  .search-input {
    padding: 0.75rem 1rem 0.75rem 2.8rem;
    border: 1px solid $border-color;
    border-radius: 12px;
    width: 300px;
    transition: all 0.2s;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
    }
    @media(max-width: 992px) { width: 100%; }
  }
}

// --- Desktop Table ---
.desktop-view {
  display: block;
  @media(max-width: 992px) { display: none; }
}

.table-responsive {
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;

  thead th {
    text-align: left;
    padding: 1.25rem 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $text-light;
    background: #fafafa;
    border-bottom: 1px solid $border-color;
  }

  tbody td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $border-color;
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #f9fafb;
  }

  .text-right { text-align: right; }
}

.id-cell {
  .id-text {
    font-family: 'Roboto Mono', monospace;
    color: $primary-color;
    font-weight: 600;
    font-size: 0.85rem;
  }
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 1rem;

  .user-avatar {
    width: 36px;
    height: 36px;
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
  .user-text {
    display: flex;
    flex-direction: column;
    .name { font-weight: 600; color: $text-main; font-size: 0.9rem; }
    .email { font-size: 0.8rem; color: $text-light; }
  }
}

.vehicle-info {
  font-weight: 600;
  color: $text-main;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: $text-light;
  white-space: nowrap;
}

.price-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  color: $text-main;
}

// --- Mobile Cards ---
.mobile-view {
  display: none;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  @media(max-width: 992px) { display: grid; }
}

.booking-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: $card-shadow;
  display: flex;
  flex-direction: column;

  .card-header {
    padding: 1.25rem;
    border-bottom: 1px solid $border-color;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .header-main {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      .vehicle-title { margin: 0; font-size: 1rem; font-weight: 700; }
      .booking-ref { font-size: 0.75rem; color: $text-light; font-family: monospace; }
    }
  }

  .card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .user-mini {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        .avatar-sm {
          width: 30px;
          height: 30px;
          background-color: $primary-color;
          color: white;
          border-radius: 50%;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .text-col {
          display: flex;
          flex-direction: column;
          .name { font-weight: 600; font-size: 0.9rem; }
          .email { font-size: 0.75rem; color: $text-light; }
        }
      }
    }

    .date-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: $bg-color;
      padding: 0.75rem;
      border-radius: 8px;
      
      .date-block {
        display: flex;
        flex-direction: column;
        .label { font-size: 0.7rem; text-transform: uppercase; color: $text-light; }
        .value { font-size: 0.85rem; font-weight: 600; }
      }
      i { color: $text-light; }
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .label { font-size: 0.9rem; color: $text-light; }
      .value { font-size: 1.1rem; font-weight: 800; color: $primary-color; }
    }
  }

  .card-footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid $border-color;
    background: #fafafa;
    display: flex;
    justify-content: flex-end;

    .btn-card {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      border: 1px solid $border-color;
      background: white;
      color: $text-main;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover { border-color: $primary-color; color: $primary-color; }
    }
  }
}

// --- Common Styles ---
.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  &.status-success { background: #d1fae5; color: #065f46; }
  &.status-warning { background: #fef3c7; color: #92400e; }
  &.status-danger { background: #fee2e2; color: #991b1b; }
  &.status-default { background: #f3f4f6; color: #4b5563; }
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { background: #e0f2fe; color: #0284c7; }
}

.primary-btn {
  background: $primary-color;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

// --- States ---
.state-container {
  text-align: center;
  padding: 4rem 2rem;
  color: $text-light;
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;

  .spinner {
    margin: 0 auto 1rem;
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba($primary-color, 0.3);
    border-radius: 50%;
    border-top-color: $primary-color;
    animation: spin 1s ease-in-out infinite;
  }
  i { font-size: 2.5rem; margin-bottom: 1rem; display: block; opacity: 0.5; }
  
  &.error i { color: #ef4444; opacity: 1; }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>