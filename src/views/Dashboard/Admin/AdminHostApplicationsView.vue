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
            <!-- UPDATED: Use selfieImageUrl for the avatar preview -->
            <img :src="app.selfieImageUrl || 'https://placehold.co/100x100/e2e8f0/666666?text=User'" alt="User" class="user-avatar" @error="onImageError" />
            <div>
              <!-- UPDATED: Use optional chaining to prevent errors if driversLicense is missing -->
              <h3 class="user-name">{{ app.driversLicense?.firstName || 'N/A' }} {{ app.driversLicense?.lastName || 'N/A' }}</h3>
              <p class="user-id">User ID: {{ app.userId }}</p>
            </div>
          </div>
          <span class="app-status">{{ app.status }}</span>
        </div>
        <div class="card-body">
          <!-- UPDATED: Use licenseNumber -->
          <h4 class="vehicle-info">License #: {{ app.driversLicense?.licenseNumber || 'N/A' }}</h4>
          <!-- UPDATED: Use 'submittedAt' (the correct field from your backend) -->
          <p class="plate-number">Submitted: {{ formatDate(app.submittedAt) }}</p>
        </div>
        <div class="card-footer">
          <button @click="viewDetails(app)" class="button secondary">View Details</button>
          <div class="decision-buttons">
            <button @click="handleDecline(app.id)" class="button danger">Decline</button>
            <button @click="handleApprove(app.id, app.userId)" class="button primary">Approve</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="isModalOpen && selectedApplication" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
            <h3 class="modal-title">Application Details</h3>
            <p class="modal-subtitle">Review applicant's provided information and documents.</p>

            <div class="modal-content">
              <!-- Driver's License Section -->
              <div class="detail-section">
                <h4 class="detail-title">Driver's License</h4>
                <div class="detail-grid">
                  <div class="detail-group">
                      <label>First Name</label>
                      <p>{{ selectedApplication.driversLicense?.firstName || 'N/A' }}</p>
                  </div>
                  <div class="detail-group">
                      <label>Last Name</label>
                      <p>{{ selectedApplication.driversLicense?.lastName || 'N/A' }}</p>
                  </div>
                   <div class="detail-group">
                      <label>License Number</label>
                      <p>{{ selectedApplication.driversLicense?.licenseNumber || 'N/A' }}</p>
                  </div>
                </div>
                 <div class="detail-group">
                    <label>License Image</label>
                    <img :src="selectedApplication.driversLicense?.licenseImageUrl || 'https://placehold.co/400x200?text=No+Image'" alt="License" class="document-image" @error="onImageError" />
                </div>
              </div>

              <!-- Selfie Section -->
              <div class="detail-section">
                <h4 class="detail-title">Identity Verification</h4>
                 <div class="detail-group">
                    <label>Selfie with ID</label>
                    <img :src="selectedApplication.selfieImageUrl || 'https://placehold.co/400x200?text=No+Image'" alt="Selfie with ID" class="document-image" @error="onImageError" />
                </div>
              </div>

              <!-- Payout Section -->
              <div class="detail-section">
                <h4 class="detail-title">Payout Details</h4>
                <div class="detail-grid">
                  <div class="detail-group">
                      <label>Payout Method</label>
                      <p style="text-transform: uppercase;">{{ selectedApplication.payoutDetails?.payoutType || 'N/A' }}</p>
                  </div>
                  <div class="detail-group">
                      <label>Account Name</label>
                      <p>{{ selectedApplication.payoutDetails?.accountName || 'N/A' }}</p>
                  </div>
                   <div class="detail-group">
                      <label>Account Number</label>
                      <p>{{ selectedApplication.payoutDetails?.accountNumber || 'N/A' }}</p>
                  </div>
                   <div v-if="selectedApplication.payoutDetails?.payoutType === 'bank'" class="detail-group">
                      <label>Bank Name</label>
                      <p>{{ selectedApplication.payoutDetails?.bankName || 'N/A' }}</p>
                  </div>
                   <div v-if="selectedApplication.payoutDetails?.payoutType === 'bank'" class="detail-group">
                      <label>Branch Name</label>
                      <p>{{ selectedApplication.payoutDetails?.branchName || 'N/A' }}</p>
                  </div>
                </div>
                
                <!-- 👇 ADDED QR CODE DISPLAY BLOCK -->
                <div v-if="selectedApplication.payoutDetails?.qrCodeUrl" class="detail-group" style="margin-top: 1rem;">
                    <label>Uploaded {{ selectedApplication.payoutDetails.payoutType }} QR Code</label>
                    <img :src="selectedApplication.payoutDetails.qrCodeUrl" alt="QR Code" class="document-image" @error="onImageError" />
                </div>
              </div>

            </div>
            
            <div class="modal-actions">
                <button @click="closeModal" class="button secondary">Close</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'AdminHostApplicationsView',
  data() {
    return {
      loading: true,
      error: null,
      applications: [],
      selectedApplication: null,
      isModalOpen: false,
    };
  },
  methods: {
    ...mapActions(['fetchHostApplications', 'approveHostApplication', 'declineHostApplication']),
    async loadApplications() {
      this.loading = true;
      this.error = null;
      try {
        // This action must be fetching the full application object
        this.applications = await this.fetchHostApplications(); 
      } catch (err) {
        this.error = 'Failed to load host applications.';
        console.error(err); // Log the actual error
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
        await this.declineHostApplication({applicationId}); // Pass as object
      } catch (error) {
        alert('Failed to decline application.');
      }
       // Refresh the list AFTER decline attempt
      await this.loadApplications();
    },
    viewDetails(app) {
        this.selectedApplication = app;
        this.isModalOpen = true;
    },
    closeModal() {
        this.isModalOpen = false;
        this.selectedApplication = null;
    },
    // 👇 UPDATED: formatDate to correctly parse Firestore timestamps
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        try {
          let jsDate;
          if (timestamp && typeof timestamp.toDate === 'function') {
            // Handle live Firestore Timestamp (from client-side subscription)
            jsDate = timestamp.toDate();
          } else if (timestamp && timestamp._seconds !== undefined) {
            // Handle serialized Timestamp from backend API ({_seconds, _nanoseconds})
            jsDate = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
          } else if (typeof timestamp === 'string') {
            // Handle ISO string
            jsDate = new Date(timestamp);
          } else {
            throw new Error("Unknown timestamp format");
          }
          
          if (isNaN(jsDate.getTime())) {
              console.warn("Could not parse date:", timestamp);
              return 'Invalid Date';
          }
          return DateTime.fromJSDate(jsDate).toFormat('LLL dd, yyyy');
        } catch (e) {
             console.error("Error formatting date:", timestamp, e);
             return 'Invalid Date';
        }
    },
    onImageError(event) {
        event.target.src = 'https://placehold.co/400x200?text=Image+Error';
    }
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
.error-state {
    color: $admin-color;
    background-color: lighten($admin-color, 45%);
    border: 1px solid lighten($admin-color, 35%);
    border-radius: $border-radius-md;
    padding: 2rem;
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
  border-bottom: 1px solid $border-color-light;
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
  background-color: $background-light;
}
.user-name {
  font-weight: 600;
  margin: 0;
  color: $text-color-dark;
}
.user-id {
  font-size: 0.8rem;
  color: $text-color-medium;
  margin: 0;
  font-family: monospace;
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
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
.plate-number { 
  color: $text-color-medium;
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid $border-color-light;
  background-color: #f9fafb;
}
.decision-buttons {
  display: flex;
  gap: 0.5rem;
}
.button {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: $primary-color;
    color: white;
    border-color: $primary-color;
    &:hover { background-color: darken($primary-color, 8%); }
  }
  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
    border-color: #d1d5db;
    &:hover { background-color: darken(#e5e7eb, 5%); }
  }
  &.danger {
    background-color: $admin-color;
    color: white;
    border-color: $admin-color;
     &:hover { background-color: darken($admin-color, 8%); }
  }
}

/* --- MODAL STYLES --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
  padding: 1rem;
}
.modal-card {
  background: white; padding: 2rem; border-radius: $border-radius-lg;
  width: 90%; max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: $shadow-large;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem;
  text-align: left;
}
.modal-subtitle {
  font-size: 1rem;
  color: $text-color-medium;
  margin: 0 0 2rem 0;
  text-align: left;
}
.modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: left;
}
.detail-section {
    border-bottom: 1px solid $border-color-light;
    padding-bottom: 1.5rem;
    &:last-of-type {
        border-bottom: none;
    }
}
.detail-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: $primary-color;
}
.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}
.detail-group {
    label {
        font-weight: 600;
        font-size: 0.75rem;
        color: $text-color-medium;
        display: block;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
    }
    p {
        margin: 0;
        color: $text-color-dark;
        font-size: 0.95rem;
        word-break: break-word;
    }
}
.document-image {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: $border-radius-md;
    border: 1px solid $border-color;
    margin-top: 0.5rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid $border-color-light;
}
</style>

