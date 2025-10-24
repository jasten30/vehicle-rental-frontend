<template>
  <div class="edit-sections-container">

    <!-- Section 1: Location -->
    <div class="edit-section card">
      <h3 class="section-title">Pickup & Return Location</h3>
      <!-- Bind directly to the specific ref -->
      <VehicleLocation
        v-model:address="editableLocation"
        :showNavigation="false"
      />
    </div>

    <!-- Section 2: Availability -->
    <div class="edit-section card">
      <h3 class="section-title">Vehicle Availability</h3>
        <!-- Bind directly to the specific ref -->
      <VehicleAvailability
        v-model="editableAvailability"
        :showNavigation="false"
      />
    </div>

    <!-- Section 3: Features -->
    <div class="edit-section card">
      <h3 class="section-title">Vehicle Features</h3>
        <!-- Bind directly to the specific ref -->
      <VehicleFeatures
        v-model="editableFeatures"
        :showNavigation="false"
      />
    </div>

    <!-- Section 4: Photos -->
    <div class="edit-section card">
      <h3 class="section-title">Vehicle Photos</h3>
        <!-- Bind directly to the specific refs -->
      <VehiclePhotos
        v-model:profilePhotoUrl="editableProfilePhotoUrl"
        v-model:exteriorPhotos="editableExteriorPhotos"
        v-model:interiorPhotos="editableInteriorPhotos"
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
// Removed unused 'reactive' import
import { ref, watch } from 'vue';
import VehicleLocation from './VehicleLocation.vue';
import VehicleAvailability from './VehicleAvailability.vue';
import VehicleFeatures from './VehicleFeatures.vue';
import VehiclePhotos from './VehiclePhotos.vue';

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
  },
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {

    // --- Create separate refs for each editable section ---
    const editableLocation = ref({});
    const editableAvailability = ref([]);
    const editableFeatures = ref({});
    const editableProfilePhotoUrl = ref('');
    const editableExteriorPhotos = ref([]);
    const editableInteriorPhotos = ref([]);

    // --- Function to initialize/reset the refs from the prop ---
    const initializeData = (sourceData) => {
        // Deep clone each part to prevent modifying the original prop object directly
        editableLocation.value = deepClone(sourceData.location || {});
        // Ensure availability is always an array of objects {start, end}
        editableAvailability.value = Array.isArray(sourceData.availability)
            ? deepClone(sourceData.availability.filter(p => p && p.start && p.end)) // Filter valid periods during clone
            : [];
        // Ensure features is always an object
        editableFeatures.value = (typeof sourceData.features === 'object' && sourceData.features !== null)
            ? deepClone(sourceData.features)
            : {};
        editableProfilePhotoUrl.value = sourceData.profilePhotoUrl || '';
        editableExteriorPhotos.value = Array.isArray(sourceData.exteriorPhotos) ? deepClone(sourceData.exteriorPhotos) : [];
        editableInteriorPhotos.value = Array.isArray(sourceData.interiorPhotos) ? deepClone(sourceData.interiorPhotos) : [];
    };

    // Initialize the refs when the component is set up
    initializeData(props.vehicle);

    // Watch the incoming prop for external changes (e.g., parent fetches new data)
    watch(() => props.vehicle, (newVehicleData) => {
        // Simple check: Re-initialize if the prop object reference changes
        initializeData(newVehicleData);

    }, { deep: true }); // Deep watch is important if the parent might mutate the prop


    // --- Save function ---
    const saveChanges = () => {
      // Construct the payload explicitly from the refs
      const payload = {
        // Add the editable sections from our refs
        location: editableLocation.value,
        availability: editableAvailability.value,
        features: editableFeatures.value,
        profilePhotoUrl: editableProfilePhotoUrl.value,
        exteriorPhotos: editableExteriorPhotos.value,
        interiorPhotos: editableInteriorPhotos.value,

        // Important: Include other fields from the original prop that weren't edited
        // This ensures we send the full vehicle data expected by the backend update,
        // not just the sections edited here.
        make: props.vehicle.make,
        model: props.vehicle.model,
        year: props.vehicle.year,
        seats: props.vehicle.seats, // Or seatingCapacity, match your data model
        vehicleType: props.vehicle.vehicleType,
        transmission: props.vehicle.transmission,
        fuelType: props.vehicle.fuelType,
        pricing: props.vehicle.pricing,
        safety: props.vehicle.safety,
        cor: props.vehicle.cor,
        or: props.vehicle.or,
        // Add any other fields...
      };

      emit('save', payload); // Emit the clean, combined object
    };

    return {
      // Return the separate refs for binding
      editableLocation,
      editableAvailability,
      editableFeatures,
      editableProfilePhotoUrl,
      editableExteriorPhotos,
      editableInteriorPhotos,
      // Return the save method
      saveChanges,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss'; // Assuming you have this

.edit-sections-container {
  display: flex;
  flex-direction: column;
  gap: 2rem; // Space between sections
}

.edit-section {
  &.card { // Apply card styling
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
  margin-top: 1rem; // Add some space above the buttons
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}

// Basic Button Styles (you might have global styles for these)
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
    // Replaced $border-color-dark with $border-color
    border-color: $border-color;
  }
}
</style>
