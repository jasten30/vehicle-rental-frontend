<template>
  <transition name="modal-fade">
    <!-- FIX: Added v-if="show" to the overlay div to enable the transition -->
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-card" @click.stop>
        
        <div class="modal-header">
          <h3>List a New Asset</h3>
          <p>What are you listing? Choose the category that best fits your asset.</p>
        </div>

        <div class="modal-body">
          <div class="choice-grid">
            <!-- Choice 1: Car -->
            <button class="choice-card" @click="$emit('navigate', 'AddVehicle')">
              <div class="icon-wrapper car">
                <i class="bi bi-car-front-fill"></i>
              </div>
              <span class="choice-label">Car / 4-Wheels</span>
              <span class="choice-description">List sedans, SUVs, vans, trucks, etc.</span>
            </button>
            
            <!-- Choice 2: Motorcycle -->
            <button class="choice-card" @click="$emit('navigate', 'AddMotorcycle')">
              <div class="icon-wrapper motorcycle">
                <!-- Using a simple icon, you can replace this with a better one -->
                <i class="bi bi-bicycle"></i> 
              </div>
              <span class="choice-label">Motorcycle / 2-Wheels</span>
              <span class="choice-description">List scooters, motorbikes, etc.</span>
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="button secondary-button" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "VehicleTypeChoiceModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'navigate'],
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
  max-width: 600px; // Wider for two options
  box-shadow: $shadow-large;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    color: $text-color-dark;
    margin: 0;
  }
  p {
    font-size: 1rem;
    color: $text-color-medium;
    margin-top: 0.5rem;
  }
}

.modal-body {
  margin-bottom: 2rem;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr; // Stack on mobile
    gap: 1rem;
  }
}

.choice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  border: 2px solid $border-color-light;
  border-radius: $border-radius-lg;
  background-color: $background-light;
  cursor: pointer;
  transition: all 0.2s ease-out;
  text-align: center;
  
  &:hover {
    border-color: $primary-color;
    background-color: #fff;
    transform: translateY(-5px);
    box-shadow: $shadow-medium;
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    
    i {
      font-size: 2rem;
      color: white;
    }
    
    &.car {
      background-color: $primary-color;
    }
    &.motorcycle {
      background-color: $secondary-color; // Use a different color
    }
  }

  .choice-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: $text-color-dark;
  }
  
  .choice-description {
    font-size: 0.9rem;
    color: $text-color-medium;
    margin-top: 0.25rem;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid $border-color-light;
  padding-top: 1.5rem;
}

/* Basic Button Styles (re-used for modal) */
.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 0.9rem;
}
.secondary-button {
  background-color: transparent;
  color: $text-color-medium;
  border-color: $border-color;
  &:hover {
    background-color: $background-light;
    color: $text-color-dark;
  }
}

/* Modal Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

