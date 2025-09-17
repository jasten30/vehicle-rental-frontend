<template>
  <div class="form-step-container">
    <h3>Vehicle Availability</h3>
    <p class="step-info-text">
      Block out specific dates when your vehicle is not available for rent.
      Renters will not be able to select these dates.
    </p>

    <div class="availability-layout">
      <div class="input-section">
        <div class="block-dates-form">
          <div class="date-inputs">
            <div class="form-group">
              <label for="unavailable-start">Unavailable From</label>
              <input type="date" id="unavailable-start" v-model="newBlock.start" />
            </div>
            <div class="form-group">
              <label for="unavailable-end">Unavailable Until</label>
              <input type="date" id="unavailable-end" v-model="newBlock.end" />
            </div>
          </div>
          <button @click="addBlockedPeriod" class="add-button">
            <i class="bi bi-plus-circle-fill"></i>
            Block Dates
          </button>
        </div>

        <div v-if="localAvailability.length > 0" class="blocked-periods-list">
          <h4>Currently Blocked Periods</h4>
          <ul>
            <li v-for="(period, index) in localAvailability" :key="index">
              <span>{{ formatDate(period.start) }} to {{ formatDate(period.end) }}</span>
              <button @click="removeBlockedPeriod(index)" class="remove-button" title="Remove">
                &times;
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="calendar-section">
        <v-calendar :attributes="calendarAttributes" is-expanded />
      </div>
    </div>
    
    <div v-if="showNavigation" class="button-group-step">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button type="button" @click="$emit('next')" class="button primary-button">Next</button>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { Calendar } from 'v-calendar';
import 'v-calendar/style.css';

export default {
  name: 'VehicleAvailability',
  components: {
    'v-calendar': Calendar,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    showNavigation: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['update:modelValue', 'next', 'prev'],
  data() {
    return {
      localAvailability: [...this.modelValue],
      newBlock: {
        start: '',
        end: '',
      },
    };
  },
  computed: {
    calendarAttributes() {
      return this.localAvailability.map((period, index) => ({
        key: `blocked-${index}`,
        highlight: {
            color: 'red',
            fillMode: 'light',
        },
        dates: {
            start: new Date(period.start),
            end: new Date(period.end)
        },
      }));
    }
  },
  methods: {
    addBlockedPeriod() {
      if (this.newBlock.start && this.newBlock.end && new Date(this.newBlock.end) >= new Date(this.newBlock.start)) {
        this.localAvailability.push({ ...this.newBlock });
        this.newBlock = { start: '', end: '' };
        this.$emit('update:modelValue', this.localAvailability);
      } else {
        alert('Please select a valid date range.');
      }
    },
    removeBlockedPeriod(index) {
      this.localAvailability.splice(index, 1);
      this.$emit('update:modelValue', this.localAvailability);
    },
    formatDate(dateString) {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

h3 { font-size: 1.5rem; color: $text-color-dark; margin-bottom: 0.5rem; }
.step-info-text { font-size: 1rem; color: $text-color-medium; margin-bottom: 2rem; }

.availability-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: flex-start;
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.block-dates-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: $border-radius-md;
  border: 1px solid $border-color;
}
.date-inputs {
  display: flex;
  gap: 1rem;
}
.form-group {
  flex: 1;
  label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
  input { width: 100%; padding: 0.5rem; border: 1px solid $border-color; border-radius: $border-radius-sm; }
}
.add-button {
  padding: 0.75rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:hover { background-color: darken($primary-color, 10%); }
}
.blocked-periods-list {
  margin-top: 2rem;
  h4 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; }
  ul { list-style: none; padding: 0; margin: 0; }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: $border-radius-md;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: $text-color-dark;
  }
}
.remove-button {
  background: none;
  border: none;
  color: $admin-color;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}
.calendar-section {
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
}
.button-group-step {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid $border-color;
}
</style>