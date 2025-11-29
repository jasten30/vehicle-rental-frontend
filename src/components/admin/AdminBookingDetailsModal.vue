<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Booking Details</h3>
      <div v-if="booking" class="modal-content">
        <div class="detail-header">
          <span class="booking-id">#{{ booking.id }}</span>
          <span
            :class="['status-badge', getStatusClass(booking.paymentStatus)]"
          >
            {{ formatStatus(booking.paymentStatus) }}
          </span>
        </div>

        <div class="detail-grid">
          <div class="detail-item full-width">
            <label>Renter</label>
            <div class="user-block">
              <div class="avatar-placeholder">
                {{
                  getInitials(booking.resolvedRenterName || booking.renterEmail)
                }}
              </div>
              <div>
                <p class="renter-name">
                  {{ booking.resolvedRenterName || "Unknown Name" }}
                </p>
                <small class="renter-email">{{ booking.renterEmail }}</small>
              </div>
            </div>
          </div>

          <div class="detail-item">
            <label>Vehicle</label>
            <p>{{ booking.vehicleName || "Unknown Vehicle" }}</p>
          </div>

          <div class="detail-item">
            <label>Total Cost</label>
            <p class="cost-text">
              ₱{{
                booking.totalCost ? booking.totalCost.toLocaleString() : "0"
              }}
            </p>
          </div>

          <div class="detail-item full-width">
            <label>Trip Dates</label>
            <p class="date-range">
              {{ formatDate(booking.startDate) }}
              <i class="bi bi-arrow-right"></i>
              {{ formatDate(booking.endDate) }}
            </p>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="button primary">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from "luxon";

export default {
  name: "AdminBookingDetailsModal",
  props: {
    isOpen: Boolean,
    booking: Object,
  },
  emits: ["close"],
  methods: {
    formatDate(dateString) {
      if (!dateString) return "N/A";
      // Handle Firestore Timestamp objects
      if (typeof dateString === "object" && dateString.seconds) {
        return DateTime.fromSeconds(dateString.seconds).toFormat(
          "MMM dd, yyyy, h:mm a"
        );
      }
      return DateTime.fromISO(dateString).toFormat("MMM dd, yyyy");
    },
    formatStatus(status) {
      if (!status) return "Unknown";
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      switch (status) {
        case "confirmed":
        case "completed":
        case "returned":
        case "downpayment_verified":
          return "status-success";
        case "pending_owner_approval":
        case "pending_payment":
        case "downpayment_pending_verification":
          return "status-warning";
        case "cancelled":
        case "declined_by_owner":
        case "cancelled_by_renter":
          return "status-danger";
        default:
          return "status-default";
      }
    },
    getInitials(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

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
  z-index: 2000;
}
.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: $text-color-dark;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
  .booking-id {
    font-family: "Roboto Mono", monospace;
    color: #6b7280;
    font-size: 0.9rem;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.full-width {
  grid-column: span 2;
}

.detail-item {
  label {
    font-weight: 600;
    font-size: 0.75rem;
    color: #9ca3af;
    display: block;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  p {
    margin: 0;
    color: $text-color-dark;
    font-size: 1rem;
    font-weight: 500;
  }
  .cost-text {
    color: #10b981;
    font-weight: 700;
    font-family: monospace;
    font-size: 1.1rem;
  }
  .date-range {
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

/* User Block Style */
.user-block {
  display: flex;
  align-items: center;
  gap: 12px;
  .avatar-placeholder {
    width: 40px;
    height: 40px;
    background: $primary-color;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .renter-name {
    font-weight: 700;
    font-size: 1rem;
    color: $text-color-dark;
  }
  .renter-email {
    display: block;
    color: #6b7280;
    font-size: 0.85rem;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}
.button.primary {
  padding: 0.6rem 1.5rem;
  background: $primary-color;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: darken($primary-color, 5%);
  }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  &.status-success {
    background-color: #d1fae5;
    color: #065f46;
  }
  &.status-warning {
    background-color: #fef3c7;
    color: #92400e;
  }
  &.status-danger {
    background-color: #fee2e2;
    color: #991b1b;
  }
  &.status-default {
    background-color: #f3f4f6;
    color: #4b5563;
  }
}
</style>
