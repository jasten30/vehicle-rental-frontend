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
import { DateTime } from 'luxon';

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
  },
  data() {
    return {
      isConfirmationModalOpen: false,
      startDate: null,
      startTime: '09:00', // Default pickup time
      endDate: null,
      endTime: '09:00', // Default return time
      totalCost: 0,
      rentalDurationDescription: '', // e.g., "3 days" or "48 hours"
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
      // Return date must be same or after pickup date
      return this.startDate ? this.startDate : this.today;
    },
    minReturnTime() {
      // If return date is the same as pickup date, return time must be after pickup time
      if (this.startDate && this.endDate && this.startDate === this.endDate && this.startTime) {
        // Add a small buffer (e.g., 1 hour) if needed, or just return startTime
        return this.startTime;
      }
      return undefined; // No minimum time if dates are different
    },
    pickupDateTimeISO() {
      if (this.startDate && this.startTime) {
        try {
          const dt = DateTime.fromISO(`${this.startDate}T${this.startTime}`, { zone: 'local' });
          // Ensure this line uses dt.toISO()
          return dt.isValid ? dt.toISO({ includeOffset: true, suppressMilliseconds: false }) : null;
        } catch (e) { console.error("Error creating pickupDateTimeISO:", e); return null; }
      }
      return null;
    },
    returnDateTimeISO() {
      if (this.endDate && this.endTime) {
        try {
          const dt = DateTime.fromISO(`${this.endDate}T${this.endTime}`, { zone: 'local' });
          // Ensure this line uses dt.toISO()
          return dt.isValid ? dt.toISO({ includeOffset: true, suppressMilliseconds: false }) : null;
        } catch (e) { console.error("Error creating returnDateTimeISO:", e); return null; }
      }
      return null;
    },
    isBookingValid() {
      return this.availabilityStatus === 'available' && !this.isLoadingAvailability;
    },
    availabilityIcon() {
        if (this.availabilityStatus === 'available') return 'bi-check-circle-fill';
        if (this.availabilityStatus === 'unavailable') return 'bi-x-circle-fill';
        return 'bi-hourglass-split';
    }
  },
  watch: {
    // Watch all date/time inputs to re-trigger check
    startDate() { this.checkAvailabilityAndCalculateCost(); },
    startTime() { this.checkAvailabilityAndCalculateCost(); },
    endDate() { this.checkAvailabilityAndCalculateCost(); },
    endTime() { this.checkAvailabilityAndCalculateCost(); },
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

    async checkAvailabilityAndCalculateCost() {
      // Reset if any input is missing
      if (!this.pickupDateTimeISO || !this.returnDateTimeISO) {
        this.totalCost = 0;
        this.rentalDurationDescription = '';
        this.availabilityMessage = '';
        this.availabilityStatus = '';
        return;
      }

      const start = DateTime.fromISO(this.pickupDateTimeISO);
      const end = DateTime.fromISO(this.returnDateTimeISO);

      // Basic validation: end must be after start
      if (start >= end) {
        this.totalCost = 0;
        this.rentalDurationDescription = '';
        this.availabilityMessage = 'Return date/time must be after pickup date/time.';
        this.availabilityStatus = 'unavailable';
        return;
      }

      this.isLoadingAvailability = true;
      this.availabilityMessage = 'Checking availability...';
      this.availabilityStatus = 'checking';
      this.rentalDurationDescription = this.calculateRentalDurationDescription(this.pickupDateTimeISO, this.returnDateTimeISO);


      try {
        const payload = {
          vehicleId: this.vehicle.id,
          // Send full ISO strings to backend
          startDate: this.pickupDateTimeISO,
          endDate: this.returnDateTimeISO,
        };

        const response = await this.checkVehicleAvailability(payload);

        if (response.isAvailable) {
          this.availabilityMessage = response.message;
          this.availabilityStatus = 'available';
          // Use the total cost returned by the backend
          this.totalCost = response.totalCost;
        } else {
          this.availabilityMessage = response.message;
          this.availabilityStatus = 'unavailable';
          this.totalCost = 0;
        }
      } catch (error) {
        console.error("[BookingBox] Failed to check availability:", error); // Log the actual error
        // Check for 403 Forbidden specifically
        if (error.response && error.response.status === 403) {
            this.availabilityMessage = 'You are not authorized to book this vehicle. Please log in as a renter.';
        } else {
            this.availabilityMessage = 'Could not check availability. Please try again.';
        }
        this.availabilityStatus = 'unavailable';
        this.totalCost = 0;
      } finally {
        this.isLoadingAvailability = false;
      }
    },

    handleContinueClick() {
      if (this.isBookingValid) {
        this.isConfirmationModalOpen = true;
      }
    },

    async proceedWithBooking() {
      this.isConfirmationModalOpen = false;

      // Ensure we have valid date-times before proceeding
      if (!this.pickupDateTimeISO || !this.returnDateTimeISO || !this.isBookingValid) {
          console.error("Booking data is invalid or availability not confirmed.");
          // Show error to user
          alert('Cannot proceed with booking. Please ensure dates and times are valid and availability is confirmed.'); // Added user feedback
          return;
      }

      try {
        const bookingData = {
          vehicleId: this.vehicle.id,
          // Send full ISO strings to backend
          startDate: this.pickupDateTimeISO,
          endDate: this.returnDateTimeISO,
          totalCost: this.totalCost, // Frontend cost is used here, backend recalculates
        };

        const newBooking = await this.createBooking(bookingData);

        // 👇 UPDATED THIS LINE: Changed route name from 'BookingStatus' to 'BookingSummary'
        this.$router.push({ name: 'BookingSummary', params: { bookingId: newBooking.id } });


      } catch (error) {
        console.error("Failed to create booking:", error);
        // Add a user-facing error notification here (e.g., using a toast library)
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
}

.price-header {
  margin-bottom: 1.5rem;
  .price-amount {
    font-size: 1.75rem;
    font-weight: 700;
  }
  .price-period {
    font-size: 1rem;
    color: $text-color-medium;
    margin-left: $spacing-sm;
  }
}

.date-picker-section {
  display: flex;
  flex-direction: column; // Stack pickup and return
  gap: 0.5rem; // Space between pickup and return groups
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.datetime-input-group {
  flex: 1;
  label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: $text-color-medium;
    margin-bottom: 0.25rem; // Space between label and inputs row
  }
}

.inputs-row {
    display: flex;
    gap: 0.5rem; // Space between date and time inputs

    input[type="date"], input[type="time"] {
        border: none; // Remove default border
        // border: 1px solid #ccc; // Optional: add subtle border
        padding: 0.4rem 0.5rem; // Adjust padding
        border-radius: $border-radius-sm;
        font-family: $font-family-base;
        font-size: 0.9rem;
        background-color: #f8f9fa; // Slightly different background
        width: 100%; // Make inputs fill the space
        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px lighten($primary-color, 30%); // Focus indicator
        }
    }
     input[type="date"] {
         flex-basis: 60%; // Give date slightly more space
     }
     input[type="time"] {
         flex-basis: 40%;
     }
}


.price-calculation {
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-size: 0.9rem; // Slightly smaller font for calculation line
  &.total {
    font-weight: 700;
    font-size: 1.1rem; // Keep total prominent
  }
}

.price-divider {
  border: 0;
  border-top: 1px solid $border-color;
  margin: 0.5rem 0;
}

.availability-message {
  padding: 0.75rem;
  border-radius: $border-radius-md;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  &.available {
    background-color: lighten($secondary-color, 40%);
    color: darken($secondary-color, 15%);
    i { color: $secondary-color; }
  }
  &.unavailable {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 20%);
     i { color: $admin-color; }
  }
  &.checking {
    background-color: #e2e8f0;
    color: #4a5568;
    i { color: #4a5568; }
  }
}

.continue-button {
  width: 100%;
  padding: 0.75rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
}
</style>