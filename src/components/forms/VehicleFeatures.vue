<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Vehicle Features</h3>
      <p class="step-info-text">
        Select the features and amenities your vehicle offers to attract more
        renters.
      </p>

      <div class="features-container">
        <div
          v-for="(features, category) in featuresList"
          :key="category"
          class="feature-category"
        >
          <h4 class="category-title">{{ category }}</h4>

          <div class="features-checkbox-group">
            <label
              class="checkbox-item"
              v-for="feature in features"
              :key="feature.key"
            >
              <input
                type="checkbox"
                :id="feature.key"
                v-model="localFeatures[feature.key]"
              />
              <span class="checkmark"></span>
              <span class="checkbox-label">{{ feature.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="showNavigation" class="navigation-buttons">
        <button
          type="button"
          @click="$emit('prev')"
          class="nav-button secondary"
        >
          Previous
        </button>
        <button type="button" @click="$emit('next')" class="nav-button primary">
          Next
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "VehicleFeatures",
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "next", "prev"],
  data() {
    return {
      localFeatures: { ...this.modelValue },
      featuresList: {
        Safety: [
          { name: "Seatbelts and Airbags", key: "seatbeltsAndAirbags" },
          { name: "Anti-lock Braking System (ABS)", key: "abs" },
          { name: "Electronic Stability Control (ESC)", key: "esc" },
          { name: "Back-up Camera", key: "backupCamera" },
          { name: "Blind Spot Monitoring (BSM)", key: "bsm" },
          { name: "Tire Pressure Monitoring System (TPMS)", key: "tpms" },
          { name: "Forward Collision Warning (FCW)", key: "fcw" },
        ],
        "Device Connectivity": [
          { name: "Bluetooth", key: "bluetooth" },
          { name: "USB Port", key: "usbPort" },
          { name: "Apple CarPlay", key: "appleCarPlay" },
          { name: "Android Auto", key: "androidAuto" },
        ],
        Convenience: [
          { name: "GPS Navigation", key: "gps" },
          { name: "Keyless Entry", key: "keylessEntry" },
          { name: "Heated Seats", key: "heatedSeats" },
          { name: "Sunroof", key: "sunroof" },
        ],
        "Additional Features": [
          { name: "Child Seat", key: "childSeat" },
          { name: "Bike Rack", key: "bikeRack" },
          { name: "Roof Box", key: "roofBox" },
          { name: "Pet Friendly", key: "petFriendly" },
        ],
      },
    };
  },
  watch: {
    // Watch local data and emit changes to parent
    localFeatures: {
      handler(newVal) {
        this.$emit("update:modelValue", newVal);
      },
      deep: true,
    },

    // Watch for parent changes (e.g., form reset)
    modelValue(newVal) {
      // THIS CHECK PREVENTS THE INFINITE LOOP
      if (JSON.stringify(newVal) !== JSON.stringify(this.localFeatures)) {
        this.localFeatures = { ...newVal };
      }
    },
  },
  methods: {
    // No other methods needed, v-model handles it all
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

/* --- Entrance Animation --- */
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

.features-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-category {
  .category-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $text-color-dark;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $border-color-light;
  }
}

.features-checkbox-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem;

  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr; // 2 columns on larger screens
  }
}

/* --- New Checkbox Styles (Copied from VehicleSafety) --- */
.checkbox-item {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.75rem 0.5rem;
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
    flex-shrink: 0; // Prevent checkmark from shrinking
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
</style>
