<template>
  <div id="app" class="app-container">
    <header class="app-header" v-if="userRole !== 'admin'">
      <router-link to="/" class="app-title-link">
        <h1 class="app-title">
          <span class="rent-text">RENT</span
          ><span class="cycle-text">CYCLE</span>
        </h1>
      </router-link>
      <nav class="header-nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/vehicles" class="nav-link">Vehicles</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/contact" class="nav-link">Contact</router-link>
      </nav>
      <div class="header-right">
        <router-link
          v-if="$route.name !== 'VehicleList'"
          :to="hostLinkTarget"
          class="become-host-button"
        >
          {{ hostLinkText }}
        </router-link>
        <div class="user-menu-container">
          <button class="menu-button" @click="toggleMenu" ref="menuButton">
            <i class="bi bi-list menu-icon"></i>
            <i class="bi bi-person-circle avatar-icon"></i>
          </button>
          <transition name="dropdown-fade">
            <div v-if="isMenuOpen" class="dropdown-menu" ref="dropdownMenu">
              <div v-if="!isAuthenticated" class="dropdown-section">
                <router-link
                  to="/login"
                  class="dropdown-item"
                  @click="closeMenu"
                  >Login</router-link
                >
                <router-link
                  to="/register"
                  class="dropdown-item"
                  @click="closeMenu"
                  >Sign up</router-link
                >
              </div>

              <div
                v-if="isAuthenticated"
                class="dropdown-section user-info-header"
              >
                <img
                  v-if="user.profilePhotoUrl"
                  :src="user.profilePhotoUrl"
                  alt="User Avatar"
                  class="dropdown-avatar"
                />
                <img
                  v-else
                  :src="initialsImage"
                  alt="User Initials"
                  class="dropdown-avatar"
                />
                <div class="user-details">
                  <router-link
                    :to="{ name: 'ProfileSettings' }"
                    class="profile-link"
                    @click="closeMenu"
                  >
                    <h6 class="dropdown-header user-name-header">
                      Hello, {{ user.name || 'User' }}
                    </h6>
                  </router-link>
                  <span class="user-email-text">{{ user.email }}</span>
                </div>
              </div>

              <div v-if="isAuthenticated" class="dropdown-section">
                <h6 class="dropdown-header">My RentCycle</h6>
                <router-link
                  to="/favorites"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-heart-fill"></i>Favorites
                </router-link>
                <router-link
                  to="/dashboard/my-bookings"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-briefcase-fill"></i>Trips
                </router-link>
                <router-link
                  to="/inbox"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-envelope-fill"></i>Inbox
                </router-link>
              </div>

              <hr
                v-if="isAuthenticated && userRole === 'owner'"
                class="dropdown-divider"
              />

              <div
                v-if="isAuthenticated && userRole === 'owner'"
                class="dropdown-section"
              >
                <h6 class="dropdown-header">Hosting</h6>
                <router-link
                  to="/dashboard/owner/vehicles"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-card-checklist"></i>My Listings
                </router-link>
                <router-link
                  to="/dashboard/earnings"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-cash-stack"></i>Earnings
                </router-link>
                <router-link
                  to="/dashboard/calendar"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-calendar-check-fill"></i>Calendar
                </router-link>
                <router-link
                  :to="hostLinkTarget"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-plus-circle-fill"></i>List a New Car
                </router-link>
              </div>

              <hr class="dropdown-divider" />

              <div class="dropdown-section">
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-key"></i>How RentCycle Works
                </router-link>
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-headset"></i>Contact Support
                </router-link>
                <router-link to="#" class="dropdown-item with-icon">
                  <i class="bi bi-file-earmark-text"></i>Legal
                </router-link>
              </div>

              <hr v-if="isAuthenticated" class="dropdown-divider" />

              <div v-if="isAuthenticated" class="dropdown-section">
                <button
                  @click="handleLogout"
                  class="dropdown-item with-icon logout-button"
                >
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
    <DateRangePicker
      v-if="isPickerVisible && $route.name === 'VehicleList'"
      @dates-selected="handleDatesSelected"
      @close-picker="isPickerVisible = false"
      :initialFromDate="fromDate"
      :initialUntilDate="untilDate"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DateRangePicker from './components/HomeViewComponents/DateRangePicker.vue';

