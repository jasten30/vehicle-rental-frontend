<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Review Driver Application</h3>
      <div v-if="application" class="modal-content">
        <div class="user-info">
            <p><strong>Applicant:</strong> {{ application.userName }} ({{ application.userEmail }})</p>
            <p><strong>Submitted:</strong> {{ formatDate(application.submittedAt) }}</p>
        </div>
        
        <hr class="divider" />

        <div class="documents-grid">
            <div class="document-viewer">
                <label>Driver's License</label>
                <img :src="application.licenseUrl" alt="Driver's License" class="document-image" />
            </div>
            <div class="document-viewer">
                <label>{{ application.otherIdType }}</label>
                <img :src="application.otherIdUrl" :alt="application.otherIdType" class="document-image" />
            </div>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="$emit('decline', { applicationId: application.id, userId: application.userId })" class="button decline">Decline</button>
        <button @click="$emit('approve', { applicationId: application.id, userId: application.userId })" class="button approve">Approve</button>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'AdminDriveApplicationModal',
  props: {
    isOpen: Boolean,
    application: Object,
  },
  emits: ['close', 'approve', 'decline'],
  methods: {
      formatDate(dateData) {
        if (!dateData) return 'N/A';
        // Handle both Firestore Timestamps (objects) and ISO strings
        const date = dateData.seconds ? new Date(dateData.seconds * 1000) : new Date(dateData);
        return DateTime.fromJSDate(date).toFormat('LLL dd, yyyy');
    },
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 0.75rem;
  width: 90%; max-width: 800px;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem;
}
.user-info p {
    margin: 0.25rem 0;
}
.divider {
    border: none;
    height: 1px;
    background-color: $border-color;
    margin: 1.5rem 0;
}
.documents-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}
.document-viewer {
    label {
        font-weight: 600;
        font-size: 0.9rem;
        color: $text-color-medium;
        display: block;
        margin-bottom: 0.5rem;
    }
}
.document-image {
    width: 100%;
    border-radius: $border-radius-md;
    border: 1px solid $border-color;
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
}
.button {
    padding: 0.6rem 1.5rem;
    font-weight: 600;
    border-radius: $border-radius-md;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
}
.button.decline {
    background-color: #f3f4f6;
    color: $text-color-dark;
     &:hover { background-color: darken(#f3f4f6, 5%); }
}
.button.approve {
    background-color: $secondary-color;
    color: white;
     &:hover { background-color: darken($secondary-color, 10%); }
}
</style>

