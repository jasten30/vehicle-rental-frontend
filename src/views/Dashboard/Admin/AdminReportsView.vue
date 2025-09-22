<template>
  <div class="admin-reports-container">
    <div class="header-section">
      <h1 class="page-title">Listing Reports</h1>
      <p class="page-subtitle">Review and manage user-submitted reports on vehicle listings.</p>
    </div>

    <div v-if="loading" class="info-state">
      <p>Loading reports...</p>
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
            <th>Vehicle</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="report in reports" :key="report.id" class="table-row">
            <td>{{ formatDate(report.submittedAt) }}</td>
            <td>{{ report.reporterEmail }}</td>
            <td>{{ report.vehicleMake }} {{ report.vehicleModel }}</td>
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

    <!-- Report Details Modal -->
    <div v-if="isModalOpen && selectedReport" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
            <h3 class="modal-title">Report Details</h3>
            <div class="modal-content">
                <div class="detail-group">
                    <label>Reported Vehicle:</label>
                    <p>{{ selectedReport.vehicleMake }} {{ selectedReport.vehicleModel }}</p>
                </div>
                <div class="detail-group">
                    <label>Reporter Contact:</label>
                    <p>{{ selectedReport.reporterEmail }} / {{ selectedReport.reporterPhone }}</p>
                </div>
                 <div class="detail-group">
                    <label>Subject:</label>
                    <p>{{ selectedReport.subject }}</p>
                </div>
                <div class="detail-group">
                    <label>Full Reason:</label>
                    <p class="reason-text">{{ selectedReport.reason }}</p>
                </div>
            </div>
            <div class="modal-actions">
                <button @click="closeModal" class="button close">Close</button>
                <button @click="resolveReport(selectedReport.id)" class="button resolve">Mark as Resolved</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'AdminReportsView',
  data() {
    return {
      loading: true,
      reports: [], // This will be populated from your backend
      selectedReport: null,
      isModalOpen: false,
    };
  },
  methods: {
    // In a real app, this would be a Vuex action that calls your backend API
    async fetchReports() {
      this.loading = true;
      // Simulating an API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.reports = [
        {
          id: 'report001',
          submittedAt: new Date(),
          reporterEmail: 'renter@example.com',
          reporterPhone: '+639171234567',
          vehicleMake: 'Toyota',
          vehicleModel: 'Vios',
          subject: 'Inaccurate Photos',
          reason: 'The photos on the listing are not of the actual car. The color is different and the interior is much more worn out than shown.',
          status: 'new',
        },
        {
          id: 'report002',
          submittedAt: new Date(Date.now() - 86400000), // 1 day ago
          reporterEmail: 'another_user@example.com',
          reporterPhone: '+639228765432',
          vehicleMake: 'Honda',
          vehicleModel: 'Civic',
          subject: 'Unresponsive Owner',
          reason: 'I have tried to contact the owner multiple times after my booking was confirmed, but I have not received any response. I am worried I will not be able to pick up the car.',
          status: 'new',
        },
        {
          id: 'report003',
          submittedAt: new Date(Date.now() - 172800000), // 2 days ago
          reporterEmail: 'test@example.com',
          reporterPhone: '+639991112233',
          vehicleMake: 'Mitsubishi',
          vehicleModel: 'Mirage',
          subject: 'Listing is a scam',
          reason: 'The price is too good to be true and the owner is asking for payment outside of the platform, which is against the rules. This seems like a scam.',
          status: 'resolved',
        },
      ];
      this.loading = false;
    },
    formatDate(date) {
      return DateTime.fromJSDate(date).toFormat('LLL dd, yyyy');
    },
    viewReportDetails(report) {
      this.selectedReport = report;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedReport = null;
    },
    // Placeholder for a method to update the report status
    resolveReport(reportId) {
        console.log(`Marking report ${reportId} as resolved.`);
        // Here you would dispatch a Vuex action to update the status on the backend
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            report.status = 'resolved';
        }
        this.closeModal();
    }
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

.table-wrapper {
  overflow-x: auto;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  background-color: #fff;
}

.reports-table {
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

.table-body .table-row {
  border-top: 1px solid $border-color;
  &:hover {
    background-color: lighten($primary-color, 48%);
  }
}

td {
  padding: 1rem 1.5rem;
  white-space: nowrap;
  font-size: 0.9rem;
  color: $text-color-dark;
  text-align: left;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: capitalize;

  &.status-new {
    background-color: #fee2e2;
    color: #991b1b;
  }
  &.status-resolved {
    background-color: #d1fae5;
    color: #065f46;
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

  &.view {
    background-color: #e0f2fe;
    color: #0284c7;
    &:hover { background-color: darken(#e0f2fe, 5%); }
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 0.75rem;
  width: 90%; max-width: 600px;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem;
}
.modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}
.detail-group {
    label {
        font-weight: 600;
        font-size: 0.8rem;
        color: $text-color-medium;
        display: block;
        margin-bottom: 0.25rem;
    }
    p {
        margin: 0;
        color: $text-color-dark;
        font-size: 1rem;
    }
    .reason-text {
        white-space: pre-wrap;
        line-height: 1.6;
    }
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
}
.button.close {
    background-color: #f3f4f6;
    color: $text-color-dark;
     &:hover { background-color: darken(#f3f4f6, 5%); }
}
.button.resolve {
    background-color: $secondary-color;
    color: white;
     &:hover { background-color: darken($secondary-color, 10%); }
}
</style>
