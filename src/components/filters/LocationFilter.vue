<template>
  <div class="location-autocomplete-container" v-click-outside="closeDropdown">
    <div class="search-input-wrapper" :class="{ focused: isFocused }">
      <i class="bi bi-geo-alt-fill location-icon"></i>

      <input
        type="text"
        v-model="searchQuery"
        :placeholder="location ? location : 'Search by location...'"
        class="search-input"
        @focus="openDropdown"
        @input="openDropdown"
      />

      <i
        v-if="location || searchQuery"
        class="bi bi-x-circle-fill clear-btn"
        @click="clearLocation"
        title="Clear location"
      ></i>
    </div>

    <transition name="fade">
      <div v-if="isOpen" class="autocomplete-dropdown">
        <div v-if="filteredCities.length === 0" class="no-results">
          No cities found matching "{{ searchQuery }}"
        </div>

        <div v-else class="city-list">
          <div
            class="city-item"
            @click="selectLocation('')"
            :class="{ selected: !location }"
          >
            <span>All Locations</span>
          </div>

          <div
            v-for="city in filteredCities"
            :key="city"
            class="city-item"
            @click="selectLocation(city)"
            :class="{ selected: location === city }"
          >
            <span class="city-name">{{ city }}</span>
            <span class="count-badge">{{ getCountForCity(city) }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "LocationFilter",
  props: {
    location: String,
    allVehicles: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:location"],

  data() {
    return {
      searchQuery: "",
      isOpen: false,
      isFocused: false,
    };
  },
  computed: {
    uniqueCities() {
      if (!this.allVehicles) return [];
      const cities = this.allVehicles
        .filter((v) => v && v.location)
        .map((v) => v.location.city)
        .filter((city) => city);
      return [...new Set(cities)].sort();
    },
    filteredCities() {
      if (!this.searchQuery) return this.uniqueCities;
      const query = this.searchQuery.toLowerCase();
      return this.uniqueCities.filter((city) =>
        city.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    openDropdown() {
      this.isOpen = true;
      this.isFocused = true;
    },
    closeDropdown() {
      this.isOpen = false;
      this.isFocused = false;
      // If they typed something but didn't select, reset search query to current location
      if (!this.location) this.searchQuery = "";
    },
    selectLocation(city) {
      this.$emit("update:location", city);
      this.searchQuery = city; // Update input text
      this.closeDropdown();
    },
    clearLocation() {
      this.$emit("update:location", "");
      this.searchQuery = "";
      this.openDropdown(); // Keep open so they can pick a new one
    },
    getCountForCity(city) {
      if (!this.allVehicles) return 0;
      return this.allVehicles.filter((v) => v.location?.city === city).length;
    },
  },
  // Simple directive to handle clicking outside
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.body.addEventListener("click", el.clickOutsideEvent);
      },
      unmounted(el) {
        document.body.removeEventListener("click", el.clickOutsideEvent);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.location-autocomplete-container {
  position: relative;
  width: 100%;
  min-width: 260px; /* Ensure it has a good width */
}

/* --- SEARCH BAR STYLE --- */
.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 50px; /* Pill shape */
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  &.focused {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px lighten($primary-color, 40%);
    background: #fff;
  }

  .location-icon {
    color: $text-color-medium;
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  .search-input {
    border: none;
    outline: none;
    font-size: 0.95rem;
    width: 100%;
    background: transparent;
    color: $text-color-dark;

    &::placeholder {
      color: #9ca3af;
    }
  }

  .clear-btn {
    color: #9ca3af;
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.2s;
    margin-left: 0.5rem;

    &:hover {
      color: #ef4444; /* Red */
    }
  }
}

/* --- DROPDOWN LIST --- */
.autocomplete-dropdown {
  position: absolute;
  top: 115%; /* Slight gap */
  left: 0;
  right: 0; /* Full width of parent */
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 100;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.city-list {
  display: flex;
  flex-direction: column;
}

.city-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.1s;
  font-size: 0.9rem;
  color: $text-color-dark;

  &:hover {
    background-color: #f3f4f6;
  }

  &.selected {
    background-color: lighten($primary-color, 45%);
    color: $primary-color;
    font-weight: 600;

    .count-badge {
      background-color: $primary-color;
      color: white;
    }
  }
}

.count-badge {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- SCROLLBAR --- */
.autocomplete-dropdown::-webkit-scrollbar {
  width: 6px;
}
.autocomplete-dropdown::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}
</style>
