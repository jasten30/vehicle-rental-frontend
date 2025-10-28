<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <h3 class="modal-title">Need to extend your trip?</h3>
        
        <div class="extension-note">
          <i class="bi bi-info-circle-fill"></i>
          <p>
            To request an extension, please contact the host directly through our chat system or contact them directly with their contact number to coordinate a new return time and any additional costs.
          </p>
        </div>

        <div v-if="booking" class="current-return-time">
          Your current return time is:
          <strong>{{ formatDateTime(booking.endDate) }}</strong>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="button primary-button">
            Got it
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import { mapActions } from 'vuex'; // No longer needed
import { DateTime } from 'luxon';

export default {
  name: 'BookingExtensionModal',
  props: {
    isOpen: Boolean,
    booking: Object, // Contains current endDate
    vehicle: Object, // Kept for future use, but not currently used
  },
  emits: ['close'], // Removed 'extension-requested'
  data() {
    return {
      // All data properties related to cost/hours are removed
      // extensionHours: 1,
      // calculatedCost: 0,
      // isSubmitting: false,
      // errorMessage: '',
    };
  },
  computed: {
    // All computed properties related to cost/hours are removed
    // hourlyRate() { ... }
    // newReturnDate() { ... }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Reset form when modal opens (now empty)
      }
    },
  },
  methods: {
    // ...mapActions(['requestBookingExtension']), // No longer needed
    
    // calculateCost() { ... } // Removed
    // async handleRequest() { ... } // Removed

    // Helper for displaying dates in the modal
    formatDateTime(dateValue) {
      if (!dateValue) return 'N/A';
       try {
            // Handle ISO string or Luxon DateTime object
            const dt = typeof dateValue === 'string' ? DateTime.fromISO(dateValue) : DateTime.fromJSDate(dateValue.toDate()); // Handle Timestamps
            if (!dt.isValid) return 'Invalid Date';
            return dt.toLocaleString(DateTime.DATETIME_MED); // e.g., Oct 14, 2025, 1:30 PM
       } catch(e) { return 'Invalid Date'; }
    },
  },
  mounted() {
    // No initial calculation needed
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: $border-radius-lg;
  width: 90%; max-width: 450px;
  text-align: center;
  box-shadow: $shadow-large;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem 0;
  color: $text-color-dark;
}
.modal-subtitle {
  margin: 0 0 1.5rem; color: $text-color-medium;
}

/* New Info Box Style */
.extension-note {
    background-color: $background-light;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    padding: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;

    i {
        font-size: 1.5rem;
        color: $primary-color;
    }
    p {
        margin: 0;
        font-size: 0.95rem;
        color: $text-color-medium;
        line-height: 1.6;
    }
}

.current-return-time {
    font-size: 0.9rem;
    color: $text-color-medium;
    strong {
        font-weight: 600;
        color: $text-color-dark;
    }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color-light;
}
.button {
  padding: 0.75rem 1.5rem; border: none; border-radius: $border-radius-md;
  font-weight: 600; cursor: pointer; transition: background-color 0.2s ease;
  width: 100%; // Make button full width
}
.primary-button {
  background-color: $primary-color; color: white;
  &:hover:not(:disabled) { background-color: darken($primary-color, 10%); }
  &:disabled { background-color: lighten($primary-color, 20%); cursor: not-allowed; }
}

/* Entrance Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
