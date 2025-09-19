<template>
  <div class="booking-box card">
    <p class="price">
      <span class="price-amount">₱{{ vehicle.rentalPricePerDay }}</span> / day
    </p>

    <!-- Date inputs to open the picker -->
    <div class="date-inputs">
      <div class="date-input-group">
        <label>PICK-UP</label>
        <input
          type="text"
          :value="formattedStartDate"
          @click="showDatePicker = true"
          readonly
          placeholder="Select date"
        />
      </div>
      <div class="date-input-group">
        <label>RETURN</label>
        <input
          type="text"
          :value="formattedEndDate"
          @click="showDatePicker = true"
          readonly
          placeholder="Select date"
        />
      </div>
    </div>

    <!-- Price breakdown -->
    <div v-if="totalPrice > 0" class="price-calculation">
      <span>₱{{ vehicle.rentalPricePerDay }} x {{ tripDuration }} days</span>
      <span class="total-price">₱{{ totalPrice.toLocaleString() }}</span>
    </div>
    <div v-else class="prompt-text">
      <p>Select your dates to see the total price.</p>
    </div>

    <!-- The button now calls a local method in this component -->
    <button
      @click="handleBookingRequest"
      :disabled="bookingLoading || !startDate || !endDate"
      class="book-now-button"
    >
      <span v-if="bookingLoading">Booking...</span>
      <span v-else>Continue</span>
    </button>

    <!-- Local error message display -->
    <div v-if="errorMessage" class="booking-message error">{{ errorMessage }}</div>

    <!-- DateRangePicker component -->
    <DateRangePicker
      v-if="showDatePicker"
      :start-date="startDate"
      :end-date="endDate"
      :unavailable-dates="unavailableDates"
      @close="showDatePicker = false"
      @save="handleDateSave"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import DateRangePicker from "@/components/HomeViewComponents/DateRangePicker.vue";
import { DateTime } from "luxon";

export default {
  name: "BookingBox",
  components: { DateRangePicker },
  props: {
    vehicle: Object,
    unavailableDates: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showDatePicker: false,
      // Local state for dates and booking status
      startDate: null,
      endDate: null,
      bookingLoading: false,
      errorMessage: null,
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'user']),
    formattedStartDate() {
      if (!this.startDate) return "";
      return DateTime.fromISO(this.startDate).toFormat("LLL dd, yyyy");
    },
    formattedEndDate() {
      if (!this.endDate) return "";
      return DateTime.fromISO(this.endDate).toFormat("LLL dd, yyyy");
    },
    tripDuration() {
      if (!this.startDate || !this.endDate) return 0;
      const start = DateTime.fromISO(this.startDate);
      const end = DateTime.fromISO(this.endDate);
      if (start >= end) return 0;
      return Math.ceil(end.diff(start, "days").days) + 1;
    },
    totalPrice() {
      if (this.tripDuration <= 0) return 0;
      return this.vehicle.rentalPricePerDay * this.tripDuration;
    },
  },
  methods: {
    // This component now has direct access to the Vuex action
    ...mapActions(['createBooking']),

    // Receives the saved dates from the date picker
    handleDateSave(dates) {
      this.startDate = dates.startDate;
      this.endDate = dates.endDate;
      this.showDatePicker = false;
    },

    // The entire booking logic is now encapsulated within this component
    async handleBookingRequest() {
      this.bookingLoading = true;
      this.errorMessage = null;

      if (!this.isAuthenticated) {
        this.$router.push('/login');
        return;
      }
      if (!this.startDate || !this.endDate) {
        this.errorMessage = 'Please select both pick-up and return dates.';
        this.bookingLoading = false;
        return;
      }

      try {
        // Constructs the complete payload, including the crucial `totalCost`
        const bookingPayload = {
          vehicleId: this.vehicle.id,
          startDate: this.startDate,
          endDate: this.endDate,
          totalCost: this.totalPrice, // This was the missing piece
        };
        
        // Dispatches the Vuex action directly
        await this.createBooking(bookingPayload);
        // The Vuex action will handle successful redirection
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      } finally {
        this.bookingLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.booking-box {
  flex: 1;
  max-width: 400px;
  padding: 1.5rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  background-color: #fff;
  box-shadow: $shadow-light;
  align-self: flex-start;
  position: sticky;
  top: 2rem;
}

.price {
  font-size: 1.125rem;
  color: $text-color-medium;
  margin-top: 0;
  .price-amount {
    font-size: 1.75rem;
    font-weight: 700;
    color: $text-color-dark;
  }
}

.date-inputs {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  overflow: hidden;
}

.date-input-group {
  flex: 1;
  padding: 0.5rem 0.75rem;
  &:first-child {
    border-right: 1px solid $border-color;
  }
  label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    color: $text-color-medium;
    text-transform: uppercase;
  }
  input {
    border: none;
    outline: none;
    width: 100%;
    padding: 0.25rem 0 0;
    font-size: 0.9rem;
    background-color: transparent;
    cursor: pointer;
  }
}

.price-calculation {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: $text-color-dark;
}

.total-price {
  font-weight: 700;
}

.prompt-text {
  text-align: center;
  color: $text-color-medium;
  font-size: 0.9rem;
  margin: 1.5rem 0;
}

.book-now-button {
  width: 100%;
  padding: 0.875rem;
  margin-top: 1.5rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
  }
}

.booking-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: $border-radius-md;
  font-size: 0.9rem;
  &.error {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 10%);
  }
}
</style>

