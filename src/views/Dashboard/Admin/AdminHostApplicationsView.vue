<template>
  <div class="admin-page-container">
    <h2 class="section-title">Host Applications</h2>
    <p class="section-subtitle">
      Review, approve, or reject applications from renters who want to become hosts.
    </p>

    <div v-if="loading" class="info-state"><p>Loading applications...</p></div>
    <div v-else-if="error" class="info-state error-state"><p>{{ error }}</p></div>
    <div v-else-if="applications.length === 0" class="info-state">
      <i class="bi bi-person-check-fill"></i>
      <p>There are no pending host applications.</p>
    </div>

    <div v-else class="applications-grid">
      <div v-for="app in applications" :key="app.id" class="application-card">
        <div class="card-header">
          <div class="user-info">
            <img :src="app.userProfilePhotoUrl || 'https://placehold.co/100x100'" alt="User" class="user-avatar" />
            <div>
              <h3 class="user-name">{{ app.driversLicense.firstName }} {{ app.driversLicense.lastName }}</h3>
              <p class="user-id">User ID: {{ app.userId }}</p>
            </div>
          </div>
          <span class="app-status">{{ app.status }}</span>
        </div>
        <div class="card-body">
          <h4 class="vehicle-info">{{ app.vehicleDetails.year }} {{ app.vehicleDetails.make }} {{ app.vehicleDetails.model }}</h4>
          <p class="plate-number">Plate: {{ app.vehicleCOR.plateNumber }}</p>
        </div>
        <div class="card-footer">
          <button class="button secondary">View Details</button>
          <div class="decision-buttons">
            <button @click="handleDecline(app.id)" class="button danger">Decline</button>
            <button @click="handleApprove(app.id, app.userId)" class="button primary">Approve</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'AdminHostApplicationsView',
  data() {
    return {
      loading: true,
      error: null,
      applications: [],
    };
  },
  methods: {
    ...mapActions(['fetchHostApplications', 'approveHostApplication', 'declineHostApplication']),
    async loadApplications() {
      this.loading = true;
      this.error = null;
      try {
        this.applications = await this.fetchHostApplications();
      } catch (err) {
        this.error = 'Failed to load host applications.';
      } finally {
        this.loading = false;
      }
    },
    async handleApprove(applicationId, userId) {
      if (!confirm('Are you sure you want to approve this host? Their role will be changed to "owner".')) return;
      try {
        await this.approveHostApplication({ applicationId, userId });
        await this.loadApplications(); // Refresh the list
      } catch (error) {
        alert('Failed to approve application.');
      }
    },
    async handleDecline(applicationId) {
      if (!confirm('Are you sure you want to decline this application?')) return;
      try {
        await this.declineHostApplication(applicationId);
        await this.loadApplications(); // Refresh the list
      } catch (error) {
        alert('Failed to decline application.');
      }
    },
  },
  created() {
    this.loadApplications();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
}
.section-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-bottom: 2.5rem;
}
.info-state {
  text-align: center;
  padding: 4rem;
  i {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: $text-color-medium;
  }
  p {
    font-size: 1.2rem;
  }
}
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}
.application-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid $border-color;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.user-name {
  font-weight: 600;
  margin: 0;
}
.user-id {
  font-size: 0.8rem;
  color: $text-color-medium;
  margin: 0;
}
.app-status {
  background-color: lighten($accent-color, 35%);
  color: darken($accent-color, 20%);
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}
.card-body {
  padding: 1rem;
}
.vehicle-info {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
.plate-number {
  color: $text-color-medium;
  margin: 0.25rem 0 0 0;
}
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid $border-color;
  background-color: #f9fafb;
}
.decision-buttons {
  display: flex;
  gap: 0.5rem;
}
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  &.primary {
    background-color: $primary-color;
    color: white;
  }
  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
  }
  &.danger {
    background-color: $admin-color;
    color: white;
  }
}
</style>