<template>
  <div class="calendar-view-container">
    <div v-if="loading" class="loading-state">
      <p>Loading Calendar...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-if="vehicle" class="calendar-content">
      <div class="calendar-header">
        <h1 class="vehicle-name">
          Calendar for {{ vehicle.make }} {{ vehicle.model }}
        </h1>
        <p class="vehicle-year">{{ vehicle.year }}</p>
      </div>

      <div class="calendar-widget">
        <div class="widget-header">
          <button @click="previousMonth" class="nav-button">&lt;</button>
          <h2 class="current-month">{{ currentMonthName }}</h2>
          <button @click="nextMonth" class="nav-button">&gt;</button>
        </div>
        
        <!-- UNIFIED CALENDAR GRID -->
        <div class="calendar-grid">
          <!-- Day of the week headers -->
          <div v-for="day in daysOfWeek" :key="day" class="day-header">
            {{ day }}
          </div>
          
          <!-- Day cells for the month -->
          <div
            v-for="day in daysInMonth"
            :key="day.date.toISO()"
            class="day-cell"
            :class="getDayClasses(day)"
            @click="onDateClick(day)"
          >
            <span class="day-number">{{ day.date.day }}</span>
          </div>
        </div>
        
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color booked"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'VehicleCalendarView',
  props: {
    vehicleId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      error: null,
      currentDate: DateTime.now(),
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    };
  },
  computed: {
    ...mapGetters({
      vehicle: 'singleVehicle',
    }),
    currentMonthName() {
      return this.currentDate.toFormat('MMMM yyyy');
    },
    daysInMonth() {
      const startOfMonth = this.currentDate.startOf('month');
      const endOfMonth = this.currentDate.endOf('month');

      // Luxon's week starts on Monday (1). We adjust to start our grid on Sunday.
      // `startOfMonth.weekday % 7` maps Sunday (7) to 0, Monday (1) to 1, etc.
      const firstDayOffset = startOfMonth.weekday % 7;
      const firstDayOfGrid = startOfMonth.minus({ days: firstDayOffset });
      
      const lastDayOfMonth = endOfMonth;
      const lastDayOffset = 6 - (lastDayOfMonth.weekday % 7);
      const lastDayOfGrid = lastDayOfMonth.plus({ days: lastDayOffset });
      
      let days = [];
      let currentDay = firstDayOfGrid;

      while (currentDay <= lastDayOfGrid) {
        days.push({
          date: currentDay,
          isCurrentMonth: currentDay.month === this.currentDate.month,
          isToday: currentDay.hasSame(DateTime.now(), 'day'),
          isBooked: this.isDateBooked(currentDay),
          bookingId: this.getBookingIdForDate(currentDay),
        });
        currentDay = currentDay.plus({ days: 1 });
      }
      return days;
    },
  },
  methods: {
    ...mapActions(['getVehicleById']),
    async fetchVehicleData() {
      this.loading = true;
      try {
        await this.getVehicleById(this.vehicleId);
      } catch (err) {
        this.error = 'Failed to load vehicle data. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    isDateBooked(date) {
      if (!this.vehicle || !this.vehicle.availability) return false;
      const checkDate = date.startOf('day');
      for (const range of this.vehicle.availability) {
        const startDate = DateTime.fromISO(range.start).startOf('day');
        const endDate = DateTime.fromISO(range.end).startOf('day');
        if (checkDate >= startDate && checkDate <= endDate) {
          return true;
        }
      }
      return false;
    },
    getBookingIdForDate(date) {
      if (!this.isDateBooked(date)) return null;
      const checkDate = date.startOf('day');
      for (const range of this.vehicle.availability) {
        const startDate = DateTime.fromISO(range.start).startOf('day');
        const endDate = DateTime.fromISO(range.end).startOf('day');
        if (checkDate >= startDate && checkDate <= endDate) {
          return range.bookingId;
        }
      }
      return null;
    },
    onDateClick(day) {
      if (day.isBooked && day.bookingId) {
        alert(`This date is part of Booking ID: ${day.bookingId}`);
      }
    },
    previousMonth() {
      this.currentDate = this.currentDate.minus({ months: 1 });
    },
    nextMonth() {
      this.currentDate = this.currentDate.plus({ months: 1 });
    },
    getDayClasses(day) {
      return {
        'not-current-month': !day.isCurrentMonth,
        'is-today': day.isToday,
        'is-booked': day.isBooked,
      };
    },
  },
  created() {
    this.fetchVehicleData();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.calendar-view-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Nunito', sans-serif;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: $text-color-medium;
}

.calendar-header {
  text-align: center;
  margin-bottom: 2rem;
  .vehicle-name {
    font-size: 2rem;
    font-weight: 700;
    color: $text-color-dark;
  }
  .vehicle-year {
    font-size: 1.1rem;
    color: $text-color-medium;
  }
}

.calendar-widget {
  background-color: $card-background;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid $border-color;
}

.current-month {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
}

.nav-button {
  background: none;
  border: 1px solid transparent;
  font-size: 1.5rem;
  color: $text-color-medium;
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-md;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background-color: $border-color;
    color: $text-color-dark;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-top: 1px solid $border-color;
}

.day-header {
  text-align: center;
  padding: 0.75rem 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: $text-color-medium;
  text-transform: uppercase;
  background-color: #f9fafb;
}

.day-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  border-bottom: 1px solid $border-color;
  border-left: 1px solid $border-color;
  transition: background-color 0.2s ease;

  &:nth-child(7n + 1) { // First column
    border-left: none;
  }
}

.day-number {
  font-size: 0.9rem;
  font-weight: 500;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.not-current-month {
  color: $text-color-light;
}

.is-today .day-number {
  background-color: $primary-color;
  color: white;
  font-weight: 700;
}

.is-booked {
  background-color: lighten($admin-color, 40%);
  color: darken($admin-color, 10%);
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: lighten($admin-color, 35%);
  }
}

.legend {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid $border-color;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 4px;
  &.booked {
    background-color: lighten($admin-color, 40%);
  }
}
</style>

