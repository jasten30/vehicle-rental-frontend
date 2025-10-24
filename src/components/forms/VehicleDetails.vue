<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Vehicle Details</h3>
      <p class="step-info-text">
        Now, fill out the rest of the details about your vehicle.
      </p>

      <!-- UPDATED: Replaced form-sub-section with form-grid -->
      <div class="form-grid">
        <div class="form-group">
          <label for="make">Make</label>
          <input
            type="text"
            id="make"
            :value="modelValue.make"
            @input="updateVehicle('make', $event.target.value)"
            placeholder="e.g., Toyota"
            required
          />
        </div>
        <div class="form-group">
          <label for="model">Model</label>
          <input
            type="text"
            id="model"
            :value="modelValue.model"
            @input="updateVehicle('model', $event.target.value)"
            placeholder="e.g., Vios"
            required
          />
        </div>
        <div class="form-group">
          <label for="year">Year</label>
          <input
            type="number"
            id="year"
            :value="modelValue.year"
            @input="updateVehicle('year', Number($event.target.value))"
            placeholder="e.g., 2020"
            min="1980"
            :max="new Date().getFullYear() + 1"
            required
          />
        </div>

        <div class="form-group">
          <label for="vehicleType">Vehicle Type</label>
          <select
            id="vehicleType"
            :value="modelValue.vehicleType"
            @change="updateVehicle('vehicleType', $event.target.value)"
            required
          >
            <option value="" disabled>Select a vehicle type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="MPV">MPV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Van">Van</option>
            <option value="Pickup Truck">Pickup Truck</option>
          </select>
        </div>

        <div class="form-group">
          <label for="seats">Seats</label>
          <select
            id="seats"
            :value="modelValue.seats"
            @change="updateVehicle('seats', Number($event.target.value))"
            required
          >
            <option value="" disabled>Select number of seats</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="15">15</option>
          </select>
        </div>

        <div class="form-group">
          <label for="transmission">Transmission</label>
          <select
            id="transmission"
            :value="modelValue.transmission"
            @change="updateVehicle('transmission', $event.target.value)"
            required
          >
            <option value="" disabled>Select transmission type</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div class="form-group">
          <label for="fuelType">Fuel Type</label>
          <select
            id="fuelType"
            :value="modelValue.fuelType"
            @change="updateVehicle('fuelType', $event.target.value)"
            required
          >
            <option value="" disabled>Select fuel type</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
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
        <button type="button" @click="nextStep" class="nav-button primary">
          Next
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "VehicleDetails",
  props: {
    // UPDATED: Changed prop name to 'modelValue' to support v-model
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        make: "",
        model: "",
        year: null,
        vehicleType: "",
        seats: null,
        transmission: "",
        fuelType: "",
      }),
    },
    // This prop is required by the parent, but not used in this component's logic
    initialVehicle: {
      type: Object,
      required: false, // Set to false to avoid conflict, parent passes it
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  // UPDATED: Changed emit event to 'update:modelValue'
  emits: ["update:modelValue", "next", "prev", "error"],
  data() {
    return {
      error: "",
    };
  },
  methods: {
    // UPDATED: This method now emits 'update:modelValue'
    updateVehicle(key, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [key]: value,
      });
    },
    // UPDATED: Validates 'modelValue' prop instead of 'initialVehicle'
    nextStep() {
      const { make, model, year, seats, vehicleType, transmission, fuelType } =
        this.modelValue;

      const isSeatsValid = typeof seats === "number" && seats > 0;

      const isValid =
        !!make &&
        !!model &&
        !!year &&
        isSeatsValid &&
        !!vehicleType &&
        !!transmission &&
        !!fuelType;

      if (isValid) {
        this.$emit("next");
        this.error = "";
      } else {
        this.error = "Please fill in all vehicle details to proceed.";
        this.$emit("error", this.error);
      }
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

/* --- New Responsive Grid --- */
.form-grid {
  display: grid;
  grid-template-columns: 1fr; // 1 column on mobile
  gap: 1.25rem;

  @media (min-width: 768px) { // 2 columns on desktop
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  margin-bottom: 0; // Use grid gap instead
  
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
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px lighten($primary-color, 40%);
  }

  /* Remove default select arrow */
  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%20fill%3D%22%236B7280%22%3E%3Cpath%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.6-3.6%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.65em auto;
    padding-right: 2.5rem;
  }

  .disabled-input {
    background-color: $background-light;
    cursor: not-allowed;
    color: $text-color-medium;
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
