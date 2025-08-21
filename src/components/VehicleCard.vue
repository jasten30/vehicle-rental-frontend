<!-- src/components/VehicleCard.vue -->
<template>
  <div class="vehicle-card">
    <img :src="vehicle.imageUrl"
         :alt="`${vehicle.make} ${vehicle.model}`"
         class="vehicle-image"
         @error="handleImageError">
    <div class="card-content">
      <h2 class="card-title">{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</h2>
      <p class="card-location"><i class="fas fa-map-marker-alt"></i> {{ vehicle.location }}</p>
      <p class="card-price">₱{{ vehicle.rentalPricePerDay }} / day</p>
      <!-- router-link is a Vue Router component, so this assumes it's configured -->
      <router-link :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }" class="view-details-button">
        View Details
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// The 'defineProps' macro is used to define the props, but the 'props' variable
// itself is no longer needed in the script setup block since the props are
// automatically exposed to the template.
defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
});

const handleImageError = (event) => {
  event.target.src = `https://placehold.co/300x200/cccccc/333333?text=No+Image`;
};
</script>

<style scoped>
.vehicle-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.vehicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.card-location {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.card-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c52ff;
  margin-bottom: 1rem;
}

.view-details-button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #2c52ff;
  color: white;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.view-details-button:hover {
  background-color: #2544d6;
}
</style>
