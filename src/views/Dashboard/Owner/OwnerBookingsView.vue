<template>
  <div class="owner-bookings-page">
    <div class="page-container">
      <h1 class="page-title">Bookings For My Vehicles</h1>

      <div v-if="loadingStatus === 'loading'" class="info-state">
        <svg
          class="spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p>Loading bookings...</p>
      </div>

      <div v-else-if="loadingStatus === 'error'" class="info-state error-state">
        <p>Failed to load bookings: {{ error }}</p>
        <p>Please try again later.</p>
      </div>

      <div v-else-if="bookings.length === 0" class="info-state">
        <p>You currently have no bookings for your vehicles.</p>
      </div>

      <div v-else class="bookings-list">
        <div
          v-for="group in groupedBookings"
          :key="group.monthLabel"
          class="month-group"
        >
          <h2 class="month-header">
            <span class="month-text">{{ group.monthLabel }}</span>
            <span class="booking-count"
              >{{ group.items.length }}
              {{ group.items.length === 1 ? "Booking" : "Bookings" }}</span
            >
          </h2>

          <div class="table-wrapper">
            <table class="bookings-table">
              <thead class="table-header">
                <tr>
                  <th
                    scope="col"
                    class="table-header-cell rounded-tl"
                    style="width: 50px"
                  >
                    No.
                  </th>
                  <th scope="col" class="table-header-cell">Vehicle</th>
                  <th scope="col" class="table-header-cell">Dates</th>
                  <th scope="col" class="table-header-cell">Status</th>
                  <th scope="col" class="table-header-cell">Total Price</th>
                  <th scope="col" class="table-header-cell rounded-tr">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr
                  v-for="(booking, index) in group.items"
                  :key="booking.id"
                  class="table-row"
                >
                  <td class="table-data font-bold text-gray-500">
                    {{ index + 1 }}
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
                    <span :class="getStatusBadgeClass(booking.paymentStatus)">
                      {{ formatStatus(booking.paymentStatus) }}
                    </span>
                  </td>
                  <td class="table-data">
                    {{ formatPrice(booking.totalCost) }}
                  </td>
                  <td class="table-data action-cell">
                    <button
                      @click="viewBookingDetails(booking.id)"
                      class="action-button view-details-button"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
                <tr class="monthly-footer">
                  <td colspan="4" class="text-right label">
                    Total for {{ group.monthLabel }}:
                  </td>
                  <td class="total-amount">
                    {{ formatPrice(group.totalRevenue) }}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "OwnerBookings",
  computed: {
    ...mapState("owner", {
      bookings: (state) => state.ownerBookings,
      loadingStatus: (state) => state.ownerBookingsStatus,
      error: (state) => state.ownerBookingsError,
    }),

    groupedBookings() {
      if (!this.bookings || this.bookings.length === 0) return [];

      const sortedBookings = [...this.bookings].sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });

      const groups = {};

      sortedBookings.forEach((booking) => {
        const dt = DateTime.fromISO(booking.startDate);
        const monthKey = dt.toFormat("MMMM yyyy");

        if (!groups[monthKey]) {
          groups[monthKey] = {
            monthLabel: monthKey,
            items: [],
            totalRevenue: 0,
          };
        }

        groups[monthKey].items.push(booking);

        if (
          booking.totalCost &&
          !["cancelled", "refunded", "cancelled_no_downpayment"].includes(
            booking.paymentStatus
          )
        ) {
          groups[monthKey].totalRevenue += booking.totalCost;
        }
      });

      const uniqueKeys = [
        ...new Set(
          sortedBookings.map((b) =>
            DateTime.fromISO(b.startDate).toFormat("MMMM yyyy")
          )
        ),
      ];

      return uniqueKeys.map((key) => groups[key]);
    },
  },
  async created() {
    await this.fetchOwnerBookings();
  },
  methods: {
    ...mapActions("owner", ["fetchOwnerBookings"]),

    viewBookingDetails(bookingId) {
      this.$router.push({
        name: "BookingDetails",
        params: { bookingId: bookingId },
      });
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = DateTime.fromISO(dateString);
      return date.toLocaleString(DateTime.DATE_SHORT);
    },
    formatPrice(price) {
      return price ? `₱${price.toFixed(2)}` : "₱0.00";
    },
    formatStatus(status) {
      if (!status) return "N/A";
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case "downpayment_received":
        case "full_payment_received":
        case "confirmed":
          return "status-badge status-confirmed";
        case "pending_cash_downpayment":
        case "awaiting_qr_downpayment":
        case "qr_downpayment_confirmed_by_user":
        case "pending_owner_approval":
          return "status-badge status-pending";
        case "cancelled":
        case "cancelled_no_downpayment":
        case "cancelled_by_user_after_grace_period":
        case "cancelled_within_grace_period":
        case "declined":
          return "status-badge status-cancelled";
        case "refunded":
          return "status-badge status-refunded";
        default:
          return "status-badge status-default";
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

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.page-container {
  max-width: 64rem;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.month-group {
  .month-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;

    .month-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #374151;
    }

    .booking-count {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }
  }
}

.info-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #6b7280;

  &.error-state {
    color: #ef4444;
  }

  p {
    margin-top: 1rem;
  }
}

.spinner {
  animation: spin 1s linear infinite;
  height: 2rem;
  width: 2rem;
  color: #3b82f6;
  margin: 0 auto;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.bookings-table {
  min-width: 100%;
  border-collapse: collapse;

  .table-header {
    background-color: #f3f4f6;
    color: #374151;

    .table-header-cell {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  .table-body {
    background-color: #ffffff;

    .table-row {
      border-top: 1px solid #e5e7eb;

      &:hover {
        background-color: #f9fafb;
        transition: background-color 150ms ease-in-out;
      }
    }

    .table-data {
      padding: 1rem 1rem;
      white-space: nowrap;
      font-size: 0.875rem;
      color: #1f2937;

      &.action-cell {
        font-weight: 500;
      }
    }

    /* Monthly Footer Styles */
    .monthly-footer {
      background-color: #f9fafb;
      border-top: 2px solid #e5e7eb;
      font-weight: 700;
      color: #1f2937;

      td {
        padding: 1rem;
        white-space: nowrap;
      }

      .text-right {
        text-align: right;
      }

      .total-amount {
        color: #059669; // Green color for revenue
        font-size: 1rem;
      }
    }
  }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
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
  &.status-refunded {
    background-color: #e0f2fe;
    color: #0284c7;
  }
  &.status-default {
    background-color: #f3f4f6;
    color: #374151;
  }
}

.action-button {
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 150ms ease-in-out;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: darken(#2563eb, 10%);
  }
}
</style>
