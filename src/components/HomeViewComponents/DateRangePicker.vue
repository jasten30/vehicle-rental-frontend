<template>
  <div class="date-picker-overlay" @click.self="$emit('close')">
    <div class="date-picker-card">
      <!-- Header with Month Navigation -->
      <div class="date-picker-header">
        <button class="nav-btn" @click="prevMonth" :disabled="isPrevMonthDisabled">
          <i class="bi bi-chevron-left"></i>
        </button>
        <div class="month-grid">
          <div class="month-year">{{ currentMonthName }}</div>
          <div class="month-year">{{ nextMonthName }}</div>
        </div>
        <button class="nav-btn" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <!-- Main Body with Two Calendars -->
      <div class="date-picker-body">
        <!-- Left Calendar -->
        <div class="calendar-container">
          <div class="days-of-week">
            <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
          </div>
          <div class="day-grid">
            <div
              v-for="day in daysInCurrentMonth"
              :key="day.date.toISO()"
              class="day-cell"
              :class="getDayClasses(day)"
              @click="selectDate(day.date)"
            >
              <span v-if="day.isCurrentMonth">{{ day.date.day }}</span>
            </div>
          </div>
        </div>
        <!-- Right Calendar -->
        <div class="calendar-container">
          <div class="days-of-week">
            <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
          </div>
          <div class="day-grid">
            <div
              v-for="day in daysInNextMonth"
              :key="day.date.toISO()"
              class="day-cell"
              :class="getDayClasses(day)"
              @click="selectDate(day.date)"
            >
              <span v-if="day.isCurrentMonth">{{ day.date.day }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Action Buttons -->
      <div class="date-picker-footer">
        <button class="reset-button" @click="resetDates">Reset</button>
        <button class="save-button" @click="saveDates" :disabled="!selectedEnd">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'DateRangePicker',
  props: {
    startDate: String,
    endDate: String,
    unavailableDates: {
      type: Array,
      default: () => [],
    },
  },
  // CORRECTED: Emits a single 'save' event with an object payload
  emits: ['close', 'save'],
  data() {
    return {
      currentDate: DateTime.now().startOf('month'),
      daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      selectedStart: this.startDate ? DateTime.fromISO(this.startDate) : null,
      selectedEnd: this.endDate ? DateTime.fromISO(this.endDate) : null,
      today: DateTime.now().startOf('day'),
    };
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toFormat('MMMM yyyy');
    },
    nextMonthDate() {
      return this.currentDate.plus({ months: 1 });
    },
    nextMonthName() {
      return this.nextMonthDate.toFormat('MMMM yyyy');
    },
    daysInCurrentMonth() {
      return this.getCalendarDaysForMonth(this.currentDate);
    },
    daysInNextMonth() {
      return this.getCalendarDaysForMonth(this.nextMonthDate);
    },
    isPrevMonthDisabled() {
        return this.currentDate <= this.today.startOf('month');
    }
  },
  methods: {
    getCalendarDaysForMonth(monthDate) {
      const startOfMonth = monthDate.startOf('month');
      const endOfMonth = monthDate.endOf('month');
      const firstDayOfGrid = startOfMonth.startOf('week');
      const lastDayOfGrid = endOfMonth.endOf('week');

      let days = [];
      let currentDay = firstDayOfGrid;
      while (currentDay <= lastDayOfGrid) {
        days.push({
          date: currentDay,
          isCurrentMonth: currentDay.month === monthDate.month,
        });
        currentDay = currentDay.plus({ days: 1 });
      }
      return days;
    },
    isDateDisabled(date) {
        if (date < this.today) return true;
        for (const range of this.unavailableDates) {
            const start = DateTime.fromISO(range.start).startOf('day');
            const end = DateTime.fromISO(range.end).startOf('day');
            if (date >= start && date <= end) {
                return true;
            }
        }
        return false;
    },
    isDateInSelectionRange(date, start, end) {
      if (!start || !end) return false;
      return date > start && date < end;
    },
    getDayClasses(day) {
        const date = day.date;
        const isDisabled = this.isDateDisabled(date);
        
        if (!day.isCurrentMonth) return 'not-current-month';

        const isStart = this.selectedStart && date.hasSame(this.selectedStart, 'day');
        const isEnd = this.selectedEnd && date.hasSame(this.selectedEnd, 'day');
        const inRange = this.isDateInSelectionRange(date, this.selectedStart, this.selectedEnd);

        return {
            disabled: isDisabled,
            'selected-start': isStart,
            'selected-end': isEnd,
            'in-range': inRange,
        };
    },
    selectDate(date) {
      if (this.isDateDisabled(date)) return;

      if (!this.selectedStart || this.selectedEnd) {
        this.selectedStart = date;
        this.selectedEnd = null;
      } else if (date < this.selectedStart) {
        this.selectedStart = date;
      } else {
        let tempDate = this.selectedStart.plus({days: 1});
        while (tempDate < date) {
            if (this.isDateDisabled(tempDate)) {
                this.selectedStart = date;
                this.selectedEnd = null;
                return;
            }
            tempDate = tempDate.plus({days: 1});
        }
        this.selectedEnd = date;
      }
    },
    prevMonth() {
      if (this.isPrevMonthDisabled) return;
      this.currentDate = this.currentDate.minus({ months: 1 });
    },
    nextMonth() {
      this.currentDate = this.currentDate.plus({ months: 1 });
    },
    resetDates() {
      this.selectedStart = null;
      this.selectedEnd = null;
    },
    // CORRECTED: Emits a single event with an object containing both dates.
    saveDates() {
      if (!this.selectedStart || !this.selectedEnd) return;
      this.$emit('save', {
        startDate: this.selectedStart.toISODate(),
        endDate: this.selectedEnd.toISODate(),
      });
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
/* Styles are unchanged */
@import '@/assets/styles/variables.scss';

.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.date-picker-card {
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  width: 90%;
  max-width: 700px;
  font-family: 'Nunito', sans-serif;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid $border-color;
  
  .month-grid {
    display: flex;
    flex-grow: 1;
    justify-content: space-around;
  }

  .month-year {
    font-weight: 600;
    font-size: 1.1rem;
    color: $text-color-dark;
    text-align: center;
    flex-basis: 50%;
  }

  .nav-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: $text-color-dark;
    &:hover:not(:disabled) {
      color: $primary-color;
    }
    &:disabled {
        color: $text-color-light;
        cursor: not-allowed;
    }
  }
}

.date-picker-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
}

