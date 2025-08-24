<template>
  <div>
    <h3>Vehicle Availability</h3>
    <p class="step-info-text">Please specify the date range your vehicle is available for rent. You can set a start and end date for your rental period.</p>
    
    <div class="form-group-availability">
      <!-- Start Date Input -->
      <div class="form-group date-input">
        <label for="startDate">Available From</label>
        <input 
          type="date" 
          id="startDate" 
          v-model="localAvailability.startDate"
          @change="validateDates"
          required
        >
      </div>
      
      <!-- End Date Input -->
      <div class="form-group date-input">
        <label for="endDate">Available Until</label>
        <input 
          type="date" 
          id="endDate" 
          v-model="localAvailability.endDate"
          @change="validateDates"
          required
        >
      </div>
    </div>
    
    <div class="button-group-step">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button 
        type="button" 
        @click="nextStep" 
        class="button primary-button" 
        :disabled="!isValid"
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
  name: 'VehicleAvailability',
  props: {
    initialAvailability: {
      type: Object,
      required: true,
      default: () => ({ startDate: '', endDate: '' }),
    }
  },
  emits: ['update:availability', 'next', 'prev', 'error'],
  data() {
    return {
      localAvailability: { ...this.initialAvailability },
      error: '',
    };
  },
  computed: {
    isValid() {
      // Check if both dates are selected and the end date is not before the start date
      return !!this.localAvailability.startDate && !!this.localAvailability.endDate &&
             new Date(this.localAvailability.endDate) >= new Date(this.localAvailability.startDate);
    }
  },
  watch: {
    localAvailability: {
      handler(newVal) {
        this.$emit('update:availability', newVal);
        this.validateDates();
      },
      deep: true,
    },
    initialAvailability: {
      handler(newVal) {
        this.localAvailability = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    validateDates() {
      this.error = '';
      if (this.localAvailability.startDate && this.localAvailability.endDate) {
        if (new Date(this.localAvailability.endDate) < new Date(this.localAvailability.startDate)) {
          this.error = 'The end date cannot be before the start date.';
        }
      }
    },
    nextStep() {
      // Here is the added console.log to inspect your data
      console.log('VehicleAvailability component data:', JSON.stringify(this.localAvailability, null, 2));

      if (this.isValid) {
        this.$emit('next');
        this.error = '';
      } else {
        this.$emit('error', 'Please select a valid start and end date for the rental period.');
        // Set local error state as well, for display in this component
        this.error = 'Please select a valid start and end date for the rental period.';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

h3 {
  font-size: 1.5rem;
  color: $primary-color;
  margin-bottom: 1rem;
}

.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.form-group-availability {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }
}

input[type="date"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: $border-radius-sm;
  font-size: 1rem;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: #ffffff;
  color: $text-color-dark;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}

.button-group-step {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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

@media (min-width: 600px) {
  .form-group-availability {
    flex-direction: row;
    gap: 2rem;
  }
  .date-input {
    flex: 1;
  }
}
</style>
