<template>
  <div class="vehicle-detail-container">
    <div v-if="loading" class="loading-message">
      <p>Loading vehicle details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchVehicle" class="button primary-button">Retry Load Vehicle</button>
    </div>

    <div v-else-if="vehicle" class="vehicle-details-content">
      <div class="card-body">
        <VehicleImageGallery
          :main-image-url="vehicle.imageUrl"
          :thumbnail-urls="thumbnailImages"
          :vehicle-make="vehicle.make"
          :vehicle-model="vehicle.model"
        />

        <!-- Using the custom v-model syntax, which handles the prop and event automatically -->
        <VehicleDetailsAndBooking
          :vehicle="vehicle"
          v-model:booking-form="bookingForm"
          :booking-loading="bookingLoading"
          :booking-error-message="bookingErrorMessage"
          :booking-success-message="bookingSuccessMessage"
          @book-vehicle="bookVehicle"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import VehicleImageGallery from '@/components/vehicle/VehicleImageGallery.vue';
import VehicleDetailsAndBooking from '@/components/vehicle/VehicleDetailsAndBooking.vue';

export default {
  name: 'VehicleDetailView',
  components: {
    VehicleImageGallery,
    VehicleDetailsAndBooking,
  },
  props: ['id'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      vehicle: null,
      bookingForm: {
        startDate: null,
        endDate: null,
      },
      bookingLoading: false,
      bookingErrorMessage: null,
      bookingSuccessMessage: null,
      thumbnailImages: [
        this.getPlaceholderImage(400, 300, 'c0c0c0', '333333', 'Thumb 1'),
        this.getPlaceholderImage(400, 300, 'a0a0a0', '333333', 'Thumb 2'),
        this.getPlaceholderImage(400, 300, 'd0d0d0', '333333', 'Thumb 3'),
        this.getPlaceholderImage(400, 300, 'b0b0b0', '333333', 'More Photos'),
      ],
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'user']),
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchVehicle();
        }
      },
    },
  },
  methods: {
    ...mapActions(['getVehicleById', 'checkVehicleAvailability', 'createBooking']),

    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    async fetchVehicle() {
      this.loading = true;
      this.errorMessage = null;
      this.vehicle = null;
      try {
        const fetchedVehicle = await this.getVehicleById(this.id);
        this.vehicle = fetchedVehicle;
        console.log('[VehicleDetailView] Fetched vehicle:', this.vehicle);
      } catch (error) {
        console.error('[VehicleDetailView] Error fetching vehicle details:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load vehicle details. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    async bookVehicle() {
      this.bookingLoading = true;
      this.bookingErrorMessage = null;
      this.bookingSuccessMessage = null; 

      console.log('[VehicleDetailView] Starting bookVehicle process...');

      if (!this.isAuthenticated) {
        this.bookingErrorMessage = 'Please log in to book a vehicle.';
        console.log('[VehicleDetailView] User not authenticated. Redirecting to login.');
        this.$router.push('/login');
        this.bookingLoading = false;
        return;
      }

      if (!this.bookingForm.startDate || !this.bookingForm.endDate) {
        this.bookingErrorMessage = 'Please select both pick-up and return dates.';
        console.log('[VehicleDetailView] Dates not selected.');
        this.bookingLoading = false;
        return;
      }

      const startDate = DateTime.fromISO(this.bookingForm.startDate);
      const endDate = DateTime.fromISO(this.bookingForm.endDate);

      if (!startDate.isValid || !endDate.isValid || startDate > endDate) {
        this.bookingErrorMessage = 'Invalid date range. Ensure return date is after pick-up date.';
        console.log('[VehicleDetailView] Invalid date range.');
        this.bookingLoading = false;
        return;
      }

      const isoStartDate = startDate.toISODate();
      const isoEndDate = endDate.toISODate();

      try {
        console.log('[VehicleDetailView] Calling checkVehicleAvailability...');
        const availabilityResponse = await this.checkVehicleAvailability({
          vehicleId: this.vehicle.id,
          startDate: isoStartDate,
          endDate: isoEndDate,
        });

        console.log('[VehicleDetailView] Received Availability Response (from Vuex action):', availabilityResponse);
        console.log('[VehicleDetailView] Type of availabilityResponse.isAvailable:', typeof availabilityResponse.isAvailable);
        console.log('[VehicleDetailView] Value of availabilityResponse.isAvailable:', availabilityResponse.isAvailable);


        if (availabilityResponse.isAvailable === true) {
            console.log('[VehicleDetailView] Vehicle is available. Proceeding to create booking...');

            const bookingPayload = {
              vehicleId: this.vehicle.id,
              renterId: this.user.uid,
              startDate: isoStartDate,
              endDate: isoEndDate,
              totalCost: availabilityResponse.totalCost,
              downpaymentAmount: availabilityResponse.downpaymentAmount,
              fullPaymentAmount: availabilityResponse.fullPaymentAmount,
              paymentStatus: 'pending_payment_selection',
              paymentDetails: {},
            };

            console.log('[VehicleDetailView] Calling createBooking with payload:', bookingPayload);
            const createBookingResponse = await this.createBooking(bookingPayload);
            console.log('[VehicleDetailView] createBooking Response:', createBookingResponse);
            
            const bookingId = createBookingResponse.id;

            if (bookingId) {
              console.log(`[VehicleDetailView] Booking created successfully. Redirecting to BookingPayment for bookingId: ${bookingId}`);
              this.$router.push({ name: 'BookingPayment', params: { bookingId: bookingId } });
            } else {
              this.bookingErrorMessage = 'Booking created but no booking ID received. Please try again.';
              console.error('[VehicleDetailView] Booking created but no booking ID:', createBookingResponse);
            }

        } else {
            this.bookingErrorMessage = availabilityResponse.message || 'Vehicle is not available for the selected dates.';
            console.log('[VehicleDetailView] Vehicle not available. Message:', this.bookingErrorMessage);
        }

      } catch (error) {
        console.error('[VehicleDetailView] Error during booking process (catch block):', error);
        this.bookingErrorMessage = error.response?.data?.message || 'Failed to book vehicle. Please try again.';
        this.bookingSuccessMessage = null;
      } finally {
        this.bookingLoading = false;
        console.log('[VehicleDetailView] bookVehicle process finished.');
      }
    },
  },
  mounted() {
    this.fetchVehicle();
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

// Use a global selector via :deep() to change the body background
:deep(body) {
  background-color: #fff;
}

.vehicle-detail-container {
  padding: 1.5rem;
  width: 100%; // Make the container full width
  background-color: #fff;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: $text-color-medium;
}

.error-message {
  color: #ef4444;
  font-weight: 600;
  background-color: #fee2e2;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.success-message {
  color: #22c55e;
  font-weight: 600;
  background-color: #dcfce7;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.vehicle-details-content {
  background-color: transparent; 
  border-radius: $border-radius-lg;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  // Make content bigger but still centered
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  background-color: transparent; 
  padding: 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid #e0e0e0;
}

.vehicle-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0;
}

.vehicle-year {
  font-size: 1.2rem;
  color: $text-color-medium;
  margin-top: 0.5rem;
}

.card-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
