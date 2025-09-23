<template>
  <div class="progress-bar-container">
    <div class="progress-info">
      <span class="step-count">
        {{ currentStep }} of {{ totalSteps }} steps
      </span>
      <span class="next-step">
        Next: {{ nextStepLabel }} |
        <a href="#" @click.prevent="$emit('start-over')">Start over</a>
      </span>
    </div>

    <div class="progress-bar-wrapper">
      <div class="progress-bar-fill" :style="progressBarStyle"></div>
      <button class="all-steps-btn" @click.prevent="isModalOpen = true">
        View all steps
      </button>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click="isModalOpen = false">
        <div class="modal-card" @click.stop>
            <div class="modal-header">
                <h3>All Listing Steps</h3>
                <button @click="isModalOpen = false" class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <ul class="steps-list">
                    <li
                        v-for="(label, step) in stepLabels"
                        :key="step"
                        class="step-item"
                        :class="{ active: parseInt(step) === currentStep, completed: parseInt(step) < currentStep }"
                        @click="jumpToStep(step)"
                    >
                        <span class="step-number">{{ step }}</span>
                        <span class="step-label">{{ label }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormStepSlider',
  props: {
    currentStep: {
      type: Number,
      required: true,
    }
  },
  emits: ['start-over', 'viewAllSteps', 'jump-to-step'],
  data() {
    return {
      isModalOpen: false,
      // UPDATED: Total steps is now 10
      totalSteps: 10,
      // UPDATED: Removed steps 4 and 6, and renumbered the rest
      stepLabels: {
        1: 'Vehicle Location',
        2: 'Vehicle COR',
        3: 'Vehicle OR',
        4: 'Drivers License',
        5: 'Vehicle Availability',
        6: 'Vehicle Details',
        7: 'Vehicle Pricing',
        8: 'Vehicle Safety',
        9: 'Vehicle Photos',
        10: 'Submit Listing',
      }
    };
  },
  computed: {
    progressBarStyle() {
      const progressPercentage = (this.currentStep / this.totalSteps) * 100;
      return {
        width: `${progressPercentage}%`
      };
    },
    nextStepLabel() {
      const nextStep = this.currentStep + 1;
      return this.stepLabels[nextStep] || 'Complete';
    }
  },
  methods: {
    jumpToStep(step) {
      this.$emit('jump-to-step', parseInt(step));
      this.isModalOpen = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.progress-bar-container {
  font-family: 'Inter', sans-serif;
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.step-count {
  font-weight: 600;
  color: #1f2937;
  margin-right: 0.5rem;
}

.next-step {
  .next-label {
    font-weight: 500;
  }
  a {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-fill {
  height: 0.75rem;
  background: linear-gradient(to right, #6d28d9, #8b5cf6, #a78bfa);
  border-radius: 0.375rem;
  transition: width 0.3s ease-in-out;
  flex-grow: 1;
}

.all-steps-btn {
  background-color: #fff;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  
  &:hover {
    background-color: #f3f4f6;
  }
}

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
  padding: 1.5rem;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 400px;
  box-shadow: $shadow-medium;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  h3 {
      margin: 0;
      font-size: 1.25rem;
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: $text-color-medium;
  &:hover {
      color: $text-color-dark;
  }
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f3f4f6;
  }
}

.step-number {
  font-weight: 600;
  color: $text-color-medium;
  width: 24px;
  text-align: right;
  flex-shrink: 0;
}

.step-label {
  color: $text-color-dark;
}

.step-item.completed {
    .step-number, .step-label {
        color: $text-color-light;
    }
}

.step-item.active {
  background-color: lighten($primary-color, 45%);
  .step-number, .step-label {
    font-weight: 700;
    color: $primary-color;
  }
}
</style>

