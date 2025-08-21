<!-- frontend/src/components/HeroSection.vue -->
<template>
  <!-- Hero Section with Background Image, New Title, and Centered Search Bar -->
  <section class="hero-section">
    <!-- The new hero title -->
    <h1 class="hero-title">Your Next Adventure, Your Way.</h1>
    
    <div class="search-bar">
      <div class="search-field where-field">
        <label class="field-label">Where</label>
        <input type="text" v-model="location" placeholder="City, airport, address or hotel" class="search-input">
      </div>
      <div class="search-divider"></div>
      <div class="search-field dates-field from-field">
        <label class="field-label">From</label>
        <div class="date-time-group">
          <div class="date-select" @click="isPickerVisible = true">
            <span class="date-placeholder">{{ fromDate || 'Select Date' }}</span>
          </div>
          <select v-model="fromTime" class="time-select" @click.stop>
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
          </select>
        </div>
      </div>
      <div class="search-divider"></div>
      <div class="search-field dates-field until-field">
        <label class="field-label">Until</label>
        <div class="date-time-group">
          <div class="date-select" @click="isPickerVisible = true">
            <span class="date-placeholder">{{ untilDate || 'Select Date' }}</span>
          </div>
          <select v-model="untilTime" class="time-select" @click.stop>
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
          </select>
        </div>
      </div>
      <button class="search-button" @click="searchVehicles">
        <i class="bi bi-search"></i>
      </button>
    </div>
    
    <!-- Date Picker Component -->
    <DateRangePicker
      v-if="isPickerVisible"
      :start-date="fromDate"
      :end-date="untilDate"
      @update:startDate="fromDate = $event"
      @update:endDate="untilDate = $event"
      @close="isPickerVisible = false"
    />
  </section>
</template>

<script>
import DateRangePicker from '@/components/HomeViewComponents/DateRangePicker.vue';

export default {
  name: 'HeroSection',
  components: {
    DateRangePicker,
  },
  data() {
    return {
      location: '',
      fromDate: '',
      fromTime: '',
      untilDate: '',
      untilTime: '',
      isPickerVisible: false,
    };
  },
  computed: {
    timeOptions() {
      const times = [];
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start at midnight
      for (let i = 0; i < 48; i++) {
        const date = new Date(now.getTime() + i * 30 * 60 * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        times.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
      }
      return times;
    },
  },
  methods: {
    setInitialDateTime() {
      const now = new Date();
      // Use toLocaleString to get PST date and time
      const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
      const pstDateTime = now.toLocaleString('en-US', options);

      // Split the string into date and time parts
      const [datePart, timePart] = pstDateTime.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');

      // Set 'From' date
      this.fromDate = `${year}-${month}-${day}`;
      // Find the closest 30-minute interval for 'From' time
      const initialFromTimeIndex = Math.floor((parseInt(hour) * 60 + parseInt(minute)) / 30);
      this.fromTime = this.timeOptions[initialFromTimeIndex] || '12:00 AM';

      // Set 'Until' date and time to 3 days later
      const untilDateObj = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      const pstUntilDateTime = untilDateObj.toLocaleString('en-US', options);
      const [untilDatePart, untilTimePart] = pstUntilDateTime.split(', ');
      const [untilMonth, untilDay, untilYear] = untilDatePart.split('/');
      const [untilHour, untilMinute] = untilTimePart.split(':');

      this.untilDate = `${untilYear}-${untilMonth}-${untilDay}`;
      // Find the closest 30-minute interval for 'Until' time
      const initialUntilTimeIndex = Math.floor((parseInt(untilHour) * 60 + parseInt(untilMinute)) / 30);
      this.untilTime = this.timeOptions[initialUntilTimeIndex] || '12:00 AM';
    },
    searchVehicles() {
      // This method now handles the routing directly, making the component self-contained.
      const query = {
        location: this.location,
        fromDate: this.fromDate,
        fromTime: this.fromTime,
        untilDate: this.untilDate,
        untilTime: this.untilTime,
      };

      // Changed the name from "Vehicles" to "VehicleList"
      this.$router.push({ name: 'VehicleList', query });
    },
  },
  created() {
    this.setInitialDateTime();
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css');

@import '../../assets/styles/variables.scss';

.hero-section {
  background-image: url('https://blog.carousell.ph/wp-content/uploads/PH_BlogCoverImages-8thSet_1024x536-2-696x364.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: none;
  margin: 0;
  padding: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  text-align: center;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  z-index: 2;
  margin-bottom: 2rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-top: 5rem;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 9999px;
  padding: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  max-width: 1100px;
  width: 95%;
  position: static;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 90%;
    border-radius: $border-radius-md;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.95);
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
}

.search-field {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  flex-grow: 1;
  cursor: pointer;
  
  .field-label {
    font-weight: 700;
    font-size: 0.8rem;
    color: $text-color-dark;
    margin-bottom: 0.25rem;
  }
  
  .search-input {
    border: none;
    background: transparent;
    font-size: 0.9rem;
    color: $text-color-dark;
    &:focus {
      outline: none;
    }
  }
}

.where-field {
  flex-grow: 2;
}

.dates-field {
  flex-shrink: 0;
  
  .date-time-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .date-select {
    display: flex;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
    position: relative;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%236c757d' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.342 4 3.204 4h9.592c.863 0 1.32 1.013.754 1.658l-4.796 5.482a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.8rem 0.8rem;
    padding-right: 1.5rem;
  }
  
  .date-placeholder {
    font-size: 0.9rem;
    color: $text-color-medium;
  }
  
  .time-select {
    border: none;
    background: transparent;
    font-size: 0.9rem;
    color: $text-color-medium;
    &:focus {
      outline: none;
    }
    flex-grow: 1;
    flex-basis: 0;
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%236c757d' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.342 4 3.204 4h9.592c.863 0 1.32 1.013.754 1.658l-4.796 5.482a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.8rem 0.8rem;
    padding-right: 2rem;
  }
}

.search-divider {
  width: 1px;
  height: 40px;
  background-color: #ddd;
  margin: 0 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.search-button {
  background-color: #6a0dad;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  font-size: 0.85rem;
  
  &:hover {
    background-color: darken(#6a0dad, 10%);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 1rem;
    border-radius: $border-radius-md;
    padding: 0.75rem;
  }
}
</style>
