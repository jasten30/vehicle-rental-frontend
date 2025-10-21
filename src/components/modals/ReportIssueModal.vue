<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Report an Issue</h3>
      <p class="modal-subtitle">
        <span v-if="userRole === 'renter'">Describe the problem you encountered with your booking (#{{ bookingId }}).</span>
        <span v-else-if="userRole === 'owner'">Describe the problem you encountered with this booking (#{{ bookingId }}).</span>
        <span v-else>Describe the problem with booking #{{ bookingId }}.</span>
      </p>

      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="reportReason">Reason:</label>
          <select id="reportReason" v-model="reportReason" required>
            <option disabled value="">Please select a reason</option>

            <template v-if="userRole === 'renter'">
              <option value="renter_vehicle_condition">Vehicle Condition (Not as described, dirty, mechanical issue)</option>
              <option value="renter_host_unresponsive">Host Unresponsive/Late</option>
              <option value="renter_pickup_issue">Problem during Pickup</option>
              <option value="renter_trip_issue">Problem during Trip</option>
              <option value="renter_return_issue">Problem during Return</option>
              <option value="renter_payment_dispute">Billing/Payment Dispute</option>
              <option value="renter_safety_concern">Safety Concern</option>
              <option value="renter_other">Other (Specify Below)</option>
            </template>

            <template v-else-if="userRole === 'owner'">
              <option value="owner_renter_late_pickup">Renter Late for Pickup</option>
              <option value="owner_renter_late_return">Renter Late for Return</option>
              <option value="owner_vehicle_damage">Vehicle Damaged</option>
              <option value="owner_vehicle_dirty">Vehicle Returned Excessively Dirty</option>
              <option value="owner_policy_violation">Renter Violated Policy (Smoking, Pets, etc.)</option>
              <option value="owner_payment_issue">Payment Issue (Renter dispute, etc.)</option>
              <option value="owner_safety_concern">Safety Concern</option>
              <option value="owner_other">Other (Specify Below)</option>
            </template>

             <template v-else>
                <option value="admin_generic_issue">Generic Issue</option>
             </template>

          </select>
        </div>

        <div class="input-group">
          <label for="reportDetails">Details:</label>
          <textarea
            id="reportDetails"
            v-model="reportDetails"
            rows="4"
            placeholder="Please provide specific details about the issue..."
            required
          ></textarea>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="button secondary-button">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="button primary-button">
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit Report</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'ReportIssueModal',
  props: {
    isOpen: Boolean,
    bookingId: String,
    userRole: String,
  },
  emits: ['close', 'report-submitted'],
  data() {
    return {
      reportReason: '',
      reportDetails: '',
      isSubmitting: false,
      errorMessage: '',
    };
  },
  watch: {
    // Reset form when modal opens
    isOpen(newVal) {
      if (newVal) {
        this.reportReason = '';
        this.reportDetails = '';
        this.isSubmitting = false;
        this.errorMessage = '';
      }
    }
  },
  methods: {
    ...mapActions(['submitBookingReport']), // Assuming you'll create this action
    async handleSubmit() {
      if (!this.reportReason || !this.reportDetails.trim()) {
        this.errorMessage = "Please select a reason and provide details.";
        return;
      }
      this.isSubmitting = true;
      this.errorMessage = '';
      try {
        await this.submitBookingReport({
          bookingId: this.bookingId,
          reason: this.reportReason,
          details: this.reportDetails.trim(),
          reporterRole: this.userRole,
        });
        this.$emit('report-submitted'); 
        this.$emit('close'); 
      } catch (error) {
        console.error("Error submitting report:", error);
        this.errorMessage = error.response?.data?.message || "Failed to submit report. Please try again.";
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* Basic Modal Styles (reuse or adapt from PaymentModal) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: $border-radius-lg;
  width: 90%; max-width: 500px; /* Slightly wider for form */
  text-align: center;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem;
}
.modal-subtitle {
  margin: 0 0 1.5rem; color: $text-color-medium;
}

/* Form Styles */
form {
    text-align: left;
}
.input-group {
    margin-bottom: 1.25rem;
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 0.9rem;
        color: $text-color-dark;
    }
    input[type="text"],
    select,
    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid $border-color;
        border-radius: $border-radius-md;
        font-size: 1rem;
        font-family: $font-family-base;
        box-sizing: border-box; /* Include padding in width */
        &:focus {
            outline: none;
            border-color: $primary-color;
            box-shadow: 0 0 0 2px lighten($primary-color, 40%);
        }
    }
    textarea {
        resize: vertical; /* Allow vertical resize */
        min-height: 80px;
    }
}

.error-message {
  color: $admin-color;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color-light;
}
/* Basic Button Styles (reuse or adapt) */
.button {
  padding: 0.75rem 1.5rem; border: none; border-radius: $border-radius-md;
  font-weight: 600; cursor: pointer; transition: background-color 0.2s ease;
}
.primary-button {
  background-color: $primary-color; color: white;
  &:hover:not(:disabled) { background-color: darken($primary-color, 10%); }
  &:disabled { background-color: lighten($primary-color, 20%); cursor: not-allowed; }
}
.secondary-button {
  background-color: #e2e8f0; color: #1f2937;
   &:hover:not(:disabled) { background-color: darken(#e2e8f0, 5%); }
}
</style>