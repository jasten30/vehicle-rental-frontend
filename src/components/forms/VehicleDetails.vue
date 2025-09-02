<template>
  <div class="form-section step-2">
    <h3>Vehicle Details</h3>
    <p class="step-info-text">
      Now, fill out the rest of the details about your vehicle.
    </p>

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
        />
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
        />
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
        />
      </div>

      <div class="form-group">
        <label for="vehicleType">Vehicle Type</label>
        <select
          id="vehicleType"
          :value="initialVehicle.vehicleType"
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
          :value="initialVehicle.seats"
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
          :value="initialVehicle.transmission"
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
          :value="initialVehicle.fuelType"
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

    <div v-if="showNavigation" class="button-group">
      <button
        type="button"
        @click="$emit('prev')"
        class="button secondary-button"
      >
        Previous
      </button>
      <button type="button" @click="nextStep" class="button primary-button">
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
  name: "VehicleDetails",
  props: {
    initialVehicle: {
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
    isEditMode: {
      type: Boolean,
      default: false,
    },
    // Add the prop here
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:vehicle", "next", "prev", "error"],
  data() {
    return {
      error: "",
    };
  },
  methods: {
    updateVehicle(key, value) {
      this.$emit("update:vehicle", {
        ...this.initialVehicle,
        [key]: value,
      });
    },
    nextStep() {
      const { make, model, year, seats, vehicleType, transmission, fuelType } =
        this.initialVehicle;

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
  input[type="number"],
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }

  select {
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%20163.6c-4.3%204.3-10%206.6-16%206.6s-11.7-2.3-16-6.6L146.2%2053.4%2037.4%20163.6c-4.3%204.3-10%206.6-16%206.6s-11.7-2.3-16-6.6c-8.7-8.7-8.7-22.9%200-31.6l121.1-121.1c4.3-4.3%2010-6.6%2016-6.6s11.7%202.3%2016%206.6l121.2%20121.1c8.7%208.7%208.7%2022.9-.1%2031.6z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.6em auto;
    padding-right: 2.5rem;
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