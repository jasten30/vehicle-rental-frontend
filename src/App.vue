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
        <!-- --- NEW: Notification Bell added here --- -->
        <NotificationBell v-if="isAuthenticated" />

        <!-- --- UPDATED: This is now a button that calls a method --- -->
        <button
          v-if="$route.name !== 'VehicleList'"
          @click.prevent="handleHostClick"
          class="become-host-button"
        >
          {{ hostLinkText }}
        </button>
        <!-- --- END UPDATE --- -->

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
                  :src="initialsDataUrl"
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
                  :to="{ name: 'MyFavorites' }"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-heart-fill"></i>Favorites
                </router-link>
                <router-link
                  :to="{ name: 'MyBookings' }"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-briefcase-fill"></i>Trips
                </router-link>
                <router-link
                  :to="{ name: 'Chat' }"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-envelope-fill"></i>Inbox
                  <NotificationBadge :count="unreadChatsCount" />
                </router-link>
              </div>

              <hr
                v-if="isAuthenticated && (userRole === 'owner' || userRole === 'renter')"
                class="dropdown-divider"
              />

              <div
                v-if="isAuthenticated && userRole === 'owner'"
                class="dropdown-section"
              >
                <h6 class="dropdown-header">Hosting</h6>
                <router-link
                  :to="{ name: 'OwnerVehicles' }"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-card-checklist"></i>My Listings
                </router-link>
                <router-link
                  :to="{ name: 'OwnerBilling' }"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-cash-stack"></i>Earnings
                </router-link>
                <router-link
                  :to="{ name: 'OwnerBookings' }"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-calendar-check-fill"></i>Calendar
                </router-link>
                <!-- --- UPDATED: This now calls the same method --- -->
                <a
                  href="#"
                  class="dropdown-item with-icon"
                  @click.prevent="handleHostClick"
                >
                  <i class="bi bi-plus-circle-fill"></i>List New Asset
                </a>
                <!-- --- END UPDATE --- -->
              </div>

              <!-- --- UPDATED: Show "Become a host" if user is a RENTER --- -->
              <div
                v-if="isAuthenticated && userRole === 'renter'"
                class="dropdown-section"
              >
                <a
                  href="#"
                  class="dropdown-item with-icon"
                  @click.prevent="handleHostClick"
                >
                  <i class="bi bi-plus-circle-fill"></i>Become a host
                </a>
              </div>
              <!-- --- END UPDATE --- -->

              <hr class="dropdown-divider" />

              <div class="dropdown-section">
                <router-link
                  to="/how-it-works"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
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

    <!-- --- NEW: Added FooterSection here --- -->
    <FooterSection v-if="userRole !== 'admin'" />
    <!-- --- END NEW --- -->

    <!-- --- NEW: Add the modal component here --- -->
    <VehicleTypeChoiceModal
      :show="isChoiceModalVisible"
      @close="isChoiceModalVisible = false"
      @navigate="handleTypeChoice"
    />
    <!-- --- END NEW --- -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import NotificationBadge from './utils/NotificationBadge.vue';
import NotificationBell from './components/utils/NotificationBell.vue';
import VehicleTypeChoiceModal from './components/modals/VehicleTypeChoiceModal.vue';
// --- NEW: Import the Footer ---
import FooterSection from './components/HomeViewComponents/FooterSection.vue';


export default {
  name: 'App',
  components: {
    NotificationBadge,
    NotificationBell,
    VehicleTypeChoiceModal,
    FooterSection, // --- NEW: Register Footer ---
  },
  data() {
    return {
      isMenuOpen: false,
      initialsDataUrl: null,
      isChoiceModalVisible: false,
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'userRole', 'user', 'userChats']),
    hostLinkText() {
      if (this.isAuthenticated && this.userRole === 'owner') {
        return 'List your asset'; // Updated text
      }
      return 'Become a host';
    },
    // hostLinkTarget computed property is no longer needed for the button
    initials() {
      if (!this.user) return '';
      const name = this.user.name || 'User';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    unreadChatsCount() {
      if (!this.user || !this.userChats || this.userChats.length === 0) {
        return 0;
      }
      return this.userChats.filter(chat =>
        chat.lastMessage &&
        chat.lastMessage.readBy &&
        !chat.lastMessage.readBy.includes(this.user.uid)
      ).length;
    },
  },
  watch: {
    initials: {
      immediate: true,
      handler(newInitials) {
        if (newInitials) {
          this.generateInitialsImage(newInitials);
        } else {
          this.initialsDataUrl = null;
        }
      },
    },
    isAuthenticated(newVal) {
      if (newVal) {
        this.fetchUserChats();
      }
    }
  },
  methods: {
    ...mapActions(['logout', 'fetchUserChats']),
    
    handleHostClick() {
      this.closeMenu();
      if (this.isAuthenticated && this.userRole === 'owner') {
        this.isChoiceModalVisible = true;
      } else {
        this.$router.push({ name: 'BecomeOwnerApplication' });
      }
    },

    handleTypeChoice(routeName) {
      this.isChoiceModalVisible = false;
      this.$router.push({ name: routeName });
    },

    generateInitialsImage(initials) {
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
      this.initialsDataUrl = canvas.toDataURL();
    },
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
  },
  mounted() {
    document.addEventListener('click', this.closeMenuOnClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  },
  created() {
    if (this.isAuthenticated) {
      this.fetchUserChats();
    }
  }
};
</script>

<style lang="scss">
/* All your existing global styles */
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
  display: flex; // --- NEW: Flex layout ---
  flex-direction: column; // --- NEW: Stack header/main/footer ---
  min-height: 100vh; // --- NEW: Ensure it takes at least full screen height ---
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
  flex-grow: 1; // --- NEW: Makes the main content grow to fill space ---
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

.dropdown-item.with-icon {
  display: flex;
  align-items: center;
}
</style>

