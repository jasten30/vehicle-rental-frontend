<!-- frontend/src/views/Dashboard/Owner/OwnerVehiclesView.vue -->
<template>
  <div class="owner-vehicles-container">
    <h2 class="section-title">My Listings</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading your vehicles...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchOwnerVehicles" class="button primary-button">Retry Load Vehicles</button>
    </div>

    <div v-else-if="!vehicles || vehicles.length === 0" class="no-vehicles-message">
      <!-- REVERTED TO DIV WITH INLINE STYLES FOR ROBUSTNESS -->
      <div style="color: #333 !important; font-size: 1rem !important; margin-bottom: 1rem;">You haven't listed any vehicles yet.</div>
      <button @click="goToAddVehicle" class="button primary-button">Add New Vehicle</button>
    </div>

    <div v-else class="vehicle-list">
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
        <img :src="vehicle.imageUrl || getPlaceholderImage(200, 150, 'cccccc', '333333', 'No Image')"
             :alt="`${vehicle.make} ${vehicle.model}`"
             class="vehicle-image"
             @error="vehicle.imageUrl = getPlaceholderImage(200, 150, 'cccccc', '333333', 'No Image')">
        <div class="vehicle-details">
          <h3>{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</h3>
          <p><strong>License Plate:</strong> {{ vehicle.licensePlate }}</p>
          <p><strong>Daily Rate:</strong> ₱{{ vehicle.rentalPricePerDay }}</p>
          <p><strong>Location:</strong> {{ vehicle.location }}</p>
          <p><strong>Status:</strong> {{ vehicle.status }}</p>
        </div>
        <div class="vehicle-actions">
          <button @click="editVehicle(vehicle.id)" class="button secondary-button">Edit</button>
          <button @click="deleteVehicle(vehicle.id)" class="button cancel-button">Delete</button>
        </div>
      </div>
      <button @click="goToAddVehicle" class="button primary-button add-new-button">Add New Vehicle</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'OwnerVehiclesView',
  data() {
    return {
      loading: true,
      errorMessage: null,
      vehicles: [], // This will hold the vehicles owned by the current user
    };
  },
  computed: {
    ...mapGetters(['user']), // Access the current user from Vuex
  },
  created() {
    // Fetch vehicles when the component is created
    this.fetchOwnerVehicles();
  },
  methods: {
    ...mapActions(['getVehiclesByOwner']), // We added this action to Vuex

    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    async fetchOwnerVehicles() {
      this.loading = true;
      this.errorMessage = null;
      this.vehicles = [];
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User not authenticated or UID not available.");
        }
        // Call the Vuex action to fetch vehicles by the current user's UID
        const fetchedVehicles = await this.getVehiclesByOwner(this.user.uid);
        this.vehicles = fetchedVehicles;
        console.log('[OwnerVehiclesView] Fetched owner vehicles:', this.vehicles);
      } catch (error) {
        console.error('[OwnerVehiclesView] Error fetching owner vehicles:', error);
        this.errorMessage = error.message || 'Failed to load your vehicle listings. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    goToAddVehicle() {
      this.$router.push('/dashboard/owner/vehicles/add'); // Placeholder route for adding a vehicle
    },
    editVehicle(vehicleId) {
      this.$router.push(`/dashboard/owner/vehicles/edit/${vehicleId}`); // Placeholder route for editing
    },
    deleteVehicle(vehicleId) {
      if (confirm('Are you sure you want to delete this vehicle listing? This action cannot be undone.')) {
        console.log(`[OwnerVehiclesView] Deleting vehicle with ID: ${vehicleId}`);
        // Implement actual delete logic here (Vuex action -> API call)
        alert('Delete functionality not yet implemented.');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/variables.scss';

.owner-vehicles-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-message, .error-message, .no-vehicles-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: $text-color-medium; /* This will now control the color of the "You haven't listed..." text */
}

.error-message {
  color: #ef4444;
  font-weight: 600;
  background-color: #fee2e2;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.vehicle-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.vehicle-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #e0e0e0;
}

.vehicle-details {
  padding: 1rem;
  flex-grow: 1;

  h3 {
    font-size: 1.3rem;
    color: $primary-color;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 0.95rem;
    color: $text-color-dark;
    margin-bottom: 0.4rem;
    strong {
      font-weight: 600;
    }
  }
}

.vehicle-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: #f9fafb;
}

.button {
  padding: 0.75rem 1.25rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  border: 1px solid $primary-color;
  &:hover {
    background-color: darken($primary-color, 10%);
    transform: translateY(-2px);
  }
}

.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border: 1px solid $primary-color;
  &:hover {
    background-color: lighten($primary-color, 40%);
    transform: translateY(-2px);
  }
}

.cancel-button {
  background-color: #ef4444;
  color: white;
  border: 1px solid #ef4444;
  &:hover:not(:disabled) {
    background-color: darken(#ef4444, 10%);
    transform: translateY(-2px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.add-new-button {
  margin-top: 2rem;
  width: fit-content;
  justify-self: center;
  grid-column: 1 / -1; /* Span across all columns */
}
</style>
