<template>
  <div class="booking-box-card">
    <div class="price-header">
      <span class="price-amount"
        >₱{{
          vehicle.rentalPricePerDay
            ? vehicle.rentalPricePerDay.toLocaleString()
            : "N/A"
        }}</span
      >
      <span class="price-period">per day</span>
    </div>

    <div class="date-picker-section">
      <div class="datetime-input-group">
        <label for="start-date">PICKUP</label>
        <div class="inputs-row">
          <input
            type="date"
            id="start-date"
            v-model="startDate"
            :min="today"
            :disabled="isBookingDisabled"
          />
          <input
            type="time"
            id="start-time"
            v-model="startTime"
            :disabled="isBookingDisabled"
          />
        </div>
      </div>
      <div class="datetime-input-group">
        <label for="end-date">RETURN</label>
        <div class="inputs-row">
          <input
            type="date"
            id="end-date"
            v-model="endDate"
            :min="minEndDate"
            :disabled="isBookingDisabled"
          />
          <input type="time" id="end-time" :value="startTime" readonly />
        </div>
      </div>
    </div>

    <div v-if="isRenterSuspended" class="availability-message suspended">
      <i class="bi bi-person-x-fill"></i>
      <span>Your account is suspended. You cannot book vehicles.</span>
    </div>

    <div
      v-else-if="availabilityStatus === 'owner_suspended'"
      class="availability-message suspended"
    >
      <i class="bi bi-slash-circle-fill"></i>
      <span>This vehicle is temporarily unavailable for booking.</span>
    </div>

    <div
      v-else-if="!isDriverVerified && userRole === 'renter'"
      class="availability-message warning"
    >
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>Driver verification required to book.</span>
    </div>

    <div v-if="totalCost > 0 && canDisplayPrice" class="price-calculation">
      <div class="price-row">
        <span>{{ rentalDurationDescription }}</span>
        <span>₱{{ totalCost.toLocaleString() }}</span>
      </div>
      <hr class="price-divider" />
      <div class="price-row total">
        <span>Total Price</span>
        <span>₱{{ totalCost.toLocaleString() }}</span>
      </div>
    </div>

    <div
      v-if="shouldShowAvailabilityMessage"
      class="availability-message"
      :class="availabilityStatus"
    >
      <i class="bi" :class="availabilityIcon"></i>
      <span>{{ availabilityMessage }}</span>
    </div>

    <button
      @click="handleContinueClick"
      class="continue-button"
      :disabled="isBookingDisabled || !canProceed"
      :class="{
        'verification-button':
          !isDriverVerified && userRole === 'renter' && !isBookingDisabled,
        'suspended-button': isBookingDisabled,
      }"
      :title="isBookingDisabled ? 'Booking Disabled' : ''"
    >
      <span v-if="isRenterSuspended">Account Suspended</span>
      <span v-else-if="availabilityStatus === 'owner_suspended'"
        >Vehicle Unavailable</span
      >
      <span v-else-if="isLoadingAvailability">Checking...</span>
      <span v-else-if="!isDriverVerified && userRole === 'renter'"
        >Get Verified to Drive</span
      >
      <span v-else>Continue</span>
    </button>

    <DownpaymentConfirmationModal
      :is-open="isConfirmationModalOpen"
      @close="isConfirmationModalOpen = false"
      @confirm="proceedWithBooking"
    />
  </div>
</template>

<script>
import DownpaymentConfirmationModal from "@/components/modals/DownpaymentConfirmationModal.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { DateTime, Interval } from "luxon";

