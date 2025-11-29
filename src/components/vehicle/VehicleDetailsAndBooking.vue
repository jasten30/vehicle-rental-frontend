<template>
  <div v-if="vehicle" class="page-container">
    <div class="details-and-booking-container">
      <VehicleDetailsBox :vehicle="vehicle" />

      <!-- This component now only passes down the necessary data. -->
      <!-- All booking logic is handled inside BookingBox. -->
      <BookingBox :vehicle="vehicle" :unavailable-dates="unavailableDates" />
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
      <div
        v-else-if="recommendedAssets.length > 0"
        class="recommended-cars-grid"
      >
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
import { mapGetters, mapActions } from "vuex"; // <-- IMPORT VUEX HELPERS
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
    ...mapGetters(["allVehicles"]), // Assumes root getter

    isMotorcycle() {
      return this.vehicle?.assetType === "motorcycle";
    },

    recommendationTitle() {
      return this.isMotorcycle
        ? "Recommended Motorcycles"
        : "Recommended Vehicles";
    },

    recommendedAssets() {
      if (!this.allVehicles || !this.vehicle) {
        return [];
      }

      // Determine the asset type to filter for.
      // Default undefined/null (old car data) to 'vehicle'
      const currentAssetType = this.vehicle.assetType || "vehicle";

      return (
        this.allVehicles
          .filter((v) => {
            // 1. Match the asset type (defaulting others to 'vehicle')
            const vAssetType = v.assetType || "vehicle";
            return vAssetType === currentAssetType;
          })
          .filter((v) => {
            // 2. Exclude the current vehicle
            return v.id !== this.vehicle.id;
          })
          // 3. Randomize the list (simple shuffle)
          .sort(() => 0.5 - Math.random())
          // 4. Take the first 4
          .slice(0, 4)
      );
    },
    // --- END NEW ---
  },
  methods: {
    // --- NEW ACTION ---
    ...mapActions(["fetchAllVehicles"]), // Assumes root action

    initMap(location) {
      if (location && location.latitude && location.longitude) {
        nextTick(() => {
          if (this.mapInstance) this.mapInstance.remove();
          if (typeof window.L !== "undefined") {
            this.mapInstance = window.L.map("map-container").setView(
              [location.latitude, location.longitude],
              13
            );
            window.L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              {
                maxZoom: 19,
                attribution:
                  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              }
            ).addTo(this.mapInstance);
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
    },
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
@import "@/assets/styles/variables.scss";

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* --- Main Layout Wrapper --- */
.details-and-booking-container {
  display: flex;
  flex-direction: column; /* Mobile: Stack vertically */
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1rem; /* Reduced padding for mobile */
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
  width: 100%;

  /* Desktop: Switch to Row */
  @media (min-width: 1024px) {
    flex-direction: row;
    padding: 2rem 1.5rem;
    gap: 3rem;
  }
}

/* --- Empty / Loading States --- */
.loading-state,
.empty-state {
  text-align: center;
  font-size: 1rem;
  color: $text-color-medium;
  padding: 3rem 1rem;
  width: 100%;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }

  &.small {
    padding: 2rem 1rem;
    font-size: 0.9rem;
  }
}

/* --- Bottom Sections (Map, Reviews, Recs) --- */
.full-width-section {
  width: 100%;
  margin-top: 2rem;
  padding: 0 1rem; /* Match container padding */
  box-sizing: border-box;

  @media (min-width: 1024px) {
    padding: 0 1.5rem;
    margin-top: 3rem;
  }
}

.full-width-section h3 {
  font-size: 1.25rem;
  color: $text-color-dark;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid $border-color-light;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
}

/* --- Map --- */
.vehicle-map {
  width: 100%;
  height: 250px; /* Shorter on mobile so it doesn't block scrolling */
  border-radius: $border-radius-md;
  border: 1px solid $border-color-light;
  object-fit: cover;

  @media (min-width: 768px) {
    height: 400px; /* Taller on tablets/desktop */
  }
}

/* --- Recommended Cars Grid --- */
.recommended-cars-grid {
  display: grid;
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;

  /* Tablet: 2 Columns */
  @media (min-width: 550px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  /* Desktop: 3 Columns */
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Large Desktop: 4 Columns */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
