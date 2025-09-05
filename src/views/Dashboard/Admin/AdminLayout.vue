<template>
  <div class="admin-layout">
    <AdminSidebar />
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue';

export default {
  name: 'AdminLayout',
  components: {
    AdminSidebar,
  },
};
</script>

<style lang="scss" scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 280px 1fr; /* Sidebar width and main content */
  height: 100vh;
  background-color: #f7fafc;
}

.admin-content {
  padding: 2rem;
  overflow-y: auto; /* Allows content to scroll if it's too long */
}
</style>