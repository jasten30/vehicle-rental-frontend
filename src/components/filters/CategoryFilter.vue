<template>
  <div class.="category-filter-container">
    <!-- This is the button visible on the page -->
    <button class="filter-trigger" :class="{ 'active': isActive || isApplied }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <!-- This is the dropdown panel -->
    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-body">
        <div class="category-grid">
          <button
            v-for="cat in categories"
            :key="cat.value || 'all'"
            class="category-button"
            :class="{ 'active': localAssetType === cat.value }"
            @click="selectCategory(cat.value)"
          >
            <i :class="cat.icon"></i>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>
      <!-- No footer needed, selection is instant -->
    </div>
  </div>
</template>

<script>
export default {
  name: "CategoryFilter",
  props: {
    assetType: String,
    isActive: Boolean,
  },
  emits: ['update:assetType', 'toggle-dropdown'],
  data() {
    return {
      localAssetType: this.assetType,
      categories: [
        { name: "All", value: null, icon: "bi bi-grid-fill" },
        { name: "Cars", value: "vehicle", icon: "bi bi-car-front-fill" },
        { name: "Motorcycles", value: "motorcycle", icon: "bi bi-bicycle" },
      ],
    };
  },
  computed: {
    isApplied() {
      return !!this.assetType;
    },
    buttonLabel() {
      const cat = this.categories.find(c => c.value === this.assetType);
      return cat ? cat.name : "Category";
    },
  },
  watch: {
    assetType(newVal) {
      this.localAssetType = newVal;
    },
    isActive(newVal) {
      if (newVal) {
        this.localAssetType = this.assetType;
      }
    }
  },
  methods: {
    selectCategory(type) {
      this.localAssetType = type;
      this.$emit('update:assetType', type);
      this.$emit('toggle-dropdown');
    },
  },
};
</script>

<style lang="scss" scoped>
// Import the shared styles
@import './_FilterDropdown.scss';

// Local styles
.filter-dropdown-content {
  width: 320px; // Set a specific width
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // Three columns
  gap: 0.75rem;
}

.category-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  color: $text-color-dark;

  i {
    font-size: 1.75rem;
    color: $primary-color;
  }

  &:hover {
    background: $background-light;
    border-color: $text-color-dark;
  }

  &.active {
    background: $primary-color;
    border-color: $primary-color;
    color: white;
    font-weight: 600;
    box-shadow: $shadow-light;
    
    i {
      color: white;
    }
  }
}
</style>
