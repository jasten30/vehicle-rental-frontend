<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <i class="bi bi-cash-coin modal-icon"></i>
        <h3 class="modal-title">Downpayment Information</h3>
      </div>
      <div class="modal-body">
        <p>
          To secure your booking, a <strong>20% downpayment</strong> will be required once the host approves your request.
        </p>
        <p class="sub-text">
          The remaining balance can be settled directly with the host upon vehicle pickup.
        </p>
      </div>
      <div class="modal-actions">
        <button @click="$emit('close')" class="button secondary-button">Cancel</button>
        <button @click="$emit('confirm')" class="button primary-button">Agree & Continue</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DownpaymentConfirmationModal',
  props: {
    isOpen: Boolean,
  },
  emits: ['confirm', 'close'],
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

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
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 450px;
  box-shadow: $shadow-large;
  text-align: center;
}

.modal-header {
  margin-bottom: 1.5rem;
}

.modal-icon {
  font-size: 3rem;
  color: $primary-color;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.modal-body p {
  font-size: 1rem;
  color: $text-color-medium;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.modal-body p.sub-text {
  font-size: 0.9rem;
  color: lighten($text-color-medium, 10%);
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-pill;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: $card-background;
  color: $text-color-dark;
  border: 1px solid $border-color;
  &:hover {
    background-color: darken($card-background, 5%);
  }
}
</style>