export default {
  name: "BookingBox",
  components: {
    DownpaymentConfirmationModal,
  },
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
    unavailableDates: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isConfirmationModalOpen: false,
      startDate: null,
      startTime: "09:00",
      endDate: null,
      totalCost: 0,
      rentalDurationDescription: "",
      isLoadingAvailability: false,
      availabilityMessage: "",
      availabilityStatus: "",
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.user,
    }),
    ...mapGetters(["userRole"]),

    isRenterSuspended() {
      return this.currentUser?.isSuspended === true;
    },

    isBookingDisabled() {
      return (
        this.isRenterSuspended || this.availabilityStatus === "owner_suspended"
      );
    },

    isDriverVerified() {
      return !!this.currentUser && this.currentUser.isApprovedToDrive === true;
    },

    today() {
      return DateTime.now().toISODate();
    },

    minEndDate() {
      const today = this.today;
      if (!this.startDate) return today;
      const start = DateTime.fromISO(this.startDate);
      const nextDay = start.plus({ days: 1 }).toISODate();
      return nextDay > today ? nextDay : today;
    },

    pickupDateTimeISO() {
      if (this.startDate && this.startTime) {
        try {
          const dt = DateTime.fromISO(`${this.startDate}T${this.startTime}`, {
            zone: "local",
          });
          // FIX: Ensure we send a standard ISO string that backend (Luxon/Date) can definitely parse
          return dt.isValid ? dt.toISO() : null;
        } catch (e) {
          console.error("Error creating pickupDateTimeISO:", e);
          return null;
        }
      }
      return null;
    },

    returnDateTimeISO() {
      if (this.endDate && this.startTime) {
        try {
          // Note: Using start time for end date to keep 24h cycles (standard rental logic)
          const dt = DateTime.fromISO(`${this.endDate}T${this.startTime}`, {
            zone: "local",
          });
          return dt.isValid ? dt.toISO() : null;
        } catch (e) {
          console.error("Error creating returnDateTimeISO:", e);
          return null;
        }
      }
      return null;
    },

    canProceed() {
      if (this.isBookingDisabled) return false;

      if (!this.isDriverVerified && this.userRole === "renter") {
        return !!(this.pickupDateTimeISO && this.returnDateTimeISO);
      }
      return (
        this.availabilityStatus === "available" && !this.isLoadingAvailability
      );
    },

    canDisplayPrice() {
      return !this.isBookingDisabled && this.isDriverVerified;
    },

    shouldShowAvailabilityMessage() {
      return (
        !this.isBookingDisabled &&
        this.availabilityMessage &&
        (this.isDriverVerified || this.userRole !== "renter")
      );
    },

    availabilityIcon() {
      if (this.availabilityStatus === "available")
        return "bi-check-circle-fill";
      if (this.availabilityStatus === "unavailable") return "bi-x-circle-fill";
      if (this.availabilityStatus === "verification_needed")
        return "bi-exclamation-triangle-fill";
      return "bi-hourglass-split";
    },
  },
  watch: {
    currentUser: "checkAvailabilityAndCalculateCost",
    startDate(newStartDate) {
      if (this.endDate && newStartDate >= this.endDate) {
        this.endDate = null;
      }
      this.checkAvailabilityAndCalculateCost();
    },
    startTime() {
      this.checkAvailabilityAndCalculateCost();
    },
    endDate() {
      this.checkAvailabilityAndCalculateCost();
    },
    unavailableDates() {
      this.checkAvailabilityAndCalculateCost();
    },
  },
  methods: {
    ...mapActions(["createBooking", "checkVehicleAvailability"]),

    calculateRentalDurationDescription(startISO, endISO) {
      if (!startISO || !endISO) return "";
      const start = DateTime.fromISO(startISO);
      const end = DateTime.fromISO(endISO);
      if (!start.isValid || !end.isValid || start >= end) return "";

      const diff = end.diff(start, ["days", "hours"]);
      const totalDays = diff.as("days");
      const calculatedDays = Math.round(totalDays);

      if (calculatedDays <= 0) return "";
      return `Rental Period: ${calculatedDays} day${calculatedDays > 1 ? "s" : ""}`;
    },

    async checkAvailabilityAndCalculateCost() {
      // 1. SAFETY CHECK: Ensure Vehicle ID exists (Prevents 400 Error)
      if (!this.vehicle || !this.vehicle.id) {
        // console.warn("Vehicle ID not loaded yet, skipping check.");
        return;
      }

      // 2. Stop if Renter is suspended
      if (this.isRenterSuspended) {
        this.resetCost();
        return;
      }

      // 3. Stop if dates are missing
      if (!this.pickupDateTimeISO || !this.returnDateTimeISO) {
        this.resetCost();
        this.availabilityStatus = "";
        if (this.availabilityStatus !== "owner_suspended")
          this.availabilityMessage = "";
        return;
      }

      if (!this.isDriverVerified && this.userRole === "renter") {
        this.availabilityMessage = "Driver verification required.";
        this.availabilityStatus = "verification_needed";
        this.totalCost = 0;
        this.rentalDurationDescription = "";
        return;
      }

      // 4. Date Validity Check
      let start, end;
      try {
        start = DateTime.fromISO(this.pickupDateTimeISO);
        end = DateTime.fromISO(this.returnDateTimeISO);
        if (!start.isValid || !end.isValid) throw new Error("Invalid Date");
      } catch (e) {
        this.setUnavailable("Invalid date/time selected.");
        return;
      }

      if (start >= end) {
        this.setUnavailable("Return date must be after pickup.");
        return;
      }

      // 5. Client-side Overlap Check (with 3-Hour Buffer)
      const renterInterval = Interval.fromDateTimes(start, end);

      for (const blockedPeriod of this.unavailableDates) {
        if (!blockedPeriod.start || !blockedPeriod.end) continue;
        try {
          const blockedStart = DateTime.fromISO(blockedPeriod.start);
          let blockedEnd = DateTime.fromISO(blockedPeriod.end);

          if (!blockedStart.isValid || !blockedEnd.isValid) continue;

          // Add 3 Hours Grace Period Buffer
          if (blockedPeriod.status !== "returned") {
            blockedEnd = blockedEnd.plus({ hours: 3 });
          }

          const blockedInterval = Interval.fromDateTimes(
            blockedStart,
            blockedEnd
          );

          if (renterInterval.overlaps(blockedInterval)) {
            this.setUnavailable(
              "Selected dates overlap with an existing booking (including 3-hour buffer)."
            );
            return;
          }
        } catch (e) {
          continue;
        }
      }

      // 6. Backend API Check
      this.isLoadingAvailability = true;
      this.availabilityMessage = "Checking...";
      this.availabilityStatus = "checking";
      this.rentalDurationDescription = this.calculateRentalDurationDescription(
        this.pickupDateTimeISO,
        this.returnDateTimeISO
      );

      try {
        const payload = {
          vehicleId: this.vehicle.id,
          startDate: this.pickupDateTimeISO,
          endDate: this.returnDateTimeISO,
        };

        const response = await this.checkVehicleAvailability(payload);

        if (response.isAvailable) {
          this.availabilityMessage = response.message;
          this.availabilityStatus = "available";
          this.totalCost = response.totalCost;
        } else {
          this.setUnavailable(response.message);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          const msg = error.response.data?.message || "Booking unavailable.";
          this.availabilityMessage = msg;

          if (msg.includes("Owner") || msg.includes("unavailable")) {
            this.availabilityStatus = "owner_suspended";
          } else {
            this.availabilityStatus = "suspended";
          }
        } else {
          console.error("[BookingBox] Availability check error:", error);
          this.setUnavailable("Could not check schedule.");
        }
        this.totalCost = 0;
      } finally {
        this.isLoadingAvailability = false;
      }
    },

    resetCost() {
      this.totalCost = 0;
      this.rentalDurationDescription = "";
    },

    setUnavailable(msg) {
      this.availabilityMessage = msg;
      this.availabilityStatus = "unavailable";
      this.totalCost = 0;
      this.rentalDurationDescription = "";
    },

    handleContinueClick() {
      if (this.isBookingDisabled) return;

      if (!this.isDriverVerified && this.userRole === "renter") {
        this.$router.push({ name: "BecomeDriveVerified" });
        return;
      }
      if (
        this.availabilityStatus === "available" &&
        !this.isLoadingAvailability
      ) {
        this.isConfirmationModalOpen = true;
      }
    },

    async proceedWithBooking() {
      this.isConfirmationModalOpen = false;

      if (this.isBookingDisabled) {
        alert("Booking is currently disabled.");
        return;
      }

      try {
        const bookingData = {
          vehicleId: this.vehicle.id,
          startDate: this.pickupDateTimeISO,
          endDate: this.returnDateTimeISO,
          totalCost: this.totalCost,
        };

        const newBooking = await this.createBooking(bookingData);
        this.$router.push({
          name: "BookingSummary",
          params: { bookingId: newBooking.id },
        });
      } catch (error) {
        console.error("Failed to create booking:", error);
        if (error.response && error.response.status === 403) {
          alert("Action Blocked: Account suspended or vehicle unavailable.");
        } else {
          alert(
            "An error occurred while creating the booking. Please try again."
          );
        }
      }
    },
  },
  created() {
    // Ensure vehicle is loaded before checking
    if (this.vehicle && this.vehicle.id) {
      this.checkAvailabilityAndCalculateCost();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.booking-box-card {
  padding: 1.5rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  background-color: $card-background;
  position: sticky;
  top: 2rem;
  min-width: 300px;
  max-width: 400px;
  align-self: flex-start;
}

.price-header {
  margin-bottom: 1.5rem;
  .price-amount {
    font-size: 1.75rem;
    font-weight: 700;
    color: $text-color-dark;
  }
  .price-period {
    font-size: 1rem;
    color: $text-color-medium;
    margin-left: $spacing-sm;
  }
}

.date-picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.datetime-input-group {
  flex: 1;
  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: $text-color-dark;
    margin-bottom: 0.35rem;
  }
}

.inputs-row {
  display: flex;
  gap: 0.75rem;

  input[type="date"],
  input[type="time"] {
    border: 1px solid $border-color-light;
    padding: 0.6rem 0.75rem;
    border-radius: $border-radius-md;
    font-family: $font-family-base;
    font-size: 0.95rem;
    background-color: #ffffff;
    width: 100%;
    box-sizing: border-box;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px lighten($primary-color, 40%);
    }

    &[readonly],
    &:disabled {
      background-color: $background-light;
      color: $text-color-medium;
      cursor: not-allowed;
      border-style: dashed;
    }
  }
  input[type="date"] {
    flex-basis: 55%;
  }
  input[type="time"] {
    flex-basis: 45%;
  }
}

