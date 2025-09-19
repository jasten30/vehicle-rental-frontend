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

    <div class="full-width-section">
      <h3>Recommended Cars</h3>
      <div class="recommended-cars-grid">
        <!-- Recommended cars content -->
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <p>Loading vehicle details...</p>
  </div>
</template>

<script>
import { nextTick } from "vue";
import VehicleDetailsBox from "./VehicleDetailsBox.vue";
import BookingBox from "./BookingBox.vue";

export default {
  name: "VehicleDetailsAndBooking",
  components: {
    VehicleDetailsBox,
    BookingBox,
  },
  // Props are simplified. This component no longer needs to know about the booking form state.
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
    };
  },
  watch: {
    vehicle(newVehicle) {
      if (newVehicle && newVehicle.location) {
        this.initMap(newVehicle.location);
      }
    },
  },
  methods: {
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
  },
  mounted() {
    if (this.vehicle) {
      this.initMap(this.vehicle.location);
    }
  },
  beforeUnmount() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  },
};
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}
.details-and-booking-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 1.5rem;
  font-family: "Inter", sans-serif;
}
@media (max-width: 1024px) {
  .details-and-booking-container {
    flex-direction: column;
  }
}
.loading-state {
  text-align: center;
  font-size: 1.25rem;
  color: #6b7280;
  padding: 2rem;
}
.full-width-section {
  width: 100%;
  margin-top: 2rem;
  padding: 0 1.5rem;
  box-sizing: border-box;
}
.full-width-section h3 {
  font-size: 1.5rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 1rem;
}
.vehicle-map {
  width: 100%;
  height: 400px;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.recommended-cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}
</style>

