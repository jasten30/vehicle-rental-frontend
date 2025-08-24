<!-- frontend/src/components/forms/VehicleDetails.vue -->
<template>
  <div class="form-section step-2">
    <h3>Vehicle Details</h3>
    <p class="step-info-text">Now, fill out the rest of the details about your vehicle.</p>
    
    <!-- Vehicle Details Section -->
    <div class="form-sub-section">
      <div class="form-group">
        <label for="make">Make</label>
        <input 
          type="text" 
          id="make" 
          :value="initialVehicle.make" 
          @input="updateVehicle('make', $event.target.value)"
          placeholder="e.g., Toyota" 
          required
        >
      </div>
      <div class="form-group">
        <label for="model">Model</label>
        <input 
          type="text" 
          id="model" 
          :value="initialVehicle.model" 
          @input="updateVehicle('model', $event.target.value)"
          placeholder="e.g., Vios" 
          required
        >
      </div>
      <div class="form-group">
        <label for="year">Year</label>
        <input 
          type="number" 
          id="year" 
          :value="initialVehicle.year" 
          @input="updateVehicle('year', Number($event.target.value))"
          placeholder="e.g., 2020" 
          required
        >
      </div>
      <div class="form-group">
        <label for="seatingCapacity">Seating Capacity</label>
        <input 
          type="number" 
          id="seatingCapacity" 
          :value="initialVehicle.seatingCapacity" 
          @input="updateVehicle('seatingCapacity', Number($event.target.value))"
          placeholder="e.g., 5" 
          required
        >
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="button-group">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button 
        type="button" 
        @click="nextStep" 
        class="button primary-button"
      >
        Next
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleDetails',
  props: {
    initialVehicle: {
      type: Object,
      required: true,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:vehicle', 'next', 'prev', 'error'],
  data() {
    return {
      error: '',
    };
  },
  methods: {
    updateVehicle(key, value) {
      this.$emit('update:vehicle', {
        ...this.initialVehicle,
        [key]: value,
      });
    },
    nextStep() {
      const { make, model, year, seatingCapacity } = this.initialVehicle;
      const isValid = !!make && !!model && !!year && !!seatingCapacity;
      
      if (isValid) {
        this.$emit('next');
        this.error = '';
      } else {
        this.error = 'Please fill in all vehicle details to proceed.';
        this.$emit('error', this.error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-section {
  padding: 1.5rem;
  border-radius: $border-radius-md;
  background-color: #f9fafb;
}

.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.form-sub-section {
  margin-bottom: 2rem;
  
  h4 {
    font-size: 1.25rem;
    color: $text-color-dark;
    margin-bottom: 1rem;
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
  input[type="number"] {
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

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>
