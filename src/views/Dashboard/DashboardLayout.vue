<!-- frontend/src/views/Dashboard/DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <!-- The header section would go here, as before -->

    <main class="dashboard-content">
      <router-view></router-view>
    </main>
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

// All sidebar-related styles have been removed.

.dashboard-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}
</style>
