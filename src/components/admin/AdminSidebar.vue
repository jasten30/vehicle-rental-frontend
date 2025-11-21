<template>
  <div 
    v-if="isOpen" 
    class="sidebar-overlay" 
    @click="$emit('close')"
  ></div>

  <aside :class="['admin-sidebar', { 'is-open': isOpen }]">
    <div class="sidebar-header">
      <div class="brand-wrapper">
        <div class="logo-icon">
          <i class="bi bi-shield-check"></i>
        </div>
        <h2 class="brand-text">Admin<span class="highlight">Panel</span></h2>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-category">Main Menu</p>
      <ul>
        <li>
          <router-link :to="{ name: 'AdminDashboard' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminUsers' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-people-fill"></i>
            <span>Users</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminVehicles' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-car-front-fill"></i>
            <span>Vehicles</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminBookings' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-briefcase-fill"></i>
            <span>Bookings</span>
          </router-link>
        </li>
      </ul>

      <p class="nav-category">Applications</p>
      <ul>
        <li>
          <router-link :to="{ name: 'AdminHostApplications' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-person-check-fill"></i>
            <span>Host Applications</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'AdminDriveApplications' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-person-vcard-fill"></i>
            <span>Driver Applications</span>
          </router-link>
        </li>
      </ul>

      <p class="nav-category">Management</p>
      <ul>
        <li>
          <router-link :to="{ name: 'AdminReports' }" class="nav-link" @click="$emit('close')">
            <i class="bi bi-flag-fill"></i>
            <span>Reports</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">A</div>
        <div class="user-info">
          <span class="name">Administrator</span>
          <span class="status">Online</span>
        </div>
      </div>
      <button @click="handleLogout" class="logout-button" title="Logout">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  </aside>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'], // Define emitted event
  setup() {
    const store = useStore();
    const router = useRouter();

    const handleLogout = () => {
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

// --- Variables ---
$sidebar-width: 280px;
$sidebar-bg: #111827; // Very dark blue/grey
$sidebar-text: #9ca3af; // Muted grey
$sidebar-active-bg: $primary-color;
$sidebar-active-text: #ffffff;
$hover-bg: rgba(255, 255, 255, 0.05);

// --- Overlay (Mobile only) ---
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 998;
  display: none;

  @media (max-width: 992px) {
    // Show overlay only when sidebar is open on mobile logic is handled by v-if in template
    display: block; 
  }
}

// --- Main Sidebar ---
.admin-sidebar {
  width: $sidebar-width;
  height: 100vh;
  background-color: $sidebar-bg;
  color: $sidebar-text;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid rgba(255,255,255,0.05);

  // Mobile State: Hidden by default
  @media (max-width: 992px) {
    transform: translateX(-100%);
    
    &.is-open {
      transform: translateX(0);
    }
  }
}

// --- Header ---
.sidebar-header {
  padding: 1.5rem 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .brand-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, $primary-color, lighten($primary-color, 20%));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba($primary-color, 0.3);
  }

  .brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0;
    letter-spacing: 0.5px;

    .highlight {
      color: $primary-color;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: $sidebar-text;
    font-size: 1.2rem;
    cursor: pointer;
    display: none; // Hidden on desktop

    @media (max-width: 992px) {
      display: block;
    }
  }
}

// --- Navigation ---
.sidebar-nav {
  flex: 1;
  overflow-y: auto; // Scrollable if content overflows
  padding: 0 1rem;

  // Custom Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }

  .nav-category {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    color: rgba($sidebar-text, 0.6);
    margin: 1.5rem 0 0.75rem 0.75rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: $sidebar-text;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;

  i {
    font-size: 1.1rem;
    transition: color 0.2s;
  }

  &:hover {
    background-color: $hover-bg;
    color: white;
    
    i {
      color: white;
    }
  }

  &.router-link-active {
    background: linear-gradient(90deg, rgba($primary-color, 0.15), transparent);
    color: $primary-color;
    font-weight: 600;
    
    // Left Border Indicator
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 20px;
      width: 3px;
      background-color: $primary-color;
      border-radius: 0 4px 4px 0;
    }

    i {
      color: $primary-color;
    }
  }
}

// --- Footer ---
.sidebar-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  background-color: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .avatar {
      width: 36px;
      height: 36px;
      background-color: #374151;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      
      .name {
        font-size: 0.9rem;
        font-weight: 600;
        color: white;
      }
      .status {
        font-size: 0.75rem;
        color: #10b981; // Green for online
      }
    }
  }

  .logout-button {
    background: none;
    border: none;
    color: $sidebar-text;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(239, 68, 68, 0.1); // Light red bg
      color: #ef4444; // Red icon
    }
  }
}
</style>