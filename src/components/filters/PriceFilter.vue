<template>
  <div class.="price-filter-container">
    <!-- This is the button visible on the page -->
    <button class="filter-trigger" :class="{ 'active': isActive || isApplied }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <!-- This is the dropdown panel -->
    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-body">
        <p class="dropdown-title">Price per day</p>
        
        <div class="price-inputs">
          <div class="input-group">
            <label for="min-price">Min Price</label>
            <input id="min-price" type="number" v-model.number="localMin" placeholder="₱0" />
          </div>
          <span class="separator">-</span>
          <div class="input-group">
            <label for="max-price">Max Price</label>
            <input id="max-price" type="number" v-model.number="localMax" :placeholder="`₱${maxValue.toLocaleString()}`" />
          </div>
        </div>
        <!-- A range slider component could be added here -->
      </div>

      <div class="dropdown-footer">
        <button class="dropdown-button secondary" @click="handleReset">Reset</button>
        <button class="dropdown-button primary" @click="applyFilter">Apply</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PriceFilter",
  props: {
    minPrice: Number,
    maxPrice: Number,
    maxValue: { type: Number, default: 100000 },
    isActive: Boolean,
  },
  emits: ['update:price', 'reset', 'toggle-dropdown'],
  data() {
    return {
      localMin: this.minPrice,
      localMax: this.maxPrice === this.maxValue ? null : this.maxPrice, // Use null for placeholder
    };
  },
  computed: {
    isApplied() {
      // Check if filter is different from default (0 and maxValue)
      return this.minPrice > 0 || (this.maxPrice < this.maxValue && this.maxPrice !== null);
    },
    buttonLabel() {
      if (this.isApplied) {
        const min = this.minPrice > 0 ? `₱${this.minPrice.toLocaleString()}` : '';
        const max = (this.maxPrice < this.maxValue && this.maxPrice !== null) ? `₱${this.maxPrice.toLocaleString()}` : '';
        if (min && max) return `${min} - ${max}`;
        if (min) return `${min}+`;
        if (max) return `Up to ${max}`;
      }
      return "Price";
    },
  },
  watch: {
    isActive(newVal) {
      // When dropdown opens, sync local state with props
      if (newVal) {
        this.localMin = this.minPrice;
        this.localMax = this.maxPrice === this.maxValue ? null : this.maxPrice;
      }
    }
  },
  methods: {
    applyFilter() {
      const min = this.localMin || 0;
      const max = (this.localMax === null || this.localMax === 0) ? this.maxValue : this.localMax;
      this.$emit('update:price', { min, max });
      this.$emit('toggle-dropdown');
    },
    handleReset() {
      this.localMin = 0;
      this.localMax = null;
      this.$emit('reset');
      this.$emit('toggle-dropdown');
    },
  },
};
</script>

<style lang="scss" scoped>
// Import the shared styles
@import './_FilterDropdown.scss';

// Local styles (e.g., trigger button) are handled by parent
// We only import shared styles for the dropdown content
.dropdown-title {
    font-weight: 600;
    margin-bottom: 1rem;
}
</style>

