<template>
  <div class="vehicle-detail-container">
    <h2 class="section-title">Vehicle Details</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading vehicle details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchVehicle" class="button primary-button">Retry Load Vehicle</button>
    </div>

    <div v-else-if="vehicle" class="vehicle-details-content">
      <div class="card-header">
        <h3 class="vehicle-name">{{ vehicle.make }} {{ vehicle.model }}</h3>
        <span class="vehicle-year">({{ vehicle.year }})</span>
      </div>

      <div class="card-body">
        <!-- New Image Gallery Component -->
        <VehicleImageGallery
          :main-image-url="vehicle.imageUrl"
          :thumbnail-urls="thumbnailImages"
          :vehicle-make="vehicle.make"
          :vehicle-model="vehicle.model"
        />

        <div class="details-and-booking-section">
          <!-- Details Box -->
          <div class="details-box">
            <h4>Details</h4>
            <div class="detail-line"><strong>License Plate:</strong> {{ vehicle.licensePlate }}</div>
            <div class="detail-line"><strong>Daily Rate:</strong> ₱{{ vehicle.rentalPricePerDay }}</div>
            <div class="detail-line"><strong>Location:</strong> {{ vehicle.location }}</div>
            <div v-if="vehicle.description" class="detail-line"><strong>Description:</strong> {{ vehicle.description }}</div>
            <div v-if="vehicle.status" class="detail-line"><strong>Status:</strong> {{ vehicle.status }}</div>
            <div v-if="vehicle.ownerId" class="detail-line"><strong>Owner ID:</strong> {{ vehicle.ownerId }}</div>
          </div>

          <!-- Booking Section -->
          <div class="booking-section">
            <h3>Book This Vehicle</h3>
            <div class="form-group">
              <label for="pickupDate">Pick-up Date:</label>
              <input type="date" id="pickupDate" v-model="bookingForm.startDate" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="returnDate">Return Date:</label>
              <input type="date" id="returnDate" v-model="bookingForm.endDate" class="form-input" required>
            </div>
            <button @click="bookVehicle" :disabled="bookingLoading" class="button primary-button">
              <span v-if="bookingLoading">Booking...</span>
              <span v-else>Reserve</span>
            </button>
            <div v-if="bookingErrorMessage" class="error-message booking-error">
              {{ bookingErrorMessage }}
            </div>
            <div v-if="bookingSuccessMessage" class="success-message booking-success">
              {{ bookingSuccessMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import VehicleImageGallery from '@/components/vehicle/VehicleImageGallery.vue'; // Import the new component

export default {
  name: 'VehicleDetailView',
  components: {
    VehicleImageGallery, // Register the new component
  },
  props: ['id'], // Vehicle ID from route params
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
      // Mock thumbnail images. You'll replace these with real data.
      thumbnailImages: [
        this.getPlaceholderImage(400, 300, 'c0c0c0', '333333', 'Thumb 1'),
        this.getPlaceholderImage(400, 300, 'a0a0a0', '333333', 'Thumb 2'),
        this.getPlaceholderImage(400, 300, 'd0d0d0', '333333', 'Thumb 3'),
        this.getPlaceholderImage(400, 300, 'b0b0b0', '333333', 'More Photos'),
      ],
    };
  },
  computed: {
    // eslint-disable-next-line no-unused-vars
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

            // UPDATED: Payload for createBooking endpoint
            const bookingPayload = {
              vehicleId: this.vehicle.id,
              renterId: this.user.uid, // Assuming user.uid is available from Vuex getter
              startDate: isoStartDate,
              endDate: isoEndDate,
              totalCost: availabilityResponse.totalCost,
              downpaymentAmount: availabilityResponse.downpaymentAmount,
              fullPaymentAmount: availabilityResponse.fullPaymentAmount,
              paymentStatus: 'pending_payment_selection', // Initial status
              paymentDetails: {}, // Empty for now, will be filled upon payment method selection
            };

            console.log('[VehicleDetailView] Calling createBooking with payload:', bookingPayload);
            const createBookingResponse = await this.createBooking(bookingPayload); // Call the new createBooking action
            console.log('[VehicleDetailView] createBooking Response:', createBookingResponse);
            
            const bookingId = createBookingResponse.id; // Get the ID from the created booking

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

.vehicle-detail-container {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
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
  box-shadow: none; // Removed box shadow
  overflow: hidden;
}

.card-header {
  background-color: transparent; 
  padding: 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.details-and-booking-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.details-box {
  flex-grow: 1;
  background-color: transparent; 
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  padding: 1.5rem;

  h4 {
    font-size: 1.25rem;
    color: $primary-color;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
  }

  .detail-line {
    font-size: 1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
    strong {
      font-weight: 600;
    }
  }
}

.booking-section {
  background-color: transparent; 
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  padding: 1.5rem;

  h3 {
    font-size: 1.5rem;
    color: $primary-color;
    margin-bottom: 1.5rem;
    text-align: center;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: $text-color-dark;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
  width: 100%;
  margin-top: 1rem;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.booking-error, .booking-success {
  margin-top: 1rem;
  text-align: center;
}
</style>
