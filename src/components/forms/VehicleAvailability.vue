<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Vehicle Availability</h3>
      <p class="step-info-text">
        Select a start and end date using the date pickers, then click "Block Selected Range".
        Renters will not be able to select these dates.
      </p>

      <div class="availability-layout">
        <!-- Section for Date Inputs -->
        <div class="date-input-section card">
          <h4>Block New Date Range</h4>

          <div class="date-inputs">
            <div class="form-group">
              <label for="start-date">Start Date</label>
              <input
                type="date"
                id="start-date"
                v-model="newBlockStart"
                :min="todayString"
              />
            </div>
            <div class="form-group">
              <label for="end-date">End Date</label>
              <input
                type="date"
                id="end-date"
                v-model="newBlockEnd"
                :min="newBlockStart || todayString"
              />
            </div>
          </div>

          <button @click="addBlockedPeriod" type="button" class="add-button" :disabled="!newBlockStart || !newBlockEnd">
            <i class="bi bi-plus-circle-fill"></i>
            Block Selected Range
          </button>
          <p v-if="dateError" class="error-message">{{ dateError }}</p>
        </div>

        <!-- Section for Displaying Blocked Periods -->
        <div class="display-section">
          <div v-if="!modelValue || modelValue.length === 0" class="blocked-periods-list empty">
            <h4>No Dates Blocked</h4>
            <p>Your vehicle is currently available all the time.</p>
          </div>

          <div v-if="modelValue && modelValue.length > 0" class="blocked-periods-list">
            <h4>Currently Blocked Periods</h4>
            <ul>
              <!-- Keep iterating over modelValue for display -->
              <li v-for="(period, index) in modelValue" :key="index">
                <span>{{ formatDate(period.start) }} to {{ formatDate(period.end) }}</span>
                <button @click="removeBlockedPeriod(index)" class="remove-button" title="Remove">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons (Optional) -->
      <div v-if="showNavigation" class="navigation-buttons">
        <button type="button" @click="$emit('prev')" class="nav-button secondary">Previous</button>
        <button type="button" @click="$emit('next')" class="nav-button primary">Next</button>
      </div>
    </div>
  </transition>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'VehicleAvailability',
  components: {},
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
      newBlockStart: null,
      newBlockEnd: null,
      dateError: '',
    };
  },
  // ================================================
  // ADDED WATCHER FOR modelValue
  // ================================================
  watch: {
      modelValue: {
          handler(newVal) {
              console.log('[VehicleAvailability] modelValue prop updated:', JSON.stringify(newVal));
              // You could add further checks here if needed, e.g., verify format
          },
          deep: true, // Watch for changes within the array
          immediate: true // Log the initial value as well
      }
  },
  // ================================================
  computed: {
    todayString() {
      return DateTime.now().toFormat('yyyy-MM-dd');
    },
  },
  methods: {
    parseToLocalDate(dateInput) {
        // This function expects YYYY-MM-DD strings primarily now
        if (!dateInput) return null;
        try {
            // It might still receive ISO strings initially from backend via prop
            if (typeof dateInput === 'string') {
                // Handle ISO string or 'yyyy-MM-dd'
                const dt = DateTime.fromISO(dateInput, { zone: dateInput.includes('T') ? undefined : 'utc' });
                 if (!dt.isValid) {
                     console.warn('[VehicleAvailability] Invalid date string received by parseToLocalDate:', dateInput);
                     return null;
                 }
                return dt.startOf('day').toJSDate();
            }
            // Less likely now, but handle other types just in case
            if (dateInput.toDate && typeof dateInput.toDate === 'function') {
                return dateInput.toDate(); // Firestore Timestamp
            }
            if (dateInput instanceof Date) {
                return dateInput; // JS Date
            }
            console.warn('[VehicleAvailability] Unhandled type in parseToLocalDate:', typeof dateInput);
            return null;
        } catch (e) {
            console.error("[VehicleAvailability] Error parsing date:", dateInput, e);
            return null;
        }
    },

    addBlockedPeriod() {
      this.dateError = '';
      if (!this.newBlockStart || !this.newBlockEnd) {
          this.dateError = 'Please select both a start and end date.';
          return;
      }

      const startDt = DateTime.fromISO(this.newBlockStart);
      const endDt = DateTime.fromISO(this.newBlockEnd);

      if (!startDt.isValid || !endDt.isValid) {
          this.dateError = 'Invalid date format selected.';
          return;
      }

      if (endDt < startDt) {
          this.dateError = 'End date cannot be before the start date.';
          return;
      }

      const newPeriodStrings = {
        start: this.newBlockStart, // Already YYYY-MM-DD
        end: this.newBlockEnd    // Already YYYY-MM-DD
      };

      // Check for overlap
      const overlaps = this.modelValue.some(existing => {
         try {
             const existingStart = DateTime.fromISO(existing.start);
             const existingEnd = DateTime.fromISO(existing.end);
             // Use the already created startDt and endDt
             return (startDt <= existingEnd && endDt >= existingStart);
         } catch(e) {
             console.error("Error comparing dates during overlap check:", existing, e);
             return false; // Treat error as non-overlapping? Be cautious.
         }
      });

      if (overlaps) {
         this.dateError = 'Selected range overlaps with an existing blocked period.';
         return;
      }

      const updatedAvailability = [...this.modelValue, newPeriodStrings];
      updatedAvailability.sort((a, b) => DateTime.fromISO(a.start) - DateTime.fromISO(b.start)); // Sort using Luxon

      this.newBlockStart = null;
      this.newBlockEnd = null;

      this.$emit('update:modelValue', updatedAvailability);
    },

    removeBlockedPeriod(index) {
      const updatedAvailability = this.modelValue.filter((_, i) => i !== index);
      this.$emit('update:modelValue', updatedAvailability);
    },

    formatDate(dateString) {
      // This function receives YYYY-MM-DD or potentially ISO strings
      if (!dateString) return 'N/A';
      try {
          // Parse assuming UTC if no time component, otherwise use embedded offset or local
          const dt = DateTime.fromISO(dateString, { zone: dateString.includes('T') ? undefined : 'utc' });
          if (!dt.isValid) return 'Invalid Date';
          return dt.toLocaleString(DateTime.DATE_MED); // Format as "Oct 25, 2025"
      } catch(e) {
          console.error("Error formatting date:", dateString, e);
          return 'Error';
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* --- Basic Form Styling --- */
.form-step-container {
  padding: 1rem 0;
}
.card { // Style for the input section
    background-color: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-light;
    padding: 1.5rem;
    border: 1px solid $border-color-light;
    margin-bottom: 1rem; // Add space below input card
}
h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
h4 { // Style for sub-section titles
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: $text-color-dark;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $border-color-light;
}
.step-info-text {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* --- Layout for Inputs and Display --- */
.availability-layout {
  display: grid;
  grid-template-columns: 1fr; // Single column by default
  gap: 2.5rem;
  align-items: flex-start;

  // Keep the 2-column layout for larger screens if desired
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
}

// Removed .calendar-section
.date-inputs {
    display: flex;
    gap: 1.5rem; // Space between date inputs
    margin-bottom: 1rem;

    @media (max-width: 576px) { // Stack inputs on small screens
        flex-direction: column;
        gap: 1rem;
    }
}
.form-group {
    flex: 1; // Make inputs share space
    label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: $text-color-dark;
        font-size: 0.9rem;
    }
    input[type="date"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid $border-color;
        border-radius: $border-radius-md;
        font-size: 1rem;
        font-family: $font-family-base;
        box-sizing: border-box;
        transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        background-color: #ffffff;
        &:focus {
            outline: none;
            border-color: $primary-color;
            box-shadow: 0 0 0 3px lighten($primary-color, 40%);
        }
    }
}

.add-button {
  width: 100%; // Make button full width within its section
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  &:hover:not(:disabled) { background-color: darken($primary-color, 10%); }
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
  }
}

/* --- Styling for Display Section (Blocked Periods List) --- */
.display-section {
    // Styles for this section are mostly within .blocked-periods-list
    margin-top: 0; // Align with top of input section on larger screens
}
.blocked-periods-list {
  // Styles remain the same as before
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: $text-color-dark;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 380px; // Adjust height slightly
    overflow-y: auto;
    padding-right: 0.5rem;
  }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: $background-light;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: $text-color-dark;
  }
  &.empty {
    text-align: center;
    padding: 3rem 1rem;
    background-color: $background-light;
    border-radius: $border-radius-lg;
    border: 1px dashed $border-color;
    p {
      color: $text-color-medium;
      font-size: 0.9rem;
      margin: 0.5rem 0 0 0;
    }
  }
}
.remove-button {
  // Styles remain the same
  background: none;
  border: none;
  color: $admin-color;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  &:hover {
      background-color: lighten($admin-color, 40%);
      color: darken($admin-color, 10%);
  }
}

/* --- Navigation Buttons --- */
.navigation-buttons {
  // Styles remain the same
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}
.nav-button {
  // Styles remain the same
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px;
  text-align: center;
  &.primary {
    background-color: $primary-color;
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
      box-shadow: $shadow-medium;
    }
  }
  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $border-color;
    &:hover {
      color: $text-color-dark;
      background-color: $background-light;
    }
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
.error-message {
  // Styles remain the same
  color: $admin-color;
  margin-top: 0.5rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 500;
}

/* --- Entrance Animation --- */
.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.form-step-fade-enter-from,
.form-step-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>

