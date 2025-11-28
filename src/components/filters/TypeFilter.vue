<template>
  <div class="type-filter-container">
    <!-- Trigger Button -->
    <button
      class="filter-trigger"
      :class="{ active: isActive || isApplied }"
      @click="$emit('toggle-dropdown')"
    >
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <!-- Dropdown Panel -->
    <div class="filter-dropdown-content" :class="{ active: isActive }">
      <div class="dropdown-body">
        <div class="type-options-list">
          <button
            v-for="type in vehicleTypes"
            :key="type"
            class="type-option-button"
            :class="{ active: localType === type }"
            @click="selectType(type)"
          >
            <span>{{ type }}</span>
            <!-- Checkmark for active state -->
            <i v-if="localType === type" class="bi bi-check-lg check-icon"></i>
          </button>
        </div>
      </div>

      <!-- Footer with Reset -->
      <div class="dropdown-footer">
        <button
          class="dropdown-button secondary full-width"
          @click="handleReset"
          :disabled="!isApplied"
        >
          Reset Type
        </button>
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
    // Accepting these props to prevent warnings,
    // even if not visually used in the list items yet
    filteredCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
  },
  emits: ["update:type", "reset", "toggle-dropdown"],
  data() {
    return {
      localType: this.vehicleType,
      // UPDATED LIST: Removed "Motorcycle" (that is a Category)
      // and added actual Car Types to match your database
      vehicleTypes: [
        "Sedan",
        "SUV",
        "Van",
        "Truck",
        "Hatchback",
        "Coupe",
        "Convertible",
        "AUV/MPV",
      ],
    };
  },
  computed: {
    isApplied() {
      return !!this.vehicleType;
    },
    buttonLabel() {
      return this.isApplied ? this.vehicleType : "Vehicle Type";
    },
  },
  watch: {
    vehicleType(newVal) {
      this.localType = newVal;
    },
    isActive(newVal) {
      if (newVal) {
        this.localType = this.vehicleType;
      }
    },
  },
  methods: {
    selectType(type) {
      this.localType = type;
      this.$emit("update:type", type);
      this.$emit("toggle-dropdown");
    },
    handleReset() {
      this.localType = "";
      this.$emit("reset");
      this.$emit("toggle-dropdown");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./_FilterDropdown.scss";

// Dropdown Dimensions
.filter-dropdown-content {
  width: 220px;
  left: 0;
}

// --- List Styling ---
.dropdown-body {
  padding: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.type-options-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.type-option-button {
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

  &:hover {
    background-color: $background-light;
  }

  // Active State
  &.active {
    background-color: lighten($primary-color, 45%);
    color: $primary-color;
    font-weight: 600;

    .check-icon {
      font-size: 1.1rem;
      color: $primary-color;
    }
  }
}

// --- Footer ---
.dropdown-footer {
  padding: 0.75rem;
  border-top: 1px solid $border-color-light;
}

.dropdown-button {
  padding: 0.6rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;

  &.full-width {
    width: 100%;
  }

  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $border-color;
    &:hover {
      background-color: $background-light;
      color: $text-color-dark;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

/* Trigger Button overrides */
.filter-trigger {
  &.active {
    border-color: $primary-color;
    background-color: lighten($primary-color, 48%);
    color: $primary-color;
  }
}
</style>
