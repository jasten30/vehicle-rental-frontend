<!-- vehicle-rental-frontend/src/App.vue - Root component of your Vue application -->
<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1 class="app-title">RentCycle</h1>
      <nav class="main-nav">
        <!-- Always show Home and Vehicles -->
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/vehicles" class="nav-link">Vehicles</router-link>

        <!-- Conditional navigation based on authentication status -->
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link">Register</router-link>
        </template>
        <template v-else>
          <!-- Always show My Bookings when authenticated -->
          <router-link to="/dashboard/my-bookings" class="nav-link">My Bookings</router-link>

          <!-- Owner/Admin Dashboard links -->
          <router-link
            v-if="userRole === 'owner' || userRole === 'admin'"
            to="/dashboard/owner/vehicles"
            class="nav-link"
          >Owner Dashboard</router-link>
          <router-link
            v-if="userRole === 'admin'"
            to="/dashboard/admin/vehicles"
            class="nav-link"
          >Admin Dashboard</router-link>
          
          <button @click="handleLogout" class="nav-link logout-button">
            Logout
          </button>
        </template>
      </nav>
    </header>

    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "App",
  computed: {
    ...mapGetters(["isAuthenticated", "userRole"]), // Map getters from Vuex store
    // Removed isDashboardRoute computed property as it's no longer needed for this top-level nav logic
  },
  methods: {
    ...mapActions(["logout"]), // Map the logout action from Vuex store
    handleLogout() {
      this.logout(); // Dispatch the logout action
    },
  },
};
</script>

<style lang="scss">
/* vehicle-rental-frontend/src/App.vue styles using SCSS */
@import "./assets/styles/variables.scss";

body {
  margin: 0;
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: $background-color;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

#app {
  text-align: center;
  color: $text-color-dark;
  max-width: 960px; /* Increased max-width for better layout */
  width: 100%;
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  margin: 0 auto; /* Center the app container */
}

.app-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee; /* Light separator */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: $primary-color;
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 2rem;
  }
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  justify-content: center;
}

.nav-link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out;

  &:hover {
    background-color: lighten($primary-color, 40%);
    color: darken($primary-color, 10%);
  }

  &.router-link-exact-active {
    background-color: $primary-color;
    color: white;
  }
}

.logout-button {
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  // Inherits nav-link styles
}

.app-content {
  padding-top: 1rem; /* Space below navigation */
  min-height: 300px; /* Ensure some height for content */
}

/* Remove initial setup message as it's no longer relevant */
.app-content p,
.app-content .setup-message {
  display: none;
}
</style>
