<template>
  <div class="owner-bookings-page">
    <div class="page-container">
      
      <div class="header-section">
        <h1 class="page-title">My Bookings & Billing</h1>
        <div class="header-actions">
          <button
            @click="refreshData"
            class="refresh-btn"
            :disabled="loadingStatus === 'loading'"
            title="Refresh Data"
          >
            <i
              class="bi bi-arrow-clockwise"
              :class="{ 'spin-icon': loadingStatus === 'loading' }"
            ></i>
          </button>
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search bookings..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <div v-if="loadingStatus === 'loading'" class="info-state">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>

      <div
        v-else-if="loadingStatus === 'error'"
        class="info-state error-state"
      >
        <p>Failed to load data: {{ error }}</p>
        <button @click="refreshData" class="action-button retry-btn">
          Retry
        </button>
      </div>

      <div v-else>
        
        <section v-if="filteredNewRequests.length > 0" class="booking-section">
          <h2 class="section-title">New Requests</h2>
          <div class="requests-grid">
            <div
              v-for="booking in filteredNewRequests"
              :key="booking.id"
              class="request-card"
            >
              <div class="card-header">
                <span class="renter-name">{{
                  booking.renterDetails?.name || 'N/A'
                }}</span>
                <span :class="getStatusBadgeClass(booking.paymentStatus)">
                  {{ formatStatus(booking.paymentStatus) }}
                </span>
              </div>
              <div class="card-body">
                <p class="booking-id">ID: {{ booking.id }}</p>
                <p class="vehicle-name">
                  {{ booking.vehicleDetails?.make }}
                  {{ booking.vehicleDetails?.model }}
                </p>
                <p class="booking-dates">
                  {{ formatDate(booking.startDate) }} -
                  {{ formatDate(booking.endDate) }}
                </p>
              </div>
              <div class="card-footer">
                <span class="booking-price">{{
                  formatPrice(booking.totalCost)
                }}</span>
                <button
                  @click="viewBookingDetails(booking.id)"
                  class="action-button"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          v-if="filteredUpcomingBookings.length > 0"
          class="booking-section"
        >
          <h2 class="section-title">Upcoming & Active Trips</h2>
          <div class="table-wrapper">
            <table class="bookings-table">
              <thead class="table-header">
                <tr>
                  <th class="table-header-cell">Renter</th>
                  <th class="table-header-cell">Vehicle</th>
                  <th class="table-header-cell">Dates</th>
                  <th class="table-header-cell">Status</th>
                  <th class="table-header-cell">Total Price</th>
                  <th class="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr
                  v-for="booking in filteredUpcomingBookings"
                  :key="booking.id"
                  class="table-row"
                >
                  <td class="table-data">
                    {{ booking.renterDetails?.name || 'N/A' }}
                  </td>
                  <td class="table-data">
                    {{ booking.vehicleDetails?.make }}
                    {{ booking.vehicleDetails?.model }}
                  </td>
                  <td class="table-data">
                    {{ formatDate(booking.startDate) }} -
                    {{ formatDate(booking.endDate) }}
                  </td>
                  <td class="table-data">
                    <span
                      :class="getStatusBadgeClass(booking.paymentStatus)"
                    >
                      {{ formatStatus(booking.paymentStatus) }}
                    </span>
                  </td>
                  <td class="table-data font-bold">
                    {{ formatPrice(booking.totalCost) }}
                  </td>
                  <td class="table-data">
                    <button
                      @click="viewBookingDetails(booking.id)"
                      class="action-button view-details-button"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="filteredPastBookings.length > 0" class="booking-section">
          <h2 class="section-title">Past & Completed Trips</h2>
          <div class="table-wrapper">
            <table class="bookings-table">
              <thead class="table-header">
                <tr>
                  <th class="table-header-cell">#</th>
                  <th class="table-header-cell">Vehicle</th>
                  <th class="table-header-cell">Dates</th>
                  <th class="table-header-cell">Status</th>
                  <th class="table-header-cell">Total Price</th>
                  <th class="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr
                  v-for="(booking, index) in paginatedPastBookings"
                  :key="booking.id"
                  class="table-row"
                >
                  <td class="table-data font-bold">
                    {{ (pastCurrentPage - 1) * pastItemsPerPage + index + 1 }}
                  </td>
                  <td class="table-data">
                    {{ booking.vehicleDetails?.make }}
                    {{ booking.vehicleDetails?.model }}
                  </td>
                  <td class="table-data">
                    {{ formatDate(booking.startDate) }} -
                    {{ formatDate(booking.endDate) }}
                  </td>
                  <td class="table-data">
                    <span
                      :class="getStatusBadgeClass(booking.paymentStatus)"
                    >
                      {{ formatStatus(booking.paymentStatus) }}
                    </span>
                  </td>
                  <td class="table-data">
                    {{ formatPrice(booking.totalCost) }}
                  </td>
                  <td class="table-data">
                    <button
                      @click="viewBookingDetails(booking.id)"
                      class="action-button view-details-button"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-container" v-if="totalPastPages > 1">
            <button
              class="page-btn"
              :disabled="pastCurrentPage === 1"
              @click="pastCurrentPage--"
            >
              Previous
            </button>
            <span class="page-info">
              Page {{ pastCurrentPage }} of {{ totalPastPages }}
            </span>
            <button
              class="page-btn"
              :disabled="pastCurrentPage === totalPastPages"
              @click="pastCurrentPage++"
            >
              Next
            </button>
          </div>
        </section>

        <section class="booking-section financial-section">
          <div class="financial-header">
            <div>
              <h2 class="section-title">Platform Fees Ledger</h2>
              <p class="section-subtitle">
                Breakdown of the 10% service fee deducted from downpayments.
              </p>
            </div>
            <div class="year-filter">
              <label>Year:</label>
              <select v-model="selectedFinancialYear" class="year-select">
                <option
                  v-for="year in availableYears"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="detailedFinancialsByMonth.length === 0"
            class="info-state"
          >
            <p>No fee records found for {{ selectedFinancialYear }}.</p>
          </div>

          <div v-else class="monthly-breakdown-list">
            <div
              v-for="monthGroup in paginatedFinancialMonths"
              :key="monthGroup.monthName"
              class="month-block"
            >
              <h3 class="month-title">
                {{ monthGroup.monthName }} {{ selectedFinancialYear }}
              </h3>

              <div class="table-wrapper">
                <table class="bookings-table">
                  <thead class="table-header">
                    <tr>
                      <th class="table-header-cell">Ref</th>
                      <th class="table-header-cell">Vehicle</th>
                      <th class="table-header-cell">Date</th>
                      <th class="table-header-cell text-right">
                        Total Cost
                      </th>
                      <th class="table-header-cell text-right text-danger">
                        Fee (10% of DP)
                      </th>
                    </tr>
                  </thead>
                  <tbody class="table-body">
                    <tr
                      v-for="booking in monthGroup.bookings"
                      :key="booking.id"
                      class="table-row"
                    >
                      <td class="table-data font-mono">
                        #{{ booking.id.substring(0, 8) }}
                      </td>
                      <td class="table-data">
                        {{ booking.vehicleDetails?.make }}
                        {{ booking.vehicleDetails?.model }}
                      </td>
                      <td class="table-data">
                        {{ formatDate(booking.startDate) }}
                      </td>
                      <td class="table-data text-right">
                        {{ formatPrice(booking.totalCost) }}
                      </td>
                      <td class="table-data text-right text-danger font-bold">
                        -{{ formatPrice(calculateFee(booking.totalCost)) }}
                      </td>
                    </tr>
                    <tr class="table-row subtotal-row">
                      <td
                        colspan="3"
                        class="table-data text-right font-bold text-gray vert-align-middle"
                      >
                        Monthly Totals:
                      </td>
                      <td
                        class="table-data text-right font-bold text-success bg-success-light vert-align-middle"
                      >
                        {{ formatPrice(monthGroup.totalMonthlyGross) }}
                      </td>
                      <td
                        class="table-data text-right bg-danger-light vert-align-middle"
                      >
                        <div class="fee-payment-cell">
                          <span class="font-bold text-danger">
                            -{{ formatPrice(monthGroup.totalMonthlyFee) }}
                          </span>
                          
                          <span v-if="monthGroup.paymentStatus === 'verified'" class="status-paid">
                            <i class="bi bi-check-circle-fill"></i> Paid
                          </span>
                          <span v-else-if="monthGroup.paymentStatus === 'pending'" class="status-review">
                            <i class="bi bi-hourglass-split"></i> Pending
                          </span>
                          
                          <button 
                            v-else-if="monthGroup.totalMonthlyFee > 0"
                            @click="openPlatformFeeModal(monthGroup)" 
                            class="pay-fee-btn"
                          >
                            Pay Fee <i class="bi bi-arrow-right"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="pagination-container" v-if="totalFinancialPages > 1">
              <button
                class="page-btn"
                :disabled="financialCurrentPage === 1"
                @click="financialCurrentPage--"
              >
                Previous Month
              </button>
              <span class="page-info">
                 {{ paginatedFinancialMonths[0]?.monthName }} ({{ financialCurrentPage }}/{{ totalFinancialPages }})
              </span>
              <button
                class="page-btn"
                :disabled="financialCurrentPage === totalFinancialPages"
                @click="financialCurrentPage++"
              >
                Next Month
              </button>
            </div>

            <div class="year-total-summary">
              <div class="summary-row">
                <span class="label">Outstanding Platform Fees:</span>
                <span class="amount">-{{ formatPrice(totalYearlyFees) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <PlatformFeePaymentModal
      :is-open="showFeeModal"
      :month-name="feeModalData.month"
      :year="feeModalData.year"
      :amount="feeModalData.amount"
      @close="showFeeModal = false"
      @submit-payment="handleFeePayment"
    />
    
    <PaymentModal
      v-if="isPaymentModalOpen"
      :is-open="isPaymentModalOpen"
      :booking="feePaymentData"
      payment-type="platform_fee"
      :amount-due="feeAmountDue"
      :owner-details="adminDetails"
      @close="isPaymentModalOpen = false"
      @payment-confirmed="handleFeePaymentSubmitted"
    />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import PlatformFeePaymentModal from '@/components/modals/PlatformFeePaymentModal.vue';
import PaymentModal from '@/components/modals/PaymentModal.vue';
import adminQrCode from '@/assets/logo-header.jpg';

export default {
  name: 'OwnerBillingView',
  components: {
    PaymentModal,
    PlatformFeePaymentModal,
  },
  data() {
    return {
      searchQuery: '',
      pastCurrentPage: 1,
      pastItemsPerPage: 5,
      selectedFinancialYear: new Date().getFullYear(),
      financialCurrentPage: 1,
      financialItemsPerPage: 1,
      
      showFeeModal: false,
      feeModalData: {
        month: '',
        year: null,
        amount: 0
      },

      isPaymentModalOpen: false,
      feeAmountDue: 0,
      feePaymentData: null,
      
      adminDetails: {
        name: 'RentCycle Platform',
        email: 'admin@rentcycle.com',
        paymentMethods: {
          qrCode: adminQrCode 
        }
      }
    };
  },
  computed: {
    ...mapState('owner', {
      allBookings: (state) => state.ownerBookings,
      loadingStatus: (state) => state.ownerBookingsStatus,
      error: (state) => state.ownerBookingsError,
    }),
    ...mapGetters(['myPlatformFees']),

    filteredNewRequests() {
      const baseRequests = this.allBookings
        .filter((b) => b.paymentStatus === 'pending_owner_approval')
        .sort(
          (a, b) => this.getJsDate(b.createdAt) - this.getJsDate(a.createdAt)
        );

      if (!this.searchQuery) return baseRequests;
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return baseRequests.filter((booking) =>
        this.matchesSearch(booking, lowerCaseQuery)
      );
    },

    filteredUpcomingBookings() {
      const upcomingStatuses = [
        'confirmed',
        'downpayment_received',
        'full_payment_received',
        'pending_payment',
        'downpayment_pending_verification',
        'downpayment_verified',
      ];
      const baseBookings = this.allBookings
        .filter(
          (b) =>
            upcomingStatuses.includes(b.paymentStatus) &&
            this.getJsDate(b.endDate) >= new Date()
        )
        .sort(
          (a, b) => this.getJsDate(a.startDate) - this.getJsDate(b.startDate)
        );

      if (!this.searchQuery) return baseBookings;
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return baseBookings.filter((booking) =>
        this.matchesSearch(booking, lowerCaseQuery)
      );
    },

    filteredPastBookings() {
      const pastStatuses = [
        'completed',
        'returned',
        'cancelled',
        'declined_by_owner',
      ];
      const baseBookings = this.allBookings
        .filter(
          (b) =>
            pastStatuses.includes(b.paymentStatus) ||
            this.getJsDate(b.endDate) < new Date()
        )
        .sort((a, b) => this.getJsDate(b.endDate) - this.getJsDate(a.endDate));

      if (!this.searchQuery) return baseBookings;
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return baseBookings.filter((booking) =>
        this.matchesSearch(booking, lowerCaseQuery)
      );
    },

    totalPastPages() {
      return Math.ceil(
        this.filteredPastBookings.length / this.pastItemsPerPage
      );
    },
    paginatedPastBookings() {
      const start = (this.pastCurrentPage - 1) * this.pastItemsPerPage;
      const end = start + this.pastItemsPerPage;
      return this.filteredPastBookings.slice(start, end);
    },

    availableYears() {
      const years = new Set();
      this.allBookings.forEach((b) => {
        const date = this.getJsDate(b.createdAt || b.startDate);
        if (date) years.add(date.getFullYear());
      });
      years.add(new Date().getFullYear());
      return Array.from(years).sort((a, b) => b - a);
    },

    detailedFinancialsByMonth() {
      const feeApplicableStatuses = [
        'confirmed',
        'downpayment_received',
        'full_payment_received',
        'completed',
        'returned',
        'downpayment_verified',
      ];

      const yearBookings = this.allBookings.filter((b) => {
        const dateToUse = b.createdAt || b.startDate;
        const date = this.getJsDate(dateToUse);

        if (!date) return false;

        const isSameYear =
          String(date.getFullYear()) === String(this.selectedFinancialYear);
        const isFeeStatus = feeApplicableStatuses.includes(b.paymentStatus);

        return isSameYear && isFeeStatus;
      });

      const grouped = {};
      yearBookings.forEach((b) => {
        const dateToUse = b.createdAt || b.startDate;
        const date = this.getJsDate(dateToUse);

        if (date) {
          const monthIndex = date.getMonth();
          if (!grouped[monthIndex]) grouped[monthIndex] = [];
          grouped[monthIndex].push(b);
        }
      });

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const result = Object.keys(grouped).map((monthIndex) => {
        const bookings = grouped[monthIndex];
        const monthName = monthNames[monthIndex];
        
        const financials = bookings.reduce((acc, b) => {
           const gross = Number(b.totalCost) || 0;
           const fee = this.calculateFee(gross);
           acc.gross += gross;
           acc.fee += fee;
           return acc;
        }, { gross: 0, fee: 0 });

        const paymentRecord = this.myPlatformFees.find(
            f => f.month === monthName && String(f.year) === String(this.selectedFinancialYear)
        );
        const status = paymentRecord ? paymentRecord.status : 'unpaid';

        return {
          monthName: monthName,
          monthIndex: parseInt(monthIndex),
          bookings: bookings.sort((a, b) => {
            const dateA = this.getJsDate(a.createdAt || a.startDate);
            const dateB = this.getJsDate(b.createdAt || b.startDate);
            return dateA - dateB;
          }),
          totalMonthlyFee: financials.fee,
          totalMonthlyGross: financials.gross,
          paymentStatus: status
        };
      });

      return result.sort((a, b) => b.monthIndex - a.monthIndex);
    },

    totalFinancialPages() {
      return Math.ceil(this.detailedFinancialsByMonth.length / this.financialItemsPerPage);
    },
    paginatedFinancialMonths() {
      const start = (this.financialCurrentPage - 1) * this.financialItemsPerPage;
      const end = start + this.financialItemsPerPage;
      return this.detailedFinancialsByMonth.slice(start, end);
    },

    totalYearlyFees() {
      return this.detailedFinancialsByMonth.reduce((sum, month) => {
        if (month.paymentStatus === 'verified' || month.paymentStatus === 'pending') {
          return sum;
        }
        return sum + month.totalMonthlyFee;
      }, 0);
    },
  },
  watch: {
    searchQuery() {
      this.pastCurrentPage = 1;
    },
    $route(to, _from) {
      if (to.name === 'OwnerBilling') {
        this.refreshData();
      }
    },
    selectedFinancialYear() {
      this.financialCurrentPage = 1;
    }
  },
  async created() {
    await this.refreshData();
    if (this.availableYears.length > 0) {
      this.selectedFinancialYear = this.availableYears[0];
    }
  },
  methods: {
    ...mapActions(['fetchOwnerPlatformFees', 'submitPlatformFee']), 
    ...mapActions('owner', ['fetchOwnerBookings']),

    async refreshData() {
      await Promise.all([
          this.fetchOwnerBookings(),
          this.fetchOwnerPlatformFees()
      ]);
    },
    
    openPlatformFeeModal(monthData) {
      this.feeModalData = {
        month: monthData.monthName,
        year: this.selectedFinancialYear,
        amount: monthData.totalMonthlyFee
      };
      this.showFeeModal = true;
    },

    async handleFeePayment(payload) {
      try {
        await this.$store.dispatch('submitPlatformFee', {
          month: payload.month,
          year: payload.year,
          amount: payload.amount,
          referenceNumber: payload.referenceNumber
        });

        alert(`Payment submitted successfully! The admin will review it shortly.`);
        this.showFeeModal = false;
        await this.refreshData();

      } catch (error) {
        console.error("Fee payment error:", error);
        alert("Failed to submit payment. Please try again.");
      }
    },

    getJsDate(val) {
      if (!val) return null;
      if (typeof val === 'object' && val.seconds) {
        return new Date(val.seconds * 1000);
      }
      if (typeof val === 'object' && val._seconds) {
        return new Date(val._seconds * 1000);
      }
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    },

    matchesSearch(booking, query) {
      const renterName = (
        booking.renterDetails?.username || ''
      ).toLowerCase();
      const vehicleMake = (
        booking.vehicleDetails?.make || ''
      ).toLowerCase();
      const vehicleModel = (
        booking.vehicleDetails?.model || ''
      ).toLowerCase();
      const bookingId = (booking.id || '').toLowerCase();
      return (
        renterName.includes(query) ||
        vehicleMake.includes(query) ||
        vehicleModel.includes(query) ||
        bookingId.includes(query)
      );
    },
    viewBookingDetails(bookingId) {
      this.$router.push({
        name: 'BookingDetails',
        params: { bookingId: bookingId },
      });
    },
    formatDate(dateVal) {
      const d = this.getJsDate(dateVal);
      if (!d) return 'N/A';
      return DateTime.fromJSDate(d).toLocaleString(DateTime.DATE_SHORT);
    },
    formatPrice(price) {
      return price ? `₱${Number(price).toFixed(2)}` : '₱0.00';
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case 'pending_owner_approval':
          return 'status-badge status-new';
        case 'confirmed':
        case 'downpayment_received':
        case 'full_payment_received':
        case 'downpayment_verified':
          return 'status-badge status-confirmed';
        case 'pending_payment':
        case 'downpayment_pending_verification':
          return 'status-badge status-pending';
        case 'completed':
        case 'returned':
          return 'status-badge status-completed';
        case 'cancelled':
        case 'declined_by_owner':
          return 'status-badge status-cancelled';
        default:
          return 'status-badge status-default';
      }
    },
    calculateFee(totalCost) {
      if (!totalCost) return 0;
      const downpayment = totalCost * 0.2;
      return downpayment * 0.1;
    },
    handleFeePaymentSubmitted() {
      this.isPaymentModalOpen = false;
      alert('Payment submitted.');
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* --- Layout --- */
.owner-bookings-page {
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 1rem;
}
.page-container {
  max-width: 64rem;
  margin: 0 auto;
}

/* --- Header --- */
.header-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
    justify-content: flex-end;
  }
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 1.875rem;
  }
}

/* --- Search & Buttons --- */
.search-wrapper {
  position: relative;
  flex-grow: 1;
}
.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 0.9rem;
  transition: box-shadow 0.2s, border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
}
.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}
.refresh-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  &:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
.spin-icon {
  animation: spin 1s linear infinite;
}

