<template>
  <div class="admin-reports-container">
    <div class="header-section">
      <h1 class="page-title">Listing Reports</h1>
      <p class="page-subtitle">Review and manage user-submitted reports on vehicle listings.</p>
    </div>

    <div v-if="loading" class="info-state">
      <p>Loading reports...</p>
    </div>

    <div v-else-if="errorMessage" class="info-state error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchReports" class="button primary">Retry</button>
    </div>

    <div v-else-if="reports.length === 0" class="info-state">
      <p>There are currently no reports to review.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="reports-table">
        <thead class="table-header">
          <tr>
            <th>Date</th>
            <th>Reporter</th>
            <th>Reported Party</th> <th>Vehicle</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="report in reports" :key="report.id" class="table-row">
            <td>{{ formatDate(report.reportedAt) }}</td>
            <td>{{ report.reporterEmail }}</td>
            <td>{{ report.reportedPartyName || 'N/A' }}</td> <td>{{ report.vehicleMake }} {{ report.vehicleModel }}</td>
            <td>{{ report.subject }}</td>
            <td>
              <span class="status-badge" :class="`status-${report.status}`">{{ report.status }}</span>
            </td>
            <td class="action-cell">
              <button @click="viewReportDetails(report)" class="button view">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen && selectedReport" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <h3 class="modal-title">Report Details</h3>
        <div class="report-meta">
            <span>Reported On: {{ formatDate(selectedReport.reportedAt) }}</span>
            <span>Booking ID: #{{ selectedReport.bookingId || 'N/A' }}</span>
        </div>

        <div class="modal-content">
          <div class="detail-group">
            <label>Reported Vehicle:</label>
            <p>{{ selectedReport.vehicleMake }} {{ selectedReport.vehicleModel }}</p>
          </div>

          <div class="detail-group">
            <label>Reporter Contact:</label>
            <div class="contact-line">
                <p>{{ selectedReport.reporterEmail }}</p>
                <button
                    v-if="selectedReport.reporterId"
                    @click="chatWithUser(selectedReport.reporterId, selectedReport.reporterEmail)"
                    class="button chat-icon"
                    title="Start chat with reporter"
                 >
                   <i class="bi bi-chat-dots-fill"></i>
                 </button>
            </div>
          </div>

          <div class="detail-group">
            <label>Reported Party:</label>
             <div class="contact-line">
                <p>{{ selectedReport.reportedPartyName || 'N/A' }}</p>
                 <button
                    v-if="selectedReport.reportedPartyId"
                    @click="chatWithUser(selectedReport.reportedPartyId, selectedReport.reportedPartyName)"
                    class="button chat-icon"
                    title="Start chat with reported party"
                 >
                   <i class="bi bi-chat-dots-fill"></i>
                 </button>
            </div>
          </div>

          <div class="detail-group">
              <label>Booking ID:</label>
              <p>{{ selectedReport.bookingId || 'N/A' }}</p>
          </div>
          <div class="detail-group">
            <label>Subject (Reason Code):</label>
            <p>{{ selectedReport.subject }}</p>
          </div>
          <div class="detail-group">
            <label>Full Details:</label>
            <p class="reason-text">{{ selectedReport.reason }}</p>
          </div>
           <div class="detail-group">
               <label>Status:</label>
               <p>
                 <span class="status-badge" :class="`status-${selectedReport.status}`">{{ selectedReport.status }}</span>
               </p>
           </div>
        </div>
        <div class="modal-actions">
           <button
             v-if="selectedReport.bookingId"
             @click="goToBookingChat"
             class="button chat"
             title="View chat associated with this booking"
           >
             View Booking Chat
           </button>
           <button @click="closeModal" class="button close">Close</button>
           <button v-if="selectedReport.status !== 'resolved'" @click="resolveReport(selectedReport.id)" class="button resolve">
               Mark as Resolved
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'; // Import mapActions
import { DateTime } from 'luxon';

