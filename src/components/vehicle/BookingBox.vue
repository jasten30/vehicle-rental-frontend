<template>
  <div class="booking-box-card">
    <div class="price-header">
      <span class="price-amount">₱{{ vehicle.rentalPricePerDay ? vehicle.rentalPricePerDay.toLocaleString() : 'N/A' }}</span>
      <span class="price-period">per day</span>
    </div>

    <div class="date-picker-section">
      <div class="datetime-input-group">
        <label for="start-date">PICKUP</label>
        <div class="inputs-row">
          <input type="date" id="start-date" v-model="startDate" :min="today" />
          <input type="time" id="start-time" v-model="startTime" />
        </div>
      </div>
      <div class="datetime-input-group">
        <label for="end-date">RETURN</label>
          <div class="inputs-row">
          <input type="date" id="end-date" v-model="endDate" :min="minEndDate" />
          <input type="time" id="end-time" v-model="endTime" :min="minReturnTime" />
        </div>
      </div>
    </div>

    <div v-if="totalCost > 0" class="price-calculation">
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

    <div v-if="availabilityMessage" class="availability-message" :class="availabilityStatus">
      <i class="bi" :class="availabilityIcon"></i>
      <span>{{ availabilityMessage }}</span>
    </div>

    <button
      @click="handleContinueClick"
      class="continue-button"
      :disabled="!isBookingValid"
    >
      <span v-if="isLoadingAvailability">Checking...</span>
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
import DownpaymentConfirmationModal from '@/components/modals/DownpaymentConfirmationModal.vue';
import { mapActions } from 'vuex';
// Import Interval from Luxon
import { DateTime, Interval } from 'luxon';

