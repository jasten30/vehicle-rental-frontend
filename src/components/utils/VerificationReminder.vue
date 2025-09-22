<template>
  <div class="reminders-container">
    <!-- Highest priority: Remind user to get approved to drive -->
    <div v-if="!isApprovedToDrive" class="reminder-banner warning">
      <div class="banner-content">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <p>To book or list a vehicle, you need to be approved to drive. Complete your application now.</p>
      </div>
      <button @click="$emit('approve-to-drive')" class="action-button">Complete Application</button>
    </div>

    <!-- Secondary reminder for email/phone, only shown if user is already approved to drive -->
    <div v-if="(!isEmailVerified || !isMobileVerified) && isApprovedToDrive" class="reminder-banner info">
      <div class="banner-content">
        <i class="bi bi-info-circle-fill"></i>
        <p>Complete your profile by verifying your email and mobile number.</p>
      </div>
      <button @click="$emit('verify-now')" class="action-button">Verify Now</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerificationReminder',
  props: {
    isEmailVerified: Boolean,
    isMobileVerified: Boolean,
    isApprovedToDrive: Boolean,
  },
  emits: ['verify-now', 'approve-to-drive'],
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.reminders-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.reminder-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: $border-radius-lg;
  border: 1px solid;

  &.info {
    background-color: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
  }

  &.warning {
    background-color: #fefce8;
    border-color: #fde68a;
    color: #854d0e;
  }
}

.banner-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    i {
        font-size: 1.5rem;
    }

    p {
        margin: 0;
        font-weight: 500;
    }
}

.action-button {
    padding: 0.6rem 1.2rem;
    border-radius: $border-radius-md;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border: none;
    white-space: nowrap;

    .info & {
        background-color: #3b82f6;
        color: white;
        &:hover {
            background-color: darken(#3b82f6, 10%);
        }
    }

    .warning & {
        background-color: #f59e0b;
        color: white;
         &:hover {
            background-color: darken(#f59e0b, 10%);
        }
    }
}
</style>

