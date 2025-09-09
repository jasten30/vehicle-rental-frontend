<template>
  <div class="booking-payment-container">
    <div class="booking-payment-card">
      <div v-if="loading" class="loading-state">Loading Booking...</div>
      <div v-else-if="errorMessage" class="error-message-box">
        {{ errorMessage }}
      </div>
      <template v-else-if="booking">
        <PaymentSteps :booking="booking" />
        <BookingSummaryCard :booking="booking" />
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import PaymentSteps from '@/components/booking/PaymentSteps.vue';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard.vue';

export default {
  name: 'BookingPaymentView',
  components: {
    PaymentSteps,
    BookingSummaryCard,
  },
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
    };
  },
  async created() {
    await this.fetchBookingDetails();
  },
  methods: {
    ...mapActions(['getBookingById', 'getVehicleById']),
    async fetchBookingDetails() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const bookingData = await this.getBookingById(this.bookingId);
        if (!bookingData || !bookingData.vehicleId) {
          throw new Error('Booking data or vehicle reference is missing.');
        }
        const vehicleData = await this.getVehicleById(bookingData.vehicleId);
        if (!vehicleData) {
          throw new Error('Vehicle details could not be found.');
        }
        this.booking = {
          ...bookingData,
          vehicle: vehicleData,
        };
      } catch (error) {
        console.error('Error fetching booking details:', error);
        this.errorMessage = 'Failed to load booking details. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.booking-payment-container {
  min-height: 100vh;
  background-color: $background-color;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-lg;
}

.booking-payment-card {
  max-width: 64rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;
  background-color: $card-background;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;

  @media (min-width: 1024px) {
    grid-template-columns: 1.2fr 1fr;
  }
}

.loading-state,
.error-message-box {
  grid-column: 1 / -1; /* Make it span the whole card */
  text-align: center;
  padding: $spacing-xl;
}
</style>