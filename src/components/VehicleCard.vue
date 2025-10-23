<template>
  <!-- The whole card is a link, but the button will override it -->
  <router-link :to="vehicleLink" class="vehicle-card">
    
    <!-- 1. FAVORITE BUTTON -->
    <button
      class="favorite-button"
      @click.prevent.stop="handleFavoriteClick"
      :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
      :class="{ favorited: isFavorited }"
      :disabled="isLoadingFavorite"
    >
      <i class="bi" :class="isFavorited ? 'bi-heart-fill' : 'bi-heart'"></i>
    </button>
    
    <!-- Image Slider -->
    <div class="image-slider">
      <img :src="primaryImage" alt="Vehicle image" class="vehicle-image" @error="onImageError" />
    </div>

    <!-- Vehicle Info -->
    <div class="vehicle-info">
      <h3 class="vehicle-name">{{ vehicle.make }} {{ vehicle.model }}</h3>
      <p class="vehicle-year">{{ vehicle.year }}</p>
      <div class="vehicle-details">
        <span><i class="bi bi-people-fill"></i> {{ vehicle.seats }} seats</span>
        <span><i class="bi bi-gear-fill"></i> {{ vehicle.transmission || 'Auto' }}</span>
      </div>
      <div class="vehicle-price">
        <span class="price-amount">₱{{ vehicle.rentalPricePerDay.toLocaleString() }}</span>
        <span class="price-period">/ day</span>
      </div>
    </div>
  </router-link>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'VehicleCard',
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLoadingFavorite: false, // Prevents double-clicking
    };
  },
  computed: {
    // 2. Import getters for auth status and favorites list
    ...mapGetters(['isAuthenticated', 'userFavorites']),
    
    vehicleLink() {
      return `/vehicles/${this.vehicle.id}`;
    },
    primaryImage() {
      if (this.vehicle.exteriorPhotos && this.vehicle.exteriorPhotos.length > 0) {
        return this.vehicle.exteriorPhotos[0];
      }
      return 'https://placehold.co/400x300/e2e8f0/666666?text=No+Image';
    },
    // 3. Check if this vehicle is in the user's favorites
    isFavorited() {
      // userFavorites comes from the Vuex getter we created
      return this.userFavorites.includes(this.vehicle.id);
    },
  },
  methods: {
    // 4. Import the toggle action from Vuex
    ...mapActions(['toggleFavorite']),
    
    // 5. Handle the click event
    async handleFavoriteClick() {
      // If user is not logged in, redirect to login page
      if (!this.isAuthenticated) {
        this.$router.push('/login');
        return;
      }
      
      // If logged in, toggle the favorite
      this.isLoadingFavorite = true;
      try {
        await this.toggleFavorite(this.vehicle.id);
      } catch (error) {
        console.error('Error toggling favorite from card:', error);
        // Error is handled in the action, but good to log
      } finally {
        this.isLoadingFavorite = false;
      }
    },

    onImageError(event) {
        event.target.src = 'https://placehold.co/400x300/e2e8f0/666666?text=No+Image';
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.vehicle-card {
  text-decoration: none;
  color: $text-color-dark;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  overflow: hidden;
  background: $card-background;
  box-shadow: $shadow-small;
  transition: all 0.2s ease-in-out;
  position: relative; // 👈 Make it a positioning context
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-medium;
  }
}

/* --- Favorite Button Styles --- */
.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid $border-color;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  color: $text-color-dark;

  &:hover {
    background-color: #fff;
    transform: scale(1.1);
  }

  // This class is applied when isFavorited is true
  &.favorited {
    color: $admin-color; // Red color when favorited
  }

  i.bi-heart-fill {
    color: $admin-color;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}
/* --- End Favorite Button Styles --- */


.image-slider {
  width: 100%;
  height: 200px;
  background-color: #f4f4f4;
}

.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vehicle-info {
  padding: $spacing-md;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.vehicle-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 $spacing-sm 0;
}

.vehicle-year {
  font-size: 0.9rem;
  color: $text-color-medium;
  margin-bottom: $spacing-md;
}

.vehicle-details {
  display: flex;
  gap: $spacing-md;
  font-size: 0.9rem;
  color: $text-color-medium;
  margin-bottom: $spacing-md;
  
  span {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.vehicle-price {
  margin-top: auto; // Pushes price to the bottom
  padding-top: $spacing-sm;
  border-top: 1px solid $border-color-light;
  
  .price-amount {
    font-size: 1.2rem;
    font-weight: 700;
  }
  .price-period {
    font-size: 0.9rem;
    color: $text-color-medium;
  }
}
</style>

