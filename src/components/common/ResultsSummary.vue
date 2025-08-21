<!-- src/components/common/ResultsSummary.vue -->
<template>
  <div class="results-summary-bar">
    <div class="divider"></div>
    <div class="summary-content">
      <p class="car-count">
        Showing <span class="count-number">{{ filteredCount }}</span> of <span class="count-number">{{ totalCount }}</span> available cars
      </p>
      <button @click="$emit('reset')" class="button reset-button">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  filteredCount: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
});

defineEmits(['reset']);
</script>

<style scoped>
.results-summary-bar {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.results-summary-bar .divider {
  border-top: 1px solid #e2e8f0;
  margin: 0 -1rem 1rem -1rem;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.car-count {
  font-size: 0.875rem;
  color: #4a5568;
}

.count-number {
  font-weight: 600;
  color: #2c52ff;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.reset-button {
  background-color: transparent;
  color: #2c52ff;
  border: 1px solid #2c52ff;
}

.reset-button:hover {
  background-color: #e6eefc;
}
</style>