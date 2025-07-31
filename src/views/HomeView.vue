<!-- frontend/src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Find Your Perfect Ride, Anytime, Anywhere.</h1>
        <p>Rent a car for your next adventure or earn by sharing your own.</p>
        <router-link to="/vehicles" class="button primary-button">Browse Vehicles</router-link>
      </div>
    </section>

    <section class="how-it-works-section">
      <h2 class="section-title">How It Works</h2>
      <div class="steps-grid">
        <div class="step-card">
          <i class="fas fa-search step-icon"></i>
          <h3>1. Find a Vehicle</h3>
          <p>Browse our wide selection of cars, trucks, and SUVs.</p>
        </div>
        <div class="step-card">
          <i class="fas fa-calendar-check step-icon"></i>
          <h3>2. Book Your Dates</h3>
          <p>Choose your pickup and return dates with flexible options.</p>
        </div>
        <div class="step-card">
          <i class="fas fa-car step-icon"></i>
          <h3>3. Enjoy Your Ride</h3>
          <p>Pick up your vehicle and start your journey!</p>
        </div>
      </div>
    </section>

    <section class="featured-vehicles-section">
      <h2 class="section-title">Featured Vehicles</h2>
      <div v-if="loadingVehicles" class="loading-message">
        <p>Loading featured vehicles...</p>
      </div>
      <div v-else-if="featuredVehicles.length === 0" class="no-vehicles-message">
        <p>No featured vehicles available at the moment.</p>
      </div>
      <div v-else class="vehicle-grid">
        <div v-for="vehicle in featuredVehicles" :key="vehicle.id" class="vehicle-card">
          <img :src="vehicle.imageUrl || getPlaceholderImage(300, 200, 'cccccc', '333333', 'No Image')"
               :alt="`${vehicle.make} ${vehicle.model}`"
               class="vehicle-image"
               @error="vehicle.imageUrl = getPlaceholderImage(300, 200, 'cccccc', '333333', 'No Image')">
          <div class="card-content">
            <h3 class="card-title">{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</h3>
            <p class="card-location"><i class="fas fa-map-marker-alt"></i> {{ vehicle.location }}</p>
            <p class="card-price">₱{{ vehicle.rentalPricePerDay }} / day</p>
            <router-link :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }" class="view-details-button">
              View Details
            </router-link>
          </div>
        </div>
      </div>
      <div v-if="featuredVehicles.length > 0" class="view-all-button-container">
        <router-link to="/vehicles" class="button secondary-button">View All Vehicles</router-link>
      </div>
    </section>

    <section class="call-to-action-section">
      <div class="cta-content">
        <h2>Ready to Start Your Adventure?</h2>
        <p>Join RentCycle today and explore the open road.</p>
        <router-link v-if="!isAuthenticated" to="/register" class="button primary-button">Get Started</router-link>
        <router-link v-else to="/vehicles" class="button primary-button">Browse Vehicles</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'HomeView',
  data() {
    return {
      loadingVehicles: true,
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'allVehicles']),
    featuredVehicles() {
      // Ensure allVehicles is an array before attempting to slice
      if (Array.isArray(this.allVehicles)) {
        // Take the first 3 vehicles as featured
        return this.allVehicles.slice(0, 3);
      }
      return []; // Return an empty array if allVehicles is not an array
    },
  },
  methods: {
    ...mapActions(['fetchAllVehicles']),
    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    async loadFeaturedVehicles() {
      this.loadingVehicles = true;
      try {
        await this.fetchAllVehicles(); // Dispatch the action to load all vehicles into the store
      } catch (error) {
        console.error('Error loading featured vehicles:', error);
      } finally {
        this.loadingVehicles = false;
      }
    },
  },
  created() {
    this.loadFeaturedVehicles();
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.home-container {
  font-family: $font-family-base;
  color: $text-color-dark;
}

.button {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  border-radius: $border-radius-md;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
  text-align: center;
  cursor: pointer;

  &.primary-button {
    background-color: $primary-color;
    color: white;
    border: 1px solid $primary-color;

    &:hover {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
    }
  }

  &.secondary-button {
    background-color: transparent;
    color: $primary-color;
    border: 1px solid $primary-color;

    &:hover {
      background-color: lighten($primary-color, 40%);
      transform: translateY(-2px);
    }
  }
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://placehold.co/1920x600/333333/FFFFFF?text=Hero+Image') no-repeat center center;
  background-size: cover;
  color: white;
  text-align: center;
  padding: 8rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  border-radius: $border-radius-lg;
  margin-bottom: 3rem;
  box-shadow: $shadow-medium;

  .hero-content {
    max-width: 800px;
  }

  h1 {
    font-size: 3.8rem;
    margin-bottom: 1rem;
    font-weight: 800;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  p {
    font-size: 1.5rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $primary-color;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: $secondary-color;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.how-it-works-section {
  padding: 4rem 2rem;
  background-color: $background-color;
  border-radius: $border-radius-lg;
  margin-bottom: 3rem;
  box-shadow: $shadow-light;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.step-card {
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  text-align: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-hover;
  }

  .step-icon {
    font-size: 3.5rem;
    color: $primary-color;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.6rem;
    font-weight: 700;
    color: $text-color-dark;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.1rem;
    color: $text-color-medium;
  }
}

.featured-vehicles-section {
  padding: 4rem 2rem;
  background-color: $card-background;
  border-radius: $border-radius-lg;
  margin-bottom: 3rem;
  box-shadow: $shadow-light;
}

.loading-message, .no-vehicles-message {
  text-align: center;
  color: $text-color-medium;
  font-style: italic;
  font-size: 1.2rem;
  padding: 3rem;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.vehicle-card {
  background-color: $card-background;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-hover;
  }
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.card-location {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 0.75rem;

  .fas {
    margin-right: 0.5rem;
    color: $primary-color;
  }
}

.card-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: $secondary-color;
  margin-top: auto;
  margin-bottom: 1rem;
}

.view-details-button {
  display: block;
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.view-all-button-container {
  text-align: center;
  margin-top: 3rem;
}

.call-to-action-section {
  background-color: $primary-color;
  color: white;
  text-align: center;
  padding: 5rem 2rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;

  .cta-content {
    max-width: 700px;
    margin: 0 auto;
  }

  h2 {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    opacity: 0.9;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  .button {
    background-color: $secondary-color;
    color: $text-color-dark;
    border: 1px solid $secondary-color;

    &:hover {
      background-color: darken($secondary-color, 10%);
      transform: translateY(-2px);
    }
  }
}
</style>
