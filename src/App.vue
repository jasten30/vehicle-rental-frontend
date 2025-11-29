<template>
  <div id="app" class="app-container">
    <header class="app-header" v-if="userRole !== 'admin'">
      <router-link to="/" class="app-title-link">
        <img :src="logo" alt="RentCycle Logo" class="app-logo-image" />
      </router-link>

      <nav class="header-nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/vehicles" class="nav-link">Vehicles</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/contact" class="nav-link">Contact</router-link>
      </nav>

      <div class="header-right">
        <NotificationBell v-if="isAuthenticated" />

        <button
          v-if="$route.name !== 'VehicleList'"
          @click.prevent="handleHostClick"
          class="become-host-button"
          :class="{ 'disabled-btn': isSuspended && userRole === 'owner' }"
          :title="isSuspended ? 'Account Suspended' : ''"
        >
          <i
            v-if="isSuspended && userRole === 'owner'"
            class="bi bi-slash-circle icon-left"
          ></i>
          {{ hostLinkText }}
        </button>

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
                >
                  Login
                </router-link>
                <router-link
                  to="/register"
                  class="dropdown-item"
                  @click="closeMenu"
                >
                  Sign up
                </router-link>
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
                      Hello, {{ user.name || "User" }}
                    </h6>
                  </router-link>
                  <span class="user-email-text">{{ user.email }}</span>

                  <span v-if="isSuspended" class="suspended-badge">
                    SUSPENDED
                  </span>
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
                v-if="
                  isAuthenticated &&
                  (userRole === 'owner' || userRole === 'renter')
                "
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

                <a
                  href="#"
                  class="dropdown-item with-icon"
                  :class="{ 'disabled-item': isSuspended }"
                  @click.prevent="handleHostClick"
                >
                  <i class="bi bi-plus-circle-fill"></i>
                  {{ isSuspended ? "Listing Disabled" : "List New Asset" }}
                </a>
              </div>

              <div
                v-if="isAuthenticated && userRole === 'renter'"
                class="dropdown-section"
              >
                <a
                  href="#"
                  class="dropdown-item with-icon"
                  :class="{ 'disabled-item': isSuspended }"
                  @click.prevent="handleHostClick"
                >
                  <i class="bi bi-plus-circle-fill"></i>Become a host
                </a>
              </div>

              <hr class="dropdown-divider" />

              <div class="dropdown-section">
                <router-link
                  to="/how-it-works"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-key"></i>How RentCycle Works
                </router-link>
                <router-link
                  to="/contact"
                  class="dropdown-item with-icon"
                  @click="closeMenu"
                >
                  <i class="bi bi-headset"></i>Contact Support
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

    <FooterSection v-if="userRole !== 'admin'" />

    <VehicleTypeChoiceModal
      :show="isChoiceModalVisible"
      @close="isChoiceModalVisible = false"
      @navigate="handleTypeChoice"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import NotificationBadge from "./utils/NotificationBadge.vue";
import NotificationBell from "./components/utils/NotificationBell.vue";
import VehicleTypeChoiceModal from "./components/modals/VehicleTypeChoiceModal.vue";
import FooterSection from "./components/HomeViewComponents/FooterSection.vue";
import logoHeader from "@/assets/rentcycle_logo.png";

