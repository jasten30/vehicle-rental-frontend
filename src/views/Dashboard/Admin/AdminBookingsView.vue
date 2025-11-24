<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h2 class="section-title">Bookings & Finance</h2>
        <p class="section-subtitle">
          Monitor rental transactions and verify platform fees.
        </p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-val">{{ filteredList.length }}</span>
          <span class="stat-label">Records</span>
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

        <div class="divider"></div>

        <button
          class="filter-tab fee-tab"
          :class="{ active: activeFilter === 'platform_fees' }"
          @click="activeFilter = 'platform_fees'"
        >
          <i class="bi bi-cash-coin"></i> Platform Fees
        </button>
      </div>

      <div class="search-wrapper">
        <i class="bi bi-search search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
        />
      </div>
    </div>

    <div class="content-area">
      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>

      <div v-else-if="error" class="state-container error">
        <i class="bi bi-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchData" class="button primary-btn">Retry</button>
      </div>

      <div
        v-else-if="paginatedList.length === 0"
        class="state-container empty"
      >
        <i class="bi bi-inbox"></i>
        <p>No records found.</p>
      </div>

      <div v-else class="list-container">
        <template v-if="activeFilter === 'platform_fees'">
          <div class="list-header fee-grid desktop-only">
            <div class="col">Period</div>
            <div class="col">Host</div>
            <div class="col">Ref No.</div>
            <div class="col">Amount</div>
            <div class="col">Status</div>
            <div class="col right">Actions</div>
          </div>

          <div
            v-for="fee in paginatedList"
            :key="fee.id"
            class="list-item fee-grid"
          >
            <div class="mobile-top mobile-only">
              <span class="period"
                ><strong>{{ fee.month }} {{ fee.year }}</strong></span
              >
              <span
                :class="[
                  'status-badge',
                  fee.status === 'verified'
                    ? 'status-success'
                    : 'status-warning',
                ]"
              >
                {{ fee.status === 'verified' ? 'Verified' : 'Pending' }}
              </span>
            </div>

            <div class="col period-cell desktop-only">
              <strong>{{ fee.month }} {{ fee.year }}</strong>
            </div>

            <div class="col user-cell">
              <div class="user-info">
                <div class="user-avatar host">
                  {{ getInitials(fee.hostName) }}
                </div>
                <div class="user-text">
                  <span class="name">{{ fee.hostName }}</span>
                  <span class="email">{{ fee.hostEmail }}</span>
                </div>
              </div>
            </div>

            <div class="col ref-cell font-mono">
              <span class="label-mobile">Ref:</span> {{ fee.referenceNumber }}
            </div>

            <div class="col amount-cell text-success">
              <span class="label-mobile">Amount:</span>
              +₱{{
                fee.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
              }}
            </div>

            <div class="col status-cell desktop-only">
              <span
                :class="[
                  'status-badge',
                  fee.status === 'verified'
                    ? 'status-success'
                    : 'status-warning',
                ]"
              >
                {{ fee.status === 'verified' ? 'Verified' : 'Pending Review' }}
              </span>
            </div>

            <div class="col actions-cell">
              <button
                v-if="fee.status !== 'verified'"
                @click="verifyFeePayment(fee.id)"
                class="button primary-btn small-btn"
              >
                Verify
              </button>
              <span v-else class="text-muted">
                <i class="bi bi-check-all"></i> Done
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="list-header booking-grid desktop-only">
            <div class="col">ID</div>
            <div class="col">Renter</div>
            <div class="col">Vehicle</div>
            <div class="col">Dates</div>
            <div class="col">Total</div>
            <div class="col">Status</div>
            <div class="col right">Actions</div>
          </div>

          <div
            v-for="booking in paginatedList"
            :key="booking.id"
            class="list-item booking-grid"
          >
            <div class="mobile-top mobile-only">
              <span class="id-text"
                >#{{ booking.id.substring(0, 8) }}</span
              >
              <span
                :class="[
                  'status-badge',
                  getStatusClass(booking.paymentStatus),
                ]"
              >
                {{ formatStatus(booking.paymentStatus) }}
              </span>
            </div>

            <div class="col id-cell desktop-only">
              #{{ booking.id.substring(0, 8) }}...
            </div>

            <div class="col user-cell">
              <div class="user-info">
                <div class="user-text">
                  <span class="name">{{ booking.resolvedRenterName }}</span>
                  <span class="email">{{ booking.renterEmail }}</span>
                </div>
              </div>
            </div>

            <div class="col vehicle-cell">
              <span class="label-mobile">Vehicle:</span>
              <span class="vehicle-name">{{ booking.vehicleName }}</span>
            </div>

            <div class="col date-cell">
              <div class="date-range">
                <span>{{ formatDate(booking.startDate) }}</span>
                <i class="bi bi-arrow-right-short arrow-icon"></i>
                <span>{{ formatDate(booking.endDate) }}</span>
              </div>
            </div>

            <div class="col price-cell">
              <span class="label-mobile">Total:</span>
              ₱{{
                booking.totalCost
                  ? booking.totalCost.toLocaleString()
                  : '0'
              }}
            </div>

            <div class="col status-cell desktop-only">
              <span
                :class="[
                  'status-badge',
                  getStatusClass(booking.paymentStatus),
                ]"
              >
                {{ formatStatus(booking.paymentStatus) }}
              </span>
            </div>

            <div class="col actions-cell">
              <button
                @click="viewBooking(booking)"
                class="action-btn view"
                title="View Details"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </template>
      </div>

      <div class="pagination-container" v-if="totalPages > 1">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <i class="bi bi-chevron-left"></i> Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          Next <i class="bi bi-chevron-right"></i>
        </button>
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
      currentPage: 1,
      itemsPerPage: 10,

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
    ...mapGetters(['allBookings', 'allUsers', 'allPlatformFees']),

    processedBookings() {
      return this.allBookings.map((booking) => {
        let resolvedRenterName = 'Unknown Renter';
        let resolvedRenterEmail = booking.renterEmail || 'No Email';

        if (this.allUsers && this.allUsers.length > 0) {
          const targetId = booking.renterId || booking.userId;
          const renter = this.allUsers.find(
            (u) =>
              (targetId && (u.uid === targetId || u.id === targetId)) ||
              (booking.renterEmail && u.email === booking.renterEmail)
          );
          if (renter) {
            resolvedRenterName = renter.name || renter.fullName || 'No Name';
            resolvedRenterEmail = renter.email || booking.renterEmail;
          }
        }
        if (
          (resolvedRenterName === 'Unknown Renter' ||
            resolvedRenterName === 'No Name') &&
          booking.renterEmail
        ) {
          resolvedRenterName = booking.renterEmail.split('@')[0];
        }
        return { ...booking, resolvedRenterName, resolvedRenterEmail };
      });
    },

    filteredList() {
      const lowerQuery = this.searchQuery.toLowerCase();

      // CASE A: PLATFORM FEES TAB
      if (this.activeFilter === 'platform_fees') {
        return this.allPlatformFees.filter(
          (fee) =>
            (fee.hostName || '').toLowerCase().includes(lowerQuery) ||
            (fee.referenceNumber || '').toLowerCase().includes(lowerQuery)
        );
      }

      // CASE B: STANDARD BOOKINGS
      let result = this.processedBookings;

      if (this.activeFilter !== 'all') {
        if (this.activeFilter === 'pending') {
          const pendingStatuses = [
            'pending_owner_approval',
            'pending_payment',
            'downpayment_pending_verification',
          ];
          result = result.filter((b) =>
            pendingStatuses.includes(b.paymentStatus)
          );
        } else if (this.activeFilter === 'cancelled') {
          const cancelledStatuses = [
            'cancelled',
            'declined_by_owner',
            'cancelled_by_renter',
          ];
          result = result.filter((b) =>
            cancelledStatuses.includes(b.paymentStatus)
          );
        } else if (this.activeFilter === 'completed') {
          const completedStatuses = ['completed', 'returned'];
          result = result.filter((b) =>
            completedStatuses.includes(b.paymentStatus)
          );
        } else {
          result = result.filter((b) => b.paymentStatus === this.activeFilter);
        }
      }

      if (this.searchQuery) {
        result = result.filter(
          (b) =>
            b.id.toLowerCase().includes(lowerQuery) ||
            b.vehicleName?.toLowerCase().includes(lowerQuery) ||
            b.resolvedRenterName?.toLowerCase().includes(lowerQuery)
        );
      }

      return result.sort((a, b) => {
        const dateA = new Date(
          a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt
        );
        const dateB = new Date(
          b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt
        );
        return dateB - dateA;
      });
    },

    totalPages() {
      return Math.ceil(this.filteredList.length / this.itemsPerPage);
    },
    paginatedList() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredList.slice(start, end);
    },
  },
  watch: {
    activeFilter() {
      this.currentPage = 1;
    },
    searchQuery() {
      this.currentPage = 1;
    },
  },
  methods: {
    ...mapActions([
      'fetchAllBookings',
      'fetchAllUsers',
      'fetchAllPlatformFees',
      'verifyPlatformFee',
    ]),

    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.fetchAllBookings(),
          this.fetchAllUsers(),
          this.fetchAllPlatformFees(),
        ]);
      } catch (err) {
        this.error = 'An error occurred while fetching data.';
      } finally {
        this.loading = false;
      }
    },

    async verifyFeePayment(id) {
      if (!confirm('Verify this payment has been received?')) return;

      try {
        await this.verifyPlatformFee(id);
        alert('Payment verified successfully.');
      } catch (e) {
        alert('Failed to verify payment.');
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      if (typeof dateString === 'object' && dateString.seconds) {
        return DateTime.fromSeconds(dateString.seconds).toFormat(
          'MMM dd, yyyy'
        );
      }
      return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy');
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getInitials(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
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

$bg-color: #f8f9fa;
$text-main: #1f2937;
$text-light: #6b7280;
$border-color: #e5e7eb;
$card-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: $text-main;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
  }
  .section-subtitle {
    color: $text-light;
    margin: 0;
    font-size: 1rem;
  }

  .header-stats .stat-item {
    background: white;
    padding: 0.5rem 1.5rem;
    border-radius: 12px;
    box-shadow: $card-shadow;
    text-align: center;
    .stat-val {
      display: block;
      font-weight: 800;
      font-size: 1.5rem;
      color: $primary-color;
    }
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: $text-light;
    }
  }
}