.price-calculation {
  margin-bottom: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin: 0.6rem 0;
  font-size: 0.95rem;
  color: $text-color-medium;

  span:last-child {
    font-weight: 500;
    color: $text-color-dark;
  }

  &.total {
    font-weight: 700;
    font-size: 1.15rem;
    color: $text-color-dark;
    span:last-child {
      color: $text-color-dark;
    }
  }
}

.price-divider {
  border: 0;
  border-top: 1px solid $border-color-light;
  margin: 0.75rem 0;
}

.availability-message {
  padding: 0.8rem 1rem;
  border-radius: $border-radius-md;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid transparent;

  &.available {
    background-color: #d1fae5;
    color: #065f46;
    border-color: #a7f3d0;
    i {
      color: #10b981;
    }
  }
  &.unavailable,
  &.verification_needed {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
    i {
      color: #dc2626;
    }
  }
  &.warning {
    background-color: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
    i {
      color: #d97706;
    }
  }
  &.checking {
    background-color: #e5e7eb;
    color: #4b5563;
    border-color: #d1d5db;
    i {
      color: #6b7280;
    }
  }

  /* Suspended Styles */
  &.suspended {
    background-color: #fee2e2;
    color: #b91c1c;
    border-color: #fca5a5;
    i {
      color: #ef4444;
      font-size: 1.2rem;
    }
  }
}

.continue-button {
  width: 100%;
  padding: 0.9rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease;

  &.verification-button {
    background-color: $secondary-color;
    &:hover:not(:disabled) {
      background-color: darken($secondary-color, 10%);
    }
  }

  /* Suspended Button Style */
  &.suspended-button {
    background-color: #e5e7eb;
    color: #6b7280;
    cursor: not-allowed;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #e5e7eb;
      transform: none;
    }
  }

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
    transform: translateY(-2px);
  }
  &:active:not(:disabled) {
    transform: translateY(0px);
  }

  &:disabled {
    background-color: lighten($primary-color, 25%);
    cursor: not-allowed;
    opacity: 0.8;
  }

  &.suspended-button:disabled {
    background-color: #e5e7eb;
    opacity: 1;
  }
}
</style>
