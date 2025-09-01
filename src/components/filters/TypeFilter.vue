<!-- src/components/filters/TypeFilter.vue -->
<template>
  <div>
    <button
      @click="$emit('toggle-dropdown')"
      class="dropdown-button"
      :class="{ active: isActive }"
    >
      Vehicle Type
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content vehicle-type-dropdown">
      <div class="vehicle-type-grid">
        <!-- Sedan -->
        <div
          class="vehicle-type-card"
          :class="{ selected: vehicleType === 'Sedan' }"
          @click="$emit('update:type', 'Sedan')"
        >
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path
              d="M20.5 9.5c0-.28-.22-.5-.5-.5H4c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5h16c.28 0 .5-.22.5-.5v-1zm-16 6h16c.28 0 .5.22.5.5v2.5c0 .28-.22.5-.5.5H4c-.28 0-.5-.22-.5-.5v-2.5c0-.28.22-.5.5-.5zM19 12h-1c-.55 0-1 .45-1 1v2h4v-2c0-.55-.45-1-1-1zM6 12h-1c-.55 0-1 .45-1 1v2h4v-2c0-.55-.45-1-1-1z"
            />
          </svg>
          <div class="vehicle-type-label">Sedan</div>
        </div>

        <!-- SUV -->
        <div
          class="vehicle-type-card"
          :class="{ selected: vehicleType === 'SUV' }"
          @click="$emit('update:type', 'SUV')"
        >
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path
              d="M21 17h-1.5c-1.39 0-2.5-1.11-2.5-2.5v-2.5H8v2.5c0 1.39-1.11 2.5-2.5 2.5H3c-.55 0-1 .45-1 1v1h22v-1c0-.55-.45-1-1-1zm-18 2h1.5c.83 0 1.5-.67 1.5-1.5v-2.5h10v2.5c0 .83.67 1.5 1.5 1.5H21v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-2.5H8v2.5c0 .83-.67 1.5-1.5 1.5H3v1zM12 2c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
            />
          </svg>
          <div class="vehicle-type-label">SUV</div>
        </div>

        <!-- MPV -->
        <div
          class="vehicle-type-card"
          :class="{ selected: vehicleType === 'MPV' }"
          @click="$emit('update:type', 'MPV')"
        >
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path
              d="M12 2L5 6v14h14V6L12 2zm-1 2.94L16 7.62V9h-5.5V4.94zm0 6.06H6v-3h5v3zm-5.5 3h1.5v1h-1.5v-1zm13 0h1.5v1h-1.5v-1zm-10.5 0h1.5v1h-1.5v-1zm10.5 0h1.5v1h-1.5v-1z"
            />
          </svg>
          <div class="vehicle-type-label">MPV</div>
        </div>

        <!-- Hatchback -->
        <div
          class="vehicle-type-card"
          :class="{ selected: vehicleType === 'Hatchback' }"
          @click="$emit('update:type', 'Hatchback')"
        >
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path
              d="M19 14h-1.5c-1.39 0-2.5-1.11-2.5-2.5v-2.5H8v2.5c0 1.39-1.11 2.5-2.5 2.5H3c-.55 0-1 .45-1 1v1h22v-1c0-.55-.45-1-1-1zM19 19c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM5 19c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
            />
          </svg>
          <div class="vehicle-type-label">Hatchback</div>
        </div>

        <!-- Van -->
        <div
          class="vehicle-type-card"
          :class="{ selected: vehicleType === 'Van' }"
          @click="$emit('update:type', 'Van')"
        >
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path
              d="M21.5 9h-3.5c-.28 0-.5.22-.5.5v2c0 .28.22.5.5.5H21c.55 0 1-.45 1-1v-1.5c0-.28-.22-.5-.5-.5zM17 12H7V9.5c0-.28.22-.5.5-.5h5.5v2.5h-5.5c-.28 0-.5.22-.5.5V17c0 .28.22.5.5.5h10c.28 0 .5-.22.5-.5v-4.5h-.5c-.28 0-.5-.22-.5-.5zM7 7.5h5.5V9H7c-.55 0-1 .45-1 1v4.5c0 .28.22.5.5.5h2.5c.28 0 .5-.22.5-.5V10.5c0-.28-.22-.5-.5-.5H7.5c-.28 0-.5.22-.5.5V13c0 .28.22.5.5.5h2.5c.28 0 .5-.22.5-.5v-2.5c0-.28-.22-.5-.5-.5H7.5c-.28 0-.5.22-.5.5V13c0 .28.22.5.5.5h2.5c.28 0 .5-.22.5-.5v-2.5c0-.28-.22-.5-.5-.5zM12.5 10.5V9h-5.5c-.28 0-.5-.22-.5-.5v-2c0-.28.22-.5.5-.5h5.5c.28 0 .5.22.5.5v2c0 .28-.22.5-.5.5z"
            />
          </svg>
          <div class="vehicle-type-label">Van</div>
        </div>

        <!-- Pickup Truck -->
        <div
          class="vehicle-type-card"
          :class="{ selected: vehicleType === 'Pickup Truck' }"
          @click="$emit('update:type', 'Pickup Truck')"
        >
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path
              d="M19 18h-1.5c-1.39 0-2.5-1.11-2.5-2.5v-2.5H8v2.5c0 1.39-1.11 2.5-2.5 2.5H3c-.55 0-1 .45-1 1v1h22v-1c0-.55-.45-1-1-1zm-18 2h1.5c.83 0 1.5-.67 1.5-1.5v-2.5h10v2.5c0 .83.67 1.5 1.5 1.5H21v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-2.5H8v2.5c0 .83-.67 1.5-1.5 1.5H3v1z"
            />
          </svg>
          <div class="vehicle-type-label">Pickup Truck</div>
        </div>
      </div>
      <ResultsSummary
        :filtered-count="filteredCount"
        :total-count="totalCount"
        @reset="$emit('reset')"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import ResultsSummary from "@/components/common/ResultsSummary.vue";

defineProps({
  vehicleType: { type: String, default: null },
  isActive: { type: Boolean, required: true },
  filteredCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
});

defineEmits(["update:type", "reset", "toggle-dropdown"]);
</script>

<style scoped>
.dropdown-content {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 1rem;
  width: 280px;
}

.vehicle-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.vehicle-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.vehicle-type-card:hover {
  background-color: #f7fafc;
}

.vehicle-type-card.selected {
  background-color: #e6eefc;
  border-color: #2c52ff;
}

.vehicle-icon {
  width: 24px;
  height: 24px;
  fill: #718096;
  transition: fill 0.2s ease-in-out;
}

.vehicle-type-card.selected .vehicle-icon {
  fill: #2c52ff;
}

.vehicle-type-label {
  font-size: 0.875rem;
  color: #4a5568;
  text-align: center;
  margin-top: 0.5rem;
  font-weight: 500;
}
</style>
