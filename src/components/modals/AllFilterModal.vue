<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close-modal')">
      <div class="modal">
        <div class="modal-header">
          <h3>Filter Options</h3>
          <button @click="$emit('close-modal')" class="close-button">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="filters-container">
            <!-- Price Filter -->
            <div class="filter-group">
              <label for="minPrice" class="filter-label">Daily Price</label>
              <div class="price-range">
                <span>{{ localFilterForm.minPrice }}</span>
                <input
                  type="range"
                  id="minPrice"
                  v-model.number="localFilterForm.minPrice"
                  :min="0"
                  :max="maxPrice"
                  class="price-slider"
                />
                <span>{{ maxPrice }}</span>
              </div>
            </div>

            <!-- Vehicle Type Filter -->
            <div class="filter-group">
              <label for="vehicleType" class="filter-label">Vehicle Type</label>
              <select
                id="vehicleType"
                v-model="localFilterForm.vehicleType"
                class="filter-select"
              >
                <option :value="null">All Types</option>
                <option v-for="type in uniqueTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <!-- Make Filter -->
            <div class="filter-group">
              <label for="make" class="filter-label">Make</label>
              <select
                id="make"
                v-model="localFilterForm.make"
                class="filter-select"
              >
                <option :value="null">All Makes</option>
                <option v-for="make in uniqueMakes" :key="make" :value="make">
                  {{ make }}
                </option>
              </select>
            </div>

            <!-- Model Filter (conditionally rendered) -->
            <div class="filter-group" v-if="localFilterForm.make">
              <label for="model" class="filter-label">Model</label>
              <select
                id="model"
                v-model="localFilterForm.model"
                class="filter-select"
              >
                <option :value="null">All Models</option>
                <option
                  v-for="model in uniqueModels"
                  :key="model"
                  :value="model"
                >
                  {{ model }}
                </option>
              </select>
            </div>

            <!-- Year Filter -->
            <div class="filter-group">
              <label for="year" class="filter-label">Year</label>
              <select
                id="year"
                v-model.number="localFilterForm.year"
                class="filter-select"
              >
                <option :value="null">All Years</option>
                <option v-for="year in uniqueYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <!-- Seats Filter -->
            <div class="filter-group">
              <label for="seats" class="filter-label">Seats</label>
              <select
                id="seats"
                v-model.number="localFilterForm.seats"
                class="filter-select"
              >
                <option :value="null">Any</option>
                <option value="4">4 seats</option>
                <option value="5">5 seats</option>
                <option value="7">7+ seats</option>
                <option value="8">8+ seats</option>
                <option value="12">12+ seats</option>
                <option value="15">15+ seats</option>
              </select>
            </div>
          </div>

          <div class="sort-section">
            <h4 class="sort-label">Sort By</h4>
            <div class="sort-controls">
              <button
                :class="{ active: localSortForm.key === 'rentalPricePerDay' }"
                @click="updateSort('rentalPricePerDay', localSortForm.order)"
                class="sort-button"
              >
                Price
              </button>
              <button
                :class="{ active: localSortForm.key === 'year' }"
                @click="updateSort('year', localSortForm.order)"
                class="sort-button"
              >
                Year
              </button>
            </div>
            <div class="sort-order">
              <button
                :class="{ active: localSortForm.order === 'asc' }"
                @click="updateSort(localSortForm.key, 'asc')"
                class="sort-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 11-2 0V4h-4zM10 3a1 1 0 011-1H4a1 1 0 011 1v12a1 1 0 11-2 0V4h4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Ascending
              </button>
              <button
                :class="{ active: localSortForm.order === 'desc' }"
                @click="updateSort(localSortForm.key, 'desc')"
                class="sort-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 11-2 0V4h-4zM10 3a1 1 0 011-1H4a1 1 0 011 1v12a1 1 0 11-2 0V4h4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Descending
              </button>
            </div>
          </div>
          <button @click="handleReset" class="reset-button">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, reactive, computed, watch } from "vue";

const props = defineProps({
  show: Boolean,
  allVehicles: Array,
  filterForm: Object,
  sortForm: Object,
  maxPrice: Number,
});

const emit = defineEmits([
  "close-modal",
  "reset-filters",
  "update:sort-key",
  "update:sort-order",
  "update:filter-form",
]);

// Use reactive clones of props to avoid mutating them directly
const localFilterForm = reactive({ ...props.filterForm });
const localSortForm = reactive({ ...props.sortForm });

// Watch for prop changes and update local state
watch(
  () => props.filterForm,
  (newVal) => {
    Object.assign(localFilterForm, newVal);
  },
  { deep: true }
);

watch(
  () => props.sortForm,
  (newVal) => {
    Object.assign(localSortForm, newVal);
  },
  { deep: true }
);

// Computed properties for dropdown options
const uniqueTypes = computed(() => {
  if (!props.allVehicles) return [];
  const types = new Set(
    props.allVehicles.map((v) => v.vehicleType).filter(Boolean)
  );
  return Array.from(types).sort();
});

const uniqueMakes = computed(() => {
  if (!props.allVehicles) return [];
  const makes = new Set(props.allVehicles.map((v) => v.make));
  return Array.from(makes).sort();
});

const uniqueModels = computed(() => {
  if (!props.allVehicles || !localFilterForm.make) return [];
  const models = new Set(
    props.allVehicles
      .filter((v) => v.make === localFilterForm.make)
      .map((v) => v.model)
  );
  return Array.from(models).sort();
});

const uniqueYears = computed(() => {
  if (!props.allVehicles) return [];
  const years = new Set(props.allVehicles.map((v) => v.year));
  return Array.from(years).sort((a, b) => b - a);
});

// Watch local form changes and emit updates to parent
watch(
  localFilterForm,
  (newVal) => {
    emit("update:filter-form", newVal);
  },
  { deep: true }
);

// Function to handle sort updates
const updateSort = (key, order) => {
  localSortForm.key = key;
  localSortForm.order = order;
  emit("update:sort-key", key);
  emit("update:sort-order", order);
};

const handleReset = () => {
  emit("reset-filters");
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem; /* Reduced padding */
  border-radius: 12px;
  width: 90%;
  max-width: 450px; /* Reduced max-width */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced gap */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem; /* Reduced font size */
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem; /* Reduced font size */
  cursor: pointer;
  color: #4a5568;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced gap */
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(180px, 1fr)
  ); /* Adjusted grid columns for smaller size */
  gap: 0.75rem; /* Reduced gap */
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* Reduced gap */
}

.filter-label,
.sort-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  background: #e2e8f0;
  border-radius: 5px;
  outline: none;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #2c52ff;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
}

.sort-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Reduced gap */
}

.sort-controls,
.sort-order {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-button {
  background-color: white;
  color: #4a5568;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 0.875rem;
}

.sort-button.active {
  background-color: #2c52ff;
  color: white;
  border-color: #2c52ff;
}

.reset-button {
  background-color: #e53e3e;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
  align-self: flex-start;
  font-size: 0.875rem;
}

.reset-button:hover {
  background-color: #c53030;
}
</style>
