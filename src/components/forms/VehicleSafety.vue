<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Safety & Standard Quality</h3>
      <p class="step-info-text">
        Confirm that your vehicle meets these safety and quality standards to ensure a safe rental experience.
      </p>

      <div class="form-sub-section">
        <!-- Safety Checklist -->
        <div class="form-group checkbox-group">
          <label class="form-section-label">Safety Checklist (Required)</label>
          
          <label class="checkbox-item">
            <input type="checkbox" id="tires" v-model="localSafety.tiresChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">Tires are in good condition with sufficient tread depth.</span>
          </label>
          
          <label class="checkbox-item">
            <input type="checkbox" id="brakes" v-model="localSafety.brakesChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">Brakes are fully functional with no unusual sounds.</span>
          </label>
          
          <label class="checkbox-item">
            <input type="checkbox" id="lights" v-model="localSafety.lightsChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">All headlights, taillights, and signal lights are working.</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" id="wipers" v-model="localSafety.wipersChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">Horn and windshield wipers are fully functional.</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" id="emergencyTools" v-model="localSafety.emergencyToolsChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">Vehicle includes emergency tools (e.g., spare tire, jack).</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" id="registration" v-model="localSafety.registrationChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">Vehicle has a valid and current registration.</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" id="cleanliness" v-model="localSafety.cleanlinessChecked">
            <span class="checkmark"></span>
            <span class="checkbox-label">Vehicle interior and exterior are clean.</span>
          </label>
        </div>

        <!-- Additional Notes -->
        <div class="form-group">
          <label for="notes">Additional Notes (Optional)</label>
          <textarea 
            id="notes" 
            v-model="localSafety.notes"
            placeholder="e.g., 'Last serviced in June 2024. New battery installed.'"
            rows="4"
          ></textarea>
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
  name: 'VehicleSafety',
  props: {
    // UPDATED: Prop name changed to modelValue
    modelValue: {
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
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  // UPDATED: Emit event changed to update:modelValue
  emits: ["update:modelValue", "next", "prev", "error"],
  data() {
    return {
      localSafety: { ...this.modelValue },
      error: '',
    };
  },
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
    nextStep() {
      if (this.validateStep()) {
        // No need to call updateSafety(), watcher handles it
        this.$emit('next');
      }
    },
    validateStep() {
        this.error = '';
        if (!this.isValid) {
            this.error = "Please check all safety and quality standards to continue.";
            this.$emit('error', this.error);
            return false;
        }
        return true;
    }
  },
  watch: {
    // Watch for parent changes (e.g., form reset)
    // modelValue(newVal) {  // 👈 REMOVED THIS WATCHER TO BREAK THE LOOP
    //   this.localSafety = { ...newVal };
    // },
    
    // Watch local data and emit changes to parent
    localSafety: {
      handler(newVal) {
        this.$emit('update:modelValue', newVal);
      },
      deep: true,
    }
  },
};
</script>


<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

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
    font-size: 0.9rem;
  }
  
  .form-section-label {
    font-size: 1.1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $border-color-light;
    margin-bottom: 1rem;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-family: $font-family-base;
    box-sizing: border-box;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;
    resize: vertical;
    min-height: 100px;
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px lighten($primary-color, 40%);
    }
  }
}

/* --- New Checkbox Styles --- */
.checkbox-item {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border-radius: $border-radius-md;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: $background-light;
  }

  .checkbox-label {
    font-size: 0.9rem;
    color: $text-color-dark;
    font-weight: 500;
  }

  /* Hide default checkbox */
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* Custom checkmark */
  .checkmark {
    position: relative;
    height: 1.25em;
    width: 1.25em;
    background-color: #fff;
    border: 2px solid $border-color;
    border-radius: $border-radius-sm;
    margin-right: 0.75rem;
    transition: all 0.2s ease;
  }

  /* When checked */
  input:checked ~ .checkmark {
    background-color: $primary-color;
    border-color: $primary-color;
  }

  /* Checkmark symbol (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  /* Show checkmark when checked */
  input:checked ~ .checkmark:after {
    display: block;
  }
}
/* --- End New Checkbox Styles --- */


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

