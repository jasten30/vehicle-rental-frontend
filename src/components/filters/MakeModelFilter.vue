<!-- src/components/filters/MakeModelFilters.vue -->
<template>
  <div>
    <button
      @click="$emit('toggle-dropdown')"
      class="dropdown-button"
      :class="{ active: isActive }"
    >
      Make & Model
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content make-model-dropdown">
      <div class="filter-group">
        <label for="make">Make</label>
        <select id="make" v-model="selectedMake">
          <option :value="null">All Makes</option>
          <option v-for="make in uniqueMakes" :key="make" :value="make">
            {{ make }}
          </option>
        </select>
      </div>

      <div class="filter-group" v-if="selectedMake">
        <label for="model">Model</label>
        <select id="model" v-model="selectedModel">
          <option :value="null">All Models</option>
          <option v-for="model in uniqueModels" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
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
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import ResultsSummary from "@/components/common/ResultsSummary.vue";

const props = defineProps({
  selectedMake: {
    type: String,
    default: null,
  },
  selectedModel: {
    type: String,
    default: null,
  },
  allVehicles: {
    type: Array,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  filteredCount: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "update:make",
  "update:model",
  "reset",
  "toggle-dropdown",
]);

const selectedMake = ref(props.selectedMake);
const selectedModel = ref(props.selectedModel);

const uniqueMakes = computed(() => {
  const makes = new Set(props.allVehicles.map((v) => v.make));
  return [...makes].sort();
});

const uniqueModels = computed(() => {
  if (!selectedMake.value) {
    return [];
  }
  const models = new Set(
    props.allVehicles
      .filter((v) => v.make === selectedMake.value)
      .map((v) => v.model)
  );
  return [...models].sort();
});

// Watch for changes to selectedMake and emit the update event.
watch(selectedMake, (newMake) => {
  emit("update:make", newMake);
  // Reset the selected model when the make changes
  selectedModel.value = null;
});

// Watch for changes to selectedModel and emit the update event.
watch(selectedModel, (newModel) => {
  emit("update:model", newModel);
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

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #f7fafc;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3 3 3-3m0 0l-3-3-3 3' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
}
</style>
