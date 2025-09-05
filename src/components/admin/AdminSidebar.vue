<template>
  <div class="admin-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        <i class="bi bi-shield-lock-fill"></i>
        Admin Panel
      </h2>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li>
          <router-link :to="{ name: 'AdminDashboard' }" class="nav-link">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminUsers' }" class="nav-link">
            <i class="bi bi-people-fill"></i>
            <span>Users</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminVehicles' }" class="nav-link">
            <i class="bi bi-car-front-fill"></i>
            <span>Vehicles</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminBookings' }" class="nav-link">
            <i class="bi bi-briefcase-fill"></i>
            <span>Bookings</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminHostApplications' }" class="nav-link">
            <i class="bi bi-person-check-fill"></i>
            <span>Host Applications</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-button">
        <i class="bi bi-box-arrow-left"></i>
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminSidebar',
  setup() {
    const store = useStore();
    const router = useRouter();

    const handleLogout = () => {
      // Use the non-namespaced 'logout' action from your root store
      store.dispatch('logout').then(() => {
        router.push('/login');
      });
    };

    return {
      handleLogout,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-sidebar {
  background-color: #1a202c;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.5rem 1rem;
}

.sidebar-header {
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: $border-radius-md;
  color: #a0aec0;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease;

  i {
    font-size: 1.25rem;
    width: 24px; // Ensures icons are aligned
    text-align: center;
  }

  &:hover {
    background-color: #2d3748;
    color: white;
  }

  &.router-link-exact-active {
    background-color: $primary-color;
    color: white;
  }
}

.sidebar-footer {
  margin-top: auto; /* Pushes the logout button to the bottom */
}

.logout-button {
  width: 100%;
  background: none;
  border: 1px solid #4a5568;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    border-color: $admin-color;
    background-color: lighten($admin-color, 10%);
    color: white;
  }
}
</style>