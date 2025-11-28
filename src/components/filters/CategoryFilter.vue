<template>
  <div class="category-filter-container">
    <button
      class="filter-trigger"
      :class="{ active: isActive || isApplied }"
      @click="$emit('toggle-dropdown')"
    >
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <div class="filter-dropdown-content" :class="{ active: isActive }">
      <div class="dropdown-body">
        <div class="category-options-list">
          <button
            v-for="cat in categories"
            :key="cat.value || 'all'"
            class="category-option-button"
            :class="{ active: localAssetType === cat.value }"
            @click="selectCategory(cat.value)"
          >
            <div class="option-label">
              <i :class="cat.icon"></i>
              <span>{{ cat.name }}</span>
            </div>

            <i
              v-if="localAssetType === cat.value"
              class="bi bi-check-lg check-icon"
            ></i>
          </button>
        </div>
      </div>
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
  emits: ["update:assetType", "toggle-dropdown"],
  data() {
    return {
      localAssetType: this.assetType,
      categories: [
        { name: "All Categories", value: null, icon: "bi bi-grid-fill" },
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
      const cat = this.categories.find((c) => c.value === this.assetType);
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
    },
  },
  methods: {
    selectCategory(type) {
      this.localAssetType = type;
      this.$emit("update:assetType", type);
      this.$emit("toggle-dropdown");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./_FilterDropdown.scss";

// Dropdown Dimensions
.filter-dropdown-content {
  width: 240px; // Cleaner, standard width
  left: 0;
}

// --- List Styling ---
.dropdown-body {
  padding: 0.5rem;
}

.category-options-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-option-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background-color: transparent;
  border-radius: $border-radius-md;
  text-align: left;
  font-size: 0.95rem;
  color: $text-color-dark;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  // Left side (Icon + Text)
  .option-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
      font-size: 1.1rem;
      color: $text-color-medium;
      transition: color 0.2s;
    }
    span {
      font-weight: 500;
    }
  }

  // Hover State
  &:hover {
    background-color: $background-light;
    .option-label i {
      color: $text-color-dark;
    }
  }

  // Active/Selected State
  &.active {
    background-color: lighten($primary-color, 45%);
    color: $primary-color;

    .option-label {
      span {
        font-weight: 700;
      }
      i {
        color: $primary-color;
      }
    }

    .check-icon {
      font-size: 1.1rem;
      color: $primary-color;
    }
  }
}

/* Trigger Button overrides (Optional, if you want specific width) */
.filter-trigger {
  &.active {
    border-color: $primary-color;
    background-color: lighten($primary-color, 48%);
    color: $primary-color;
  }
}
</style>
