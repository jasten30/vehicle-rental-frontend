<!-- src/components/DateRangePicker.vue -->
<template>
  <div class="date-picker-overlay" @click.self="$emit('close')">
    <div class="date-picker-card">
      <div class="date-picker-header">
        <div class="month-selector">
          <button class="nav-btn" @click="prevMonth">
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="month-year">{{ formatDate(currentMonth, currentYear) }}</div>
        </div>
        <div class="month-selector">
          <div class="month-year">{{ formatDate(nextMonth, nextYear) }}</div>
          <button class="nav-btn" @click="goToNextMonth">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="date-picker-body">
        <div class="calendar-container">
          <div class="days-of-week">
            <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
          </div>
          <div class="day-grid">
            <span v-for="blank in startDayOffset" :key="`blank-${blank}`" class="day-cell blank"></span>
            <span v-for="day in daysInMonth"
                  :key="`day-${day}`"
                  class="day-cell"
                  :class="{'selected-start': isSelectedStart(day), 'selected-end': isSelectedEnd(day), 'in-range': isInRange(day), 'disabled': isDateDisabled(day)}"
                  @click="selectDate(day)">
              {{ day }}
            </span>
          </div>
        </div>
        <div class="calendar-container">
          <div class="days-of-week">
            <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
          </div>
          <div class="day-grid">
            <span v-for="blank in nextStartDayOffset" :key="`blank-next-${blank}`" class="day-cell blank"></span>
            <span v-for="day in daysInNextMonth"
                  :key="`day-next-${day}`"
                  class="day-cell"
                  :class="{'selected-start': isSelectedStart(day, true), 'selected-end': isSelectedEnd(day, true), 'in-range': isInRange(day, true), 'disabled': isDateDisabled(day, true)}"
                  @click="selectDate(day, true)">
              {{ day }}
            </span>
          </div>
        </div>
      </div>
      <div class="date-picker-footer">
        <button class="reset-button" @click="resetDates">Reset</button>
        <button class="save-button" @click="saveDates">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateRangePicker',
  props: {
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      daysOfWeek: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
      selectedStart: this.startDate ? new Date(this.startDate) : null,
      selectedEnd: this.endDate ? new Date(this.endDate) : null,
      today: new Date(new Date().setHours(0, 0, 0, 0)),
    };
  },
  computed: {
    nextMonth() {
      return this.currentMonth === 11 ? 0 : this.currentMonth + 1;
    },
    nextYear() {
      return this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
    },
    daysInMonth() {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    },
    startDayOffset() {
      return new Date(this.currentYear, this.currentMonth, 1).getDay();
    },
    daysInNextMonth() {
      return new Date(this.nextYear, this.nextMonth + 1, 0).getDate();
    },
    nextStartDayOffset() {
      return new Date(this.nextYear, this.nextMonth, 1).getDay();
    },
  },
  methods: {
    formatDate(month, year) {
      const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long' });
      return `${monthName} ${year}`;
    },
    isSameDay(date1, date2) {
      if (!date1 || !date2) return false;
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },
    isDateDisabled(day, isNextMonth = false) {
      const date = this.getDateObject(day, isNextMonth);
      return date < this.today;
    },
    isSelectedStart(day, isNextMonth = false) {
      const date = this.getDateObject(day, isNextMonth);
      return this.selectedStart && this.isSameDay(date, this.selectedStart);
    },
    isSelectedEnd(day, isNextMonth = false) {
      const date = this.getDateObject(day, isNextMonth);
      return this.selectedEnd && this.isSameDay(date, this.selectedEnd);
    },
    isInRange(day, isNextMonth = false) {
      const date = this.getDateObject(day, isNextMonth);
      if (!this.selectedStart || !this.selectedEnd) return false;
      return date > this.selectedStart && date < this.selectedEnd;
    },
    getDateObject(day, isNextMonth) {
      const year = isNextMonth ? this.nextYear : this.currentYear;
      const month = isNextMonth ? this.nextMonth : this.currentMonth;
      const date = new Date(year, month, day);
      return date;
    },
    selectDate(day, isNextMonth = false) {
      const date = this.getDateObject(day, isNextMonth);
      // Disable selecting past dates
      if (date < this.today) {
        return;
      }

      if (!this.selectedStart || (this.selectedStart && this.selectedEnd) || date < this.selectedStart) {
        // First date selected, or starting a new range, or clicking a date before the current start
        this.selectedStart = date;
        this.selectedEnd = null;
      } else if (date >= this.selectedStart) {
        // Second date selected
        this.selectedEnd = date;
      }
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    goToNextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    resetDates() {
      this.selectedStart = null;
      this.selectedEnd = null;
      this.$emit('update:startDate', '');
      this.$emit('update:endDate', '');
    },
    saveDates() {
      const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      this.$emit('update:startDate', formatDate(this.selectedStart));
      this.$emit('update:endDate', formatDate(this.selectedEnd));
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 1000;
}

.date-picker-card {
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  padding: 2rem;
  width: 90%;
  max-width: 768px;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: $font-family-base;

  @media (max-width: 768px) {
    max-width: 100%;
    width: auto;
    margin: 1rem;
    padding: 1rem;
  }
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  .month-selector {
    display: flex;
    align-items: center;
  }

  .nav-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: $text-color-dark;
    &:hover {
      color: $primary-color;
    }
  }

  .month-year {
    font-weight: 600;
    font-size: 1.1rem;
    color: $text-color-dark;
    padding: 0 1rem;
    min-width: 150px;
    text-align: center;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    .month-selector:nth-child(2) {
      margin-top: 1rem;
    }
  }
}

.date-picker-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
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

  span {
    text-align: center;
  }
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;

  .day-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    color: $text-color-dark;
    position: relative;
    z-index: 1;

    &.blank {
      visibility: hidden;
    }

    &:hover {
      background-color: lighten($primary-color, 35%);
      color: $primary-color;
    }

    &.selected-start, &.selected-end {
      background-color: $primary-color;
      color: white;
      font-weight: 600;
    }
    
    &.disabled {
      color: $text-color-light;
      cursor: not-allowed;
      pointer-events: none;
    }

    &.in-range {
      background-color: lighten($primary-color, 35%);
      color: $primary-color;
      border-radius: 0;
      z-index: 0;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        background-color: lighten($primary-color, 35%);
        z-index: -1;
      }
    }
  }
}

.date-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;

  .reset-button, .save-button {
    padding: 0.75rem 1.5rem;
    border-radius: $border-radius-md;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .reset-button {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $text-color-medium;

    &:hover {
      background-color: lighten($text-color-medium, 20%);
    }
  }

  .save-button {
    background-color: $primary-color;
    color: white;
    border: none;

    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }
}
</style>
