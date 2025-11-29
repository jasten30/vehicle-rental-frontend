<template>
  <div v-if="isOpen" class="sidebar-overlay" @click="$emit('close')"></div>

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
          <router-link
            :to="{ name: 'AdminDashboard' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'AdminUsers' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-people-fill"></i>
            <span>Users</span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'AdminVehicles' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-car-front-fill"></i>
            <span>Vehicles</span>
            <span v-if="counts.vehicles > 0" class="notification-badge">
              {{ counts.vehicles }}
            </span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'AdminBookings' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-briefcase-fill"></i>
            <span>Bookings</span>
            <span v-if="counts.bookings > 0" class="notification-badge">
              {{ counts.bookings }}
            </span>
          </router-link>
        </li>
      </ul>

      <p class="nav-category">Applications</p>
      <ul>
        <li>
          <router-link
            :to="{ name: 'AdminHostApplications' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-person-check-fill"></i>
            <span>Host Applications</span>
            <span v-if="counts.hostApps > 0" class="notification-badge danger">
              {{ counts.hostApps }}
            </span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'AdminDriveApplications' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-person-vcard-fill"></i>
            <span>Driver Applications</span>
            <span v-if="counts.driveApps > 0" class="notification-badge danger">
              {{ counts.driveApps }}
            </span>
          </router-link>
        </li>
      </ul>

      <p class="nav-category">Management</p>
      <ul>
        <li>
          <router-link
            :to="{ name: 'AdminReports' }"
            class="nav-link"
            @click="$emit('close')"
          >
            <i class="bi bi-flag-fill"></i>
            <span>Reports</span>
            <span v-if="counts.reports > 0" class="notification-badge warning">
              {{ counts.reports }}
            </span>
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
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed, onMounted, watch } from "vue";

export default {
  name: "AdminSidebar",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup() {
    const store = useStore();
    const router = useRouter();

    // 1. Function to refresh counts
    const refreshCounts = async () => {
      try {
        // Only fetch if we have a token (user is logged in)
        if (store.getters.authToken) {
          await Promise.all([
            store.dispatch("fetchHostApplications"),
            store.dispatch("fetchDriveApplications"),
            store.dispatch("fetchBookingReports"),
          ]);
        }
      } catch (e) {
        console.error("Sidebar failed to fetch counts:", e);
      }
    };

    // 2. Fetch on Mount
    onMounted(() => {
      refreshCounts();
    });

    // 3. Watch for route changes (e.g. coming back to dashboard)
    watch(
      () => router.currentRoute.value,
      () => {
        refreshCounts();
      }
    );

    // 4. Compute counts directly from state to ensure reactivity
    // (Using getters is fine, but direct state access debugs if getters are broken)
    const counts = computed(() => {
      const hostApps = store.state.hostApplications || []; // Adjust based on your store module structure
      const driveApps = store.state.driveApplications || [];
      const reports = store.state.reports || [];

      // Use getters if available, fallback to state filter
      const pendingHost =
        store.getters.pendingHostApplicationsCount ??
        hostApps.filter((a) => a.status === "pending").length;
      const pendingDrive =
        store.getters.pendingDriveApplicationsCount ??
        driveApps.filter((a) => a.status === "pending").length;
      const activeReports =
        store.getters.unresolvedReportsCount ??
        reports.filter((r) => r.status !== "resolved").length;

      return {
        hostApps: pendingHost,
        driveApps: pendingDrive,
        vehicles: store.getters.pendingVehiclesCount || 0,
        reports: activeReports,
        bookings: 0,
      };
    });

    const handleLogout = () => {
      store.dispatch("logout").then(() => {
        router.push("/login");
      });
    };

    return {
      handleLogout,
      counts,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

// --- Variables ---
$sidebar-width: 280px;
$sidebar-bg: #111827;
$sidebar-text: #9ca3af;
$hover-bg: rgba(255, 255, 255, 0.05);

// --- Overlay ---
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
  border-right: 1px solid rgba(255, 255, 255, 0.05);
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
    background: linear-gradient(
      135deg,
      $primary-color,
      lighten($primary-color, 20%)
    );
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
    display: none;
    @media (max-width: 992px) {
      display: block;
    }
  }
}

// --- Nav ---
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
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

// --- Links & Badges ---
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
    &::before {
      content: "";
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

  // The Notification Badge Style
  .notification-badge {
    margin-left: auto; // Push to right
    background-color: $primary-color; // Default (Blue/Green)
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    min-width: 20px;
    text-align: center;
    line-height: 1.2;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    &.danger {
      background-color: #ef4444;
    } // Red
    &.warning {
      background-color: #f59e0b;
    } // Orange
  }
}

// --- Footer ---
.sidebar-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(0, 0, 0, 0.2);
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
        color: #10b981;
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
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }
}
</style>
