<template>
  <div class="vehicle-detail-container">
    <div v-if="loading" class="loading-message">
      <p>Loading vehicle details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchVehicle" class="button primary-button">
        Retry Load Vehicle
      </button>
    </div>

    <div v-else-if="vehicle" class="vehicle-details-content">
      <div class="card-body">
        <VehicleImageGallery
          :exterior-photos="vehicle.exteriorPhotos"
          :interior-photos="vehicle.interiorPhotos"
          :vehicle-make="vehicle.make"
          :vehicle-model="vehicle.model"
        />

        <div class="vehicle-info-section card">
          <h1 class="vehicle-name">{{ vehicle.make }} {{ vehicle.model }}</h1>
          <p class="vehicle-year">{{ vehicle.year }}</p>
          <p class="vehicle-price">₱{{ vehicle.rentalPricePerDay }} / day</p>

          <hr class="divider" />

          <div class="specifications-grid">
            <div class="spec-item">
              <i class="fa-solid fa-car-side icon-color"></i>
              <div class="spec-details">
                <span class="spec-label">Type</span>
                <span class="spec-value">{{ vehicle.vehicleType }}</span>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-person-seat icon-color"></i>
              <div class="spec-details">
                <span class="spec-label">Seats</span>
                <span class="spec-value">{{ vehicle.seatingCapacity }}</span>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-gear icon-color"></i>
              <div class="spec-details">
                <span class="spec-label">Transmission</span>
                <span class="spec-value">{{ vehicle.transmission }}</span>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-gas-pump icon-color"></i>
              <div class="spec-details">
                <span class="spec-label">Fuel Type</span>
                <span class="spec-value">{{ vehicle.fuelType }}</span>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-location-dot icon-color"></i>
              <div class="spec-details">
                <span class="spec-label">Location</span>
                <span class="spec-value">{{ vehicle.location.city }}</span>
              </div>
            </div>
          </div>
        </div>

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
    ...mapActions([
      'getVehicleById',
      'checkVehicleAvailability',
      'createBooking',
    ]),

    async fetchVehicle() {
      this.loading = true;
      this.errorMessage = null;
      this.vehicle = null;
      try {
        const fetchedVehicle = await this.getVehicleById(this.id);
        this.vehicle = fetchedVehicle;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          'Failed to load vehicle details. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    async bookVehicle() {
      this.bookingLoading = true;
      this.bookingErrorMessage = null;
      this.bookingSuccessMessage = null;

      if (!this.isAuthenticated) {
        this.bookingErrorMessage = 'Please log in to book a vehicle.';
        this.$router.push('/login');
        this.bookingLoading = false;
        return;
      }

      if (!this.bookingForm.startDate || !this.bookingForm.endDate) {
        this.bookingErrorMessage =
          'Please select both pick-up and return dates.';
        this.bookingLoading = false;
        return;
      }

      const startDate = DateTime.fromISO(this.bookingForm.startDate);
      const endDate = DateTime.fromISO(this.bookingForm.endDate);

      if (!startDate.isValid || !endDate.isValid || startDate > endDate) {
        this.bookingErrorMessage =
          'Invalid date range. Ensure return date is after pick-up date.';
        this.bookingLoading = false;
        return;
      }

      const isoStartDate = startDate.toISODate();
      const isoEndDate = endDate.toISODate();

      try {
        const availabilityResponse = await this.checkVehicleAvailability({
          vehicleId: this.vehicle.id,
          startDate: isoStartDate,
          endDate: isoEndDate,
        });

        if (availabilityResponse.isAvailable === true) {
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

          const createBookingResponse = await this.createBooking(
            bookingPayload
          );
          const bookingId = createBookingResponse.id;

          if (bookingId) {
            this.$router.push({
              name: 'BookingPayment',
              params: { bookingId: bookingId },
            });
          } else {
            this.bookingErrorMessage =
              'Booking created but no booking ID received. Please try again.';
          }
        } else {
          this.bookingErrorMessage =
            availabilityResponse.message ||
            'Vehicle is not available for the selected dates.';
        }
      } catch (error) {
        this.bookingErrorMessage =
          error.response?.data?.message ||
          'Failed to book vehicle. Please try again.';
        this.bookingSuccessMessage = null;
      } finally {
        this.bookingLoading = false;
      }
    },
  },
  mounted() {
    this.fetchVehicle();
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';
/* Import Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.vehicle-detail-container {
  padding: 1.5rem;
  width: 100%;
  background-color: #fff;
  font-family: 'Inter', sans-serif;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #718096;
}

.error-message {
  color: #ef4444;
  font-weight: 600;
  background-color: #fee2e2;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.vehicle-details-content {
  background-color: transparent;
  border-radius: 12px;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.card-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.vehicle-info-section {
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.vehicle-name {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 0.25rem;
}

.vehicle-year {
  font-size: 1.125rem;
  color: #718096;
  margin-bottom: 1rem;
}

.vehicle-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c52ff;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1rem 0;
}

.specifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem 1rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-color {
  font-size: 1.25rem;
  color: #2c52ff;
}

.spec-details {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #a0aec0;
}

.spec-value {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
}
</style>