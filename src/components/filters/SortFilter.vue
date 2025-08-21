<template>
  <div>
    <button @click="$emit('toggle-dropdown')" class="dropdown-button" :class="{ active: isActive }">
      Sort by: {{ sortLabel }}
      <span class="dropdown-arrow">▼</span>
    </button>
    <div v-if="isActive" class="dropdown-content sort-dropdown">
      <ul class="dropdown-list">
        <li
          v-for="option in sortOptions"
          :key="option.key + '-' + option.order"
          @click="selectSortOption(option)"
          :class="{ selected: sortKey === option.key && sortOrder === option.order }"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  sortKey: {
    type: String,
    required: true,
  },
  sortOrder: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:sort-key', 'update:sort-order', 'toggle-dropdown']);

const sortOptions = [
  { label: 'Price (Low to High)', key: 'rentalPricePerDay', order: 'asc' },
  { label: 'Price (High to Low)', key: 'rentalPricePerDay', order: 'desc' },
  { label: 'Year (Newest First)', key: 'year', order: 'desc' },
  { label: 'Year (Oldest First)', key: 'year', order: 'asc' },
];

const sortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.key === props.sortKey && opt.order === props.sortOrder);
  return option ? option.label : 'Price (Low to High)';
});

const selectSortOption = (option) => {
  emit('update:sort-key', option.key);
  emit('update:sort-order', option.order);
};
</script>

<style scoped>
.dropdown-content {
  position: absolute;
  top: calc(100% + 10px);
  right: 0; /* Align the dropdown to the right */
  left: auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 1rem;
  width: 250px;
}

.sort-dropdown .dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sort-dropdown .dropdown-list li {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  color: #4a5568;
}

.sort-dropdown .dropdown-list li:hover {
  background-color: #f7fafc;
}

.sort-dropdown .dropdown-list li.selected {
  background-color: #ebf4ff;
  color: #2c52ff;
  font-weight: 600;
}
</style>
