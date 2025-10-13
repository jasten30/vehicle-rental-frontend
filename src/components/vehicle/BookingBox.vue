<template>
  <div class="booking-box-card">
    <div class="price-header">
      <span class="price-amount">₱{{ vehicle.rentalPricePerDay ? vehicle.rentalPricePerDay.toLocaleString() : 'N/A' }}</span>
      <span class="price-period">per day</span>
    </div>

    <div class="date-picker-section">
      <div class="date-input-group">
        <label for="start-date">PICKUP</label>
        <input type="date" id="start-date" v-model="startDate" :min="today" />
      </div>
      <div class="date-input-group">
        <label for="end-date">RETURN</label>
        <input type="date" id="end-date" v-model="endDate" :min="minEndDate" />
      </div>
    </div>

    <div v-if="totalCost > 0" class="price-calculation">
      <div class="price-row">
        <span>₱{{ vehicle.rentalPricePerDay.toLocaleString() }} x {{ numberOfDays }} days</span>
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
      endDate: null,
      totalCost: 0,
      numberOfDays: 0,
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
    startDate() {
      this.checkAvailabilityAndCalculateCost();
    },
    endDate() {
      this.checkAvailabilityAndCalculateCost();
    },
  },
  methods: {
    ...mapActions(['createBooking', 'checkVehicleAvailability']),

    async checkAvailabilityAndCalculateCost() {
      if (!this.startDate || !this.endDate) {
        this.totalCost = 0;
        this.availabilityMessage = '';
        this.availabilityStatus = '';
        return;
      }
      
      const start = DateTime.fromISO(this.startDate);
      const end = DateTime.fromISO(this.endDate);

      if (start >= end) {
        this.totalCost = 0;
        this.availabilityMessage = 'Return date must be after the pickup date.';
        this.availabilityStatus = 'unavailable';
        return;
      }

      this.isLoadingAvailability = true;
      this.availabilityMessage = 'Checking availability...';
      this.availabilityStatus = 'checking';

      try {
        const payload = {
          vehicleId: this.vehicle.id,
          startDate: this.startDate,
          endDate: this.endDate,
        };
        
        const response = await this.checkVehicleAvailability(payload);

        if (response.isAvailable) {
          this.availabilityMessage = response.message;
          this.availabilityStatus = 'available';
          this.totalCost = response.totalCost;
          this.numberOfDays = Math.ceil(end.diff(start, 'days').days);
        } else {
          this.availabilityMessage = response.message;
          this.availabilityStatus = 'unavailable';
          this.totalCost = 0;
        }
      } catch (error) {
        this.availabilityMessage = 'Could not check availability. Please try again.';
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

      try {
        const bookingData = {
          vehicleId: this.vehicle.id,
          startDate: this.startDate,
          endDate: this.endDate,
          totalCost: this.totalCost,
        };
        
        const newBooking = await this.createBooking(bookingData);
        
        this.$router.push({ name: 'BookingSummary', params: { bookingId: newBooking.id } });

      } catch (error) {
        console.error("Failed to create booking:", error);
        // You can add a user-facing error notification here
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
  gap: 1rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.date-input-group {
  flex: 1;
  padding: 0.25rem 0.5rem;
  label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: $text-color-medium;
  }
  input[type="date"] {
    border: none;
    width: 100%;
    font-family: $font-family-base;
    font-size: 0.9rem;
    &:focus {
      outline: none;
    }
  }
}

.price-calculation {
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  &.total {
    font-weight: 700;
    font-size: 1.1rem;
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
  &.available {
    background-color: lighten($secondary-color, 40%);
    color: darken($secondary-color, 15%);
  }
  &.unavailable {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 20%);
  }
  &.checking {
    background-color: #e2e8f0;
    color: #4a5568;
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

  &:hover {
    background-color: darken($primary-color, 10%);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
</style>

