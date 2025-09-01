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
        <!-- Image Gallery now uses computed properties to get images -->
        <VehicleImageGallery
          :main-image-url="mainImageUrl"
          :thumbnail-urls="thumbnailUrls"
          :vehicle-make="vehicle.make"
          :vehicle-model="vehicle.model"
        />

        <!-- NEW: Section to display vehicle information -->
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

        <!-- Booking component remains the same -->
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
import { mapActions, mapGetters } from "vuex";
import { DateTime } from "luxon";
import VehicleImageGallery from "@/components/vehicle/VehicleImageGallery.vue";
import VehicleDetailsAndBooking from "@/components/vehicle/VehicleDetailsAndBooking.vue";

export default {
  name: "VehicleDetailView",
  components: {
    VehicleImageGallery,
    VehicleDetailsAndBooking,
  },
  props: ["id"],
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
    ...mapGetters(["isAuthenticated", "user"]),
    // Helper to get a placeholder image URL
    getPlaceholderImage() {
      return (width, height, bgColor, textColor, text) => {
        return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
      };
    },
    // Dynamically get the main image from the vehicle data
    mainImageUrl() {
      const defaultUrl = this.getPlaceholderImage(
        800,
        600,
        "e2e8f0",
        "666666",
        "Main+Image"
      );
      if (
        this.vehicle &&
        this.vehicle.exteriorPhotos &&
        this.vehicle.exteriorPhotos.length > 0
      ) {
        return this.vehicle.exteriorPhotos[0];
      }
      return defaultUrl;
    },
    // Dynamically get the thumbnail images from the vehicle data,
    // following the specific order requested by the user
    thumbnailUrls() {
      const urls = [];
      const defaultUrl = this.getPlaceholderImage(
        400,
        300,
        "e2e8f0",
        "666666",
        "Image+Not+Found"
      );

      // First thumbnail: First interior photo
      if (
        this.vehicle &&
        this.vehicle.interiorPhotos &&
        this.vehicle.interiorPhotos.length > 0
      ) {
        urls.push(this.vehicle.interiorPhotos[0]);
      } else {
        urls.push(defaultUrl);
      }

      // Second thumbnail: Second exterior photo
      if (
        this.vehicle &&
        this.vehicle.exteriorPhotos &&
        this.vehicle.exteriorPhotos.length > 1
      ) {
        urls.push(this.vehicle.exteriorPhotos[1]);
      } else {
        urls.push(defaultUrl);
      }

      // Add a couple more placeholders if needed, to match the gallery component's expectations
      // This makes the gallery look complete even with only 1 or 2 photos
      for (let i = urls.length; i < 4; i++) {
        urls.push(
          this.getPlaceholderImage(
            400,
            300,
            "a0a0a0",
            "333333",
            `Thumb+${i + 1}`
          )
        );
      }

      return urls;
    },
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
      "getVehicleById",
      "checkVehicleAvailability",
      "createBooking",
    ]),

    async fetchVehicle() {
      this.loading = true;
      this.errorMessage = null;
      this.vehicle = null;
      try {
        const fetchedVehicle = await this.getVehicleById(this.id);
        this.vehicle = fetchedVehicle;
        console.log("[VehicleDetailView] Fetched vehicle:", this.vehicle);
      } catch (error) {
        console.error(
          "[VehicleDetailView] Error fetching vehicle details:",
          error
        );
        this.errorMessage =
          error.response?.data?.message ||
          "Failed to load vehicle details. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    async bookVehicle() {
      this.bookingLoading = true;
      this.bookingErrorMessage = null;
      this.bookingSuccessMessage = null;

      console.log("[VehicleDetailView] Starting bookVehicle process...");

      if (!this.isAuthenticated) {
        this.bookingErrorMessage = "Please log in to book a vehicle.";
        console.log(
          "[VehicleDetailView] User not authenticated. Redirecting to login."
        );
        this.$router.push("/login");
        this.bookingLoading = false;
        return;
      }

      if (!this.bookingForm.startDate || !this.bookingForm.endDate) {
        this.bookingErrorMessage =
          "Please select both pick-up and return dates.";
        console.log("[VehicleDetailView] Dates not selected.");
        this.bookingLoading = false;
        return;
      }

      const startDate = DateTime.fromISO(this.bookingForm.startDate);
      const endDate = DateTime.fromISO(this.bookingForm.endDate);

      if (!startDate.isValid || !endDate.isValid || startDate > endDate) {
        this.bookingErrorMessage =
          "Invalid date range. Ensure return date is after pick-up date.";
        console.log("[VehicleDetailView] Invalid date range.");
        this.bookingLoading = false;
        return;
      }

      const isoStartDate = startDate.toISODate();
      const isoEndDate = endDate.toISODate();

      try {
        console.log("[VehicleDetailView] Calling checkVehicleAvailability...");
        const availabilityResponse = await this.checkVehicleAvailability({
          vehicleId: this.vehicle.id,
          startDate: isoStartDate,
          endDate: isoEndDate,
        });

        console.log(
          "[VehicleDetailView] Received Availability Response (from Vuex action):",
          availabilityResponse
        );
        console.log(
          "[VehicleDetailView] Type of availabilityResponse.isAvailable:",
          typeof availabilityResponse.isAvailable
        );
        console.log(
          "[VehicleDetailView] Value of availabilityResponse.isAvailable:",
          availabilityResponse.isAvailable
        );

        if (availabilityResponse.isAvailable === true) {
          console.log(
            "[VehicleDetailView] Vehicle is available. Proceeding to create booking..."
          );

          const bookingPayload = {
            vehicleId: this.vehicle.id,
            renterId: this.user.uid,
            startDate: isoStartDate,
            endDate: isoEndDate,
            totalCost: availabilityResponse.totalCost,
            downpaymentAmount: availabilityResponse.downpaymentAmount,
            fullPaymentAmount: availabilityResponse.fullPaymentAmount,
            paymentStatus: "pending_payment_selection",
            paymentDetails: {},
          };

          console.log(
            "[VehicleDetailView] Calling createBooking with payload:",
            bookingPayload
          );
          const createBookingResponse =
            await this.createBooking(bookingPayload);
          console.log(
            "[VehicleDetailView] createBooking Response:",
            createBookingResponse
          );

          const bookingId = createBookingResponse.id;

          if (bookingId) {
            console.log(
              `[VehicleDetailView] Booking created successfully. Redirecting to BookingPayment for bookingId: ${bookingId}`
            );
            this.$router.push({
              name: "BookingPayment",
              params: { bookingId: bookingId },
            });
          } else {
            this.bookingErrorMessage =
              "Booking created but no booking ID received. Please try again.";
            console.error(
              "[VehicleDetailView] Booking created but no booking ID:",
              createBookingResponse
            );
          }
        } else {
          this.bookingErrorMessage =
            availabilityResponse.message ||
            "Vehicle is not available for the selected dates.";
          console.log(
            "[VehicleDetailView] Vehicle not available. Message:",
            this.bookingErrorMessage
          );
        }
      } catch (error) {
        console.error(
          "[VehicleDetailView] Error during booking process (catch block):",
          error
        );
        this.bookingErrorMessage =
          error.response?.data?.message ||
          "Failed to book vehicle. Please try again.";
        this.bookingSuccessMessage = null;
      } finally {
        this.bookingLoading = false;
        console.log("[VehicleDetailView] bookVehicle process finished.");
      }
    },
  },
  mounted() {
    this.fetchVehicle();
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/variables.scss";
/* Import Font Awesome */
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.vehicle-detail-container {
  padding: 1.5rem;
  width: 100%;
  background-color: #fff;
  font-family: "Inter", sans-serif;
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