export default {
  name: 'App',
  components: {
    DateRangePicker,
  },
  data() {
    return {
      isMenuOpen: false,
      isPickerVisible: false,
      location: '',
      fromDate: '',
      fromTime: '',
      untilDate: '',
      untilTime: '',
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'userRole', 'user']),
    hostLinkText() {
      if (this.isAuthenticated && this.userRole === 'owner') {
        return 'List your car';
      }
      return 'Become a host';
    },
    hostLinkTarget() {
      if (this.isAuthenticated && this.userRole === 'owner') {
        return { name: 'AddVehicle' };
      }
      return { name: 'BecomeOwnerApplication' };
    },
    timeOptions() {
      const times = [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);
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
    initialsImage() {
      const name = this.user?.name || 'User';
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 100;
      canvas.width = size;
      canvas.height = size;

      context.fillStyle = '#C0C0C0';
      context.fillRect(0, 0, size, size);

      context.fillStyle = '#FFFFFF';
      context.font = `bold ${size / 2}px Nunito`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(initials, size / 2, size / 2);

      return canvas.toDataURL();
    },
  },
  methods: {
    ...mapActions(['logout']),
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
    closeMenuOnClickOutside(event) {
      if (this.isMenuOpen && this.$refs.dropdownMenu && this.$refs.menuButton) {
        if (
          !this.$refs.dropdownMenu.contains(event.target) &&
          !this.$refs.menuButton.contains(event.target)
        ) {
          this.closeMenu();
        }
      }
    },
    handleDatesSelected({ fromDate, untilDate }) {
      this.fromDate = fromDate;
      this.untilDate = untilDate;
      this.isPickerVisible = false;
    },
    setInitialDateTime() {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const pstDateTime = now.toLocaleString('en-US', options);
      const [datePart, timePart] = pstDateTime.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      this.fromDate = `${year}-${month}-${day}`;
      const initialFromTimeIndex = Math.floor(
        (parseInt(hour) * 60 + parseInt(minute)) / 30
      );
      this.fromTime = this.timeOptions[initialFromTimeIndex] || '12:00 AM';
      const untilDateObj = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const pstUntilDateTime = untilDateObj.toLocaleString('en-US', options);
      const [untilDatePart] = pstUntilDateTime.split(', ');
      const [untilMonth, untilDay, untilYear] = untilDatePart.split('/');
      this.untilDate = `${untilYear}-${untilMonth}-${untilDay}`;
      this.untilTime = this.fromTime;
    },
    searchVehicles() {
      const query = {
        location: this.location,
        fromDate: this.fromDate,
        fromTime: this.fromTime,
        untilDate: this.untilDate,
        untilTime: this.untilTime,
      };
      this.$router.push({ name: 'VehicleList', query });
    },
  },
  mounted() {
    document.addEventListener('click', this.closeMenuOnClickOutside);
    this.setInitialDateTime();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Nunito:wght@400;700;900&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css');
@import './assets/styles/variables.scss';
body {
  margin: 0;
  font-family: 'Nunito', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: white;
  box-sizing: border-box;
}
.app-container {
  max-width: 100%;
  width: 100%;
  padding: 0;
  box-shadow: none;
  background-color: white;
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
  position: relative;
  cursor: pointer;
  &::before {
    content: '';
    position: absolute;
    top: -0.5rem;
    bottom: -0.5rem;
    left: 0;
    right: 0;
    background-color: #f0f0f0;
    clip-path: polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%);
    border-radius: 9999px;
  }
}
.app-title {
  font-family: 'Anton', sans-serif;
  font-size: 2.2rem;
  font-weight: 400;
  margin: 0;
  line-height: 1;
  position: relative;
  z-index: 1;
  padding: 0 1.5rem;
}
.rent-text {
  color: red;
  font-style: italic;
}
.cycle-text {
  color: black;
  font-style: italic;
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
  font-family: 'Nunito', sans-serif;
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
  font-family: 'Nunito', sans-serif;
  &:hover {
    box-shadow: $shadow-medium;
    background-color: white;
  }
  .menu-icon {
    font-size: 1.2rem;
    color: black;
  }
  .avatar-icon {
    font-size: 1.2rem;
    color: black;
  }
}
.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
  margin-left: -0.5rem;
}
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
  font-family: 'Nunito', sans-serif;
}
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
.user-info-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  text-align: center;
}
.dropdown-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $primary-color;
  margin-bottom: 0.5rem;
}
.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-name-header,
.user-email-text {
  font-family: 'Nunito', sans-serif;
  margin: 0;
}
.user-name-header {
  font-size: 1rem;
  font-weight: 700;
  color: $text-color-dark;
  text-transform: capitalize;
  border: none;
  padding: 0;
}
.profile-link {
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
}
.user-email-text {
  font-size: 0.85rem;
  color: $text-color-medium;
}
.dropdown-header {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-color-medium;
  padding: 0 1.5rem 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
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
  &.with-icon {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  &:hover {
    transform: translateX(5px);
  }
}
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
  font-family: 'Nunito', sans-serif;
  font-size: inherit;
  cursor: pointer;
  text-align: left;
}
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
  font-family: 'Nunito', sans-serif;
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
    font-family: 'Nunito', sans-serif;
  }
  .search-input,
  .date-time-group {
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
  font-family: 'Nunito', sans-serif;
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
.search-button {
  background-color: #6a0dad;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.65rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  font-size: 0.85rem;
  &:hover {
    background-color: darken(#6a0dad, 10%);
  }
  .bi-search {
    font-size: 1rem;
  }
}
.time-select {
  width: 100px;
  padding: 0.25rem;
  text-align: right;
  box-sizing: border-box;
}

.header-nav {
  display: flex;
  gap: 2rem;
  @media (max-width: 768px) {
    display: none;
  }
}

.nav-link {
  font-family: 'Nunito', sans-serif;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  transition: color 0.2s ease-in-out;

  &:hover,
  &.router-link-active {
    color: black;
  }
}
</style>