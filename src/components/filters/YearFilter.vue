<template>
  <div class="year-filter-container">
    <button class="filter-trigger" :class="{ 'active': isActive || isApplied }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-body">
        <div class="scrollable-list">
          <div
            class="list-item"
            :class="{ 'active': localYear === null }"
            @click="selectYear(null)"
          >
            All Years
          </div>
          <div
            v-for="year in uniqueYears"
            :key="year"
            class="list-item"
            :class="{ 'active': localYear === year }"
            @click="selectYear(year)"
          >
            {{ year }}
          </div>
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
  name: "YearFilter",
  props: {
    selectedYear: Number,
    allVehicles: { type: Array, default: () => [] },
    isActive: Boolean,
  },
  emits: ['update:year', 'reset', 'toggle-dropdown'],
  data() {
    return {
      localYear: this.selectedYear,
    };
  },
  computed: {
    isApplied() {
      // Filter is applied if a year is selected (not null)
      return this.selectedYear !== null;
    },
    buttonLabel() {
      return this.isApplied ? `Year: ${this.selectedYear}` : "Year";
    },
    uniqueYears() {
      // Get all years, filter out null/undefined, create unique set, sort descending
      const years = this.allVehicles.map(v => v.year).filter(Boolean);
      return [...new Set(years)].sort((a, b) => b - a);
    },
  },
  watch: {
    selectedYear(newVal) {
      this.localYear = newVal;
    },
    isActive(newVal) {
      // When dropdown opens, sync local state with props
      if (newVal) {
        this.localYear = this.selectedYear;
      }
    }
  },
  methods: {
    selectYear(year) {
      this.localYear = year;
      this.$emit('update:year', year);
      this.$emit('toggle-dropdown');
    },
    handleReset() {
      this.localYear = null;
      this.$emit('reset');
      this.$emit('toggle-dropdown');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './_FilterDropdown.scss';

// This dropdown can be narrower
.filter-dropdown-content {
  width: 200px;
}
</style>

