<template>
  <div class="sort-filter-container">
    <!-- This is the button visible on the page -->
    <button class="filter-trigger" :class="{ 'active': isActive }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <!-- This is the dropdown panel -->
    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-body">
        <!-- Replaced .scrollable-list with a cleaner button-based list -->
        <div class="sort-options-list">
          <button
            v-for="option in sortOptions"
            :key="option.key + '-' + option.order"
            class="sort-option-button"
            :class="{ 'active': localSortKey === option.key && localSortOrder === option.order }"
            @click="selectSort(option)"
          >
            <span>{{ option.label }}</span>
            <!-- Show a checkmark only for the active item -->
            <i v-if="localSortKey === option.key && localSortOrder === option.order" class="bi bi-check-lg"></i>
          </button>
        </div>
      </div>
      <!-- No footer needed for sort, selection is immediate -->
    </div>
  </div>
</template>

<script>
export default {
  name: "SortFilter",
  props: {
    sortKey: String,
    sortOrder: String,
    isActive: Boolean,
  },
  emits: ['update:sort-key', 'update:sort-order', 'toggle-dropdown'],
  data() {
    return {
      localSortKey: this.sortKey,
      localSortOrder: this.sortOrder,
      sortOptions: [
        { label: 'Price (Low to High)', key: 'rentalPricePerDay', order: 'asc' },
        { label: 'Price (High to Low)', key: 'rentalPricePerDay', order: 'desc' },
        { label: 'Year (Newest First)', key: 'year', order: 'desc' },
        { label: 'Year (Oldest First)', key: 'year', order: 'asc' },
      ],
    };
  },
  computed: {
    buttonLabel() {
      const option = this.sortOptions.find(opt => opt.key === this.sortKey && opt.order === this.sortOrder);
      // Use a cleaner label for the button
      return option ? `Sort: ${option.label}` : 'Sort by';
    },
  },
  watch: {
    // Watch for prop changes (e.g., from "Reset All")
    sortKey(newVal) {
      this.localSortKey = newVal;
    },
    sortOrder(newVal) {
      this.localSortOrder = newVal;
    },
    // Sync local state when dropdown is opened
    isActive(newVal) {
      if (newVal) {
        this.localSortKey = this.sortKey;
        this.localSortOrder = this.sortOrder;
      }
    }
  },
  methods: {
    selectSort(option) {
      this.localSortKey = option.key;
      this.localSortOrder = option.order;
      this.$emit('update:sort-key', option.key);
      this.$emit('update:sort-order', option.order);
      this.$emit('toggle-dropdown'); // Close dropdown after selection
    },
  },
};
</script>

<style lang="scss" scoped>
// Import the shared styles for the dropdown panel itself
@import './_FilterDropdown.scss';

// --- Local styles for the Sort Options ---

// Adjust dropdown width and alignment
.filter-dropdown-content {
  width: 280px; 
  left: auto; // Align to the right
  right: 0; 
}

// Remove padding from the body to let buttons fill the space
.dropdown-body {
  padding: 0.5rem; // Add a little padding around the list
  max-height: none; // Sort list is short, no scroll needed
}

.sort-options-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; // Small gap between buttons
}

.sort-option-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.85rem 1rem; // Comfortable padding
  border: none;
  background-color: #fff; // Transparent background
  border-radius: $border-radius-md; // Match dropdown radius
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  color: $text-color-dark;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  i {
    font-size: 1.2rem;
    color: $primary-color; // Checkmark color
  }

  &:hover {
    background-color: $background-light; // Hover effect
  }

  // Active state
  &.active {
    background-color: lighten($primary-color, 45%); // Light primary background
    color: $primary-color;
    font-weight: 700;
  }
}
</style>

