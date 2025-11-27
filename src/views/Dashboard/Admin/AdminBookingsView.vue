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
      <div class="back-button-wrapper" v-if="activeFilter === 'platform_fees'">
        <button
          class="button secondary-btn back-btn"
          @click="
            activeFilter = 'all';
            feeStatusFilter = 'all';
          "
          title="Back to All Booking Records"
        >
          <i class="bi bi-arrow-left"></i> Back to Bookings
        </button>
      </div>

      <div
        class="reminder-wrapper"
        v-if="
          activeFilter === 'platform_fees' &&
          calculatedUnpaidPlatformFees.length > 0
        "
      >
        <button
          @click="handleBulkReminders"
          class="button primary-btn"
          :class="{ 'urgent-pulse': isNearEndOfMonth() }"
          :title="
            isNearEndOfMonth()
              ? 'Urgent: Send end of month reminders'
              : 'Send payment reminders'
          "
        >
          <i class="bi bi-megaphone"></i>
          <span class="btn-text">
            {{
              isNearEndOfMonth()
                ? "Send End-of-Month Reminders"
                : "Send Reminders"
            }}
          </span>
        </button>
      </div>

      <div class="tabs-wrapper">
        <template v-if="activeFilter !== 'platform_fees'">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </template>

        <template v-else>
          <button
            class="filter-tab"
            :class="{ active: feeStatusFilter === 'all' }"
            @click="feeStatusFilter = 'all'"
          >
            All Fees
          </button>
          <button
            class="filter-tab status-warning"
            :class="{ active: feeStatusFilter === 'pending' }"
            @click="feeStatusFilter = 'pending'"
          >
            Unpaid (Pending)
          </button>
          <button
            class="filter-tab status-success"
            :class="{ active: feeStatusFilter === 'verified' }"
            @click="feeStatusFilter = 'verified'"
          >
            Paid (Verified)
          </button>
        </template>

        <div class="divider"></div>

        <button
          class="filter-tab fee-tab"
          :class="{ active: activeFilter === 'platform_fees' }"
          @click="
            activeFilter = 'platform_fees';
            feeStatusFilter = 'all';
          "
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

      <div v-else-if="paginatedList.length === 0" class="state-container empty">
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
              <span class="period">
                <strong>{{ fee.month }} {{ fee.year }}</strong>
              </span>
              <span
                :class="[
                  'status-badge',
                  fee.status === 'verified'
                    ? 'status-success'
                    : fee.status === 'calculated'
                      ? 'status-danger'
                      : 'status-warning',
                ]"
              >
                {{
                  fee.status === "verified"
                    ? "Verified"
                    : fee.status === "calculated"
                      ? "Unpaid"
                      : "Pending"
                }}
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
                fee.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
              }}
            </div>

            <div class="col status-cell desktop-only">
              <span
                :class="[
                  'status-badge',
                  fee.status === 'verified'
                    ? 'status-success'
                    : fee.status === 'calculated'
                      ? 'status-danger'
                      : 'status-warning',
                ]"
              >
                {{
                  fee.status === "verified"
                    ? "Verified"
                    : fee.status === "calculated"
                      ? "Unpaid (Calculated)"
                      : "Pending Review"
                }}
              </span>
            </div>

            <div class="col actions-cell">
              <div
                v-if="fee.status !== 'verified'"
                class="action-buttons-group"
              >
                <button
                  @click="handleNotifyOwner(fee)"
                  class="button secondary-btn small-btn"
                  title="Send Payment Reminder / Request"
                >
                  <i class="bi bi-bell"></i>
                </button>

                <button
                  v-if="fee.status === 'pending'"
                  @click="verifyFeePayment(fee.id)"
                  class="button primary-btn small-btn"
                >
                  Verify
                </button>

                <button
                  v-else-if="fee.status === 'calculated'"
                  @click="filterByFeeSource(fee)"
                  class="button primary-btn small-btn"
                  title="Filter booking list to see this owner's transactions"
                >
                  Review
                </button>
              </div>

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
              <span class="id-text">#{{ booking.id.substring(0, 8) }}</span>
              <span
                :class="['status-badge', getStatusClass(booking.paymentStatus)]"
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
                booking.totalCost ? booking.totalCost.toLocaleString() : "0"
              }}
            </div>

            <div class="col status-cell desktop-only">
              <span
                :class="['status-badge', getStatusClass(booking.paymentStatus)]"
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
import { mapGetters, mapActions } from "vuex";
import { DateTime } from "luxon";
import AdminBookingDetailsModal from "@/components/admin/AdminBookingDetailsModal.vue";

