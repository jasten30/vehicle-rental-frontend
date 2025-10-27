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
        
        <!-- === UPDATED: Conditional Seats/CC === -->
        <span v-if="isMotorcycle">
          <i class="bi bi-speedometer2"></i> {{ vehicle.engineDisplacement || 'N/A' }} cc
        </span>
        <span v-else>
          <i class="bi bi-people-fill"></i> {{ vehicle.seats || vehicle.seatingCapacity || 'N/A' }} seats
        </span>
        <!-- ======================================= -->
        
        <span><i class="bi bi-gear-fill"></i> {{ vehicle.transmission || 'Auto' }}</span>
      </div>
      <div class="vehicle-price">
        <span class="price-amount">₱{{ vehicle.rentalPricePerDay ? vehicle.rentalPricePerDay.toLocaleString() : 'N/A' }}</span>
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
    // 2. Import getters from the ROOT store
    // Assumes your getters are in the root state
    ...mapGetters(['isAuthenticated', 'userFavorites']),
    
    vehicleLink() {
      return `/vehicles/${this.vehicle.id}`;
    },
    primaryImage() {
       // Use profile photo first, then first exterior, then placeholder
       // This matches the logic from the previous (overwritten) card
      return this.vehicle.profilePhotoUrl || 
             (this.vehicle.exteriorPhotos && this.vehicle.exteriorPhotos.length > 0 ? this.vehicle.exteriorPhotos[0] : 
             'https://placehold.co/400x300/e2e8f0/666666?text=No+Image');
    },
    // 3. Check if this vehicle is in the user's favorites
    isFavorited() {
      // userFavorites comes from the Vuex getter
      // Ensure userFavorites is an array
      if (!Array.isArray(this.userFavorites)) {
          return false;
      }
      return this.userFavorites.includes(this.vehicle.id);
    },

    // --- NEW COMPUTED PROPERTY ---
    isMotorcycle() {
      return this.vehicle.assetType === 'motorcycle';
    }
  },
  methods: {
    // 4. Import the toggle action from the ROOT store
    // Assumes 'toggleFavorite' is in your root actions.
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
  position: relative; 
  display: flex;
  flex-direction: column;
  height: 100%; 

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-medium;
  }
}

/* --- Favorite Button Styles --- */
.favorite-button {
  position: absolute;
  top: 10px; // UPDATED: Smaller spacing
  right: 10px; // UPDATED: Smaller spacing
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid $border-color;
  border-radius: 50%;
  width: 32px; // UPDATED: Smaller button
  height: 32px; // UPDATED: Smaller button
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  font-size: 1rem; // UPDATED: Smaller icon
  color: $text-color-dark;

  &:hover {
    background-color: #fff;
    transform: scale(1.1);
  }

  &.favorited {
    color: $admin-color; 
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
  height: 180px; // UPDATED: Smaller image height
  background-color: #f4f4f4;
  overflow: hidden; 
}

.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
   .vehicle-card:hover & {
    transform: scale(1.05);
  }
}

.vehicle-info {
  padding: 1rem; // UPDATED: Reduced padding
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.vehicle-name {
  font-size: 1.05rem; // UPDATED: Smaller font size
  font-weight: 700;
  margin: 0 0 0.25rem 0; // UPDATED: Reduced margin
  color: $text-color-dark;
  line-height: 1.3;
}

.vehicle-year {
  font-size: 0.85rem; // UPDATED: Smaller font size
  color: $text-color-medium;
  margin-bottom: $spacing-sm; // UPDATED: Reduced margin
}

.vehicle-details {
  display: flex;
  gap: $spacing-md;
  font-size: 0.85rem; // UPDATED: Smaller font size
  color: $text-color-medium;
  margin-bottom: $spacing-sm; // UPDATED: Reduced margin
  
  span {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    i {
        color: $primary-color;
        font-size: 0.9rem; // UPDATED: Smaller icon
    }
  }
}

.vehicle-price {
  margin-top: auto; 
  padding-top: $spacing-sm; 
  border-top: 1px solid $border-color-light;
  
  .price-amount {
    font-size: 1.15rem; // UPDATED: Smaller font size
    font-weight: 800;
    color: $primary-color;
  }
  .price-period {
    font-size: 0.85rem; // UPDATED: Smaller font size
    color: $text-color-medium;
     margin-left: 0.25rem;
  }
}
</style>