/* CONTROL BAR */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem;
  border-radius: 16px;
  box-shadow: $card-shadow;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 992px) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
  background: $bg-color;
  padding: 0.25rem;
  border-radius: 12px;
  overflow-x: auto;

  .filter-tab {
    border: none;
    background: none;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: $text-light;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      color: $text-main;
    }
    &.active {
      background: white;
      color: $primary-color;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
  .divider {
    width: 1px;
    background: #d1d5db;
    margin: 0 0.5rem;
  }
  .fee-tab {
    color: #059669;
    &.active {
      color: #047857;
    }
  }
}

.search-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
  @media (max-width: 992px) {
    max-width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-light;
  }
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.8rem;
    border: 1px solid $border-color;
    border-radius: 12px;
    outline: none;
    transition: border 0.2s;
    &:focus {
      border-color: $primary-color;
    }
  }
}

/* LIST LAYOUT (Replaces Table) */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Desktop Header Row */
.list-header {
  display: grid;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  font-weight: 700;
  color: $text-light;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  box-shadow: $card-shadow;

  @media (max-width: 991px) {
    display: none;
  }

  &.booking-grid {
    grid-template-columns: 0.8fr 1.5fr 1.2fr 1.5fr 1fr 1fr 0.5fr;
  }
  &.fee-grid {
    grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 0.5fr;
  }
  .col.right {
    text-align: right;
  }
}