export default {
  name: "App",
  components: {
    NotificationBadge,
    NotificationBell,
    VehicleTypeChoiceModal,
    FooterSection,
  },
  data() {
    return {
      isMenuOpen: false,
      initialsDataUrl: null,
      isChoiceModalVisible: false,
      logo: logoHeader,
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "userRole", "user", "userChats"]),

    // Helper to check if account is suspended
    isSuspended() {
      return this.user?.isSuspended === true;
    },

    hostLinkText() {
      if (this.isAuthenticated && this.userRole === "owner") {
        if (this.isSuspended) return "Listing Disabled";
        return "List your asset";
      }
      return "Become a host";
    },

    initials() {
      if (!this.user) return "";
      const name = this.user.name || "User";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },

    unreadChatsCount() {
      if (!this.user || !this.userChats || this.userChats.length === 0) {
        return 0;
      }
      return this.userChats.filter(
        (chat) =>
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
    },
  },
  methods: {
    ...mapActions(["logout", "fetchUserChats"]),

    handleHostClick() {
      this.closeMenu();

      if (this.isSuspended) {
        alert(
          "Your account is suspended. You cannot perform this action. Please contact support."
        );
        return;
      }

      if (this.isAuthenticated && this.userRole === "owner") {
        this.isChoiceModalVisible = true;
      } else {
        this.$router.push({ name: "BecomeOwnerApplication" });
      }
    },

    handleTypeChoice(routeName) {
      this.isChoiceModalVisible = false;
      this.$router.push({ name: routeName });
    },

    generateInitialsImage(initials) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      context.fillStyle = "#C0C0C0";
      context.fillRect(0, 0, size, size);
      context.fillStyle = "#FFFFFF";
      context.font = `bold ${size / 2}px Nunito`;
      context.textAlign = "center";
      context.textBaseline = "middle";
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
    document.addEventListener("click", this.closeMenuOnClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeMenuOnClickOutside);
  },
  created() {
    if (this.isAuthenticated) {
      this.fetchUserChats();
    }
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Nunito:wght@400;700;900&display=swap");
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");
@import "./assets/styles/variables.scss";

body {
  margin: 0;
  font-family: "Nunito", sans-serif;
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* --- Responsive Header --- */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #eee;
  box-shadow: $shadow-light;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
}

.app-title-link {
  text-decoration: none;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.app-logo-image {
  height: 50px;
  width: auto;
  object-fit: contain;

  @media (max-width: 480px) {
    height: 40px;
  }
}

/* --- Navigation Links --- */
.header-nav {
  display: flex;
  gap: 2rem;

  @media (max-width: 900px) {
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
    color: $primary-color;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
}

/* --- Become Host Button --- */
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    box-shadow: $shadow-medium;
  }

  @media (max-width: 900px) {
    display: none;
  }

  &.disabled-btn {
    color: #9ca3af;
    background-color: #f3f4f6;
    border-color: #e5e7eb;
    cursor: not-allowed;
    &:hover {
      box-shadow: none;
    }
    .icon-left {
      color: #ef4444;
    }
  }
}

/* --- User Menu --- */
.user-menu-container {
  position: relative;
  display: inline-block;
}

.menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: 9999px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
  box-shadow: $shadow-light;

  @media (min-width: 768px) {
    padding: 0.75rem 1rem;
  }

  &:hover {
    box-shadow: $shadow-medium;
  }
  .menu-icon,
  .avatar-icon {
    font-size: 1.2rem;
    color: black;
  }
}

/* --- RESPONSIVE DROPDOWN MENU --- */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 1000;
  min-width: 250px;
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-large;
  list-style: none;
  padding: 0.5rem 0;
  text-align: left;
  border: 1px solid #f0f0f0;

  /* SCROLL FIX: Allow scrolling if menu is too tall */
  max-height: 75vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* MOBILE FIX: Fix position to viewport on small screens */
  @media (max-width: 768px) {
    position: fixed; /* Anchors to the window, not the button */
    top: 75px; /* Just below the header */
    right: 1rem; /* 1rem from right edge */
    width: 280px; /* Wider width */
    max-height: 80vh; /* Ensure it fits on screen */
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
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

/* User Info Inside Dropdown */
.user-info-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  text-align: center;
  background-color: #f9fafb;
  border-bottom: 1px solid #eee;
}

.dropdown-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $primary-color;
  margin-bottom: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.user-name-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: $text-color-dark;
  text-transform: capitalize;
  margin: 0;
  padding: 0;
  line-height: 1.2;
}

.user-email-text {
  font-size: 0.85rem;
  color: $text-color-medium;
  margin-top: 0.25rem;
  word-break: break-all;
}

/* Suspension Badge */
.suspended-badge {
  background-color: #fee2e2;
  color: #dc2626;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 6px;
  border: 1px solid #fecaca;
}

.profile-link {
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
}

.dropdown-header {
  font-size: 0.85rem;
  font-weight: 800;
  color: $text-color-medium;
  padding: 0.5rem 1.5rem 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0.5rem 0 0;
}

.dropdown-section {
  padding: 0.25rem 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1.5rem;
  color: $text-color-dark;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
  box-sizing: border-box;
  font-size: 0.95rem;

  &.with-icon {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  &:hover {
    background-color: #f3f4f6;
    color: $primary-color;
  }

  &.disabled-item {
    color: #9ca3af !important;
    cursor: not-allowed;
    background-color: #f9fafb;
    &:hover {
      background-color: #f9fafb;
      color: #9ca3af !important;
    }
  }
}

.dropdown-item i {
  color: $text-color-medium;
  font-size: 1.1rem;
}
.dropdown-item:hover i {
  color: $primary-color;
}

.dropdown-item.disabled-item i {
  color: #9ca3af !important;
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
  color: $admin-color;

  &:hover {
    background-color: #fee2e2;
    color: darken($admin-color, 10%);
  }
  i {
    color: $admin-color;
  }
}

.app-content {
  padding-top: 0;
  min-height: 300px;
  flex-grow: 1;
}
</style>
