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

    <!-- Location Section -->
    <hr class="divider" />
    <div class="location-section">
      <div class="location-item">
        <span>Pickup location</span>
        <span class="location-value">{{ pickupLocation }}</span>
      </div>
       <div class="location-item">
        <span>Return location</span>
        <span class="location-value">{{ pickupLocation }}</span>
      </div>
    </div>

    <!-- Report Button Section -->
    <div class="report-section">
        <!-- UPDATED: This button now opens the report modal -->
        <button class="report-button" @click="isReportModalOpen = true">
            <i class="bi bi-flag"></i>
            <span>Report this listing</span>
        </button>
    </div>

    <!-- DateRangePicker component -->
    <DateRangePicker
      v-if="showDatePicker"
      :start-date="startDate"
      :end-date="endDate"
      :unavailable-dates="unavailableDates"
      @close="showDatePicker = false"
      @save="handleDateSave"
    />
    
    <!-- NEW: Report Listing Modal component -->
    <ReportListingModal
      :is-open="isReportModalOpen"
      :vehicle="vehicle"
      @close="isReportModalOpen = false"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import DateRangePicker from "@/components/HomeViewComponents/DateRangePicker.vue";
import ReportListingModal from "@/components/modals/ReportListingModal.vue"; // NEW: Import modal
import { DateTime } from "luxon";

export default {
  name: "BookingBox",
  components: { DateRangePicker, ReportListingModal }, // NEW: Register modal
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
      startDate: null,
      endDate: null,
      bookingLoading: false,
      errorMessage: null,
      isReportModalOpen: false, // NEW: State to control the report modal
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
    pickupLocation() {
        if (this.vehicle && this.vehicle.location) {
            return `${this.vehicle.location.barangay}, ${this.vehicle.location.city}`;
        }
        return 'Location not specified';
    }
  },
  methods: {
    ...mapActions(['createBooking']),
    handleDateSave(dates) {
      this.startDate = dates.startDate;
      this.endDate = dates.endDate;
      this.showDatePicker = false;
    },
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
        const bookingPayload = {
          vehicleId: this.vehicle.id,
          startDate: this.startDate,
          endDate: this.endDate,
          totalCost: this.totalPrice,
        };
        
        await this.createBooking(bookingPayload);
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

.divider {
    border: none;
    height: 1px;
    background-color: $border-color;
    margin: 1.5rem 0;
}

.location-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.location-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: $text-color-medium;

    .location-value {
        font-weight: 600;
        color: $text-color-dark;
    }
}

.report-section {
    text-align: center;
    margin-top: 1.5rem;
}

.report-button {
    background: none;
    border: none;
    color: $text-color-medium;
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;

    &:hover {
        color: $text-color-dark;
    }

    i {
        font-size: 1rem;
    }
}
</style>

