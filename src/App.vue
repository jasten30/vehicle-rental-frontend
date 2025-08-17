<!-- vehicle-rental-frontend/src/App.vue - Root component of your Vue application -->
<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <!-- Left side: Logo now a link to home -->
      <router-link to="/" class="app-title-link">
        <h1 class="app-title">
          <span class="rent-text">RENT</span><span class="cycle-text">CYCLE</span>
        </h1>
      </router-link>

      <!-- Center: Conditional Search Bar for the VehicleList page -->
      <div class="header-center">
        <!-- The search bar is now conditionally displayed and styled to match the image -->
        <div v-if="$route.name === 'VehicleList'" class="search-bar header-search-bar">
          <div class="search-field where-field">
            <label for="location-input">Where</label>
            <input id="location-input" type="text" v-model="location" placeholder="Anywhere" class="search-input">
          </div>
          <div class="search-divider"></div>
          <div class="search-field dates-field from-field">
            <label>From</label>
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
            <label>Until</label>
            <div class="date-time-group">
              <div class="date-select" @click="isPickerVisible = true">
                <span class="date-placeholder">{{ untilDate || 'Select Date' }}</span>
              </div>
              <select v-model="untilTime" class="time-select" @click.stop>
                <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
              </select>
            </div>
          </div>
          <div class="search-divider"></div>
          <div class="search-field age-field">
            <label>Age</label>
            <select v-model="age" class="age-select">
              <option v-for="ageOption in ageOptions" :key="ageOption" :value="ageOption">{{ ageOption }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Right side: Buttons and Dropdown -->
      <div class="header-right">
        <!-- The 'Become a host' button is now displayed on all pages except VehicleList -->
        <router-link to="/dashboard/owner/vehicles" v-if="$route.name !== 'VehicleList'" class="become-host-button">
          Become a host
        </router-link>

        <!-- Combined hamburger and avatar button with dropdown -->
        <div class="user-menu-container">
          <!-- Ref added to the button to check for clicks -->
          <button class="menu-button" @click="toggleMenu" ref="menuButton">
            <!-- Bootstrap icons -->
            <i class="bi bi-list menu-icon"></i>
            <i class="bi bi-person-circle avatar-icon"></i>
          </button>

          <!-- Dropdown Menu with transition -->
          <transition name="dropdown-fade">
            <div v-if="isMenuOpen" class="dropdown-menu" ref="dropdownMenu">
              <div v-if="!isAuthenticated" class="dropdown-section">
                <router-link to="/login" class="dropdown-item" @click="closeMenu">Login</router-link>
                <router-link to="/register" class="dropdown-item" @click="closeMenu">Sign up</router-link>
              </div>
              
              <hr v-if="!isAuthenticated" class="dropdown-divider">

              <!-- Logged-in Menu -->
              <div v-if="isAuthenticated" class="dropdown-section">
                <router-link to="/favorites" class="dropdown-item with-icon" @click="closeMenu">
                  <i class="bi bi-heart-fill"></i>Favorites
                </router-link>
                <router-link to="/dashboard/my-bookings" class="dropdown-item with-icon" @click="closeMenu">
                  <i class="bi bi-briefcase-fill"></i>Trips
                </router-link>
                <router-link to="/inbox" class="dropdown-item with-icon" @click="closeMenu">
                  <i class="bi bi-envelope-fill"></i>Inbox
                </router-link>
              </div>

              <hr v-if="isAuthenticated" class="dropdown-divider">

              <div v-if="isAuthenticated" class="dropdown-section">
                <router-link to="/profile" class="dropdown-item with-icon" @click="closeMenu">
                  <i class="bi bi-person-fill"></i>Profile
                </router-link>
                <router-link to="/account" class="dropdown-item with-icon" @click="closeMenu">
                  <i class="bi bi-gear-fill"></i>Account
                </router-link>
                <router-link to="/dashboard/owner/vehicles" class="dropdown-item with-icon" @click="closeMenu">
                  <i class="bi bi-car-front-fill"></i>Become A Host
                </router-link>
              </div>

              <hr v-if="isAuthenticated" class="dropdown-divider">
              
              <!-- Always visible section -->
              <div class="dropdown-section">
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-key"></i>How RentCycle Works
                </router-link>
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-gift-fill"></i>Gift Cards
                </router-link>
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-headset"></i>Contact Support
                </router-link>
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-file-earmark-text"></i>Legal
                </router-link>
              </div>

              <hr v-if="isAuthenticated" class="dropdown-divider">
              
              <div v-if="isAuthenticated" class="dropdown-section">
                <button @click="handleLogout" class="dropdown-item with-icon logout-button">
                  <i class="bi bi-box-arrow-right"></i>Logout
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <main class="app-content">
      <router-view />
    </main>
    
    <!-- The DateRangePicker component, now placed in App.vue and conditionally displayed -->
    <DateRangePicker v-if="isPickerVisible && $route.name === 'VehicleList'"
      @dates-selected="handleDatesSelected"
      @close-picker="isPickerVisible = false"
      :initialFromDate="fromDate"
      :initialUntilDate="untilDate"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DateRangePicker from "./components/DateRangePicker.vue";

export default {
  name: "App",
  components: {
    DateRangePicker,
  },
  data() {
    return {
      isMenuOpen: false,
      isPickerVisible: false,
      // Added search bar data properties from HomeView
      location: '',
      fromDate: '',
      fromTime: '',
      untilDate: '',
      untilTime: '',
      // Age data property and options
      age: 25,
      ageOptions: Array.from({ length: 83 }, (_, i) => 18 + i),
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "userRole"]),
    // Added computed property for time options from HomeView
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
    ...mapActions(["logout"]),
    handleLogout() {
      this.logout();
      this.closeMenu();
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    // Method to close the dropdown if a click occurs outside of it
    closeMenuOnClickOutside(event) {
      // Check if the menu is open and the click target is not within the menu or the button
      if (this.isMenuOpen && this.$refs.dropdownMenu && this.$refs.menuButton) {
        if (!this.$refs.dropdownMenu.contains(event.target) && !this.$refs.menuButton.contains(event.target)) {
          this.closeMenu();
        }
      }
    },
    // Method to handle dates selected from the DateRangePicker
    handleDatesSelected({ fromDate, untilDate }) {
      this.fromDate = fromDate;
      this.untilDate = untilDate;
      this.isPickerVisible = false;
    },
    // Method to set initial date and time for search bar
    setInitialDateTime() {
      const now = new Date();
      const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
      const pstDateTime = now.toLocaleString('en-US', options);
      const [datePart, timePart] = pstDateTime.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      this.fromDate = `${year}-${month}-${day}`;
      const initialFromTimeIndex = Math.floor((parseInt(hour) * 60 + parseInt(minute)) / 30);
      this.fromTime = this.timeOptions[initialFromTimeIndex] || '12:00 AM';
      const untilDateObj = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      const pstUntilDateTime = untilDateObj.toLocaleString('en-US', options);
      const [untilDatePart, untilTimePart] = pstUntilDateTime.split(', ');
      const [untilMonth, untilDay, untilYear] = untilDatePart.split('/');
      const [untilHour, untilMinute] = untilTimePart.split(':');
      this.untilDate = `${untilYear}-${untilMonth}-${untilDay}`;
      const initialUntilTimeIndex = Math.floor((parseInt(untilHour) * 60 + parseInt(untilMinute)) / 30);
      this.untilTime = this.timeOptions[initialUntilTimeIndex] || '12:00 AM';
    },
  },
  mounted() {
    // Add the event listener when the component is mounted
    document.addEventListener('click', this.closeMenuOnClickOutside);
    // Set initial date/time when the app component is created
    this.setInitialDateTime();
  },
  beforeUnmount() {
    // Remove the event listener before the component is unmounted
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  }
};
</script>

<style lang="scss">
/*
  The following import statement loads the 'Nunito' and 'Anton' fonts from Google Fonts.
  This is necessary for the fonts to be available for use in the application.
*/
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Nunito:wght@400;700;900&display=swap');

/* Import the variables SCSS file */
@import "./assets/styles/variables.scss";

body {
  margin: 0;
  /* Use Nunito for the body font */
  font-family: 'Nunito', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: $background-color;
  box-sizing: border-box;
}

.app-container {
  max-width: 100%;
  width: 100%;
  padding: 0;
  box-shadow: none;
  background-color: transparent;
  margin: 0;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #eee;
  box-shadow: $shadow-light;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
}

.app-title-link {
  text-decoration: none;
  position: relative; // Needed to position the pseudo-element background
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: -0.5rem;
    bottom: -0.5rem;
    left: 0;
    right: 0;
    background-color: #f0f0f0; // A light gray background
    clip-path: polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%);
    border-radius: 9999px;
  }
}

