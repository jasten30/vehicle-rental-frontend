<template>
  <router-link :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }" class="profile-vehicle-card">
    <img :src="primaryImage" alt="Vehicle Image" class="vehicle-image" @error="onImageError" />
    <div class="vehicle-info">
      <h5 class="vehicle-name">{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</h5>
      <!-- Location and Price have been removed -->
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'ProfileVehicleCard',
  props: {
    vehicle: {
      type: Object,
      required: true,
    }
  },
  computed: {
    primaryImage() {
      return this.vehicle.profilePhotoUrl || 
             (this.vehicle.exteriorPhotos && this.vehicle.exteriorPhotos.length > 0 ? this.vehicle.exteriorPhotos[0] : 
             'https://placehold.co/200x150/e2e8f0/666666?text=No+Image'); // Smaller placeholder
    }
  },
  methods: {
    onImageError(event) {
      event.target.src = 'https://placehold.co/200x150/e2e8f0/666666?text=Error';
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.profile-vehicle-card {
  display: flex;
  flex-direction: column; // UPDATED: Stack image on top of name
  gap: 0.75rem; // Space between image and name
  padding: 0.75rem; // Reduced padding
  background-color: $card-background;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-small;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  color: $text-color-dark;

  &:hover {
    box-shadow: $shadow-medium;
    border-color: $primary-color;
  }
}

.vehicle-image {
  width: 100%;
  height: 150px; // UPDATED: Taller image for a grid look
  object-fit: cover;
  border-radius: $border-radius-md;
  flex-shrink: 0;
}

.vehicle-info {
  flex-grow: 1;
  text-align: center; // Center the name
}

.vehicle-name {
  font-size: 1rem; // Slightly smaller name
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
}

/* Removed location and price styles */

</style>