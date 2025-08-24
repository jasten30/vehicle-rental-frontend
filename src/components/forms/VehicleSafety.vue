<template>
  <div class="form-section step-10">
    <h3>Step 10: Safety & Standard Quality</h3>
    <p class="step-info-text">
      Confirm that your vehicle meets these safety and quality standards to ensure a safe rental experience.
    </p>

    <div class="form-sub-section">
      <!-- Safety Checklist -->
      <div class="form-group checkbox-group">
        <label>Safety Checklist (Required)</label>
        
        <div class="checkbox-item">
          <input type="checkbox" id="tires" v-model="localSafety.tiresChecked">
          <label for="tires">Tires are in good condition with sufficient tread depth.</label>
        </div>
        
        <div class="checkbox-item">
          <input type="checkbox" id="brakes" v-model="localSafety.brakesChecked">
          <label for="brakes">Brakes are fully functional with no unusual sounds.</label>
        </div>
        
        <div class="checkbox-item">
          <input type="checkbox" id="lights" v-model="localSafety.lightsChecked">
          <label for="lights">All headlights, taillights, and signal lights are working.</label>
        </div>

        <div class="checkbox-item">
          <input type="checkbox" id="wipers" v-model="localSafety.wipersChecked">
          <label for="wipers">Horn and windshield wipers are fully functional.</label>
        </div>

        <div class="checkbox-item">
          <input type="checkbox" id="emergencyTools" v-model="localSafety.emergencyToolsChecked">
          <label for="emergencyTools">Vehicle includes emergency tools (e.g., spare tire, jack).</label>
        </div>

        <div class="checkbox-item">
          <input type="checkbox" id="registration" v-model="localSafety.registrationChecked">
          <label for="registration">Vehicle has a valid and current registration.</label>
        </div>

        <div class="checkbox-item">
          <input type="checkbox" id="cleanliness" v-model="localSafety.cleanlinessChecked">
          <label for="cleanliness">Vehicle interior and exterior are clean.</label>
        </div>
      </div>

      <!-- Additional Notes -->
      <div class="form-group">
        <label for="notes">Additional Notes (Optional)</label>
        <textarea 
          id="notes" 
          v-model="localSafety.notes"
          placeholder="e.g., 'Last serviced in June 2024. New battery installed.'"
        ></textarea>
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
  name: 'VehicleSafety',
  
  // Define the props that the component expects to receive from its parent
  props: {
    safety: {
      type: Object,
      required: true,
      default: () => ({
        tiresChecked: false,
        brakesChecked: false,
        lightsChecked: false,
        wipersChecked: false,
        emergencyToolsChecked: false,
        registrationChecked: false,
        cleanlinessChecked: false,
        notes: '',
      }),
    },
  },
  
  data() {
    // We create a local copy of the safety prop to work with.
    // This prevents direct mutation of the prop from the parent.
    return {
      localSafety: { ...this.safety },
      error: '',
    };
  },
  
  // FIX: Add a computed property to check if all checkboxes are checked.
  computed: {
    isValid() {
      // Check that all required fields are true.
      return this.localSafety.tiresChecked &&
             this.localSafety.brakesChecked &&
             this.localSafety.lightsChecked &&
             this.localSafety.wipersChecked &&
             this.localSafety.emergencyToolsChecked &&
             this.localSafety.registrationChecked &&
             this.localSafety.cleanlinessChecked;
    },
  },
  
  methods: {
    // A method to handle moving to the next step
    nextStep() {
      // First, we update the prop with the local data
      this.updateSafety();
      // Then, we emit the event to move to the next step in the parent component
      this.$emit('next');
    },
    
    // When the user changes any value, this method emits the update
    // event back to the parent component.
    updateSafety() {
      this.$emit('update:safety', this.localSafety);
    },
  },
  
  watch: {
    // We watch for changes in the safety prop and update the local copy.
    // This ensures the component stays in sync with its parent.
    safety: {
      handler(newVal) {
        this.localSafety = { ...newVal };
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
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;
    resize: vertical;
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
    }
  }
}

.checkbox-group {
  .checkbox-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  input[type="checkbox"] {
    margin-right: 0.75rem;
    margin-top: 0.25rem;
    transform: scale(1.2);
  }
  label {
    margin-bottom: 0;
    font-weight: 400;
    cursor: pointer;
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
