<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Request Booking Extension</h3>
      <p v-if="booking" class="modal-subtitle">
        Current Return: {{ formatDateTime(booking.endDate) }}
      </p>

      <form @submit.prevent="handleRequest">
        <div class="input-group">
          <label for="extensionHours">Extend by (Hours):</label>
          <input
            type="number"
            id="extensionHours"
            v-model.number="extensionHours"
            min="1"
            max="72" step="1"
            required
            @input="calculateCost" />
        </div>

        <div v-if="hourlyRate > 0 && extensionHours > 0" class="cost-preview">
            <p>Hourly Rate: ₱{{ hourlyRate.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            <p>New Return Time: {{ formatDateTime(newReturnDate) }}</p>
            <p class="estimated-cost">
                Estimated Extension Cost:
                <strong>₱{{ calculatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
            </p>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="button secondary-button">Cancel</button>
          <button type="submit" :disabled="isSubmitting || extensionHours <= 0" class="button primary-button">
            <span v-if="isSubmitting">Requesting...</span>
            <span v-else>Request Extension</span>
          </button>
        </div>
        <p class="note">Note: Extension is subject to vehicle availability and requires payment.</p>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'BookingExtensionModal',
  props: {
    isOpen: Boolean,
    booking: Object, // Contains current endDate
    vehicle: Object, // Contains rentalPricePerDay
  },
  emits: ['close', 'extension-requested'], // Event when request is successfully sent
  data() {
    return {
      extensionHours: 1, // Default to 1 hour
      calculatedCost: 0,
      isSubmitting: false,
      errorMessage: '',
    };
  },
  computed: {
    hourlyRate() {
      if (this.vehicle && this.vehicle.rentalPricePerDay > 0) {
        return parseFloat((this.vehicle.rentalPricePerDay / 24).toFixed(2));
      }
      return 0;
    },
    newReturnDate() {
        if (!this.booking?.endDate || !this.extensionHours || this.extensionHours <= 0) return null;
        try {
            return DateTime.fromISO(this.booking.endDate).plus({ hours: this.extensionHours });
        } catch(e) { return null;}
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Reset form when modal opens
        this.extensionHours = 1;
        this.calculatedCost = this.hourlyRate * 1; // Initial cost
        this.isSubmitting = false;
        this.errorMessage = '';
      }
    },
    // Recalculate cost when vehicle prop changes (if it might)
    vehicle: {
        handler() { this.calculateCost(); },
        deep: true
    }
  },
  methods: {
    ...mapActions(['requestBookingExtension']), // New Vuex action
    calculateCost() {
      if (this.hourlyRate > 0 && this.extensionHours > 0) {
        this.calculatedCost = parseFloat((this.hourlyRate * this.extensionHours).toFixed(2));
      } else {
        this.calculatedCost = 0;
      }
    },
    async handleRequest() {
      if (this.extensionHours <= 0) {
        this.errorMessage = "Please enter a valid number of hours (at least 1).";
        return;
      }
      this.isSubmitting = true;
      this.errorMessage = '';
      try {
        const payload = {
          bookingId: this.booking.id,
          extensionHours: this.extensionHours,
        };
        // This action calls the backend, which validates availability and calculates final cost
        const result = await this.requestBookingExtension(payload);

        // Emit event with result (might include confirmed cost, new end date)
        this.$emit('extension-requested', result);
        this.$emit('close'); // Close this modal
      } catch (error) {
        console.error("Error requesting booking extension:", error);
        this.errorMessage = error.response?.data?.message || "Failed to request extension. Check availability or try again.";
      } finally {
        this.isSubmitting = false;
      }
    },
    // Helper for displaying dates in the modal
    formatDateTime(dateValue) {
      if (!dateValue) return 'N/A';
       try {
            // Handle ISO string or Luxon DateTime object
            const dt = typeof dateValue === 'string' ? DateTime.fromISO(dateValue) : dateValue;
            if (!dt.isValid) return 'Invalid Date';
            return dt.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS); // e.g., 10/14/2025, 1:30:00 PM
       } catch(e) { return 'Invalid Date'; }
    },
  },
   mounted() {
       // Initial calculation when modal might open with props already set
       this.calculateCost();
   }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* Re-use or adapt modal styles from ReportIssueModal or PaymentModal */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: $border-radius-lg;
  width: 90%; max-width: 450px;
  text-align: center;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem;
}
.modal-subtitle {
  margin: 0 0 1.5rem; color: $text-color-medium;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color-light;
}
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
.error-message {
  color: $admin-color;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

/* Form Styles */
form { text-align: left; }
.input-group {
    margin-bottom: 1.25rem;
    label 
    input[type="number"] { // Style number input
        width: 100%; padding: 0.75rem; border: 1px solid $border-color;
        border-radius: $border-radius-md; font-size: 1rem;
        font-family: $font-family-base; box-sizing: border-box;
    }
}

.cost-preview {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: $border-radius-md;
    margin-bottom: 1.5rem;
    border: 1px solid $border-color-light;
    p {
        margin: 0.3rem 0;
        font-size: 0.9rem;
        color: $text-color-medium;
    }
    .estimated-cost {
        margin-top: 0.75rem;
        font-size: 1rem;
        color: $text-color-dark;
        strong {
            font-weight: 700;
            color: $primary-color;
            font-size: 1.1rem;
        }
    }
}
.note {
    font-size: 0.8rem;
    color: $text-color-medium;
    margin-top: 1.5rem;
    text-align: center;
}
</style>