export default {
  name: "AdminBookingsView",
  components: {
    AdminBookingDetailsModal,
  },
  data() {
    return {
      loading: true,
      error: null,
      isModalOpen: false,
      selectedBooking: null,
      activeFilter: "all",
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,

      // Fee Filter State
      feeStatusFilter: "all",
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
    ...mapGetters([
      "allBookings",
      "allUsers",
      "allPlatformFees",
      "calculatedUnpaidPlatformFees",
    ]),

    processedBookings() {
      // Logic for resolving renter names
      return this.allBookings.map((booking) => {
        let resolvedRenterName = "Unknown Renter";
        let resolvedRenterEmail = booking.renterEmail || "No Email";

        if (this.allUsers && this.allUsers.length > 0) {
          const targetId = booking.renterId || booking.userId;
          const renter = this.allUsers.find(
            (u) =>
              (targetId && (u.uid === targetId || u.id === targetId)) ||
              (booking.renterEmail && u.email === booking.renterEmail)
          );
          if (renter) {
            resolvedRenterName = renter.name || renter.fullName || "No Name";
            resolvedRenterEmail = renter.email || booking.renterEmail;
          }
        }

        // Fallback logic
        if (
          (resolvedRenterName === "Unknown Renter" ||
            resolvedRenterName === "No Name") &&
          booking.renterEmail
        ) {
          resolvedRenterName = booking.renterEmail.split("@")[0];
        } else if (
          resolvedRenterName === "Unknown Renter" &&
          booking.renterDetails?.name
        ) {
          resolvedRenterName = booking.renterDetails.name;
        }

        return { ...booking, resolvedRenterName, resolvedRenterEmail };
      });
    },

    filteredList() {
      const lowerQuery = this.searchQuery.toLowerCase();

      // CASE A: PLATFORM FEES TAB
      if (this.activeFilter === "platform_fees") {
        // MERGE: Combine explicit reported fees (allPlatformFees) with calculated fees
        let feesResult = [
          ...this.allPlatformFees,
          ...this.calculatedUnpaidPlatformFees, // Get calculated list
        ];

        // 1. Apply Fee Status Filter
        if (this.feeStatusFilter !== "all") {
          // If filtering for 'pending', include both 'pending' (reported) and 'calculated' (unpaid) fees
          const targetStatuses =
            this.feeStatusFilter === "pending"
              ? ["pending", "calculated"]
              : [this.feeStatusFilter];

          feesResult = feesResult.filter((fee) =>
            targetStatuses.includes(fee.status)
          );
        }

        // 2. Apply Search Query Filter
        if (this.searchQuery) {
          feesResult = feesResult.filter(
            (fee) =>
              (fee.hostName || "").toLowerCase().includes(lowerQuery) ||
              (fee.referenceNumber || "").toLowerCase().includes(lowerQuery)
          );
        }

        // Sort by status (calculated/unpaid first), then by date (descending)
        return feesResult.sort((a, b) => {
          const statusOrder = { calculated: 0, pending: 1, verified: 2 };
          const statusComparison =
            statusOrder[a.status] - statusOrder[b.status];
          if (statusComparison !== 0) return statusComparison;

          const dateA =
            a.year * 100 + DateTime.fromFormat(a.month, "MMMM").month;
          const dateB =
            b.year * 100 + DateTime.fromFormat(b.month, "MMMM").month;
          return dateB - dateA; // Sort descending by date
        });
      }

      // CASE B: STANDARD BOOKINGS
      let result = this.processedBookings;

      if (this.activeFilter !== "all") {
        if (this.activeFilter === "pending") {
          const pendingStatuses = [
            "pending_owner_approval",
            "pending_payment",
            "downpayment_pending_verification",
          ];
          result = result.filter((b) =>
            pendingStatuses.includes(b.paymentStatus)
          );
        } else if (this.activeFilter === "cancelled") {
          const cancelledStatuses = [
            "cancelled",
            "declined_by_owner",
            "cancelled_by_renter",
          ];
          result = result.filter((b) =>
            cancelledStatuses.includes(b.paymentStatus)
          );
        } else if (this.activeFilter === "completed") {
          const completedStatuses = ["completed", "returned"];
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
    activeFilter(newValue) {
      this.currentPage = 1;
      // Reset fee sub-filter if we switch to a booking tab
      if (newValue !== "platform_fees") {
        this.feeStatusFilter = "all";
      }
    },
    searchQuery() {
      this.currentPage = 1;
    },
    // Reset pagination when fee sub-filter changes
    feeStatusFilter() {
      this.currentPage = 1;
    },
  },
  methods: {
    ...mapActions([
      "fetchAllBookings",
      "fetchAllUsers",
      "fetchAllPlatformFees",
      "verifyPlatformFee",
      "sendNotification",
      "sendBulkFeeReminders", // <--- Ensure this is here
    ]),

    // --- FIX FOR YOUR ERROR: isNearEndOfMonth ---
    isNearEndOfMonth() {
      const now = DateTime.now();
      const endOfMonth = now.endOf("month");
      // Calculate difference in days between Now and End of Month
      const daysLeft = endOfMonth.diff(now, "days").days;

      // Return true if 5 days or less left (and not already past)
      return daysLeft <= 5 && daysLeft >= -1;
    },

    async handleBulkReminders() {
      // 1. Confirmation
      if (
        !confirm(
          "Are you sure you want to send payment reminders to ALL owners with unpaid fees?"
        )
      )
        return;

      this.loading = true;
      try {
        // 2. Call the store action
        const count = await this.sendBulkFeeReminders();

        // 3. Success Message
        if (count > 0) {
          alert(`Success! Reminders sent to ${count} owners.`);
        } else {
          alert("No unpaid owners found to notify.");
        }
      } catch (e) {
        console.error(e);
        alert("Failed to send reminders. Check console for details.");
      } finally {
        this.loading = false;
      }
    },

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
        this.error =
          "An error occurred while fetching data. Check backend logs.";
      } finally {
        this.loading = false;
      }
    },

    async verifyFeePayment(id) {
      if (!confirm("Verify this payment has been received?")) return;

      try {
        // Prevent verifying calculated fees
        if (id.startsWith("CALC_")) {
          alert(
            "Cannot verify a calculated fee. Please wait for the host to report payment."
          );
          return;
        }
        await this.verifyPlatformFee(id);
        alert("Payment verified successfully.");
      } catch (e) {
        alert("Failed to verify payment.");
      }
    },

    // Used for the "Review" button logic
    filterByFeeSource(fee) {
      this.searchQuery = fee.hostName;
      this.activeFilter = "all";
      this.feeStatusFilter = "all";
      this.currentPage = 1;
    },

    async handleNotifyOwner(fee) {
      if (fee.status === "calculated") {
        // Action for calculated/unpaid fee (URGENT Payment Request)
        if (
          !confirm(
            `This is a calculated unpaid fee for ${fee.month} ${fee.year}. Send payment request to ${fee.hostName}?`
          )
        )
          return;

        try {
          const notificationPayload = {
            userId: fee.ownerId,
            message: `URGENT: Platform fee of ₱${fee.amount.toFixed(2).toLocaleString()} is due for completed bookings in ${fee.month} ${fee.year}. Please submit payment immediately.`,
            link: "/dashboard/owner/billing",
            type: "payment_request",
          };

          await this.sendNotification(notificationPayload);
          alert(`URGENT Payment Request sent to ${fee.hostName}.`);
        } catch (error) {
          console.error(error);
          alert("Failed to send payment request.");
        }
      } else {
        // Original notification logic for pending (reported) fees (Reminder)
        if (!confirm(`Send payment reminder to ${fee.hostName}?`)) return;

        try {
          const notificationPayload = {
            userId: fee.ownerId,
            message: `Reminder: Please verify your platform fee payment of ₱${fee.amount} for ${fee.month} ${fee.year}.`,
            link: "/dashboard/owner/billing",
          };

          await this.sendNotification(notificationPayload);
          alert(`Notification sent to ${fee.hostName}.`);
        } catch (error) {
          console.error(error);
          alert("Failed to send notification.");
        }
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      if (typeof dateString === "object" && dateString.seconds) {
        return DateTime.fromSeconds(dateString.seconds).toFormat(
          "MMM dd, yyyy"
        );
      }
      return DateTime.fromISO(dateString).toFormat("MMM dd, yyyy");
    },
    formatStatus(status) {
      if (!status) return "Unknown";
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getInitials(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },
    getStatusClass(status) {
      switch (status) {
        case "confirmed":
        case "completed":
        case "returned":
        case "paid":
        case "downpayment_verified":
          return "status-success";
        case "pending_owner_approval":
        case "pending_payment":
        case "downpayment_pending_verification":
          return "status-warning";
        case "cancelled":
        case "declined_by_owner":
        case "cancelled_by_renter":
          return "status-danger";
        default:
          return "status-default";
      }
    },

    // View Booking: Enriched with profile data for the Modal
    viewBooking(booking) {
      // Find profiles
      const renter = this.allUsers.find(
        (u) =>
          u.uid === booking.renterId ||
          u.id === booking.renterId ||
          u.uid === booking.userId
      );
      const owner = this.allUsers.find(
        (u) => u.uid === booking.ownerId || u.id === booking.ownerId
      );

      this.selectedBooking = {
        ...booking,
        renterProfile: renter || {},
        ownerProfile: owner || {},
        resolvedRenterName: booking.resolvedRenterName,
      };

      this.isModalOpen = true;
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

/* --- Variables --- */
$bg-color: #f8f9fa;
$text-main: #1f2937;
$text-light: #6b7280;
$border-color: #e5e7eb;
$card-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
$primary-color: #10b981; /* Fallback if variable missing */

/* --- Main Container --- */
.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: $text-main;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

/* --- Header --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content {
    .section-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;

      @media (min-width: 768px) {
        font-size: 2rem;
      }
    }
    .section-subtitle {
      color: $text-light;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }
  }

  .header-stats {
    @media (max-width: 768px) {
      width: 100%;
      display: flex;
      justify-content: flex-start;
    }

    .stat-item {
      background: white;
      padding: 0.5rem 1.5rem;
      border-radius: 12px;
      box-shadow: $card-shadow;
      text-align: center;
      min-width: 100px;

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
        font-weight: 600;
      }
    }
  }
}

/* --- Control Bar --- */
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

.back-button-wrapper {
  min-width: fit-content;

  @media (max-width: 992px) {
    width: 100%;
  }

  .back-btn {
    background: white;
    border: 1px solid $border-color;
    color: $text-main;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%; /* Full width on mobile when wrapped */
    display: flex;
    justify-content: center;
    align-items: center;

    @media (min-width: 992px) {
      width: auto;
    }

    i {
      margin-right: 0.5rem;
    }
    &:hover {
      background: #f3f4f6;
    }
  }
}

.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
  background: $bg-color;
  padding: 0.25rem;
  border-radius: 12px;

  /* Horizontal Scroll for Mobile */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  flex-grow: 1;
  max-width: 100%; /* Ensure it doesn't overflow parent */

  .filter-tab {
    border: none;
    background: none;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: $text-light;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0; /* Prevent tabs from squishing */

    @media (min-width: 768px) {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }

    &:hover {
      color: $text-main;
    }
    &.active {
      background: white;
      color: $primary-color;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Fee sub-filter styles */
    &.status-warning {
      color: #92400e;
      &.active {
        background: #fef3c7;
        box-shadow: none;
      }
    }
    &.status-success {
      color: #065f46;
      &.active {
        background: #d1fae5;
        box-shadow: none;
      }
    }
    &.status-danger {
      color: #991b1b;
      &.active {
        background: #fee2e2;
        box-shadow: none;
      }
    }
  }

  .divider {
    width: 1px;
    background: #d1d5db;
    margin: 0 0.25rem;
    flex-shrink: 0;
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
  width: 100%;

  @media (min-width: 993px) {
    flex-grow: 1;
    max-width: 300px;
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
    font-size: 0.95rem;

    &:focus {
      border-color: $primary-color;
    }
  }
}

/* --- List Container --- */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Header Row (Desktop) */
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
  align-items: center;
  gap: 1rem;

  @media (max-width: 991px) {
    display: none;
  }

  /* Define Min/Max widths for better scaling */
  &.booking-grid {
    grid-template-columns:
      minmax(60px, 0.5fr) minmax(180px, 1.5fr) minmax(120px, 1.2fr)
      minmax(150px, 1.5fr) 1fr 1fr 0.5fr;
  }
  &.fee-grid {
    grid-template-columns:
      minmax(100px, 1fr) minmax(200px, 2fr) minmax(120px, 1.5fr)
      1fr 1fr 0.5fr;
  }
  .col.right {
    text-align: right;
  }
}

/* List Items (Rows/Cards) */
.list-item {
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;
  padding: 1rem 1.5rem;
  display: grid; /* Default to grid */
  align-items: center;
  transition: transform 0.2s;
  gap: 1rem;

  &:hover {
    transform: translateY(-2px);
  }

  /* --- DESKTOP VIEW --- */
  @media (min-width: 992px) {
    &.booking-grid {
      grid-template-columns:
        minmax(60px, 0.5fr) minmax(180px, 1.5fr) minmax(120px, 1.2fr)
        minmax(150px, 1.5fr) 1fr 1fr 0.5fr;
    }
    &.fee-grid {
      grid-template-columns:
        minmax(100px, 1fr) minmax(200px, 2fr) minmax(120px, 1.5fr)
        1fr 1fr 0.5fr;
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
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .actions-cell {
      justify-content: flex-end;
    }
  }

  /* --- MOBILE/TABLET VIEW (Card Stack) --- */
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
      margin-bottom: 0.25rem;

      .id-text {
        font-family: "Roboto Mono", monospace;
        color: $primary-color;
        font-weight: 700;
        font-size: 1rem;
      }
      .period {
        font-weight: 700;
        font-size: 1rem;
      }
    }

    .col {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center; /* Changed from flex-start to align nice vertically */
      gap: 1rem;

      /* Allow text wrapping on mobile */
      .email,
      .vehicle-name,
      .name {
        white-space: normal;
        text-align: right;
        word-break: break-word;
        max-width: 60%;
      }
    }

    .label-mobile {
      font-size: 0.75rem;
      color: $text-light;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      flex-shrink: 0; /* Prevent label from shrinking */
    }

    .actions-cell {
      margin-top: 0.5rem;
      border-top: 1px solid $border-color;
      padding-top: 1rem;
      justify-content: flex-end;
      width: 100%;
    }

    /* Specific Mobile adjustments for User Info */
    .user-cell {
      align-items: flex-start;
      .user-info {
        width: 100%;
        justify-content: space-between;

        .user-text {
          align-items: flex-end;
          text-align: right;
        }
      }
    }
  }
}

/* --- Component Utilities --- */
.id-cell {
  font-family: "Roboto Mono", monospace;
  color: $primary-color;
  font-weight: 600;
  font-size: 0.85rem;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;

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
    flex-shrink: 0;

    &.host {
      background-color: #7c3aed;
    }
  }

  .user-text {
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent spill */

    .name {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .email {
      font-size: 0.8rem;
      color: $text-light;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: $text-light;
  flex-wrap: wrap; /* Allow dates to stack on very small screens */
}

.price-cell {
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
}
.text-success {
  color: #10b981;
}
.font-mono {
  font-family: "Roboto Mono", monospace;
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

/* --- Buttons --- */
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #e0f2fe;
    color: #0284c7;
  }
}

.action-buttons-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.primary-btn {
  background: $primary-color;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: darken(#10b981, 5%);
  }

  &.small-btn {
    font-size: 0.8rem;
  }
}

.secondary-btn {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
  &.small-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* --- Pagination --- */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap; /* Stack on mobile if needed */

  .page-btn {
    background: white;
    border: 1px solid $border-color;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .page-info {
    font-size: 0.9rem;
    color: $text-light;
  }
}

/* --- States --- */
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

// Animation for End of Month Urgency
.urgent-pulse {
  background-color: #ef4444 !important; /* Red */
  border-color: #ef4444 !important;
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
