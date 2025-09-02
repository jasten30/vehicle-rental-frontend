<template>
  <div class="form-section">
    <h2 class="form-title">Vehicle Features</h2>
    <p class="form-description">
      Select the features and amenities your vehicle offers to attract more
      renters.
    </p>

    <div class="features-grid-container">
      <div
        v-for="(features, category) in featuresList"
        :key="category"
        class="feature-category-card"
      >
        <h3 class="category-title">{{ category }}</h3>
        <div class="category-features-grid">
          <div
            v-for="feature in features"
            :key="feature.name"
            class="feature-item"
            :class="{ selected: selectedFeatures.includes(feature.name) }"
            @click="toggleFeature(feature)"
          >
            <input
              type="checkbox"
              class="form-checkbox"
              :checked="selectedFeatures.includes(feature.name)"
              :id="feature.name"
            />
            <label :for="feature.name" class="feature-label">
              <span class="feature-name">{{ feature.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button @click.prevent="$emit('prev')" class="btn-secondary">Back</button>
      <button @click.prevent="handleNext" class="btn-primary">Next</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "VehicleFeatures",
  props: {
    initialFeatures: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:features", "next", "prev", "error"],
  data() {
    return {
      selectedFeatures: [...this.initialFeatures],
      featuresList: {
        Safety: [
          { name: "Seatbelts and Airbags" },
          { name: "Anti-lock Braking System (ABS)" },
          { name: "Electronic Stability Control (ESC)" },
          { name: "Back-up Camera" },
          { name: "Blind Spot Monitoring (BSM)" },
          { name: "Tire Pressure Monitoring System (TPMS)" },
          {
            name: "Forward Collision Warning (FCW) and Automatic Emergency Braking (AEB)",
          },
        ],
        "Device Connectivity": [
          { name: "Bluetooth" },
          { name: "USB Port" },
          { name: "Apple CarPlay" },
          { name: "Android Auto" },
        ],
        Convenience: [
          { name: "GPS Navigation" },
          { name: "Keyless Entry" },
          { name: "Heated Seats" },
          { name: "Sunroof" },
        ],
        "Additional Features": [
          { name: "Child Seat" },
          { name: "Bike Rack" },
          { name: "Roof Box" },
          { name: "Pet Friendly" },
        ],
      },
    };
  },
  watch: {
    selectedFeatures(newVal) {
      this.$emit("update:features", newVal);
    },
  },
  methods: {
    toggleFeature(feature) {
      const index = this.selectedFeatures.indexOf(feature.name);
      if (index > -1) {
        this.selectedFeatures.splice(index, 1);
      } else {
        this.selectedFeatures.push(feature.name);
      }
    },
    validateStep() {
      // Clear any previous errors.
      this.$emit("error", "");

      // CRITICAL FIX: The previous validation required at least one feature from EVERY category.
      // This updated logic simply checks if at least one feature has been selected in total.
      if (this.selectedFeatures.length === 0) {
        this.$emit(
          "error",
          "Please select at least one feature for your vehicle."
        );
        return false;
      }
      return true;
    },
    handleNext() {
      if (this.validateStep()) {
        this.$emit("next");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// SASS Variables
$primary-color: #007bff;
$secondary-color: #28a745;
$accent-color: #fd7e14;
$accent-color-dark: #eb5915;

$text-color-dark: #343a40;
$text-color-medium: #6c757d;
$text-color-light: #f8f9fa;

$background-color: #f8f9fa;
$card-background: #ffffff;

$border-color: #dee2e6;
$border-radius-lg: 1rem;

$shadow-medium: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);

$font-family-base: "Inter", sans-serif;
$font-size-base: 1rem;

$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

.form-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  font-family: $font-family-base;
}

.form-title {
  color: $text-color-dark;
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: $spacing-sm;
}
.form-description {
  color: $text-color-medium;
  font-size: $font-size-base;
}
.features-grid-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}
.feature-category-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  border: 1px solid $border-color;
  box-shadow: $shadow-medium;
}
.category-title {
  color: $text-color-dark;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: $spacing-lg;
}
.category-features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-md;
}
.feature-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: $spacing-md;
  border-radius: $border-radius-lg;
  border: 2px solid $border-color;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.feature-item:hover {
  border-color: $primary-color;
}
.feature-item.selected {
  border-color: $primary-color;
  background-color: lighten($primary-color, 45%);
}
.form-checkbox {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid $border-color;
  accent-color: $primary-color;
  margin-right: $spacing-md;
  transform: scale(1.2);
}
.feature-label {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.feature-name {
  color: $text-color-medium;
  font-size: $font-size-base;
  font-weight: 500;
}
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-xl;
}
.btn-primary,
.btn-secondary {
  border-radius: $border-radius-lg;
  font-weight: 600;
  padding: 0.75rem 2rem;
  transition: background-color 0.2s;
  font-size: $font-size-base;
}
.btn-primary {
  background-color: $primary-color;
  color: $text-color-light;
}
.btn-primary:hover {
  background-color: darken($primary-color, 10%);
}
.btn-secondary {
  background-color: lighten($border-color, 5%);
  color: $text-color-dark;
}
.btn-secondary:hover {
  background-color: $border-color;
}
</style>
