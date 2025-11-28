<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Motorcycle Details</h3>
      <p class="step-info-text">
        Provide the basic details for your motorcycle.
      </p>

      <div class="form-grid">
        <div class="form-group">
          <label for="make">Make (e.g., Honda, Yamaha)</label>
          <input
            id="make"
            type="text"
            v-model="localData.make"
            placeholder="Honda"
          />
        </div>

        <div class="form-group">
          <label for="model">Model (e.g., Click 150i)</label>
          <input
            id="model"
            type="text"
            v-model="localData.model"
            placeholder="Click 150i"
          />
        </div>

        <div class="form-group">
          <label for="year">Year</label>
          <input
            id="year"
            type="number"
            v-model.number="localData.year"
            placeholder="2022"
          />
        </div>

        <div class="form-group">
          <label for="licensePlate">
            License Plate
            <span v-if="isEditMode" class="locked-badge">
              <i class="bi bi-lock-fill"></i> Locked
            </span>
          </label>

          <input
            id="licensePlate"
            type="text"
            v-model="localData.licensePlate"
            placeholder="ABC 123"
            :disabled="isEditMode"
            :class="{ 'input-locked': isEditMode }"
            title="License plate cannot be changed after listing creation"
          />

          <small v-if="isEditMode" class="helper-text-warning">
            To prevent fraud, license plates cannot be edited once created.
          </small>
        </div>

        <div class="form-group">
          <label for="motorcycleType">Type</label>
          <select id="motorcycleType" v-model="localData.motorcycleType">
            <option disabled value="">Select a type</option>
            <option>Scooter</option>
            <option>Standard</option>
            <option>Sport Bike</option>
            <option>Cruiser</option>
            <option>Touring</option>
            <option>Off-road</option>
          </select>
        </div>

        <div class="form-group">
          <label for="engineDisplacement">Engine (cc)</label>
          <input
            id="engineDisplacement"
            type="number"
            v-model.number="localData.engineDisplacement"
            placeholder="150"
          />
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div v-if="showNavigation" class="navigation-buttons">
        <button
          type="button"
          @click="$emit('prev')"
          class="nav-button secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleNext"
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
  name: "MotorcycleDetails",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    // We use this to detect if we are in "Edit Mode"
    // If showNavigation is false, it implies we are in the Edit View
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "next", "prev"],
  data() {
    return {
      localData: { ...this.modelValue },
      error: "",
    };
  },
  computed: {
    isEditMode() {
      return !this.showNavigation;
    },
    isValid() {
      // Basic validation
      return (
        this.localData.make &&
        this.localData.model &&
        this.localData.year > 1990 &&
        this.localData.licensePlate &&
        this.localData.motorcycleType &&
        this.localData.engineDisplacement > 50
      );
    },
  },
  watch: {
    // Deep watch to ensure parent gets updates immediately in Edit Mode
    localData: {
      handler(newVal) {
        this.$emit("update:modelValue", newVal);
      },
      deep: true,
    },
    modelValue(newVal) {
      // Avoid infinite loops
      if (JSON.stringify(newVal) !== JSON.stringify(this.localData)) {
        this.localData = { ...newVal };
      }
    },
  },
  methods: {
    handleNext() {
      if (this.isValid) {
        this.$emit("update:modelValue", this.localData);
        this.$emit("next");
      } else {
        this.error = "Please fill in all required fields to continue.";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

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
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
    font-size: 0.9rem;
  }
  input,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-family: $font-family-base;
    box-sizing: border-box;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px lighten($primary-color, 40%);
    }

    /* Disabled State */
    &:disabled {
      background-color: #f3f4f6; /* Light gray */
      color: #6b7280; /* Gray text */
      cursor: not-allowed;
      border-color: #e5e7eb;
    }
  }

  /* Locked Styling */
  .locked-badge {
    font-size: 0.7rem;
    background-color: #fee2e2;
    color: #991b1b;
    padding: 0.1rem 0.5rem;
    border-radius: 4px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .helper-text-warning {
    margin-top: 0.4rem;
    font-size: 0.8rem;
    color: #ef4444;
    font-style: italic;
  }
}

.error-message {
  color: $admin-color;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
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
  &.primary {
    background-color: $primary-color;
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
    }
    &:disabled {
      background-color: lighten($primary-color, 20%);
      cursor: not-allowed;
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
}

.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.form-step-fade-enter-from,
.form-step-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>
