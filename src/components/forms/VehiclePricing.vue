<!-- frontend/src/components/forms/VehiclePricing.vue -->
<template>
  <div class="form-section step-9">
    <h3>Step 9: Set Your Price</h3>
    <p class="step-info-text">We'll help you set a competitive daily rental price based on your car's market value in the Philippines.</p>
    
    <div class="form-sub-section">
      <!-- Estimated Market Value Input -->
      <div class="form-group">
        <label for="marketValue">Estimated Market Value (PHP)</label>
        <input 
          type="number" 
          id="marketValue" 
          v-model.number="localPricing.marketValue"
          placeholder="e.g., ₱1,000,000" 
          required
        >
      </div>

      <!-- Car Condition Dropdown -->
      <div class="form-group">
        <label for="condition">Car Condition</label>
        <select id="condition" v-model="localPricing.condition" required>
          <option value="" disabled selected>Select condition</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>
      </div>
      
      <!-- Calculated Daily Price Display -->
      <div class="form-group calculated-price">
        <label>Recommended Daily Price</label>
        <div class="price-box">
          <!-- FIX: Added a conditional check to ensure calculatedPrice is not null before formatting -->
          ₱ {{ calculatedPrice ? calculatedPrice.toLocaleString('en-PH') : '0.00' }}
        </div>
      </div>

      <!-- User-adjustable price -->
      <div class="form-group">
        <label for="manualPrice">Your Daily Rental Price (Optional)</label>
        <input 
          type="number" 
          id="manualPrice" 
          v-model.number="localPricing.manualPrice"
          placeholder="Enter a custom price if you wish"
        >
      </div>
    </div>
    
    <!-- Action Buttons -->
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
  // Define the component's name
  name: 'VehiclePricing',
  
  // Define the props that the component expects to receive from its parent
  props: {
    pricing: {
      type: Object,
      required: true,
      // Provide a default value to prevent undefined errors.
      default: () => ({
        marketValue: null,
        condition: '',
        manualPrice: null,
        recommendedPrice: null, // Ensure all expected properties are here
      }),
    },
    vehicleYear: {
      type: Number,
      default: null,
    },
  },
  
  data() {
    // We create a local copy of the pricing prop to work with.
    // This allows the component to modify its own data without directly
    // mutating the prop, which is a best practice in Vue.
    return {
      localPricing: { ...this.pricing },
      error: '',
    };
  },
  
  computed: {
    // This computed property handles the price calculation logic
    calculatedPrice() {
      // Return 0 if marketValue or condition is not set to prevent errors
      if (!this.localPricing.marketValue || !this.localPricing.condition) {
        return 0;
      }
      
      const conditionMultiplier = this.getConditionMultiplier();
      // Simple formula: Daily price is a small percentage of market value adjusted by condition
      return (this.localPricing.marketValue * 0.001) * conditionMultiplier;
    },
    // This computed property checks if the form is valid to enable the "Next" button
    isValid() {
      // The form is valid if marketValue is a number > 0 and a condition is selected
      return this.localPricing.marketValue > 0 && this.localPricing.condition !== '';
    }
  },

  methods: {
    // A method to handle moving to the next step
    nextStep() {
      this.updatePricing(); // Ensure data is up-to-date
      this.$emit('next');
    },

    // When the user changes any value, this method emits the update
    // event back to the parent component.
    updatePricing() {
      // Also update the recommended price in the local data
      this.localPricing.recommendedPrice = this.calculatedPrice;
      this.$emit('update:pricing', this.localPricing);
    },
    
    // Helper methods for price calculation
    getConditionMultiplier() {
      switch (this.localPricing.condition) {
        case 'excellent': return 1.2;
        case 'good': return 1.0;
        case 'fair': return 0.8;
        default: return 1.0;
      }
    },
  },
  
  watch: {
    // We watch for changes in the pricing prop and update the local copy.
    // This ensures the component stays in sync with its parent.
    pricing: {
      handler(newVal) {
        this.localPricing = { ...newVal };
      },
      deep: true,
      immediate: true,
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
}

.form-group {
  margin-bottom: 1.25rem;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }
  input[type="number"],
  select {
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
  
  .calculated-price .price-box {
    display: block;
    width: 100%;
    padding: 0.75rem;
    background-color: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-radius: $border-radius-sm;
    font-weight: bold;
    font-size: 1.25rem;
    color: $primary-color;
    text-align: center;
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
</style>
