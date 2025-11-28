<template>
  <div class="seats-filter-container">
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
        <p class="dropdown-title">Minimum number of seats</p>

        <div class="seats-row">
          <button
            v-for="count in seatOptions"
            :key="count"
            class="seat-button"
            :class="{ active: localSeats === count }"
            @click="selectSeats(count)"
          >
            {{ count }}{{ count === 8 ? "+" : "" }}
          </button>
        </div>
      </div>

      <div class="dropdown-footer">
        <button
          class="dropdown-button secondary full-width"
          @click="handleReset"
          :disabled="!isApplied"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SeatsFilter",
  props: {
    selectedSeats: Number,
    isActive: Boolean,
  },
  emits: ["update:seats", "reset", "toggle-dropdown"],
  data() {
    return {
      localSeats: this.selectedSeats,
      seatOptions: [2, 4, 5, 7, 8], // 8 means 8 or more
    };
  },
  computed: {
    isApplied() {
      return this.selectedSeats !== null;
    },
    buttonLabel() {
      if (this.isApplied) {
        return this.selectedSeats === 8
          ? "8+ Seats"
          : `${this.selectedSeats} Seats`;
      }
      return "Seats";
    },
  },
  watch: {
    selectedSeats(newVal) {
      this.localSeats = newVal;
    },
    isActive(newVal) {
      if (newVal) {
        this.localSeats = this.selectedSeats;
      }
    },
  },
  methods: {
    selectSeats(count) {
      this.localSeats = count;
      this.$emit("update:seats", count);
      this.$emit("toggle-dropdown");
    },
    handleReset() {
      this.localSeats = null;
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
  width: 280px;
  left: auto; // Align appropriately
}

.dropdown-body {
  padding: 1rem;
}

.dropdown-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  color: $text-color-dark; /* Ensure title is visible */
}

// --- SEAT BUTTONS ROW ---
.seats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center; /* Center the buttons */
}

.seat-button {
  width: 45px;
  height: 45px;
  border-radius: 50%; /* Circle shape */
  border: 1px solid $border-color;
  background-color: #fff; /* White background by default */
  color: $text-color-dark; /* Dark text for visibility */
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: $primary-color;
    background-color: #f9fafb;
  }

  // Active State (Selected)
  &.active {
    background-color: $primary-color;
    color: white; /* White text on primary background */
    border-color: $primary-color;
    box-shadow: 0 2px 6px rgba($primary-color, 0.3);
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
