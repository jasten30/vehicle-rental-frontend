<template>
  <div class="owner-bookings-page">
    <div class="page-container">
      <div class="header-section">
        <h1 class="page-title">My Bookings</h1>
        <!-- --- UPDATED: Search Bar placeholder --- -->
        <div class="search-wrapper">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by renter, vehicle, or booking ID..."
            class="search-input"
          />
        </div>
      </div>

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

      <!-- No bookings at all state -->
      <div v-else-if="allBookings.length === 0" class="info-state">
        <p>You currently have no bookings for your vehicles.</p>
      </div>

      <!-- No search results state -->
      <div v-else-if="filteredNewRequests.length === 0 && filteredUpcomingBookings.length === 0 && filteredPastBookings.length === 0" class="info-state">
        <p>No bookings found for "{{ searchQuery }}".</p>
      </div>

      <!-- Bookings displayed in sections -->
      <div v-else>
        <!-- Section for New Requests -->
        <section v-if="filteredNewRequests.length > 0" class="booking-section">
          <h2 class="section-title">New Requests</h2>
          <div class="requests-grid">
            <div v-for="booking in filteredNewRequests" :key="booking.id" class="request-card">
              <div class="card-header">
                <span class="renter-name">{{ booking.renterDetails?.username || 'N/A' }}</span>
                <span :class="getStatusBadgeClass(booking.paymentStatus)">
                  {{ formatStatus(booking.paymentStatus) }}
                </span>
              </div>
              <div class="card-body">
                <!-- --- NEW: Booking ID added --- -->
                <p class="booking-id">ID: {{ booking.id }}</p>
                <p class="vehicle-name">{{ booking.vehicleDetails?.make }} {{ booking.vehicleDetails?.model }}</p>
                <p class="booking-dates">{{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}</p>
              </div>
              <div class="card-footer">
                <span class="booking-price">{{ formatPrice(booking.totalCost) }}</span>
                <button @click="viewBookingDetails(booking.id)" class="action-button">
                  Review Request
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Section for Upcoming Trips -->
        <section v-if="filteredUpcomingBookings.length > 0" class="booking-section">
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
                <tr v-for="booking in filteredUpcomingBookings" :key="booking.id" class="table-row">
                  <td class="table-data">{{ booking.renterDetails?.username || 'N/A' }}</td>
                  <td class="table-data">{{ booking.vehicleDetails?.make }} {{ booking.vehicleDetails?.model }}</td>
                  <td class="table-data">{{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}</td>
                  <td class="table-data">
                    <span :class="getStatusBadgeClass(booking.paymentStatus)">{{ formatStatus(booking.paymentStatus) }}</span>
                  </td>
                  <td class="table-data">{{ formatPrice(booking.totalCost) }}</td>
                  <td class="table-data">
                    <button @click="viewBookingDetails(booking.id)" class="action-button view-details-button">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Section for Past Trips -->
        <section v-if="filteredPastBookings.length > 0" class="booking-section">
          <h2 class="section-title">Past & Completed Trips</h2>
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
                <tr v-for="booking in filteredPastBookings" :key="booking.id" class="table-row">
                  <td class="table-data">{{ booking.renterDetails?.username || 'N/A' }}</td>
                  <td class="table-data">{{ booking.vehicleDetails?.make }} {{ booking.vehicleDetails?.model }}</td>
                  <td class="table-data">{{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}</td>
                  <td class="table-data">
                    <span :class="getStatusBadgeClass(booking.paymentStatus)">{{ formatStatus(booking.paymentStatus) }}</span>
                  </td>
                  <td class="table-data">{{ formatPrice(booking.totalCost) }}</td>
                  <td class="table-data">
                    <button @click="viewBookingDetails(booking.id)" class="action-button view-details-button">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'OwnerBookings',
  data() {
    return {
      searchQuery: '',
    };
  },
  computed: {
    ...mapState('owner', {
      allBookings: state => state.ownerBookings,
      loadingStatus: state => state.ownerBookingsStatus,
      error: state => state.ownerBookingsError,
    }),

    filteredNewRequests() {
      const baseRequests = this.allBookings
        .filter(b => b.paymentStatus === 'pending_owner_approval')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (!this.searchQuery) return baseRequests;

      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return baseRequests.filter(booking => this.matchesSearch(booking, lowerCaseQuery));
    },

    filteredUpcomingBookings() {
      const upcomingStatuses = [
        'confirmed', 'downpayment_received', 'full_payment_received',
        'pending_payment', 'downpayment_pending_verification'
      ];
      const baseBookings = this.allBookings
        .filter(b => upcomingStatuses.includes(b.paymentStatus) && new Date(b.endDate) >= new Date())
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      if (!this.searchQuery) return baseBookings;
      
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return baseBookings.filter(booking => this.matchesSearch(booking, lowerCaseQuery));
    },

    filteredPastBookings() {
      const pastStatuses = ['completed', 'returned', 'cancelled', 'declined_by_owner'];
      const baseBookings = this.allBookings
        .filter(b => pastStatuses.includes(b.paymentStatus) || new Date(b.endDate) < new Date())
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
      
      if (!this.searchQuery) return baseBookings;

      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return baseBookings.filter(booking => this.matchesSearch(booking, lowerCaseQuery));
    },
  },
  async created() {
    await this.fetchOwnerBookings();
  },
  methods: {
    ...mapActions('owner', ['fetchOwnerBookings']),

    // --- UPDATED: Search logic now includes booking ID ---
    matchesSearch(booking, query) {
        const renterName = (booking.renterDetails?.username || '').toLowerCase();
        const vehicleMake = (booking.vehicleDetails?.make || '').toLowerCase();
        const vehicleModel = (booking.vehicleDetails?.model || '').toLowerCase();
        const bookingId = (booking.id || '').toLowerCase(); // Add booking ID to search
        
        return renterName.includes(query) || 
               vehicleMake.includes(query) || 
               vehicleModel.includes(query) ||
               bookingId.includes(query);
    },
    
    viewBookingDetails(bookingId) {
      this.$router.push({ name: 'BookingDetails', params: { bookingId: bookingId } });
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_SHORT);
    },
    formatPrice(price) {
      return price ? `₱${Number(price).toFixed(2)}` : 'N/A';
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    getStatusBadgeClass(status) {
       switch (status) {
        case 'pending_owner_approval':
          return 'status-badge status-new';
        case 'confirmed':
        case 'downpayment_received':
        case 'full_payment_received':
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
  },
};
</script>

<style lang="scss" scoped>
.owner-bookings-page {
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 1rem;
}

.page-container {
  max-width: 64rem;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 350px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem; /* Add padding for the icon */
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
  to { transform: rotate(360deg); }
}

/* New Request Cards Styles */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.request-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
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
}

.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}

/* --- NEW: Style for booking ID --- */
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

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
}

.bookings-table {
  min-width: 100%;
  border-collapse: collapse;
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
}

/* Badge Styles */
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
.status-refunded { background-color: #e0f2fe; color: #0284c7; }
.status-default { background-color: #f3f4f6; color: #374151; }

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
</style>

