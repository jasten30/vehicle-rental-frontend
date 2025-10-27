<template>
  <div class="type-filter-container">
    <button class="filter-trigger" :class="{ 'active': isActive || isApplied }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-body">
        <div class="type-grid">
          <button
            v-for="type in vehicleTypes"
            :key="type"
            class="type-button"
            :class="{ 'active': localType === type }"
            @click="selectType(type)"
          >
            <!-- You can add icons here later if you want -->
            {{ type }}
          </button>
        </div>
      </div>
      <div class="dropdown-footer">
        <button class="dropdown-button secondary" @click="handleReset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TypeFilter",
  props: {
    vehicleType: String,
    isActive: Boolean,
  },
  emits: ['update:type', 'reset', 'toggle-dropdown'],
  data() {
    return {
      localType: this.vehicleType,
      // Define the types you want to offer as filters
      vehicleTypes: ["Sedan", "SUV", "Truck", "Van", "Motorcycle", "Convertible"],
    };
  },
  computed: {
    isApplied() {
      // The filter is applied if a vehicleType is selected
      return !!this.vehicleType;
    },
    buttonLabel() {
      // Show the selected type or the default label
      return this.isApplied ? this.vehicleType : "Vehicle Type";
    },
  },
  watch: {
    // Watch for prop changes (e.g., from "Reset All")
    vehicleType(newVal) {
      this.localType = newVal;
    },
    // Sync local state when dropdown is opened
    isActive(newVal) {
      if (newVal) {
        this.localType = this.vehicleType;
      }
    }
  },
  methods: {
    selectType(type) {
      this.localType = type;
      this.$emit('update:type', type);
      this.$emit('toggle-dropdown'); // Close dropdown after selection
    },
    handleReset() {
      this.localType = "";
      this.$emit('reset');
      this.$emit('toggle-dropdown'); // Close dropdown after reset
    },
  },
};
</script>

<style lang="scss" scoped>
// Import the shared styles from the file in the Canvas
@import './_FilterDropdown.scss';

// Styles for the trigger button are in VehicleListView.vue
// The .scss file handles the dropdown panel and component-specific styles
</style>

