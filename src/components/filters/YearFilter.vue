<template>
  <div>
    <button @click="$emit('toggle-dropdown')" class="dropdown-button" :class="{ active: isActive }">
      Years
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content">
      <div class="filter-options-group">
        <!-- "All Years" option using a radio button -->
        <div class="radio-option">
          <input 
            type="radio" 
            id="all-years" 
            :checked="selectedYear === null"
            @change="$emit('update:year', null)"
            name="year-filter"
            class="radio-input"
          >
          <label for="all-years" class="radio-label">All Years</label>
        </div>

        <!-- Dynamically generated year options -->
        <div v-for="year in uniqueYears" :key="year" class="radio-option">
          <input 
            type="radio" 
            :id="'year-' + year" 
            :checked="selectedYear === year"
            @change="$emit('update:year', year)"
            name="year-filter"
            class="radio-input"
          >
          <label :for="'year-' + year" class="radio-label">{{ year }}</label>
        </div>
      </div>
      <ResultsSummary :filtered-count="filteredCount" :total-count="totalCount" @reset="$emit('reset')" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import ResultsSummary from '@/components/common/ResultsSummary.vue';

const props = defineProps({
  selectedYear: { type: Number, default: null },
  allVehicles: { type: Array, required: true },
  isActive: { type: Boolean, required: true },
  filteredCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
});

defineEmits(['update:year', 'reset', 'toggle-dropdown']);

const uniqueYears = computed(() => {
  const years = new Set(props.allVehicles.map(v => v.year));
  return [...years].sort((a, b) => b - a); // Sort descending
});
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

.filter-options-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-input {
  /* Style the radio button itself */
  -webkit-appearance: none;
  appearance: none;
  background-color: #e2e8f0;
  margin: 0;
  font: inherit;
  width: 1.15em;
  height: 1.15em;
  border-radius: 50%;
  transform: translateY(-0.075em);
  display: grid;
  place-content: center;
  cursor: pointer;
}

.radio-input::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.15s ease-in-out;
  box-shadow: inset 1em 1em #2c52ff;
}

.radio-input:checked::before {
  transform: scale(1);
}

.radio-label {
  font-size: 1rem;
  color: #4a5568;
  cursor: pointer;
}
</style>
