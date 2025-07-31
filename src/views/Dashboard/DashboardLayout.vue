<!-- frontend/src/views/Dashboard/DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <!-- REMOVED: The entire <header> block goes here -->

    <div class="dashboard-main">
      <aside class="dashboard-sidebar">
        <nav class="sidebar-nav">
          <!-- Common Links for all authenticated users -->
          <router-link :to="{ name: 'MyBookings' }" class="sidebar-link">My Bookings</router-link>
          <router-link :to="{ name: 'ProfileSettings' }" class="sidebar-link">Profile Settings</router-link>

          <!-- Owner-specific links (also visible to Admin) -->
          <template v-if="userRole === 'owner' || userRole === 'admin'">
            <hr class="sidebar-divider">
            <router-link :to="{ name: 'OwnerVehicles' }" class="sidebar-link owner-link">My Listings</router-link>
            <router-link :to="{ name: 'OwnerBookings' }" class="sidebar-link owner-link">Bookings For My Vehicles</router-link>
          </template>

          <!-- Admin-specific links -->
          <template v-if="userRole === 'admin'">
            <hr class="sidebar-divider">
            <router-link :to="{ name: 'AdminVehicles' }" class="sidebar-link admin-link">Manage Vehicles</router-link>
            <router-link :to="{ name: 'AdminBookings' }" class="sidebar-link admin-link">Manage All Bookings</router-link>
            <router-link :to="{ name: 'AdminUsers' }" class="sidebar-link admin-link">Manage Users</router-link>
          </template>
        </nav>
      </aside>

      <main class="dashboard-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'DashboardLayout',
  computed: {
    ...mapGetters(['userRole']),
  },
  methods: {
    ...mapActions(['logout']),
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $background-color;
  font-family: 'Inter', sans-serif;
}

/* REMOVED .dashboard-header, .header-content, .logo, .main-nav, .nav-link, .logout-link styles */

.dashboard-main {
  display: flex;
  flex-grow: 1;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.dashboard-sidebar {
  width: 250px;
  background-color: $card-background;
  padding: 1.5rem;
  box-shadow: $shadow-light;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    display: flex;
    justify-content: center;
    box-shadow: $shadow-medium;
    overflow-x: auto; /* Allow horizontal scrolling for sidebar links on small screens */
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    white-space: nowrap; /* Prevent wrapping of links */
  }
}

.sidebar-link {
  color: $text-color-dark;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: $border-radius-md;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: lighten($primary-color, 45%);
    color: $primary-color;
  }

  &.router-link-exact-active {
    background-color: $primary-color;
    color: white;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

.sidebar-divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 1rem 0;

  @media (max-width: 768px) {
    display: none; /* Hide divider on small screens */
  }
}

.owner-link {
  color: $accent-color-dark; // A different color for owner links
  &:hover {
    background-color: lighten($accent-color-dark, 40%);
    color: darken($accent-color-dark, 10%);
  }
  &.router-link-exact-active {
    background-color: $accent-color-dark;
    color: white;
  }
}

.admin-link {
  color: $admin-color; // Assuming you have an admin color in variables.scss
  &:hover {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 10%);
  }
  &.router-link-exact-active {
    background-color: $admin-color;
    color: white;
  }
}

.dashboard-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto; /* Enable scrolling for content if it overflows */
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}
</style>
