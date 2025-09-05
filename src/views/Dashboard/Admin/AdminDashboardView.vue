<template>
  <div class="admin-page-container">
    <h2 class="section-title">Dashboard</h2>
    <p class="section-subtitle">Welcome, Admin! Here's a summary of your platform.</p>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ stats.totalUsers }}</h3>
        <p>Total Users</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.totalVehicles }}</h3>
        <p>Total Vehicles</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.pendingApplications }}</h3>
        <p>Pending Applications</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.activeBookings }}</h3>
        <p>Active Bookings</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'AdminDashboardView',
  setup() {
    const stats = ref({
      totalUsers: 0,
      totalVehicles: 0,
      pendingApplications: 0,
      activeBookings: 0,
    });

    const fetchStats = async () => {
      // TODO: Create a backend endpoint to fetch these numbers
      // For now, we'll use placeholder data
      stats.value = {
        totalUsers: 124,
        totalVehicles: 42,
        pendingApplications: 5,
        activeBookings: 12,
      };
    };

    onMounted(fetchStats);

    return {
      stats,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container { max-width: 1200px; margin: 0 auto; }
.section-title { font-size: 2.5rem; margin-bottom: 0.5rem; }
.section-subtitle { font-size: 1.1rem; color: $text-color-medium; margin-bottom: 2.5rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.stat-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  text-align: center;
  
  h3 {
    font-size: 2.5rem;
    color: $primary-color;
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: $text-color-medium;
    font-weight: 600;
  }
}
</style>