export default {
  name: 'AdminReportsView',
  data() {
    return {
      loading: true,
      reports: [],
      selectedReport: null,
      isModalOpen: false,
      errorMessage: null,
      isChatting: false, // Add loading state for chat initiation
    };
  },
  computed: {
     // No mapGetters needed currently
  },
  methods: {
    // Map the Vuex actions
    ...mapActions(['fetchBookingReports', 'resolveBookingReport', 'findOrCreateAdminUserChat']), // Added findOrCreateAdminUserChat

    async fetchReports() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const fetchedReports = await this.fetchBookingReports();
        this.reports = fetchedReports;
      } catch (error) {
        console.error("Error fetching reports:", error);
        this.errorMessage = "Failed to load reports. Please try again.";
        this.reports = [];
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      try {
          const jsDate = date.toDate ? date.toDate() : new Date(date);
           if (isNaN(jsDate.getTime())) return 'Invalid Date';
          return DateTime.fromJSDate(jsDate).toFormat('LLL dd, yyyy');
      } catch (e) {
          console.warn("Error formatting date:", date, e);
          return 'Invalid Date';
      }
    },
    viewReportDetails(report) {
      this.selectedReport = report;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedReport = null;
    },
    async resolveReport(reportId) {
       console.log(`Attempting to resolve report ${reportId}...`);
       try {
            await this.resolveBookingReport(reportId);
            const report = this.reports.find(r => r.id === reportId);
            if (report) {
                report.status = 'resolved';
            }
            this.closeModal();
            alert('Report marked as resolved.');
       } catch(error) {
           console.error(`Error resolving report ${reportId}:`, error);
           alert(`Failed to resolve report: ${error.response?.data?.message || error.message}`);
       }
    },
    // Method to navigate to the main booking chat
    goToBookingChat() {
      if (this.selectedReport && this.selectedReport.bookingId) {
        this.$router.push({ name: 'ChatConversation', params: { chatId: this.selectedReport.bookingId } });
        this.closeModal();
      } else {
        console.warn("Cannot navigate to chat: bookingId is missing from the selected report.");
        alert("Booking ID is missing for this report, cannot open chat.");
      }
    },
    // Method triggered by the small chat icons - NOW IMPLEMENTED
    async chatWithUser(targetUserId, userName) {
        if (!targetUserId) {
            alert("Cannot initiate chat: User ID is missing.");
            return;
        }
        this.isChatting = true; // Set loading state for the chat button if needed
        console.log(`ADMIN ACTION: Finding/Creating chat for report ${this.selectedReport?.id} with user ${userName || 'Unknown'} (ID: ${targetUserId})`);
        try {
            // Dispatch Vuex action, passing the target user's ID
            // This action calls the backend to find/create the chat and returns the chatId
            const chatId = await this.findOrCreateAdminUserChat(targetUserId);

            if (chatId) {
                // Navigate to the chat view using the returned chatId
                this.$router.push({ name: 'ChatConversation', params: { chatId: chatId } });
                this.closeModal(); // Close the report modal after navigating
            } else {
                 // This case should ideally be handled within the Vuex action's error handling
                 throw new Error("Chat ID was not returned.");
            }
        } catch (error) {
            console.error("Error initiating admin-user chat:", error);
            alert(`Could not open or create chat: ${error.response?.data?.message || error.message}`);
            // Keep the modal open on error
        } finally {
             this.isChatting = false; // Reset loading state
        }
    },
  },
  created() {
    this.fetchReports();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-reports-container {
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
  color: $text-color-dark;
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

.error-state {
  color: $admin-color;
  background-color: lighten($admin-color, 45%);
  border: 1px solid lighten($admin-color, 35%);
  border-radius: $border-radius-md;
  padding: 2rem;
  button { margin-top: 1rem; }
}


.table-wrapper {
  overflow-x: auto;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-small;
  background-color: #fff;
}

.reports-table {
  min-width: 100%;
  border-collapse: collapse;
  width: 100%;
}

.table-header {
  background-color: #f9fafb;
  th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    color: $text-color-medium;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.table-body .table-row {
  border-top: 1px solid $border-color-light;
  transition: background-color 0.15s ease-in-out;
  &:hover {
    background-color: lighten($primary-color, 48%);
  }
}

td {
  padding: 0.75rem 1rem;
  white-space: nowrap;
  font-size: 0.85rem;
  color: $text-color-dark;
  text-align: left;
  vertical-align: middle;
}

.action-cell {
    text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: capitalize;
  line-height: 1.2;

  &.status-submitted, &.status-new {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }
  &.status-resolved {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
   &.status-investigating {
     background-color: #FEF3C7;
     color: #92400E;
     border: 1px solid #FDE68A;
   }
}

.button {
  padding: 0.4rem 0.8rem;
  border-radius: $border-radius-md;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &.view {
    background-color: #e0f2fe;
    color: #0284c7;
    &:hover { background-color: darken(#e0f2fe, 4%); }
  }
   &.primary {
     background-color: $primary-color; color: white;
     &:hover { background-color: darken($primary-color, 8%); }
   }
}

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
  padding: 1rem;
}
.modal-card {
  background: white; padding: 2rem; border-radius: $border-radius-lg;
  width: 90%; max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: $shadow-large;
}
.modal-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.75rem; /* Reduced bottom margin */
  padding-bottom: 0; /* Remove padding if border is removed */
  border-bottom: none; /* Remove border if meta section has one */
  text-align: left;
}
.report-meta {
    font-size: 0.85rem;
    color: $text-color-medium;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $border-color-light;
    text-align: left;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.modal-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
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
    .reason-text {
        white-space: pre-wrap;
        line-height: 1.6;
        background-color: #f8f9fa;
        padding: 0.75rem;
        border-radius: $border-radius-sm;
        border: 1px solid $border-color-light;
        max-height: 200px;
        overflow-y: auto;
    }
}
.contact-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}
.button.chat-icon {
    background: none;
    border: none;
    color: $primary-color;
    padding: 0.25rem;
    font-size: 1.1rem;
    line-height: 1;
    margin-left: 0.5rem;
    cursor: pointer; // Ensure cursor changes
    &:hover {
        color: darken($primary-color, 15%);
        background-color: lighten($primary-color, 45%);
    }
}
.modal-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color-light;
}
.button.chat { /* Style for "View Booking Chat" */
    background-color: #e0e7ff;
    color: #4338ca;
    margin-right: auto; // Pushes other buttons right
    &:hover { background-color: darken(#e0e7ff, 5%); }
}
.button.close {
    background-color: #f3f4f6;
    color: $text-color-dark;
    border: 1px solid $border-color;
     &:hover { background-color: darken(#f3f4f6, 5%); }
}
.button.resolve {
    background-color: $secondary-color;
    color: white;
    border: 1px solid $secondary-color;
     &:hover { background-color: darken($secondary-color, 10%); border-color: darken($secondary-color, 10%); }
}
</style>