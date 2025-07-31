<!-- frontend/src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="brand-link">RentCycle PH</router-link>
    </div>
    <div class="navbar-menu">
      <router-link to="/vehicles" class="nav-item">Vehicles</router-link>
      <router-link to="/about" class="nav-item">About</router-link>
      <router-link to="/contact" class="nav-item">Contact</router-link>

      <div v-if="isAuthenticated" class="auth-links">
        <router-link to="/dashboard" class="nav-item">Dashboard</router-link> <!-- New Dashboard Link -->
        <a @click="handleLogout" class="nav-item logout-link">Logout</a>
      </div>
      <div v-else class="auth-links">
        <router-link to="/login" class="nav-item">Login</router-link>
        <router-link to="/register" class="nav-item register-button">Register</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'NavbarView',
  computed: {
    ...mapGetters(['isAuthenticated', 'userRole']),
  },
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.logout();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.navbar {
  background-color: $primary-color;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: $shadow-medium;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-brand .brand-link {
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: color 0.2s ease;

  &:hover {
    color: lighten($primary-color, 30%);
  }
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: $primary-color;
    padding: 1rem 0;
    box-shadow: $shadow-medium;
    display: none; /* Hide by default on small screens, toggle with JS if needed */
  }
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.5rem 0.75rem;
  border-radius: $border-radius-sm;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
  }
}

.register-button {
  background-color: $secondary-color;
  border: 1px solid $secondary-color;
  padding: 0.5rem 1rem;
  border-radius: $border-radius-md;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: darken($secondary-color, 10%);
    transform: translateY(-1px);
  }
}

.logout-link {
  cursor: pointer;
  // Inherits nav-item styles
}

.auth-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
}
</style>
