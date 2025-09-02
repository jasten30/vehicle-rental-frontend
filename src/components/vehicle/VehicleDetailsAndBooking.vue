<!-- frontend/src/components/vehicle/VehicleDetailsAndBooking.vue -->
<template>
  <div v-if="vehicle" class="page-container">
    <div class="details-and-booking-container">
      <VehicleDetailsBox :vehicle="vehicle" />

      <BookingBox :vehicle="vehicle" />
    </div>

    <div class="full-width-section">
      <h3>Vehicle Location</h3>
      <div id="map-container" class="vehicle-map"></div>
    </div>

    <div class="full-width-section">
      <h3>Recommended Cars</h3>
      <div class="recommended-cars-grid">
        <div v-for="car in recommendedCars" :key="car.id" class="car-card">
          <img :src="car.imageUrl" :alt="car.make" class="car-image" />
          <div class="car-details">
            <h4 class="car-model">{{ car.make }} {{ car.model }}</h4>
            <span class="car-rating">
              <span class="star-icon-small">★</span>
              {{ car.rating.toFixed(1) }} ({{ car.trips }} trips)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <p>Loading vehicle details...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import VehicleDetailsBox from "./VehicleDetailsBox.vue";
import BookingBox from "./BookingBox.vue";


const store = useStore();
const route = useRoute();

const vehicle = ref(null);
let mapInstance = null;

// Reactive state for recommended cars
const recommendedCars = ref([]);

const allCars = ref([
  {
    id: 1,
    make: "Toyota",
    model: "Corolla",
    rating: 4.8,
    trips: 15,
    imageUrl: "https://placehold.co/400x300/4F46E5/ffffff?text=Toyota+Corolla",
  },
  {
    id: 2,
    make: "Honda",
    model: "Civic",
    rating: 4.9,
    trips: 22,
    imageUrl: "https://placehold.co/400x300/2563EB/ffffff?text=Honda+Civic",
  },
  {
    id: 3,
    make: "Ford",
    model: "Mustang",
    rating: 4.7,
    trips: 18,
    imageUrl: "https://placehold.co/400x300/F59E0B/ffffff?text=Ford+Mustang",
  },
  {
    id: 4,
    make: "Tesla",
    model: "Model 3",
    rating: 5.0,
    trips: 35,
    imageUrl: "https://placehold.co/400x300/DB2777/ffffff?text=Tesla+Model+3",
  },
  {
    id: 5,
    make: "Nissan",
    model: "Titan",
    rating: 4.6,
    trips: 12,
    imageUrl: "https://placehold.co/400x300/10B981/ffffff?text=Nissan+Titan",
  },
  {
    id: 6,
    make: "Subaru",
    model: "Outback",
    rating: 4.8,
    trips: 28,
    imageUrl: "https://placehold.co/400x300/6366F1/ffffff?text=Subaru+Outback",
  },
]);

// Function to get a random subset of cars
const getRandomCars = (count) => {
  const shuffled = [...allCars.value].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Fetch vehicle data and initialize map in onMounted
onMounted(async () => {
  const vehicleId = route.params.id;
  if (!vehicleId) {
    console.error("Vehicle ID is missing from the route parameters.");
    return;
  }

  try {
    // Populate recommended cars as soon as the component is mounted
    recommendedCars.value = getRandomCars(3);

    // Directly fetch the vehicle details without forcing a login.
    await store.dispatch("getVehicleById", vehicleId);
    vehicle.value = store.state.vehicle;

    // If a vehicle is found, initialize the Leaflet map
    if (vehicle.value) {
      if (
        vehicle.value.location &&
        vehicle.value.location.latitude &&
        vehicle.value.location.longitude
      ) {
        const { latitude, longitude } = vehicle.value.location;

        // Use nextTick to ensure the DOM is updated before trying to create the map
        nextTick(() => {
          // Check if the global L object exists before using it
          if (typeof window.L !== "undefined") {
            mapInstance = window.L.map("map-container").setView(
              [latitude, longitude],
              13
            );

            // Add the OpenStreetMap tile layer
            window.L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              {
                maxZoom: 19,
                attribution:
                  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              }
            ).addTo(mapInstance);

            // Add a marker for the vehicle's location
            window.L.marker([latitude, longitude])
              .addTo(mapInstance)
              .bindPopup(
                `<b>${vehicle.value.make} ${vehicle.value.model}</b><br>
                  <small>Lat: ${latitude}, Lng: ${longitude}</small>`
              )
              .openPopup();
          } else {
            console.error(
              "Leaflet (L) is not defined. Ensure it's loaded in your index.html."
            );
          }
        });
      }
    }
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
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

/* NEW SECTION: Full-width map */
.full-width-section {
  width: 100%;
  margin-top: 2rem;
  padding: 0 1.5rem; /* Match the side padding of the container */
  box-sizing: border-box; /* Include padding in width calculation */
}
.full-width-section h3 {
  font-size: 1.5rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* NEW: Styles for the Leaflet map container */
.vehicle-map {
  width: 100%;
  height: 400px; /* Give the map a fixed height */
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

/* NEW: Recommended Cars Section Styles */
.recommended-cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.car-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease-in-out;
}

.car-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0,
    0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.05);
}

.car-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.car-details {
  padding: 1rem;
}

.car-model {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.car-rating {
  font-size: 0.9rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.star-icon-small {
  font-size: 1rem;
  color: #8c73ff;
  margin-right: 0.25rem;
}
</style>