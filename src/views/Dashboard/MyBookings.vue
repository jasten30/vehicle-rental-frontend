<template>
  <div class="my-bookings-container">
    <div class="header-section">
      <h2 class="section-title">My Trips</h2>
      <p class="section-subtitle">
        Review your upcoming, past, and pending trips.
      </p>
    </div>

    <!-- Tabbed filters for booking status -->
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
      <p>Loading your trips...</p>
    </div>
    <div v-else-if="errorMessage" class="info-state error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchBookings" class="button primary">Retry</button>
    </div>
    <div
      v-else-if="filteredBookings.length === 0 && activeFilter === 'all'"
      class="info-state empty-state"
    >
      <p>You have no active or past trips.</p>
      <router-link to="/vehicles" class="button primary"
        >Browse Vehicles</router-link
      >
    </div>
    <div
      v-else-if="filteredBookings.length === 0"
      class="info-state empty-state"
    >
      <p>You have no trips with the status "{{ activeFilter }}".</p>
    </div>

    <!-- Grid layout for booking cards -->
    <div v-else class="bookings-grid">
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="booking-card"
      >
        <div class="card-header">
          <h3 class="vehicle-name">
            {{ booking.vehicleDetails.make }} {{ booking.vehicleDetails.model }}
          </h3>
          <span
            :class="['status-badge', getStatusClass(booking.paymentStatus)]"
          >
            {{ formatStatus(booking.paymentStatus) }}
          </span>
        </div>
        <div class="card-body">
          <div class="detail-row">
            <i class="bi bi-calendar-range"></i>
            <span
              >{{ formatDate(booking.startDate) }} to
              {{ formatDate(booking.endDate) }}</span
            >
          </div>
          <div class="detail-row">
            <i class="bi bi-tag-fill"></i>
            <span
              >₱{{
                booking.totalCost ? booking.totalCost.toLocaleString() : "N/A"
              }}</span
            >
          </div>
        </div>
        <div class="card-footer">
          <span class="booking-id">ID: {{ booking.id }}</span>
          <button @click="viewDetails(booking.id)" class="button secondary">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "MyBookingsView",
  data() {
    return {
      loading: true,
      errorMessage: null,
      bookings: [],
      activeFilter: "all",
      statusFilters: [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    };
  },
  computed: {
    ...mapGetters(["user"]),
    filteredBookings() {
      if (this.activeFilter === "all") {
        return this.bookings;
      }
      if (this.activeFilter === "pending") {
        const pendingStatuses = ["pending_owner_approval", "pending_payment"];
        return this.bookings.filter((b) =>
          pendingStatuses.includes(b.paymentStatus)
        );
      }
      if (this.activeFilter === "cancelled") {
        const cancelledStatuses = ["cancelled", "declined_by_owner"];
        return this.bookings.filter((b) =>
          cancelledStatuses.includes(b.paymentStatus)
        );
      }
      if (this.activeFilter === "completed") {
        const completedStatuses = ["completed", "returned"];
        return this.bookings.filter((b) =>
          completedStatuses.includes(b.paymentStatus)
        );
      }
      return this.bookings.filter((b) => b.paymentStatus === this.activeFilter);
    },
  },
  watch: {
    user(newUser) {
      if (newUser && newUser.uid) {
        this.fetchBookings();
      }
    },
  },
  created() {
    if (this.user && this.user.uid) {
      this.fetchBookings();
    }
  },
  methods: {
    ...mapActions(["fetchBookingsByUser"]),
    async fetchBookings() {
      this.loading = true;
      this.errorMessage = null;
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User is not authenticated.");
        }
        const fetchedBookings = await this.fetchBookingsByUser(this.user.uid);
        this.bookings = fetchedBookings;
      } catch (error) {
        this.errorMessage = "Failed to load your bookings. Please try again.";
        console.error("[MyBookingsView] Error fetching bookings:", error);
      } finally {
        this.loading = false;
      }
    },
    viewDetails(bookingId) {
      this.$router.push({
        name: "BookingDetails",
        params: { bookingId: bookingId },
      });
    },
    formatDate(isoString) {
      if (!isoString) return "N/A";
      return DateTime.fromISO(isoString).toFormat("MMM dd, yyyy");
    },
    formatStatus(status) {
      if (!status) return "Unknown";
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    },
    getStatusClass(status) {
      switch (status) {
        case "confirmed":
        case "completed":
        case "returned":
          return "status-success";
        case "pending_owner_approval":
        case "pending_payment":
          return "status-warning";
        case "cancelled":
        case "declined_by_owner":
          return "status-danger";
        default:
          return "status-default";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.my-bookings-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem; /* Reduced padding for mobile */
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.header-section {
  text-align: center;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
}

.section-title {
  font-size: 1.8rem; /* Smaller on mobile */
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: $text-color-dark;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
}

.section-subtitle {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
  }
}

/* --- Filter Tabs (Scrollable on Mobile) --- */
.booking-filters {
  display: flex;
  justify-content: flex-start; /* Align left for scroll */
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid $border-color;

  /* Scrollable on mobile */
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    height: 0px;
    background: transparent;
  }

  @media (min-width: 600px) {
    justify-content: center; /* Center on larger screens */
    margin-bottom: 2.5rem;
  }
}

.filter-tab {
  padding: 0.6rem 1rem;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: $text-color-medium;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap; /* Prevent wrapping */
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

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
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    gap: 1.5rem;
  }
}

.booking-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  display: flex;
  flex-direction: column;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid $border-color-light;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-medium;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $border-color;
  background-color: #fcfcfc;

  @media (min-width: 768px) {
    padding: 1rem 1.25rem;
  }
}

.vehicle-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: $text-color-dark;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
}

.card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 768px) {
    padding: 1.25rem;
    gap: 0.75rem;
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: $text-color-medium;

  i {
    font-size: 1rem;
    color: $primary-color;
    margin-top: 2px; /* Align icon with text top */
  }
  span {
    font-weight: 500;
    color: $text-color-dark;
  }
}

.card-footer {
  display: flex;
  flex-direction: row; /* Keep row, but allow wrap if needed */
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid $border-color;
  margin-top: auto;
  gap: 0.5rem;

  @media (min-width: 768px) {
    padding: 1rem 1.25rem;
  }
}

.booking-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: $text-color-medium;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: $border-radius-pill;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (min-width: 768px) {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }

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
  padding: 0.5rem 1rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;

  @media (min-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
  }

  &.primary {
    background-color: $primary-color;
    color: white;
    border: 1px solid $primary-color;
    &:hover {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background-color: transparent;
    color: $primary-color;
    border: 1px solid $primary-color;
    &:hover {
      background-color: lighten($primary-color, 40%);
      transform: translateY(-2px);
    }
  }
}

.info-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;

  .button {
    margin-top: 1rem;
  }
  p {
    font-size: 1rem;
    color: $text-color-medium;
  }
}
</style>
