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
      <router-link to="/vehicles" class="button primary-button"
        >Find Vehicles</router-link
      >
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
import { mapGetters, mapActions } from "vuex";
import VehicleCard from "@/components/VehicleCard.vue"; // We re-use the same card

export default {
  name: "MyFavoritesView",
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
      "allVehicles", // From your vehicle module/store
      "userFavorites", // From your auth module/store
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

      return this.allVehicles.filter((vehicle) => favoriteIds.has(vehicle.id));
    },
  },
  methods: {
    ...mapActions(["fetchAllVehicles"]), // Assumes this action loads all vehicles

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
    },
  },
  created() {
    this.loadData();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.favorites-container {
  padding: 1rem; /* Default mobile padding */
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2rem 2.5rem;
  }
}

.page-title {
  font-size: 1.75rem; /* Smaller on mobile */
  font-weight: 800;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 2.25rem;
    text-align: left;
  }
}

.page-subtitle {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 1.1rem;
    text-align: left;
    margin-bottom: 2.5rem;
  }
}

/* --- RESPONSIVE VEHICLE GRID --- */
.vehicle-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
  gap: 1.5rem;

  /* Tablet: 2 columns */
  @media (min-width: 550px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Small Desktop: 3 columns */
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  /* Large Desktop: 4 columns */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* --- EMPTY STATE --- */
.info-state {
  text-align: center;
  padding: 3rem 1rem; /* Reduced padding for mobile */
  font-size: 1.1rem;
  color: $text-color-medium;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px; /* Ensure vertical centering */

  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: $text-color-light; /* Lighter icon color */
  }

  .button {
    margin-top: 1.5rem;
    font-size: 1rem;
    width: 100%; /* Full width button on mobile */
    max-width: 250px;
  }

  @media (min-width: 768px) {
    padding: 4rem;
    font-size: 1.2rem;

    .button {
      width: auto;
    }
  }
}

/* --- BUTTONS --- */
.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
}
</style>
