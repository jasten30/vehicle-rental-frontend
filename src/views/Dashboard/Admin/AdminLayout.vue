<template>
  <div class="admin-layout">
    <AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <main class="main-content">
      <header class="mobile-top-bar">
        <button class="menu-toggle" @click="isSidebarOpen = true">
          <i class="bi bi-list"></i>
        </button>
        <span class="mobile-brand">Admin Panel</span>
      </header>

      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import { ref } from 'vue';

export default {
  name: 'AdminLayout',
  components: {
    AdminSidebar,
  },
  setup() {
    const isSidebarOpen = ref(false);

    return {
      isSidebarOpen
    };
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

// Ensure global box-sizing to prevent width calculation errors
* {
  box-sizing: border-box;
}

.admin-layout {
  min-height: 100vh;
  background-color: #f3f4f6; /* Light gray background */
  position: relative;
}

// --- Main Content Logic ---
.main-content {
  /* CRITICAL FIX: 
     Push the content to the right by the exact width of the sidebar (280px).
     This prevents it from sliding under the fixed sidebar.
  */
  margin-left: 280px; 
  width: calc(100% - 280px);
  min-height: 100vh;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  // ON MOBILE: Remove the margin because the sidebar is hidden
  @media (max-width: 992px) {
    margin-left: 0;
    width: 100%;
  }
}

// --- Mobile Header ---
.mobile-top-bar {
  display: none; // Hidden on desktop
  background: white;
  padding: 1rem;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 900;

  @media (max-width: 992px) {
    display: flex;
  }

  .menu-toggle {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #1a202c;
    cursor: pointer;
  }

  .mobile-brand {
    font-weight: 700;
    font-size: 1.1rem;
    color: #1a202c;
  }
}

.content-wrapper {
  padding: 2rem;
  flex: 1;
  width: 100%; /* Ensure inner content takes full available width */

  @media (max-width: 768px) {
    padding: 1rem;
  }
}
</style>