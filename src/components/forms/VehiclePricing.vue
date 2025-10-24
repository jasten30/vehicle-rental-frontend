<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Set Your Price</h3>
      <p class="step-info-text">We'll help you set a competitive daily rental price based on your car's market value in the Philippines.</p>
      
      <div class="form-grid">
        <!-- Estimated Market Value Input -->
        <div class="form-group">
          <label for="marketValue">Estimated Market Value (PHP)</label>
          <input 
            type="number" 
            id="marketValue" 
            v-model.number="localPricing.marketValue"
            placeholder="e.g., 1000000" 
            required
            @input="updatePricing"
            min="0"
          >
        </div>

        <!-- Car Condition Dropdown -->
        <div class="form-group">
          <label for="condition">Car Condition</label>
          <select id="condition" v-model="localPricing.condition" required @change="updatePricing">
            <option value="" disabled>Select condition</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>
        
        <!-- Calculated Daily Price Display -->
        <div class="form-group calculated-price">
          <label>Recommended Daily Price</label>
          <div class="price-box">
            ₱ {{ calculatedPrice ? calculatedPrice.toLocaleString('en-PH', { maximumFractionDigits: 0 }) : '0' }}
          </div>
        </div>

        <!-- User-adjustable price -->
        <div class="form-group">
          <label for="manualPrice">Your Daily Rental Price (Optional)</label>
          <input 
            type="number" 
            id="manualPrice" 
            v-model.number="localPricing.manualPrice"
            placeholder="Override recommended price"
            @input="updatePricing"
            min="0"
          >
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Action Buttons -->
      <div v-if="showNavigation" class="navigation-buttons">
        <button type="button" @click="$emit('prev')" class="nav-button secondary">Previous</button>
        <button 
          type="button" 
          @click="nextStep" 
          class="nav-button primary"
          :disabled="!isValid"
        >
          Next
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'VehiclePricing',
  props: {
    // UPDATED: Changed 'pricing' to 'modelValue' to work with v-model
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        marketValue: null,
        condition: '',
        manualPrice: null,
        recommendedPrice: null,
      }),
    },
    vehicleYear: {
      type: Number,
      default: null,
    },
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  // UPDATED: Changed 'update:pricing' to 'update:modelValue'
  emits: ["update:modelValue", "next", "prev", "error"],
  data() {
    return {
      // Create a local copy to avoid mutating the prop
      localPricing: { ...this.modelValue },
      error: '',
    };
  },
  computed: {
    calculatedPrice() {
      if (!this.localPricing.marketValue || !this.localPricing.condition) {
        return 0;
      }
      const conditionMultiplier = this.getConditionMultiplier();
      // Simple formula: Daily price is a small percentage of market value
      return (this.localPricing.marketValue * 0.001) * conditionMultiplier;
    },
    isValid() {
      // Form is valid if marketValue is a number > 0 and a condition is selected
      return this.localPricing.marketValue > 0 && this.localPricing.condition !== '';
    }
  },
  methods: {
    nextStep() {
      if (this.validate()) {
        this.updatePricing(); // Final update before moving
        this.$emit('next');
      }
    },
    validate() {
        this.error = '';
        if (!this.isValid) {
            this.error = "Please enter the market value and condition.";
            return false;
        }
        if (this.localPricing.manualPrice && this.localPricing.manualPrice < 100) {
            this.error = "Custom price must be at least ₱100.";
            return false;
        }
        return true;
    },
    updatePricing() {
      // Also update the recommended price in the local data
      this.localPricing.recommendedPrice = this.calculatedPrice;
      // Emit the update event for v-model
      this.$emit('update:modelValue', this.localPricing);
    },
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
    // Watch for parent changes (e.g., form reset) and update local copy
    modelValue: {
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
@import "@/assets/styles/variables.scss";

/* --- Entrance Animation --- */
.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.form-step-fade-enter-from,
.form-step-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.form-step-container {
  padding: 1rem 0;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.step-info-text {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr; // 1 column on mobile
  gap: 1.25rem;

  @media (min-width: 768px) { // 2 columns on desktop
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  margin-bottom: 0;
  display: flex; /* Use flex to control child height */
  flex-direction: column;
  
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
    font-size: 0.9rem;
  }

  input[type="text"],
  input[type="number"],
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-family: $font-family-base;
    box-sizing: border-box;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;
    
    /* ADDED: Set a fixed height */
    height: 50px; 
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px lighten($primary-color, 40%);
  }

  /* Custom styling for select dropdown arrow */
  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%20fill%3D%22%236B7280%22%3E%3Cpath%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2JCUzB%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.65em auto;
    padding-right: 2.5rem;
  }

  &.calculated-price .price-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem;
    background-color: $background-light;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    font-weight: 700;
    font-size: 1.2rem;
    color: $primary-color;
    text-align: center;
    
    /* UPDATED: Set a fixed height to match inputs */
    height: 50px; 
    box-sizing: border-box;
  }
}

.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}

.nav-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px;
  text-align: center;
  
  &.primary {
    background-color: $primary-color;
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
      box-shadow: $shadow-medium;
    }
  }
  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $border-color;
    &:hover {
      color: $text-color-dark;
      background-color: $background-light;
    }
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.error-message {
  color: $admin-color;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>

