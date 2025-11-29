<template>
  <div class="admin-page-container">
    <h2 class="section-title">Host Applications</h2>
    <p class="section-subtitle">
      Review, approve, or reject applications from renters who want to become
      hosts.
    </p>

    <div v-if="loading" class="info-state"><p>Loading applications...</p></div>
    <div v-else-if="error" class="info-state error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="applications.length === 0" class="info-state">
      <i class="bi bi-person-check-fill"></i>
      <p>There are no pending host applications.</p>
    </div>

    <div v-else class="applications-grid">
      <div v-for="app in applications" :key="app.id" class="application-card">
        <div class="card-header">
          <div class="user-info">
            <img
              :src="
                app.selfieImageUrl ||
                'https://placehold.co/100x100/e2e8f0/666666?text=User'
              "
              alt="User"
              class="user-avatar"
              @error="onImageError"
            />
            <div>
              <h3 class="user-name">
                {{ app.driversLicense?.firstName || "Unknown" }}
                {{ app.driversLicense?.lastName || "" }}
              </h3>
              <p class="user-id">User ID: {{ app.userId }}</p>
            </div>
          </div>
          <span class="app-status">{{ app.status || "Pending" }}</span>
        </div>
        <div class="card-body">
          <h4 class="vehicle-info">
            License #: {{ app.driversLicense?.licenseNumber || "N/A" }}
          </h4>
          <p class="plate-number">
            Submitted: {{ formatDate(app.submittedAt) }}
          </p>
        </div>
        <div class="card-footer">
          <button @click="viewDetails(app)" class="button secondary">
            View Details
          </button>
          <div class="decision-buttons">
            <button @click="handleDecline(app.id)" class="button danger">
              Decline
            </button>
            <button
              @click="handleApprove(app.id, app.userId)"
              class="button primary"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isModalOpen && selectedApplication"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-card">
        <h3 class="modal-title">Application Details</h3>
        <p class="modal-subtitle">
          Review applicant's provided information and documents.
        </p>

        <div class="modal-content">
          <div class="detail-section">
            <h4 class="detail-title">Driver's License Info</h4>
            <div class="detail-grid">
              <div class="detail-group">
                <label>Full Name</label>
                <p>
                  {{ selectedApplication.driversLicense?.firstName }}
                  {{ selectedApplication.driversLicense?.lastName }}
                </p>
              </div>
              <div class="detail-group">
                <label>License Number</label>
                <p>
                  {{
                    selectedApplication.driversLicense?.licenseNumber || "N/A"
                  }}
                </p>
              </div>
            </div>

            <div class="detail-group full-width">
              <label>License Image</label>
              <a
                :href="selectedApplication.driversLicense?.licenseImageUrl"
                target="_blank"
                class="image-link"
              >
                <img
                  :src="
                    selectedApplication.driversLicense?.licenseImageUrl ||
                    'https://placehold.co/400x200?text=No+Image'
                  "
                  alt="License Document"
                  class="document-image"
                  @error="onImageError"
                />
              </a>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Identity Verification</h4>
            <div class="detail-group full-width">
              <label>Selfie with ID</label>
              <a
                :href="selectedApplication.selfieImageUrl"
                target="_blank"
                class="image-link"
              >
                <img
                  :src="
                    selectedApplication.selfieImageUrl ||
                    'https://placehold.co/400x200?text=No+Image'
                  "
                  alt="Selfie with ID"
                  class="document-image"
                  @error="onImageError"
                />
              </a>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Payout Details</h4>
            <div class="detail-grid">
              <div class="detail-group">
                <label>Method</label>
                <p
                  style="
                    text-transform: uppercase;
                    font-weight: bold;
                    color: #10b981;
                  "
                >
                  {{ selectedApplication.payoutDetails?.payoutType || "N/A" }}
                </p>
              </div>
              <div class="detail-group">
                <label>Account Name</label>
                <p>
                  {{ selectedApplication.payoutDetails?.accountName || "N/A" }}
                </p>
              </div>
              <div class="detail-group">
                <label>Account Number</label>
                <p>
                  {{
                    selectedApplication.payoutDetails?.accountNumber || "N/A"
                  }}
                </p>
              </div>

              <template
                v-if="selectedApplication.payoutDetails?.payoutType === 'bank'"
              >
                <div class="detail-group">
                  <label>Bank Name</label>
                  <p>
                    {{ selectedApplication.payoutDetails?.bankName || "N/A" }}
                  </p>
                </div>
                <div class="detail-group">
                  <label>Branch</label>
                  <p>
                    {{ selectedApplication.payoutDetails?.branchName || "N/A" }}
                  </p>
                </div>
              </template>
            </div>

            <div
              v-if="selectedApplication.payoutDetails?.qrCodeUrl"
              class="detail-group full-width"
              style="margin-top: 1.5rem"
            >
              <label>Payment QR Code</label>
              <a
                :href="selectedApplication.payoutDetails.qrCodeUrl"
                target="_blank"
                class="image-link"
              >
                <img
                  :src="selectedApplication.payoutDetails.qrCodeUrl"
                  alt="QR Code"
                  class="document-image qr-image"
                  @error="onImageError"
                />
              </a>
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
import { mapActions } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "AdminHostApplicationsView",
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
    ...mapActions([
      "fetchHostApplications",
      "approveHostApplication",
      "declineHostApplication",
    ]),

    async loadApplications() {
      this.loading = true;
      this.error = null;
      try {
        const response = await this.fetchHostApplications();
        this.applications = Array.isArray(response)
          ? response
          : response.data || [];
      } catch (err) {
        this.error = "Failed to load host applications.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async handleApprove(applicationId, userId) {
      if (!confirm("Are you sure you want to approve this host?")) return;
      try {
        await this.approveHostApplication({ applicationId, userId });
        await this.loadApplications();
        alert("Host approved successfully!");
      } catch (error) {
        alert("Failed to approve application.");
      }
    },

    async handleDecline(applicationId) {
      if (!confirm("Are you sure you want to decline this application?"))
        return;
      try {
        await this.declineHostApplication(applicationId);
        await this.loadApplications();
        alert("Application declined successfully.");
      } catch (error) {
        console.error(error);
        alert("Failed to decline application.");
      }
    },

    viewDetails(app) {
      this.selectedApplication = app;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedApplication = null;
    },

    formatDate(timestamp) {
      if (!timestamp) return "N/A";
      try {
        let jsDate;
        if (timestamp.seconds) {
          jsDate = new Date(timestamp.seconds * 1000);
        } else if (timestamp._seconds) {
          jsDate = new Date(timestamp._seconds * 1000);
        } else {
          jsDate = new Date(timestamp);
        }

        if (isNaN(jsDate.getTime())) return "Invalid Date";

        return DateTime.fromJSDate(jsDate).toFormat("LLL dd, yyyy");
      } catch (e) {
        return "Invalid Date";
      }
    },

    onImageError(event) {
      event.target.src = "https://placehold.co/400x200?text=Image+Load+Error";
    },
  },
  created() {
    this.loadApplications();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

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
  color: #b91c1c;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 2rem;
}

/* Grid Layout */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}
.application-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
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
  background-color: #f3f4f6;
}
.user-name {
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}
.user-id {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  font-family: monospace;
}
.app-status {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

/* Card Body */
.card-body {
  padding: 1rem;
}
.vehicle-info {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
.plate-number {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

/* Footer */
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}
.decision-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.button {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.button.primary {
  background-color: $primary-color;
  color: white;
  &:hover {
    background-color: darken($primary-color, 8%);
  }
}
.button.secondary {
  background-color: #e5e7eb;
  color: #1f2937;
  border-color: #d1d5db;
  &:hover {
    background-color: darken(#e5e7eb, 5%);
  }
}
.button.danger {
  background-color: #ef4444;
  color: white;
  &:hover {
    background-color: darken(#ef4444, 8%);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}
.modal-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
}
.detail-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
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
    color: #6b7280;
    display: block;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
  }
  p {
    margin: 0;
    color: #1f2937;
    font-size: 0.95rem;
    word-break: break-word;
  }
}
.full-width {
  grid-column: 1 / -1;
}

/* Image Styling */
.document-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  cursor: zoom-in;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.02);
  }
}
.qr-image {
  max-width: 200px;
}
.image-link {
  display: block;
  text-decoration: none;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
