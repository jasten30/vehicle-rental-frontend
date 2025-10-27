<template>
  <div class="edit-sections-container">
    
    <!-- ================================== -->
    <!-- CONDITIONAL SECTIONS               -->
    <!-- ================================== -->

    <!-- SHOW CAR-SPECIFIC FORMS -->
    <template v-if="!isMotorcycle">
      <!-- Section: Vehicle Details -->
      <div class="edit-section card">
        <h3 class="section-title">Vehicle Details</h3>
        <!-- You need to import VehicleDetails.vue for this to work -->
        <VehicleDetails 
          v-model="localVehicle"
          :initialVehicle="localVehicle" 
          :showNavigation="false"
          @update:modelValue="handleChildUpdate"
        />
      </div>
      <!-- Section: Features -->
      <div class="edit-section card">
        <h3 class="section-title">Vehicle Features</h3>
        <VehicleFeatures 
          v-model="localVehicle.features" 
          :showNavigation="false" 
        />
      </div>
    </template>

    <!-- SHOW MOTORCYCLE-SPECIFIC FORMS -->
    <template v-else>
      <!-- Section: Motorcycle Details -->
      <div class="edit-section card">
        <h3 class="section-title">Motorcycle Details</h3>
        <MotorcycleDetails
          v-model="localVehicle"
          :showNavigation="false"
          @update:modelValue="handleChildUpdate"
        />
      </div>
      <!-- Note: We do not show the VehicleFeatures component for motorcycles -->
    </template>

    <!-- ================================== -->
    <!-- COMMON SECTIONS                    -->
    <!-- ================================== -->

    <!-- Section: Location -->
    <div class="edit-section card">
      <h3 class="section-title">Pickup & Return Location</h3>
      <VehicleLocation 
        v-model:address="localVehicle.location" 
        :showNavigation="false" 
      />
    </div>

    <!-- Section: Availability -->
    <div class="edit-section card">
      <h3 class="section-title">Vehicle Availability</h3>
      <VehicleAvailability 
        v-model="localVehicle.availability" 
        :showNavigation="false" 
      />
    </div>

    <!-- Section: Photos (Now aware of assetType) -->
    <div class="edit-section card">
      <h3 class="section-title">Vehicle Photos</h3>
      <VehiclePhotos 
        v-model:profilePhotoUrl="localVehicle.profilePhotoUrl"
        v-model:exteriorPhotos="localVehicle.exteriorPhotos"
        v-model:interiorPhotos="localVehicle.interiorPhotos"
        :assetType="localVehicle.assetType" 
        :showNavigation="false" 
      />
    </div>

    <!-- Save Button -->
    <div class="save-actions">
       <button @click="$emit('cancel')" type="button" class="button secondary-button">Cancel</button>
       <button @click="saveChanges" type="button" class="button primary-button">Save Changes</button>
    </div>

  </div>
</template>

<script>
// FIX: Import 'computed'
import { ref, watch, computed } from 'vue'; 
// Import ALL possible sub-forms
import VehicleLocation from './VehicleLocation.vue';
import VehicleAvailability from './VehicleAvailability.vue';
import VehicleFeatures from './VehicleFeatures.vue';
import VehiclePhotos from './VehiclePhotos.vue';
import VehicleDetails from './VehicleDetails.vue'; // <-- IMPORT THIS
import MotorcycleDetails from './motorcyle/MotorcycleDetails.vue'; // <-- IMPORT THIS

// Helper for deep cloning
function deepClone(obj) {
    try {
        return structuredClone(obj);
    } catch(e) {
        return JSON.parse(JSON.stringify(obj));
    }
}

export default {
  name: 'EditVehicleSections',
  components: {
    VehicleLocation,
    VehicleAvailability,
    VehicleFeatures,
    VehiclePhotos,
    VehicleDetails, // <-- REGISTER
    MotorcycleDetails, // <-- REGISTER
  },
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    
    // Initialize with a clone of the prop (or empty object)
    const localVehicle = ref(deepClone(props.vehicle || {}));

    // FIX: 'isMotorcycle' is now a computed property
    const isMotorcycle = computed(() => {
        // It depends on localVehicle.value, so it will update when localVehicle updates
        return localVehicle.value?.assetType === 'motorcycle';
    });

    const initializeData = (sourceData) => {
        localVehicle.value = deepClone(sourceData || {}); // Handle null/undefined source
        
        // Ensure essential nested structures exist
        if (!localVehicle.value.location) localVehicle.value.location = {};
        if (!Array.isArray(localVehicle.value.availability)) localVehicle.value.availability = [];
        if (typeof localVehicle.value.features !== 'object' || localVehicle.value.features === null) localVehicle.value.features = {};
        if (typeof localVehicle.value.safety !== 'object' || localVehicle.value.safety === null) localVehicle.value.safety = {};
        if (typeof localVehicle.value.pricing !== 'object' || localVehicle.value.pricing === null) localVehicle.value.pricing = {};
        if (typeof localVehicle.value.cor !== 'object' || localVehicle.value.cor === null) localVehicle.value.cor = {};
        if (typeof localVehicle.value.or !== 'object' || localVehicle.value.or === null) localVehicle.value.or = {};
        if (!Array.isArray(localVehicle.value.exteriorPhotos)) localVehicle.value.exteriorPhotos = [];
        if (!Array.isArray(localVehicle.value.interiorPhotos)) localVehicle.value.interiorPhotos = [];
        if (!localVehicle.value.profilePhotoUrl) localVehicle.value.profilePhotoUrl = '';
        
        // Default assetType to 'vehicle' if it's missing (for old data)
        if (!localVehicle.value.assetType) {
          localVehicle.value.assetType = 'vehicle';
        }
    };

    // Initialize on setup
    initializeData(props.vehicle);

    // Watch for prop changes (e.g., parent reloads data)
    watch(() => props.vehicle, (newVehicleData) => {
        if (JSON.stringify(newVehicleData) !== JSON.stringify(localVehicle.value)) {
            initializeData(newVehicleData);
        }
    }, { deep: true });

    // Handle updates from child "Details" components
    const handleChildUpdate = (updatedData) => {
        // This is necessary because VehicleDetails/MotorcycleDetails emit the *whole* object
        localVehicle.value = { ...localVehicle.value, ...updatedData };
    };

    const saveChanges = () => {
      const payload = { ...localVehicle.value };
      
      // Clean up data before saving
      if (payload.assetType === 'motorcycle') {
          // Remove car-specific fields if it's a motorcycle
          delete payload.features;
          delete payload.seatingCapacity; // or seats
          delete payload.vehicleType; 
      } else {
          // Remove motorcycle-specific fields if it's a car
          delete payload.engineDisplacement;
          delete payload.motorcycleType;
      }

      emit('save', payload);
    };

    return {
      localVehicle,
      isMotorcycle, // Return the computed property
      saveChanges,
      handleChildUpdate,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.edit-sections-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-section {
  &.card {
    background-color: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-light;
    padding: 1.5rem;
    border: 1px solid $border-color-light;
  }
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid $border-color-light;
}

.save-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  border-color: $primary-color;
  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: transparent;
  color: $text-color-medium;
  border-color: $border-color;
  &:hover {
    background-color: $background-light;
    color: $text-color-dark;
    border-color: $border-color;
  }
}
</style>