/* List Items */
.list-item {
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;
  padding: 1rem 1.5rem;
  display: grid;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  /* DESKTOP GRID */
  @media (min-width: 992px) {
    &.booking-grid {
      grid-template-columns: 0.8fr 1.5fr 1.2fr 1.5fr 1fr 1fr 0.5fr;
    }
    &.fee-grid {
      grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 0.5fr;
    }

    .mobile-top,
    .mobile-only,
    .label-mobile {
      display: none;
    }
    .col {
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .actions-cell {
      justify-content: flex-end;
    }
  }

  /* MOBILE CARD STACK */
  @media (max-width: 991px) {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 1.25rem;

    .desktop-only {
      display: none;
    }

    .mobile-top {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $border-color;
      padding-bottom: 0.8rem;
      margin-bottom: 0.5rem;

      .id-text {
        font-family: 'Roboto Mono', monospace;
        color: $primary-color;
        font-weight: 700;
      }
      .period {
        font-weight: 700;
      }
    }

    .col {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label-mobile {
      font-size: 0.8rem;
      color: $text-light;
      text-transform: uppercase;
      font-weight: 600;
    }

    .actions-cell {
      margin-top: 0.5rem;
      border-top: 1px solid $border-color;
      padding-top: 1rem;
      justify-content: flex-end;
    }
  }
}

/* COMPONENT STYLES */
.id-cell {
  font-family: 'Roboto Mono', monospace;
  color: $primary-color;
  font-weight: 600;
  font-size: 0.85rem;
}
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .user-avatar {
    width: 36px;
    height: 36px;
    background: $primary-color;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
    &.host {
      background-color: #7c3aed;
    }
  }
  .user-text {
    display: flex;
    flex-direction: column;
    .name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .email {
      font-size: 0.8rem;
      color: $text-light;
    }
  }
}
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: $text-light;
}
.price-cell {
  font-weight: 700;
  font-family: monospace;
}
.text-success {
  color: #10b981;
}
.font-mono {
  font-family: monospace;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  &.status-success {
    background: #d1fae5;
    color: #065f46;
  }
  &.status-warning {
    background: #fef3c7;
    color: #92400e;
  }
  &.status-danger {
    background: #fee2e2;
    color: #991b1b;
  }
  &.status-default {
    background: #f3f4f6;
    color: #4b5563;
  }
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
  &:hover {
    background: #e0f2fe;
    color: #0284c7;
  }
}
.primary-btn {
  background: $primary-color;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &.small-btn {
    font-size: 0.8rem;
  }
}

/* PAGINATION */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  .page-btn {
    background: white;
    color: black;
    border: 1px solid $border-color;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }
    &:disabled {
      opacity: 0.5;
    }
  }
  .page-info {
    font-size: 0.9rem;
    color: $text-light;
  }
}

/* STATE CONTAINERS */
.state-container {
  text-align: center;
  padding: 4rem 2rem;
  color: $text-light;
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;
  i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: block;
    opacity: 0.5;
  }
  &.error i {
    color: #ef4444;
    opacity: 1;
  }
}
.spinner {
  margin: 0 auto 1rem;
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba($primary-color, 0.3);
  border-radius: 50%;
  border-top-color: $primary-color;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>