/* --- Section Styles --- */
.booking-section {
  margin-bottom: 3rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* --- Loading/States --- */
.info-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #6b7280;
}
.spinner {
  animation: spin 1s linear infinite;
  height: 2rem;
  width: 2rem;
  color: #3b82f6;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- Cards (Mobile Optimized) --- */
.requests-grid {
  display: grid;
  grid-template-columns: 1fr; /* 1 column on mobile */
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
.request-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.renter-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}
.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}
.booking-id {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
  word-break: break-all;
}
.vehicle-name {
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.5rem;
}
.booking-dates {
  color: #6b7280;
  font-size: 0.875rem;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
.booking-price {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
}

/* --- Tables --- */
.table-wrapper {
  overflow-x: auto; /* Enable horizontal scrolling on small screens */
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.bookings-table {
  min-width: 100%;
  border-collapse: collapse;
  
  /* Ensure min-width to trigger scroll on mobile if needed */
  @media (max-width: 640px) {
    min-width: 800px; 
  }
}
.table-header {
  background-color: #f9fafb;
}
.table-header-cell {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}
.table-body .table-row {
  border-top: 1px solid #e5e7eb;
}
.table-body .table-row:hover {
  background-color: #f3f4f6;
}
.table-data {
  padding: 1rem 1rem;
  white-space: nowrap;
  font-size: 0.875rem;
  color: #374151;
  vertical-align: middle;
}
.font-bold {
  font-weight: 700;
  color: #1f2937;
}

/* --- Status Badges --- */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1;
}
.status-new { background-color: #e0f2fe; color: #0284c7; }
.status-confirmed { background-color: #d1fae5; color: #065f46; }
.status-pending { background-color: #fef3c7; color: #92400e; }
.status-completed { background-color: #e5e7eb; color: #374151; }
.status-cancelled { background-color: #fee2e2; color: #991b1b; }
.status-default { background-color: #f3f4f6; color: #374151; }

/* --- Buttons --- */
.action-button {
  background-color: #3b82f6;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 150ms ease-in-out;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: darken(#3b82f6, 10%);
  }
}
.retry-btn {
  margin-top: 1rem;
}

/* --- Pagination --- */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}
.page-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.page-info {
  font-size: 0.875rem;
  color: #6b7280;
}

/* --- Financial Section Styles --- */
.financial-section {
  margin-top: 4rem;
}
.financial-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
}
.section-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}
.year-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.year-select {
  padding: 0.4rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #374151;
  cursor: pointer;
  background-color: white;
}

.monthly-breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.month-block {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
.month-title {
  background: #f9fafb;
  padding: 0.75rem 1.25rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

/* Financials Specific */
.font-mono { font-family: monospace; font-size: 0.8rem; color: #6b7280; }
.text-right { text-align: right; }
.text-danger { color: #dc2626; }
.text-success { color: #16a34a; }
.text-gray { color: #4b5563; }
.bg-danger-light { background-color: #fef2f2; }
.bg-success-light { background-color: #ecfdf5; }

.subtotal-row td {
  border-top: 2px solid #e5e7eb;
  background-color: #fff;
}
.vert-align-middle {
  vertical-align: middle !important;
}

.year-total-summary {
  background: #1f2937;
  color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }

  .amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f87171;
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
}

.fee-payment-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.pay-fee-btn {
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: darken(#dc2626, 10%);
  }
}
/* Fee Status Styles */
.status-paid {
  color: #10b981;
  font-weight: 600;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-review {
  color: #f59e0b;
  font-weight: 600;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>