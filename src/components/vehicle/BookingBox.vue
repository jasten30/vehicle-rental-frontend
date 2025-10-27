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

    <!-- Display verification message if needed -->
    <div v-if="!isDriverVerified && userRole === 'renter'" class="availability-message warning">
         <i class="bi bi-exclamation-triangle-fill"></i>
         <span>Driver verification required to book.</span>
    </div>

    <div v-if="totalCost > 0 && isDriverVerified" class="price-calculation">
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

    <!-- Only show availability status if driver is verified or not a renter -->
    <div v-if="availabilityMessage && (isDriverVerified || userRole !== 'renter')" class="availability-message" :class="availabilityStatus">
      <i class="bi" :class="availabilityIcon"></i>
      <span>{{ availabilityMessage }}</span>
    </div>

    <button
      @click="handleContinueClick"
      class="continue-button"
      :disabled="!canProceed"
      :class="{ 'verification-button': !isDriverVerified && userRole === 'renter' }"
    >
      <span v-if="isLoadingAvailability">Checking...</span>
      <!-- Change button text based on verification status for renters -->
      <span v-else-if="!isDriverVerified && userRole === 'renter'">Get Verified to Drive</span>
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
// Import mapState and mapGetters
import { mapActions, mapState, mapGetters } from 'vuex';
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
    unavailableDates: {
        type: Array,
        default: () => [],
    },
  },
  data() {
    return {
      isConfirmationModalOpen: false,
      startDate: null,
      startTime: '09:00',
      endDate: null,
      endTime: '09:00',
      totalCost: 0,
      rentalDurationDescription: '',
      isLoadingAvailability: false,
      availabilityMessage: '',
      availabilityStatus: '', // 'available', 'unavailable', 'checking', 'verification_needed'
    };
  },
  computed: {
    // ================================================
    //  UPDATED VUEX MAPPING
    // ================================================
    // Assumes 'user' object is in the ROOT state
    ...mapState({
        currentUser: state => state.user // Adjusted path
    }),
    // Assumes 'userRole' is a ROOT getter
    ...mapGetters(['userRole']),
    // ================================================

    isDriverVerified() {
        // Now uses currentUser directly from mapState
        return !!this.currentUser && this.currentUser.isApprovedToDrive === true;
    },

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
    canProceed() {
        if (!this.isDriverVerified && this.userRole === 'renter') {
            return !!(this.pickupDateTimeISO && this.returnDateTimeISO);
        }
        return this.availabilityStatus === 'available' && !this.isLoadingAvailability;
    },
    availabilityIcon() {
        if (this.availabilityStatus === 'available') return 'bi-check-circle-fill';
        if (this.availabilityStatus === 'unavailable') return 'bi-x-circle-fill';
        if (this.availabilityStatus === 'verification_needed') return 'bi-exclamation-triangle-fill';
        return 'bi-hourglass-split';
    }
  },
  watch: {
    currentUser: 'checkAvailabilityAndCalculateCost',
    startDate() { this.checkAvailabilityAndCalculateCost(); },
    startTime() { this.checkAvailabilityAndCalculateCost(); },
    endDate() { this.checkAvailabilityAndCalculateCost(); },
    endTime() { this.checkAvailabilityAndCalculateCost(); },
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
        const calculatedDays = Math.ceil(totalHours / 24);

        return `Rental Period: ${calculatedDays} day${calculatedDays > 1 ? 's' : ''}`;
    },

    async checkAvailabilityAndCalculateCost() {
      if (!this.pickupDateTimeISO || !this.returnDateTimeISO) {
        this.totalCost = 0;
        this.rentalDurationDescription = '';
        this.availabilityMessage = '';
        this.availabilityStatus = '';
        return;
      }

       if (!this.isDriverVerified && this.userRole === 'renter') {
           this.availabilityMessage = 'Driver verification required to check availability and book.';
           this.availabilityStatus = 'verification_needed';
           this.totalCost = 0;
           this.rentalDurationDescription = '';
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

      if (start >= end) {
        this.totalCost = 0;
        this.rentalDurationDescription = '';
        this.availabilityMessage = 'Return date/time must be after pickup date/time.';
        this.availabilityStatus = 'unavailable';
        return;
      }

      const renterInterval = Interval.fromDateTimes(start, end);

      for (const blockedPeriod of this.unavailableDates) {
        if (!blockedPeriod.start || !blockedPeriod.end) continue;

        try {
            const blockedStart = DateTime.fromISO(blockedPeriod.start + 'T00:00:00Z').startOf('day');
            const blockedEnd = DateTime.fromISO(blockedPeriod.end + 'T23:59:59Z').endOf('day');

            if (!blockedStart.isValid || !blockedEnd.isValid) continue;

            const blockedInterval = Interval.fromDateTimes(blockedStart, blockedEnd);

            if (renterInterval.overlaps(blockedInterval)) {
              this.availabilityMessage = `Vehicle is unavailable from ${blockedStart.toLocaleString(DateTime.DATE_MED)} to ${blockedEnd.toLocaleString(DateTime.DATE_MED)}.`;
              this.availabilityStatus = 'unavailable';
              this.totalCost = 0;
              this.rentalDurationDescription = '';
              return;
            }
        } catch(e) {
            console.error("Error parsing blocked date period:", blockedPeriod, e);
            continue;
        }
      }

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

        const response = await this.checkVehicleAvailability(payload);

        if (response.isAvailable) {
          this.availabilityMessage = response.message;
          this.availabilityStatus = 'available';
          this.totalCost = response.totalCost;
        } else {
          this.availabilityMessage = response.message;
          this.availabilityStatus = 'unavailable';
          this.totalCost = 0;
        }
      } catch (error) {
        console.error("[BookingBox] Failed to check backend availability:", error);
        if (error.response && error.response.status === 403) {
            this.availabilityMessage = 'You are not authorized to book this vehicle. Please ensure you are logged in as a verified renter.';
        } else {
            this.availabilityMessage = 'Could not check booking schedule. Please try again.';
        }
        this.availabilityStatus = 'unavailable';
        this.totalCost = 0;
      } finally {
        this.isLoadingAvailability = false;
      }
    },

    handleContinueClick() {
      if (!this.isDriverVerified && this.userRole === 'renter') {
          this.$router.push({ name: 'BecomeDriveVerified' });
          return;
      }
      if (this.availabilityStatus === 'available' && !this.isLoadingAvailability) {
        this.isConfirmationModalOpen = true;
      }
    },

    async proceedWithBooking() {
      this.isConfirmationModalOpen = false;

      if (!this.isDriverVerified && this.userRole === 'renter') {
          alert('You must be a verified driver to book.');
          this.$router.push({ name: 'BecomeDriveVerified' });
          return;
      }
      if (!this.pickupDateTimeISO || !this.returnDateTimeISO || this.availabilityStatus !== 'available') {
          console.error("Booking data is invalid or availability not confirmed.");
          alert('Cannot proceed with booking. Please ensure dates/times are valid and availability is confirmed.');
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
   created() {
       this.checkAvailabilityAndCalculateCost();
   }
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

    input[type="date"], input[type="time"] {
        border: 1px solid $border-color-light;
        padding: 0.6rem 0.75rem;
        border-radius: $border-radius-md;
        font-family: $font-family-base;
        font-size: 0.95rem;
        background-color: #ffffff;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
            outline: none;
            border-color: $primary-color;
            box-shadow: 0 0 0 3px lighten($primary-color, 40%);
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
    i { color: #10b981; }
  }
  &.unavailable, &.verification_needed { // Apply unavailable style also for verification needed
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
     i { color: #dc2626; }
  }
   &.warning { // Specific style for the verification message shown above price
    background-color: #FEF3C7; // Light yellow
    color: #92400E; // Dark yellow/brown
    border-color: #FDE68A; // Lighter yellow border
    i { color: #D97706; } // Medium yellow/orange icon
  }
  &.checking {
    background-color: #e5e7eb;
    color: #4b5563;
    border-color: #d1d5db;
    i { color: #6b7280; }
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
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;

  // Style for verification button
  &.verification-button {
      background-color: $secondary-color; // Use a different color like secondary
       &:hover:not(:disabled) {
         background-color: darken($secondary-color, 10%);
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
}
</style>

