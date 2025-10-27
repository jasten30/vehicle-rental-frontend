<template>
  <div class="seats-filter-container">
    <button class="filter-trigger" :class="{ 'active': isActive || isApplied }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-body">
        <p class="dropdown-title">Minimum number of seats</p>
        <div class="seats-row">
          <button
            v-for="count in seatOptions"
            :key="count"
            class="seat-button"
            :class="{ 'active': localSeats === count }"
            @click="selectSeats(count)"
          >
            {{ count }}{{ count === 8 ? '+' : '' }}
          </button>
        </div>
      </div>
      <div class="dropdown-footer">
        <button class="dropdown-button secondary" @click="handleReset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SeatsFilter",
  props: {
    selectedSeats: Number,
    isActive: Boolean,
  },
  emits: ['update:seats', 'reset', 'toggle-dropdown'],
  data() {
    return {
      localSeats: this.selectedSeats,
      seatOptions: [2, 4, 5, 7, 8], // 8 means 8 or more
    };
  },
  computed: {
    isApplied() {
      // Filter is applied if seats is selected (not null)
      return this.selectedSeats !== null;
    },
    buttonLabel() {
      if (this.isApplied) {
        return this.selectedSeats === 8 ? "8+ Seats" : `${this.selectedSeats} Seats`;
      }
      return "Seats";
    },
  },
  watch: {
    selectedSeats(newVal) {
      this.localSeats = newVal;
    },
    isActive(newVal) {
      // When dropdown opens, sync local state with props
      if (newVal) {
        this.localSeats = this.selectedSeats;
      }
    }
  },
  methods: {
    selectSeats(count) {
      this.localSeats = count;
      this.$emit('update:seats', count);
      this.$emit('toggle-dropdown');
    },
    handleReset() {
      this.localSeats = null;
      this.$emit('reset');
      this.$emit('toggle-dropdown');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './_FilterDropdown.scss';

.dropdown-title {
    font-weight: 600;
    margin-bottom: 1rem;
    color: $text-color-dark;
}
</style>

