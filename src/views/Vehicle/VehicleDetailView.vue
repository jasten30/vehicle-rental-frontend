<template>
  <div class="vehicle-detail-container">
    <div v-if="loading" class="loading-message">
      <p>Loading vehicle details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else-if="vehicle" class="vehicle-details-content">
      <div class="card-body">
        <VehicleImageGallery
          :exterior-photos="vehicle.exteriorPhotos"
          :interior-photos="vehicle.interiorPhotos"
          :vehicle-make="vehicle.make"
          :vehicle-model="vehicle.model"
        />
        <VehicleDetailsAndBooking
          :vehicle="vehicle"
          :unavailable-dates="vehicle.availability || []"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VehicleImageGallery from '@/components/vehicle/VehicleImageGallery.vue';
import VehicleDetailsAndBooking from '@/components/vehicle/VehicleDetailsAndBooking.vue';

export default {
  name: 'VehicleDetailView',
  components: {
    VehicleImageGallery,
    VehicleDetailsAndBooking,
  },
  props: ['id'],
  // Data has been simplified. No more booking-related state here.
  data() {
    return {
      loading: true,
      errorMessage: null,
      vehicle: null,
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) this.fetchVehicle();
      },
    },
  },
  methods: {
    ...mapActions(['getVehicleById']),
    async fetchVehicle() {
      this.loading = true;
      this.errorMessage = null;
      this.vehicle = null;
      try {
        this.vehicle = await this.getVehicleById(this.id);
      } catch (error) {
        this.errorMessage = 'Failed to load vehicle details. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.vehicle-detail-container {
  padding: 1.5rem;
}
.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #718096;
}
.error-message {
  color: #ef4444;
}
.vehicle-details-content {
  max-width: 1100px;
  margin: 0 auto;
}
.card-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>

