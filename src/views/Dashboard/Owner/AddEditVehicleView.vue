<!-- frontend/src/views/Dashboard/Owner/AddEditVehicleView.vue -->
<template>
  <div class="add-edit-vehicle-container">
    <h2 class="section-title">{{ isEditMode ? 'Edit Your Vehicle Listing' : 'List Your Car' }}</h2>

    <!-- This is the new component that handles the multi-step form -->
    <VehicleFormSteps 
      :initialVehicle="vehicle"
      :isEditMode="isEditMode"
      @submit="handleFormSubmit"
      @cancel="handleCancel"
      @error="handleError"
    />

    <!-- Status and Error Messages -->
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon';
// Import the new component that manages the form steps
import VehicleFormSteps from '@/components/forms/VehicleFormSteps.vue';

export default {
  name: 'AddEditVehicleView',
  components: {
    VehicleFormSteps,
  },
  props: ['id'], // Vehicle ID for edit mode
  data() {
    return {
      isEditMode: false,
      loading: false,
      successMessage: '',
      errorMessage: '',
      vehicle: {
        make: '',
        model: '',
        year: null,
        licensePlate: '',
        location: '',
        seatingCapacity: null,
        rentalPricePerDay: null,
        description: '',
        imageUrl: '',
        availability: [],
      },
    };
  },
  created() {
    // Check if an 'id' prop exists, which indicates edit mode
    if (this.id) {
      this.isEditMode = true;
      this.fetchVehicleDetails(this.id);
    }
  },
  methods: {
    // Map Vuex actions to component methods
    ...mapActions(['addVehicle', 'updateVehicle', 'getVehicleById']),
    
    // Fetches vehicle data for editing
    async fetchVehicleDetails(vehicleId) {
      this.loading = true;
      try {
        const vehicleData = await this.getVehicleById(vehicleId);
        // Update the local vehicle data with fetched data
        this.vehicle = {
          ...vehicleData,
          // Ensure dates are correctly formatted for the input type="date"
          availability: vehicleData.availability.map(range => ({
            start: range.start ? DateTime.fromISO(range.start).toISODate() : null,
            end: range.end ? DateTime.fromISO(range.end).toISODate() : null,
          })),
        };
      } catch (error) {
        this.errorMessage = 'Failed to load vehicle details for editing.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // Handles error messages emitted from child components
    handleError(message) {
      this.errorMessage = message;
    },
    
    // Handles the form submission event from the child component
    async handleFormSubmit(vehicleData) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        const payload = {
          ...vehicleData,
          // Re-format availability dates for the backend if needed
          availability: vehicleData.availability.map(range => ({
            start: range.start,
            end: range.end,
          })),
        };

        if (this.isEditMode) {
          await this.updateVehicle({ id: this.id, ...payload });
          this.successMessage = 'Vehicle listing updated successfully!';
        } else {
          await this.addVehicle(payload);
          this.successMessage = 'Vehicle added successfully!';
          // Reset the vehicle data for a new listing
          this.vehicle = {
            make: '', model: '', year: null, licensePlate: '', location: '',
            seatingCapacity: null, rentalPricePerDay: null, description: '',
            imageUrl: '', availability: [],
          };
        }
        // Redirect to the listings page after success
        this.$router.push({ name: 'MyListings' });

      } catch (error) {
        this.errorMessage = 'An error occurred. Please try again.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // Handles the cancel event from the child component
    handleCancel() {
      this.$router.push({ name: 'MyListings' });
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.add-edit-vehicle-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 2rem;
  text-align: center;
}

.success-message {
  color: #16a34a;
  background-color: #dcfce7;
  padding: 1rem;
  border-radius: $border-radius-md;
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  padding: 1rem;
  border-radius: $border-radius-md;
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
}
</style>