.app-title {
  /* Keep Anton for the app title */
  font-family: "Anton", sans-serif;
  font-size: 2.2rem;
  font-weight: 400;
  margin: 0;
  line-height: 1;
  position: relative; // Ensures text is above the pseudo-element
  z-index: 1;
  padding: 0 1.5rem; // Adds space for the arrow shape
}

.rent-text {
  color: red;
  font-style: italic;
}

.cycle-text {
  color: black;
  font-style: italic;
}

.header-center {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Removed max-width to allow it to be wider */
  margin: 0 1rem; /* Add some margin */

  @media (max-width: 768px) {
    display: none; /* Hide search bar on mobile */
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.become-host-button {
  text-decoration: none;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: black;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
  box-shadow: $shadow-light;
  font-family: 'Nunito', sans-serif; /* Explicitly set font */


  &:hover {
    box-shadow: $shadow-medium;
  }
}

.user-menu-container {
  position: relative;
  display: inline-block;
}

.menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
  box-shadow: $shadow-light;
  font-family: 'Nunito', sans-serif; /* Explicitly set font */

  &:hover {
    box-shadow: $shadow-medium;
    background-color: white;
  }

  /* Changed icon colors to black for the menu and red for dropdown items */
  .menu-icon {
    font-size: 1.2rem;
    color: black;
  }
  .avatar-icon {
    font-size: 1.2rem;
    color: black;
  }
}

/* Base styles for the dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  margin-top: 0.75rem;
  min-width: 250px;
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-medium;
  list-style: none;
  padding: 0.5rem 0;
  text-align: left;
  font-family: 'Nunito', sans-serif; /* Explicitly set font */
}

