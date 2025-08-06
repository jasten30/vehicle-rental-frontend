<!-- frontend/src/views/Dashboard/Owner/AddEditVehicleView.vue -->
<template>
  <div class="add-edit-vehicle-container">
    <h2 class="section-title">{{ isEditMode ? 'Edit Your Vehicle Listing' : 'Add a New Vehicle' }}</h2>

    <form @submit.prevent="submitForm" class="vehicle-form">
      <!-- Vehicle Details Section -->
      <div class="form-section">
        <h3>Vehicle Details</h3>
        <div class="form-group">
          <label for="make">Make</label>
          <input type="text" id="make" v-model="vehicle.make" placeholder="e.g., Toyota" required>
        </div>
        <div class="form-group">
          <label for="model">Model</label>
          <input type="text" id="model" v-model="vehicle.model" placeholder="e.g., Vios" required>
        </div>
        <div class="form-group">
          <label for="year">Year</label>
          <input type="number" id="year" v-model.number="vehicle.year" placeholder="e.g., 2020" required>
        </div>
        <div class="form-group">
          <label for="licensePlate">License Plate</label>
          <input type="text" id="licensePlate" v-model="vehicle.licensePlate" placeholder="e.g., ABC 123" required>
        </div>
        <div class="form-group">
          <label for="location">Location</label>
          <input type="text" id="location" v-model="vehicle.location" placeholder="e.g., Cebu City" required>
        </div>
        <div class="form-group">
          <label for="seatingCapacity">Seating Capacity</label>
          <input type="number" id="seatingCapacity" v-model.number="vehicle.seatingCapacity" placeholder="e.g., 5" required>
        </div>
      </div>

      <!-- Pricing Section -->
      <div class="form-section">
        <h3>Pricing</h3>
        <div class="form-group">
          <label for="rentalPricePerDay">Rental Price Per Day (PHP)</label>
          <input type="number" id="rentalPricePerDay" v-model.number="vehicle.rentalPricePerDay" placeholder="e.g., 1500" required>
        </div>
      </div>

      <!-- Features Section -->
      <div class="form-section">
        <h3>Features</h3>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" v-model="vehicle.description" rows="4" placeholder="Describe your vehicle's condition and features..." required></textarea>
        </div>
        <div class="form-group">
          <label for="imageUrl">Image URL</label>
          <input type="url" id="imageUrl" v-model="vehicle.imageUrl" placeholder="e.g., https://example.com/car.jpg">
          <p class="help-text">A URL to an image of your vehicle.</p>
        </div>
      </div>

      <!-- Availability Section -->
      <div class="form-section">
        <h3>Availability (Optional)</h3>
        <div class="availability-info">
          <p>Mark specific date ranges when the vehicle is **unavailable** for rent.</p>
          <p class="help-text">Example: Vehicle is unavailable from 2024-06-01 to 2024-06-05.</p>
        </div>
        <div class="availability-list" v-if="vehicle.availability && vehicle.availability.length > 0">
          <h4>Unavailable Dates:</h4>
          <ul>
            <li v-for="(range, index) in vehicle.availability" :key="index" class="availability-item">
              <span class="date-range-text">{{ formatDate(range.start) }} - {{ formatDate(range.end) }}</span>
              <button type="button" @click="removeAvailability(index)" class="remove-btn">
                <i class="fas fa-trash"></i>
              </button>
            </li>
          </ul>
        </div>
        <div class="add-availability-form">
          <div class="form-group">
            <label for="newStartDate">From</label>
            <input type="date" id="newStartDate" v-model="newAvailability.start">
          </div>
          <div class="form-group">
            <label for="newEndDate">To</label>
            <input type="date" id="newEndDate" v-model="newAvailability.end">
          </div>
          <button type="button" @click="addAvailability" class="button secondary-button">Add Unavailable Date Range</button>
        </div>
      </div>


      <!-- Action Buttons -->
      <div class="button-group">
        <button type="submit" class="button primary-button" :disabled="loading">
          <span v-if="loading">{{ isEditMode ? 'Updating...' : 'Adding...' }}</span>
          <span v-else>{{ isEditMode ? 'Update Vehicle' : 'Add Vehicle' }}</span>
        </button>
        <button type="button" @click="cancel" class="button secondary-button">Cancel</button>
      </div>

      <!-- Status and Error Messages -->
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'AddEditVehicleView',
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
        availability: [], // Array of { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
      },
      newAvailability: {
        start: null,
        end: null,
      },
    };
  },
  created() {
    if (this.id) {
      this.isEditMode = true;
      this.fetchVehicleDetails(this.id);
    }
  },
  methods: {
    ...mapActions(['addVehicle', 'updateVehicle', 'getVehicleById']),
    async fetchVehicleDetails(vehicleId) {
      this.loading = true;
      try {
        const vehicleData = await this.getVehicleById(vehicleId);
        // Map the fetched data to the local vehicle object
        this.vehicle = {
          ...vehicleData,
          // Ensure availability dates are in 'YYYY-MM-DD' format for the input type="date"
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
    async submitForm() {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        const payload = {
          ...this.vehicle,
          // Convert availability dates back to ISO strings for the backend
          availability: this.vehicle.availability.map(range => ({
            start: range.start, // Already in YYYY-MM-DD format
            end: range.end,
          })),
        };

        if (this.isEditMode) {
          await this.updateVehicle({ id: this.id, ...payload });
          this.successMessage = 'Vehicle listing updated successfully!';
        } else {
          await this.addVehicle(payload);
          this.successMessage = 'Vehicle added successfully!';
          this.resetForm();
        }
        // Redirect to My Listings after success
        this.$router.push({ name: 'MyListings' });

      } catch (error) {
        this.errorMessage = 'An error occurred. Please try again.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    addAvailability() {
      if (this.newAvailability.start && this.newAvailability.end) {
        const startDate = DateTime.fromISO(this.newAvailability.start);
        const endDate = DateTime.fromISO(this.newAvailability.end);
        if (startDate.isValid && endDate.isValid && startDate <= endDate) {
          this.vehicle.availability.push({ ...this.newAvailability });
          this.newAvailability.start = null;
          this.newAvailability.end = null;
        } else {
          // Use a custom modal or message box instead of alert()
          console.error('Please select a valid date range where the start date is before or on the end date.');
        }
      } else {
        // Use a custom modal or message box instead of alert()
        console.error('Please select both a start and an end date.');
      }
    },
    removeAvailability(index) {
      this.vehicle.availability.splice(index, 1);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = DateTime.fromISO(dateString);
      return date.isValid ? date.toLocaleString(DateTime.DATE_MED) : 'Invalid Date';
    },
    resetForm() {
      this.vehicle = {
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
      };
      this.newAvailability = { start: null, end: null };
    },
    cancel() {
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

.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
}

.form-section {
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-radius: $border-radius-md;
  background-color: #f9fafb;

  h3 {
    font-size: 1.5rem;
    color: $primary-color;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid $primary-color;
    padding-bottom: 0.5rem;
  }
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }

  input[type="text"],
  input[type="number"],
  input[type="url"],
  input[type="date"],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
    }
  }

  textarea {
    resize: vertical;
  }
}

.help-text {
  font-size: 0.85rem;
  color: $text-color-medium;
  margin-top: 0.25rem;
}

.availability-info {
  margin-bottom: 1.5rem;
}

.availability-list {
  margin-top: 1rem;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .availability-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: #f3f4f6;
    border-radius: $border-radius-sm;
    margin-bottom: 0.5rem;
    .date-range-text {
      font-weight: 500;
    }
  }
  .remove-btn {
    background-color: transparent;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 1.1rem;
    transition: color 0.2s ease;
    &:hover {
      color: #b91c1c;
    }
  }
}

.add-availability-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;

  .form-group {
    flex: 1;
    min-width: 150px;
    margin-bottom: 0;
  }

  .button {
    flex-shrink: 0;
  }
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: $border-radius-sm;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: #6b7280;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#6b7280, 10%);
  }
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
