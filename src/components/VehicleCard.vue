<template>
  <div
    v-if="vehicle && vehicle.location"
    class="vehicle-card"
    @click="goToDetails"
  >
    <div class="card-content">
      <h3 class="card-title">{{ vehicle.make }} {{ vehicle.model }}</h3>
      <div class="specs">
        <span class="spec-item">{{ formattedSpecs }}</span>
      </div>
    </div>
    <div class="image-container">
      <img
        :src="imageUrl"
        :alt="`Image of ${vehicle.make} ${vehicle.model}`"
        class="vehicle-image"
        @error="handleImageError"
      />
    </div>
    <div class="price-container">
      <p class="card-price">₱{{ vehicle.rentalPricePerDay }} / day</p>
    </div>
  </div>
  <div v-else>Loading vehicle data...</div>
</template>

<script>
export default {
  name: "VehicleCard",
  props: {
    vehicle: {
      type: Object,
      required: false,
      default: null,
    },
  },
  computed: {
    imageUrl() {
      if (
        this.vehicle &&
        this.vehicle.exteriorPhotos &&
        this.vehicle.exteriorPhotos.length > 0
      ) {
        return this.vehicle.exteriorPhotos[0];
      }
      return "https://placehold.co/400x300/e2e8f0/666666?text=Image+Not+Found";
    },
    formattedSpecs() {
      const specs = [this.vehicle.vehicleType || "Sedan"];
      if (this.vehicle.seatingCapacity) {
        specs.push(`${this.vehicle.seatingCapacity} seats`);
      }
      if (this.vehicle.transmission) {
        specs.push(this.vehicle.transmission);
      }
      return specs.join(" · ");
    },
  },
  methods: {
    handleImageError(event) {
      event.target.src =
        "https://placehold.co/400x300/e2e8f0/666666?text=Image+Not+Found";
    },
    goToDetails() {
      if (this.vehicle && this.vehicle.id) {
        this.$router.push({
          name: "VehicleDetail",
          params: { id: this.vehicle.id },
        });
      }
    },
  },
};
</script>

<style scoped>
.vehicle-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  font-family: "Inter", sans-serif;
  height: 100%;
  cursor: pointer;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.vehicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-content {
  flex-grow: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.specs {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #718096;
}

.spec-item {
  white-space: nowrap;
}

.spec-separator {
  margin: 0 0.5rem;
  color: #a0aec0;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  margin: 1rem 0;
}

.vehicle-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.price-container {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.card-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}
</style>
