<template>
  <div class="vehicle-detail-container">
    <div v-if="loading" class="loading-message">
      <p>Loading vehicle details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else-if="vehicle" class="vehicle-details-content">
      <div class="card-body">
        <VehicleImageGallery
          :exterior-photos="vehicle.exteriorPhotos"
          :interior-photos="vehicle.interiorPhotos"
          :vehicle-make="vehicle.make"
          :vehicle-model="vehicle.model"
        />
        <VehicleDetailsAndBooking
          :vehicle="vehicle"
          :unavailable-dates="vehicle.availability || []"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import VehicleImageGallery from "@/components/vehicle/VehicleImageGallery.vue";
import VehicleDetailsAndBooking from "@/components/vehicle/VehicleDetailsAndBooking.vue";

export default {
  name: "VehicleDetailView",
  components: {
    VehicleImageGallery,
    VehicleDetailsAndBooking,
  },
  props: ["id"],
  // Data has been simplified. No more booking-related state here.
  data() {
    return {
      loading: true,
      errorMessage: null,
      vehicle: null,
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) this.fetchVehicle();
      },
    },
  },
  methods: {
    ...mapActions(["getVehicleById"]),
    async fetchVehicle() {
      this.loading = true;
      this.errorMessage = null;
      this.vehicle = null;
      try {
        this.vehicle = await this.getVehicleById(this.id);
      } catch (error) {
        this.errorMessage = "Failed to load vehicle details. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.vehicle-detail-container {
  padding: 1rem; /* Reduced padding for mobile */
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2rem; /* Comfortable padding for tablet/desktop */
  }
}

.loading-message,
.error-message {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1rem;
  color: #718096;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
}

.error-message {
  color: #ef4444;
}

.vehicle-details-content {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.card-body {
  padding: 1.5rem; /* Tighter padding on mobile */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: white; /* Ensure visibility if card style is external */
  border-radius: 8px; /* Standard border radius */

  @media (min-width: 768px) {
    padding: 2.5rem; /* Spacious padding on desktop */
    gap: 2.5rem;
  }
}
</style>
