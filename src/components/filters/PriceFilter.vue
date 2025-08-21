<template>
  <div>
    <button @click="$emit('toggle-dropdown')" class="dropdown-button" :class="{ active: isActive }">
      Daily Price
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content price-dropdown">
      <div class="custom-slider-container">
        <div class="slider-track-line"></div>
        <div class="slider-fill-line" :style="fillStyle"></div>
        <input 
          type="range"
          :min="0"
          :max="maxValue"
          v-model.number="localMinPrice"
          class="slider-input min-slider-input"
        >
        <input 
          type="range"
          :min="0"
          :max="maxValue"
          v-model.number="localMaxPrice"
          class="slider-input max-slider-input"
        >
      </div>
      <div class="price-inputs">
        <div class="price-input-group">
          <label for="min-price">Min</label>
          <input 
            id="min-price"
            type="number" 
            v-model.number="localMinPrice" 
            :min="0"
            :max="maxValue"
            class="price-input"
          >
        </div>
        <div class="price-input-group">
          <label for="max-price">Max</label>
          <input 
            id="max-price"
            type="number" 
            v-model.number="localMaxPrice" 
            :min="0"
            :max="maxValue"
            class="price-input"
          >
        </div>
      </div>
      <ResultsSummary :filtered-count="filteredCount" :total-count="totalCount" @reset="$emit('reset')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue';
import ResultsSummary from '@/components/common/ResultsSummary.vue';

const props = defineProps({
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  maxValue: { type: Number, required: true },
  isActive: { type: Boolean, required: true },
  filteredCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
});

const emit = defineEmits(['update:price', 'reset', 'toggle-dropdown']);

// Create local refs to hold the price values, avoiding direct prop mutation
const localMinPrice = ref(props.minPrice);
const localMaxPrice = ref(props.maxPrice);

// Watch for changes in the parent's props and update the local state
watch(() => props.minPrice, (newVal) => {
  localMinPrice.value = newVal;
});
watch(() => props.maxPrice, (newVal) => {
  localMaxPrice.value = newVal;
});

// Watch for changes in the local state and emit to the parent
let timeout = null;
watch([localMinPrice, localMaxPrice], ([newMin, newMax]) => {
  // Clear any existing timeout to debounce the emit
  if (timeout) clearTimeout(timeout);
  
  // Set a new timeout to emit the update after a short delay
  timeout = setTimeout(() => {
    // Ensure min price doesn't exceed max price
    const clampedMin = Math.min(newMin, localMaxPrice.value);
    // Ensure max price doesn't go below min price
    const clampedMax = Math.max(newMax, localMinPrice.value);

    // Emit the updated price range to the parent
    emit('update:price', { min: clampedMin, max: clampedMax });
  }, 100); // 100ms debounce
});

// Define computed property for the slider's colored fill line
const fillStyle = computed(() => {
  const left = (localMinPrice.value / props.maxValue) * 100;
  const width = ((localMaxPrice.value - localMinPrice.value) / props.maxValue) * 100;
  return {
    left: `${left}%`,
    width: `${width}%`,
  };
});
</script>

<style scoped>
/* Scoped styles for the component */
.dropdown-content {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 1.5rem 1rem 1rem;
  width: 280px;
}

.price-dropdown {
  padding-bottom: 0;
}

.custom-slider-container {
  position: relative;
  width: 100%;
  height: 10px;
  margin-bottom: 1.5rem;
}

.slider-track-line,
.slider-fill-line {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  border-radius: 2px;
}

.slider-track-line {
  width: 100%;
  background-color: #e2e8f0;
}

.slider-fill-line {
  background-color: #2c52ff;
}

.slider-input {
  position: absolute;
  width: 100%;
  height: 10px;
  background: transparent;
  -webkit-appearance: none;
  pointer-events: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #2c52ff;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
  pointer-events: all;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.min-slider-input {
  z-index: 2;
}

.max-slider-input {
  z-index: 3;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.price-input-group {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.price-input-group label {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.price-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  -moz-appearance: textfield;
}

.price-input::-webkit-inner-spin-button,
.price-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