.calendar-container {
  text-align: center;
}

.days-of-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-color-medium;
  margin-bottom: 0.5rem;
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  cursor: pointer;
  font-size: 0.9rem;
  color: $text-color-dark;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
  position: relative;

  &:hover:not(.disabled):not(.selected-start):not(.selected-end):not(.in-range) {
    background-color: lighten($primary-color, 40%);
  }
}

.not-current-month {
  color: $text-color-light;
  pointer-events: none;
}

.disabled {
  color: $text-color-light;
  cursor: not-allowed;
  text-decoration: line-through;
}

.selected-start, .selected-end {
  background-color: $primary-color;
  color: white;
  font-weight: 700;
}

.in-range {
  background-color: lighten($primary-color, 35%);
  color: darken($primary-color, 10%);
  border-radius: 0;
}

.selected-start:not(.selected-end) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.selected-end:not(.selected-start) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}


.date-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid $border-color;
  background-color: #f9fafb;

  .reset-button, .save-button {
    padding: 0.6rem 1.2rem;
    border-radius: $border-radius-md;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .reset-button {
    background-color: transparent;
    color: $text-color-medium;
    &:hover {
      background-color: $border-color;
    }
  }

  .save-button {
    background-color: $primary-color;
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
    }
    &:disabled {
        background-color: lighten($primary-color, 20%);
        cursor: not-allowed;
    }
  }
}
</style>

