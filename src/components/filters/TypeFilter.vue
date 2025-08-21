<!-- src/components/filters/TypeFilter.vue -->
<template>
  <div>
    <button @click="$emit('toggle-dropdown')" class="dropdown-button" :class="{ active: isActive }">
      Vehicle Type
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content vehicle-type-dropdown">
      <div class="vehicle-type-grid">
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'Car' }" @click="$emit('update:type', 'Car')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M18.92 6C18.66 5.8 18.3 5.75 17.9 5.75H6.1c-.4 0-.76.05-1.02.25C4.82 6.2 4.6 6.55 4.6 7v8.5c0 .45.22.8.48 1 .26.2.62.25 1.02.25h1.9c.4 0 .76-.05 1.02-.25.26-.2.48-.55.48-1v-1.5H13v1.5c0 .45.22.8.48 1 .26.2.62.25 1.02.25h1.9c.4 0 .76-.05 1.02-.25.26-.2.48-.55.48-1V7c0-.45-.22-.8-.48-1zM11.5 14H6.5v-1.5h5V14zM11.5 11H6.5V9.5h5V11zM11.5 8H6.5V6.5h5V8zM17.5 14H12.5v-1.5h5V14zM17.5 11H12.5V9.5h5V11zM17.5 8H12.5V6.5h5V8zM19 16.5c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zM5 16.5c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1z"/>
          </svg>
          <div class="vehicle-type-label">Cars</div>
        </div>
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'SUV' }" @click="$emit('update:type', 'SUV')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M21 17h-1.5c-1.39 0-2.5-1.11-2.5-2.5v-2.5H8v2.5c0 1.39-1.11 2.5-2.5 2.5H3c-.55 0-1 .45-1 1v1h22v-1c0-.55-.45-1-1-1zm-18 2h1.5c.83 0 1.5-.67 1.5-1.5v-2.5h10v2.5c0 .83.67 1.5 1.5 1.5H21v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-2.5H8v2.5c0 .83-.67 1.5-1.5 1.5H3v1zM12 2c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
          <div class="vehicle-type-label">SUVs</div>
        </div>
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'Minivan' }" @click="$emit('update:type', 'Minivan')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M12 2L5 6v14h14V6L12 2zm-1 2.94L16 7.62V9h-5.5V4.94zm0 6.06H6v-3h5v3zm-5.5 3h1.5v1h-1.5v-1zm13 0h1.5v1h-1.5v-1zm-10.5 0h1.5v1h-1.5v-1zm10.5 0h1.5v1h-1.5v-1z"/>
          </svg>
          <div class="vehicle-type-label">Minivans</div>
        </div>
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'Truck' }" @click="$emit('update:type', 'Truck')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M19 18h-1.5c-1.39 0-2.5-1.11-2.5-2.5v-2.5H8v2.5c0 1.39-1.11 2.5-2.5 2.5H3c-.55 0-1 .45-1 1v1h22v-1c0-.55-.45-1-1-1zm-18 2h1.5c.83 0 1.5-.67 1.5-1.5v-2.5h10v2.5c0 .83.67 1.5 1.5 1.5H21v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-2.5H8v2.5c0 .83-.67 1.5-1.5 1.5H3v1z"/>
          </svg>
          <div class="vehicle-type-label">Trucks</div>
        </div>
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'Van' }" @click="$emit('update:type', 'Van')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M21.5 9h-3.5c-.28 0-.5.22-.5.5v2c0 .28.22.5.5.5H21c.55 0 1-.45 1-1v-1.5c0-.28-.22-.5-.5-.5zM17 12H7V9.5c0-.28.22-.5.5-.5h5.5v2.5h-5.5c-.28 0-.5.22-.5.5V17c0 .28.22.5.5.5h10c.28 0 .5-.22.5-.5v-4.5h-.5c-.28 0-.5-.22-.5-.5zM7 7.5h5.5V9H7c-.55 0-1 .45-1 1v4.5c0 .28.22.5.5.5h2.5c.28 0 .5-.22.5-.5V10.5c0-.28-.22-.5-.5-.5H7.5c-.28 0-.5.22-.5.5V13c0 .28.22.5.5.5h2.5c.28 0 .5-.22.5-.5v-2.5c0-.28-.22-.5-.5-.5H7.5c-.28 0-.5.22-.5.5V13c0 .28.22.5.5.5h2.5c.28 0 .5-.22.5-.5v-2.5c0-.28-.22-.5-.5-.5zM12.5 10.5V9h-5.5c-.28 0-.5-.22-.5-.5v-2c0-.28.22-.5.5-.5h5.5c.28 0 .5.22.5.5v2c0 .28-.22.5-.5.5z"/>
          </svg>
          <div class="vehicle-type-label">Vans</div>
        </div>
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'Cargo van' }" @click="$emit('update:type', 'Cargo van')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M21 9h-3v-2.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5V9h-3v-2.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5V9H3c-.55 0-1 .45-1 1v10h22v-10c0-.55-.45-1-1-1zm-18 10v-9h4v9h-4zM8 19v-9h4v9H8zm5 0v-9h4v9h-4zM18 19v-9h4v9h-4z"/>
          </svg>
          <div class="vehicle-type-label">Cargo vans</div>
        </div>
        <div class="vehicle-type-card" :class="{ selected: vehicleType === 'Box truck' }" @click="$emit('update:type', 'Box truck')">
          <svg viewBox="0 0 24 24" class="vehicle-icon">
            <path d="M21 9h-3v-2.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5V9h-3v-2.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5V9H3c-.55 0-1 .45-1 1v10h22v-10c0-.55-.45-1-1-1zm-18 10v-9h4v9h-4zM8 19v-9h4v9H8zm5 0v-9h4v9h-4zM18 19v-9h4v9h-4z"/>
          </svg>
          <div class="vehicle-type-label">Box trucks</div>
        </div>
      </div>
      <ResultsSummary :filtered-count="filteredCount" :total-count="totalCount" @reset="$emit('reset')" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import ResultsSummary from '@/components/common/ResultsSummary.vue';

defineProps({
  vehicleType: { type: String, default: null },
  isActive: { type: Boolean, required: true },
  filteredCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
});

defineEmits(['update:type', 'reset', 'toggle-dropdown']);
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