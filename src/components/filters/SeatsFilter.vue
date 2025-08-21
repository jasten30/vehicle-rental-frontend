<!-- src/components/filters/SeatsFilter.vue -->
<template>
  <div>
    <button @click="$emit('toggle-dropdown')" class="dropdown-button" :class="{ active: isActive }">
      Seats
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content seats-dropdown-content">
      <div class="seats-buttons-grid">
        <div class="seats-button" :class="{ selected: selectedSeats === null }" @click="$emit('update:seats', null)">
          Any
        </div>
        <div class="seats-button" :class="{ selected: selectedSeats === 2 }" @click="$emit('update:seats', 2)">
          2
        </div>
        <div class="seats-button" :class="{ selected: selectedSeats === 4 }" @click="$emit('update:seats', 4)">
          4
        </div>
        <div class="seats-button" :class="{ selected: selectedSeats === 5 }" @click="$emit('update:seats', 5)">
          5
        </div>
        <div class="seats-button" :class="{ selected: selectedSeats === 7 }" @click="$emit('update:seats', 7)">
          7+
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
  selectedSeats: { type: Number, default: null },
  isActive: { type: Boolean, required: true },
  filteredCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
});

defineEmits(['update:seats', 'reset', 'toggle-dropdown']);
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

.seats-buttons-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.seats-button {
  background-color: #edf2f7;
  color: #4a5568;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.seats-button:hover {
  background-color: #e2e8f0;
}

.seats-button.selected {
  background-color: #2c52ff;
  color: white;
}
</style>