export default {
  name: 'BookingBox',
  components: {
    DownpaymentConfirmationModal,
  },
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
    // This prop holds the owner's blocked dates
    unavailableDates: {
        type: Array,
        default: () => [],
    },
  },
  data() {
    return {
      isConfirmationModalOpen: false,
      startDate: null,
      startTime: '09:00', // Default pickup time
      endDate: null,
      endTime: '09:00', // Default return time
      totalCost: 0,
      rentalDurationDescription: '',
      isLoadingAvailability: false,
      availabilityMessage: '',
      availabilityStatus: '', // 'available', 'unavailable', 'checking'
    };
  },
  computed: {
    today() {
      return DateTime.now().toISODate();
    },
    minEndDate() {
      return this.startDate ? this.startDate : this.today;
    },
    minReturnTime() {
      if (this.startDate && this.endDate && this.startDate === this.endDate && this.startTime) {
        return this.startTime;
      }
      return undefined;
    },
    pickupDateTimeISO() {
      if (this.startDate && this.startTime) {
        try {
          const dt = DateTime.fromISO(`${this.startDate}T${this.startTime}`, { zone: 'local' });
          return dt.isValid ? dt.toISO({ includeOffset: true, suppressMilliseconds: false }) : null;
        } catch (e) { console.error("Error creating pickupDateTimeISO:", e); return null; }
      }
      return null;
    },
    returnDateTimeISO() {
      if (this.endDate && this.endTime) {
        try {
          const dt = DateTime.fromISO(`${this.endDate}T${this.endTime}`, { zone: 'local' });
          return dt.isValid ? dt.toISO({ includeOffset: true, suppressMilliseconds: false }) : null;
        } catch (e) { console.error("Error creating returnDateTimeISO:", e); return null; }
      }
      return null;
    },
    isBookingValid() {
      // Allow continue only if explicitly marked as available
      return this.availabilityStatus === 'available' && !this.isLoadingAvailability;
    },
    availabilityIcon() {
        if (this.availabilityStatus === 'available') return 'bi-check-circle-fill';
        if (this.availabilityStatus === 'unavailable') return 'bi-x-circle-fill';
        return 'bi-hourglass-split'; // Represents checking
    }
  },
  watch: {
    startDate() { this.checkAvailabilityAndCalculateCost(); },
    startTime() { this.checkAvailabilityAndCalculateCost(); },
    endDate() { this.checkAvailabilityAndCalculateCost(); },
    endTime() { this.checkAvailabilityAndCalculateCost(); },
    // Also watch unavailableDates prop in case it loads async
    unavailableDates() { this.checkAvailabilityAndCalculateCost(); },
  },
  methods: {
    ...mapActions(['createBooking', 'checkVehicleAvailability']),

    calculateRentalDurationDescription(startISO, endISO) {
        if (!startISO || !endISO) return '';
        const start = DateTime.fromISO(startISO);
        const end = DateTime.fromISO(endISO);
        if (!start.isValid || !end.isValid || start >= end) return '';

        const diff = end.diff(start, ['days', 'hours']);
        const totalHours = diff.as('hours');
        const calculatedDays = Math.ceil(totalHours / 24); // Round up to the nearest full day

        return `Rental Period: ${calculatedDays} day${calculatedDays > 1 ? 's' : ''}`;
    },

    // ================================================
    //  UPDATED CHECK AVAILABILITY METHOD
    // ================================================
    async checkAvailabilityAndCalculateCost() {
      // Reset if any input is missing
      if (!this.pickupDateTimeISO || !this.returnDateTimeISO) {
        this.totalCost = 0;
        this.rentalDurationDescription = '';
        this.availabilityMessage = '';
        this.availabilityStatus = '';
        return;
      }

      let start, end;
      try {
          start = DateTime.fromISO(this.pickupDateTimeISO);
          end = DateTime.fromISO(this.returnDateTimeISO);
          if (!start.isValid || !end.isValid) throw new Error("Invalid Luxon DateTime created.");
      } catch(e) {
          console.error("Error parsing selected dates:", e);
          this.availabilityMessage = 'Invalid date/time selected.';
          this.availabilityStatus = 'unavailable';
          this.totalCost = 0;
          return;
      }


      // --- 1. Basic Validation ---
      if (start >= end) {
        this.totalCost = 0;
        this.rentalDurationDescription = '';
        this.availabilityMessage = 'Return date/time must be after pickup date/time.';
        this.availabilityStatus = 'unavailable';
        return;
      }

      // --- 2. Check Against Owner's Blocked Dates (unavailableDates prop) ---
      const renterInterval = Interval.fromDateTimes(start, end);

      for (const blockedPeriod of this.unavailableDates) {
        if (!blockedPeriod.start || !blockedPeriod.end) continue; // Skip invalid data from prop

        try {
            // Convert owner's YYYY-MM-DD strings to Luxon DateTimes at start/end of day UTC
            const blockedStart = DateTime.fromISO(blockedPeriod.start + 'T00:00:00Z');
            const blockedEnd = DateTime.fromISO(blockedPeriod.end + 'T23:59:59Z');

            if (!blockedStart.isValid || !blockedEnd.isValid) continue; // Skip invalid blocked dates

            const blockedInterval = Interval.fromDateTimes(blockedStart, blockedEnd);

            // Check if the renter's desired interval overlaps with the blocked interval
            if (renterInterval.overlaps(blockedInterval)) {
              console.log(`Overlap detected with owner blocked period: Renter wants ${renterInterval.toString()}, blocked period is ${blockedInterval.toString()}`);
              this.availabilityMessage = `Vehicle is unavailable from ${blockedStart.toLocaleString(DateTime.DATE_MED)} to ${blockedEnd.toLocaleString(DateTime.DATE_MED)}.`;
              this.availabilityStatus = 'unavailable';
              this.totalCost = 0;
              this.rentalDurationDescription = ''; // Clear description on conflict
              return; // Stop checking immediately on conflict
            }
        } catch(e) {
            console.error("Error parsing blocked date period:", blockedPeriod, e);
            continue; // Skip this potentially malformed blocked date
        }
      }

      // --- 3. If no owner blocks conflict, THEN check backend (existing bookings) ---
      this.isLoadingAvailability = true;
      this.availabilityMessage = 'Checking existing bookings...';
      this.availabilityStatus = 'checking';
      this.rentalDurationDescription = this.calculateRentalDurationDescription(this.pickupDateTimeISO, this.returnDateTimeISO);


      try {
        const payload = {
          vehicleId: this.vehicle.id,
          startDate: this.pickupDateTimeISO,
          endDate: this.returnDateTimeISO,
        };

        // Call backend to check against other bookings
        const response = await this.checkVehicleAvailability(payload);

        if (response.isAvailable) {
          this.availabilityMessage = response.message; // e.g., "Vehicle is available for these dates."
          this.availabilityStatus = 'available';
          this.totalCost = response.totalCost; // Use backend calculated cost
        } else {
          this.availabilityMessage = response.message; // e.g., "Vehicle is already booked..."
          this.availabilityStatus = 'unavailable';
          this.totalCost = 0;
        }
      } catch (error) {
        console.error("[BookingBox] Failed to check backend availability:", error);
        if (error.response && error.response.status === 403) {
            this.availabilityMessage = 'You are not authorized to book this vehicle. Please log in as a renter.';
        } else {
            this.availabilityMessage = 'Could not check booking schedule. Please try again.';
        }
        this.availabilityStatus = 'unavailable';
        this.totalCost = 0;
      } finally {
        this.isLoadingAvailability = false;
      }
    },
    // ================================================

    handleContinueClick() {
      if (this.isBookingValid) {
        this.isConfirmationModalOpen = true;
      }
    },

    async proceedWithBooking() {
      this.isConfirmationModalOpen = false;

      if (!this.pickupDateTimeISO || !this.returnDateTimeISO || !this.isBookingValid) {
          console.error("Booking data is invalid or availability not confirmed.");
          alert('Cannot proceed with booking. Please ensure dates and times are valid and availability is confirmed.');
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
        this.$router.push({ name: 'BookingSummary', params: { bookingId: newBooking.id } });

      } catch (error) {
        console.error("Failed to create booking:", error);
        alert('An error occurred while creating the booking. Please try again.');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.booking-box-card {
  padding: 1.5rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  background-color: $card-background;
  // Make it sticky
  position: sticky;
  top: 2rem; // Adjust as needed based on your header height
  min-width: 300px; // Ensure it doesn't get too narrow
   max-width: 400px; // Prevent it from getting too wide
   align-self: flex-start; // Prevent stretching if in flex container
}

.price-header {
  margin-bottom: 1.5rem;
  .price-amount {
    font-size: 1.75rem;
    font-weight: 700;
    color: $text-color-dark; // Darker color for price
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
  gap: 0.75rem; // Increased gap between pickup/return
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  padding: 1rem; // More padding
  margin-bottom: 1.5rem; // More space below
}

.datetime-input-group {
  flex: 1;
  label {
    display: block;
    font-size: 0.75rem; // Slightly larger label
    font-weight: 700;
    text-transform: uppercase;
    color: $text-color-dark; // Darker label
    margin-bottom: 0.35rem; // Space between label and inputs row
  }
}

.inputs-row {
    display: flex;
    gap: 0.75rem; // Increased gap between date/time

    input[type="date"], input[type="time"] {
        border: 1px solid $border-color-light; // Subtle border
        padding: 0.6rem 0.75rem; // Increased padding
        border-radius: $border-radius-md; // More rounded
        font-family: $font-family-base;
        font-size: 0.95rem; // Slightly larger font
        background-color: #ffffff; // White background
        width: 100%;
        box-sizing: border-box; // Include padding/border in width
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
            outline: none;
            border-color: $primary-color; // Highlight border on focus
            box-shadow: 0 0 0 3px lighten($primary-color, 40%);
        }
    }
     input[type="date"] {
         flex-basis: 55%; // Adjust basis if needed
     }
     input[type="time"] {
         flex-basis: 45%;
     }
}


.price-calculation {
  margin-bottom: 1.5rem; // More space below calculation
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin: 0.6rem 0; // Slightly more vertical space
  font-size: 0.95rem; // Slightly larger font
  color: $text-color-medium; // Medium color for breakdown

  span:last-child {
      font-weight: 500;
      color: $text-color-dark; // Darker color for price value
  }

  &.total {
    font-weight: 700;
    font-size: 1.15rem; // Larger total
    color: $text-color-dark; // Darker total label
    span:last-child {
        color: $text-color-dark; // Ensure total price value is dark
    }
  }
}

.price-divider {
  border: 0;
  border-top: 1px solid $border-color-light; // Lighter divider
  margin: 0.75rem 0;
}

.availability-message {
  padding: 0.8rem 1rem; // More padding
  border-radius: $border-radius-md;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem; // More gap
  font-size: 0.95rem;
  font-weight: 500; // Slightly bolder text
  border: 1px solid transparent; // Base border

  &.available {
    background-color: #d1fae5; // Light green
    color: #065f46; // Dark green
    border-color: #a7f3d0; // Lighter green border
    i { color: #10b981; } // Medium green icon
  }
  &.unavailable {
    background-color: #fee2e2; // Light red
    color: #991b1b; // Dark red
    border-color: #fecaca; // Lighter red border
     i { color: #dc2626; } // Medium red icon
  }
  &.checking {
    background-color: #e5e7eb; // Light gray
    color: #4b5563; // Medium gray
    border-color: #d1d5db; // Lighter gray border
    i { color: #6b7280; } // Slightly darker gray icon
  }
}


.continue-button {
  width: 100%;
  padding: 0.9rem; // Larger padding
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
    transform: translateY(-2px); // Subtle lift effect
  }
   &:active:not(:disabled) {
       transform: translateY(0px); // Press effect
   }

  &:disabled {
    background-color: lighten($primary-color, 25%); // Lighter disabled color
    cursor: not-allowed;
    opacity: 0.8;
  }
}
</style>
