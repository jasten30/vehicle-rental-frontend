<template>
  <div
    v-if="!isEmailVerified || !isMobileVerified"
    class="verification-reminder-banner"
  >
    <div class="reminder-icon">
      <i class="bi bi-exclamation-triangle-fill"></i>
    </div>
    <div class="reminder-content">
      <div class="reminder-text">
        <h4>Complete Your Verification</h4>
        <p>{{ reminderText }}</p>
      </div>
      <button @click="$emit('verify-now')" class="verify-now-button">
        Verify Now
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerificationReminder',
  props: {
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['verify-now'],
  computed: {
    // This computed property creates a clean, natural language string
    reminderText() {
      const items = [];
      if (!this.isMobileVerified) {
        items.push('Phone Number');
      }
      if (!this.isEmailVerified) {
        items.push('Email Address');
      }
      return `To unlock all features, please verify your ${items.join(' and ')}.`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.verification-reminder-banner {
  background-color: #fffbeb; // Light yellow
  border: 1px solid #fde68a; // Lighter yellow border
  border-radius: $border-radius-lg;
  padding: 1rem 1.5rem; // Reduced padding
  margin-bottom: 2rem;
  display: flex;
  align-items: center; // Vertically center content
  gap: 1rem; // Reduced gap
  box-shadow: $shadow-light;
}

.reminder-icon {
  font-size: 1.5rem; // Reduced icon size
  color: #f59e0b; // Amber color
  flex-shrink: 0;
}

.reminder-content {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;

  // Stack on smaller screens
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.reminder-text {
  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem; // Reduced font size
    color: $text-color-dark;
  }

  p {
    margin: 0;
    color: $text-color-medium;
    font-size: 0.9rem; // Reduced font size
  }
}

.verify-now-button {
  background-color: $primary-color;
  color: white;
  padding: 0.5rem 1.25rem; // Reduced padding
  border-radius: $border-radius-pill;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  white-space: nowrap; // Prevent button from wrapping

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}
</style>