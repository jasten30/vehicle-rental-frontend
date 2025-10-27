<template>
  <div v-if="vehicle" class="page-container">
    <div class="details-and-booking-container">
      <VehicleDetailsBox :vehicle="vehicle" />

      <!-- This component now only passes down the necessary data. -->
      <!-- All booking logic is handled inside BookingBox. -->
      <BookingBox
        :vehicle="vehicle"
        :unavailable-dates="unavailableDates"
      />
    </div>

    <div class="full-width-section">
      <h3>Vehicle Location</h3>
      <div id="map-container" class="vehicle-map"></div>
    </div>

    <!-- ================================== -->
    <!-- UPDATED RECOMMENDATIONS SECTION      -->
    <!-- ================================== -->
    <div class="full-width-section">
      <h3>{{ recommendationTitle }}</h3>
      
      <!-- Loading state for recommendations -->
      <div v-if="loadingRecommendations" class="loading-state small">
        <p>Loading recommendations...</p>
      </div>

      <!-- Grid for recommended assets -->
      <div v-else-if="recommendedAssets.length > 0" class="recommended-cars-grid">
        <VehicleCard
          v-for="asset in recommendedAssets"
          :key="asset.id"
          :vehicle="asset"
        />
      </div>

       <!-- Empty state for recommendations -->
      <div v-else class="empty-state small">
        <p>No other similar vehicles found.</p>
      </div>
    </div>
    <!-- ================================== -->

  </div>
  <div v-else class="loading-state">
    <p>Loading vehicle details...</p>
  </div>
</template>

<script>
import { nextTick } from "vue";
import { mapGetters, mapActions } from 'vuex'; // <-- IMPORT VUEX HELPERS
import VehicleDetailsBox from "./VehicleDetailsBox.vue";
import BookingBox from "./BookingBox.vue";
import VehicleCard from "@/components/VehicleCard.vue"; // <-- IMPORT VEHICLE CARD

export default {
  name: "VehicleDetailsAndBooking",
  components: {
    VehicleDetailsBox,
    BookingBox,
    VehicleCard, // <-- REGISTER VEHICLE CARD
  },
  props: {
    vehicle: Object,
    unavailableDates: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      mapInstance: null,
      loadingRecommendations: true, // <-- NEW DATA PROPERTY
    };
  },
  watch: {
    vehicle(newVehicle) {
      if (newVehicle && newVehicle.location) {
        this.initMap(newVehicle.location);
      }
    },
  },
  computed: {
    // --- NEW COMPUTED PROPERTIES ---
    ...mapGetters(['allVehicles']), // Assumes root getter

    isMotorcycle() {
      return this.vehicle?.assetType === 'motorcycle';
    },
    
    recommendationTitle() {
      return this.isMotorcycle ? 'Recommended Motorcycles' : 'Recommended Vehicles';
    },

    recommendedAssets() {
      if (!this.allVehicles || !this.vehicle) {
        return [];
      }
      
      // Determine the asset type to filter for.
      // Default undefined/null (old car data) to 'vehicle'
      const currentAssetType = this.vehicle.assetType || 'vehicle';
      
      return this.allVehicles
        .filter(v => {
          // 1. Match the asset type (defaulting others to 'vehicle')
          const vAssetType = v.assetType || 'vehicle';
          return vAssetType === currentAssetType;
        })
        .filter(v => {
          // 2. Exclude the current vehicle
          return v.id !== this.vehicle.id;
        })
        // 3. Randomize the list (simple shuffle)
        .sort(() => 0.5 - Math.random())
        // 4. Take the first 4
        .slice(0, 4);
    }
    // --- END NEW ---
  },
  methods: {
    // --- NEW ACTION ---
    ...mapActions(['fetchAllVehicles']), // Assumes root action

    initMap(location) {
      if (location && location.latitude && location.longitude) {
        nextTick(() => {
          if (this.mapInstance) this.mapInstance.remove();
          if (typeof window.L !== "undefined") {
            this.mapInstance = window.L.map("map-container").setView([location.latitude, location.longitude], 13);
            window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(this.mapInstance);
            window.L.marker([location.latitude, location.longitude])
              .addTo(this.mapInstance)
              .bindPopup(`<b>${this.vehicle.make} ${this.vehicle.model}</b>`)
              .openPopup();
          }
        });
      }
    },

    // --- NEW METHOD ---
    async loadVehicleData() {
      this.loadingRecommendations = true;
      try {
        // Fetch all vehicles if they aren't already in the store
        if (!this.allVehicles || this.allVehicles.length === 0) {
          await this.fetchAllVehicles();
        }
      } catch (error) {
        console.error("Error fetching vehicles for recommendations:", error);
      } finally {
        this.loadingRecommendations = false;
      }

      // Initialize the map (existing logic)
      if (this.vehicle) {
        this.initMap(this.vehicle.location);
      }
    }
  },
  mounted() {
    // Call the new method on mount
    this.loadVehicleData();
  },
  beforeUnmount() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  },
};
</script>

<style lang="scss" scoped>
/* Assuming variables.scss is imported via vue.config.js or globally */
@import '@/assets/styles/variables.scss';

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}
.details-and-booking-container {
  display: flex;
  flex-direction: row; // Ensure it's row by default
  gap: 2rem;
  align-items: flex-start;
  padding: 1.5rem;
  font-family: "Inter", sans-serif;
}
@media (max-width: 1024px) {
  .details-and-booking-container {
    flex-direction: column; // Stack on tablet/mobile
  }
}
.loading-state, .empty-state {
  text-align: center;
  font-size: 1.25rem;
  color: $text-color-medium;
  padding: 2rem;
  
  &.small { // For recommendations
    padding: 2rem 1rem;
    font-size: 1rem;
  }
}
.full-width-section {
  width: 100%;
  margin-top: 2rem;
  padding: 0 1.5rem;
  box-sizing: border-box;
}
.full-width-section h3 {
  font-size: 1.5rem;
  color: $text-color-dark;
  font-weight: bold;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid $border-color-light;
}
.vehicle-map {
  width: 100%;
  height: 400px;
  border-radius: 0.75rem;
  border: 1px solid $border-color-light;
}
.recommended-cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); // Use smaller minmax
  gap: 1.5rem 1rem; // Use smaller gap
  margin-top: 1rem;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr); // Max 4 columns
  }
}
</style>
