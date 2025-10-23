<template>
  <div class="favorites-container">
    <h1 class="page-title">My Favorites</h1>
    <p class="page-subtitle">Your saved vehicles for future trips.</p>

    <div v-if="loading" class="info-state">
      <p>Loading your favorites...</p>
    </div>
    
    <div v-else-if="favoriteVehicles.length === 0" class="info-state">
      <i class="bi bi-heartbreak-fill"></i>
      <p>You haven't saved any vehicles yet.</p>
      <router-link to="/vehicles" class="button primary-button">Find Vehicles</router-link>
    </div>

    <div v-else class="vehicle-grid">
      <VehicleCard
        v-for="vehicle in favoriteVehicles"
        :key="vehicle.id"
        :vehicle="vehicle"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import VehicleCard from '@/components/VehicleCard.vue'; // We re-use the same card

export default {
  name: 'MyFavoritesView',
  components: {
    VehicleCard,
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    ...mapGetters([
        'allVehicles',     // From your vehicle module/store
        'userFavorites'    // From your auth module/store
    ]),
    
    /**
     * Filters the main vehicle list to get only the
     * full vehicle objects that are in the user's favorites list.
     */
    favoriteVehicles() {
      if (!this.allVehicles.length || !this.userFavorites.length) {
        return [];
      }
      
      // Create a Set for faster lookups
      const favoriteIds = new Set(this.userFavorites);
      
      return this.allVehicles.filter(vehicle => 
        favoriteIds.has(vehicle.id)
      );
    }
  },
  methods: {
    ...mapActions(['fetchAllVehicles']), // Assumes this action loads all vehicles
    
    async loadData() {
      this.loading = true;
      try {
        // Only fetch all vehicles if they aren't already in the store
        if (this.allVehicles.length === 0) {
          await this.fetchAllVehicles();
        }
      } catch (error) {
        console.error("Error loading vehicles for favorites:", error);
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.loadData();
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.favorites-container {
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
.page-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-bottom: 2.5rem;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem 1.5rem;
}

.info-state {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: $text-color-medium;

  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: $text-color-medium;
  }
  
  .button {
    margin-top: 1.5rem;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }
}

/* Re-using button styles from other components */
.button {
  padding: 0.85rem 1.5rem;
  border-radius: $border-radius-sm;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
  text-decoration: none;
  display: inline-block;
}
.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
}
</style>
