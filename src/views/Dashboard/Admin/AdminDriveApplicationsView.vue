<template>
  <div class="admin-page-container">
    <div class="header-section">
      <h1 class="page-title">Driver Applications</h1>
      <p class="page-subtitle">Review and approve users who have submitted their documents to drive.</p>
    </div>

    <div v-if="loading" class="info-state">
      <p>Loading applications...</p>
    </div>
    <div v-else-if="error" class="info-state error-state">
        <p>{{ error }}</p>
        <button @click="fetchApplications" class="button primary">Retry</button>
    </div>
    <div v-else-if="!applications || applications.length === 0" class="info-state">
      <p>There are no pending driver applications.</p>
    </div>
    
    <div v-else class="table-wrapper">
      <table class="applications-table">
        <thead class="table-header">
          <tr>
            <th>Submitted On</th>
            <th>Applicant Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="app in applications" :key="app.id" class="table-row">
            <td>{{ formatDate(app.submittedAt) }}</td>
            <td>{{ app.userName }}</td>
            <td>{{ app.userEmail }}</td>
            <td>
              <span class="status-badge" :class="`status-${app.status}`">{{ app.status }}</span>
            </td>
            <td class="action-cell">
              <button @click="reviewApplication(app)" class="button review">Review</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Application Review Modal -->
    <AdminDriveApplicationModal
      :is-open="isModalOpen"
      :application="selectedApplication"
      @close="closeModal"
      @approve="handleApproval"
      @decline="handleDecline"
    />
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { mapActions } from 'vuex';
import AdminDriveApplicationModal from '@/components/admin/AdminDriveApplicationModal.vue';

export default {
  name: 'AdminDriveApplicationsView',
  components: {
    AdminDriveApplicationModal,
  },
  data() {
    return {
      loading: true,
      applications: [],
      selectedApplication: null,
      isModalOpen: false,
      error: null,
    };
  },
  methods: {
    ...mapActions([
        'fetchDriveApplications', 
        'approveDriveApplication', 
        'declineDriveApplication'
    ]),
    async fetchApplications() {
      this.loading = true;
      this.error = null;
      try {
        this.applications = await this.fetchDriveApplications();
      } catch (err) {
        console.error("Failed to fetch driver applications:", err);
        this.error = "Could not load applications. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateData) {
      if (!dateData) return 'N/A';
      const date = dateData.seconds ? new Date(dateData.seconds * 1000) : new Date(dateData);
      return DateTime.fromJSDate(date).toFormat('LLL dd, yyyy');
    },
    reviewApplication(application) {
      this.selectedApplication = application;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedApplication = null;
    },
    async handleApproval(appData) {
        try {
            await this.approveDriveApplication(appData);
            await this.fetchApplications();
        } catch (error) {
            alert('Approval failed. Please try again.');
        } finally {
            this.closeModal();
        }
    },
    async handleDecline(appData) {
         try {
            await this.declineDriveApplication(appData);
            await this.fetchApplications();
        } catch (error) {
            alert('Decline failed. Please try again.');
        } finally {
            this.closeModal();
        }
    }
  },
  created() {
    this.fetchApplications();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.header-section {
  text-align: center;
  margin-bottom: 3rem;
}
.page-title {
  font-size: 2.25rem;
  font-weight: 700;
}
.page-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-top: 0.5rem;
}
.info-state {
  text-align: center;
  padding: 4rem 0;
  color: $text-color-medium;
  font-size: 1.2rem;
}
.error-state .button {
    margin-top: 1rem;
}
.table-wrapper {
  overflow-x: auto;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  background-color: #fff;
}
.applications-table {
  min-width: 100%;
  border-collapse: collapse;
}
.table-header {
  background-color: #f9fafb;
  th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 600;
    color: $text-color-medium;
    text-transform: uppercase;
  }
}
.table-body .table-row:hover {
  background-color: lighten($primary-color, 48%);
}
td {
  padding: 1rem 1.5rem;
  border-top: 1px solid $border-color;
  font-size: 0.9rem;
}
.status-badge {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: capitalize;
  &.status-pending {
    background-color: #fefce8;
    color: #a16207;
  }
}
.button {
    padding: 0.5rem 1rem;
    border-radius: $border-radius-md;
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}
.button.review {
  background-color: #e0f2fe;
  color: #0284c7;
  &:hover { background-color: darken(#e0f2fe, 5%); }
}
</style>

