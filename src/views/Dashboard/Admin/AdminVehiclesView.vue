<template>
  <div class="admin-page-container">
    <h2 class="section-title">Manage All Vehicles</h2>
    <p class="section-subtitle">
      View, edit, or remove any vehicle listing on the platform.
    </p>

    <div v-if="loading" class="loading-state">
      <p>Loading all vehicles...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>Failed to load vehicles. Please try again.</p>
      <button @click="fetchData" class="button primary">Retry</button>
    </div>
    <div v-else-if="allVehicles.length === 0" class="empty-state">
      <p>No vehicles have been listed yet.</p>
    </div>

    <div v-else class="vehicle-grid">
      <div v-for="vehicle in allVehicles" :key="vehicle.id" class="admin-vehicle-card">
        <img :src="vehicle.exteriorPhotos[0]" alt="Vehicle Image" class="vehicle-image" />
        <div class="card-content">
          <h3 class="vehicle-name">{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</h3>
          <p class="vehicle-owner">Owner Email: {{ vehicle.ownerEmail || 'N/A' }}</p>
          <p class="vehicle-price">₱{{ vehicle.rentalPricePerDay.toLocaleString() }} / day</p>
        </div>
        <div class="card-actions">
          <button @click="viewVehicle(vehicle.id)" class="button secondary">View</button>
          <button @click="editVehicle(vehicle.id)" class="button primary">Edit</button>
          <button @click="deleteVehicle(vehicle.id)" class="button danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'AdminVehiclesView',
  data() {
    return {
      loading: true,
      error: null,
    };
  },
  computed: {
    ...mapGetters(['allVehicles']),
  },
  methods: {
    ...mapActions(['fetchAllVehicles']), // We use the existing action from the store

    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchAllVehicles();
      } catch (err) {
        this.error = 'An error occurred while fetching vehicle data.';
        console.error('[AdminVehiclesView] Fetch error:', err);
      } finally {
        this.loading = false;
      }
    },

    viewVehicle(vehicleId) {
      // Navigates to the public detail page for the vehicle
      this.$router.push({ name: 'VehicleDetail', params: { id: vehicleId } });
    },

    editVehicle(vehicleId) {
      // Navigates to the existing form for editing a vehicle
      this.$router.push({ name: 'EditVehicle', params: { vehicleId: vehicleId } });
    },

    deleteVehicle(vehicleId) {
      if (confirm('Are you sure you want to permanently delete this vehicle? This action cannot be undone.')) {
        // TODO: Create a Vuex action and backend endpoint to delete the vehicle
        console.log(`Request to delete vehicle with ID: ${vehicleId}`);
        alert('Delete functionality is not yet implemented.');
      }
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-bottom: 2.5rem;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: $text-color-medium;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.admin-vehicle-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-medium;
  }
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
  flex-grow: 1;
}

.vehicle-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin: 0 0 0.5rem 0;
}

.vehicle-owner {
  font-size: 0.9rem;
  color: $text-color-medium;
  margin: 0 0 1rem 0;
}

.vehicle-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid $border-color;
  padding-top: 1rem;
  margin-top: 1rem;
}

.button {
  flex: 1;
  padding: 0.6rem;
  border-radius: $border-radius-md;
  border: none;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s ease;
  
  &.primary {
    background-color: $primary-color;
    color: white;
    &:hover { background-color: darken($primary-color, 10%); }
  }

  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
     &:hover { background-color: darken(#e5e7eb, 10%); }
  }
  
  &.danger {
    background-color: $admin-color;
    color: white;
     &:hover { background-color: darken($admin-color, 10%); }
  }
}
</style>