/* Transition classes for the dropdown menu */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  transform: scale(0.95);
  transform-origin: top right;
  opacity: 0;
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  transform: scale(1);
  opacity: 1;
}

.dropdown-section {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1.5rem;
  color: $text-color-dark;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-out;

  // Use flexbox to align icon and text and add a gap for spacing
  &.with-icon {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &:hover {
    /* Updated background color to be a transparent gray */
    transform: translateX(5px);
  }
}

/* Changed dropdown item icon colors to red */
.dropdown-item i {
  color: red;
}

.dropdown-divider {
  height: 1px;
  margin: 0.5rem 0;
  overflow: hidden;
  background-color: #e5e7eb;
  border: 0;
}

.logout-button {
  background: none;
  border: none;
  font-family: 'Nunito', sans-serif; /* Explicitly set font */
  font-size: inherit;
  cursor: pointer;
  text-align: left;
}

// Styles for disabled items
.disabled {
  color: $text-color-medium;
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
}

.app-content {
  padding-top: 0;
  min-height: 300px;
}

/* New and modified styles for the header search bar */
.search-bar.header-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 9999px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif; /* Explicitly set font */

}

.search-field {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 0.75rem;
  cursor: pointer;

  label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #4b5563;
    white-space: nowrap;
    font-family: 'Nunito', sans-serif; /* Explicitly set font */
  }
  
  .search-input,
  .date-time-group,
  .age-select {
    border: none;
    background: transparent;
    padding: 0;
    font-size: 0.9rem;
    font-weight: 400;
    color: #1a202c;
    width: 100%;
    &:focus {
      outline: none;
    }
  }
}

.search-divider {
  width: 1px;
  height: 25px;
  background-color: #e0e0e0;
  margin: 0 0.25rem;
}

.date-time-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Nunito', sans-serif; /* Explicitly set font */


  .date-select,
  .time-select {
    cursor: pointer;
  }

  .date-placeholder {
    white-space: nowrap;
  }
}

.where-field {
  flex-basis: 35%;
  .search-input {
    min-width: 100px;
  }
}

.from-field,
.until-field {
  flex-basis: 25%;
  .date-time-group {
    min-width: 150px;
  }
}

.age-field {
  flex-basis: 15%;
  .age-select {
    min-width: 50px;
  }
}

/* Added or modified for wider time selectors */
.time-select {
    width: 100px; /* Adjust this value as needed */
    padding: 0.25rem;
    text-align: right;
    box-sizing: border-box; /* Ensures padding doesn't affect total width */
}
</style>
