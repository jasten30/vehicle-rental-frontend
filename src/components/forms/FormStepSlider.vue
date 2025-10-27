<template>
  <div class="progress-bar-container">
    <div class="progress-info">
      <div> <!-- Wrapper for step count and next step -->
        <span class="step-count">
          {{ currentStep }} of {{ totalSteps }} steps
        </span>
        <span class="next-step">
          Next: {{ nextStepLabel }} |
          <a href="#" @click.prevent="$emit('start-over')">Start over</a>
        </span>
      </div>
       <!-- Moved Button Here -->
      <button class="all-steps-btn button secondary-button" @click.prevent="isModalOpen = true">
         <i class="bi bi-list-task"></i> View Steps
      </button>
    </div>

    <div class="progress-bar-wrapper">
      <div class="progress-bar-fill" :style="progressBarStyle"></div>
      <!-- Button Removed From Here -->
    </div>

    <!-- Modal for viewing all steps -->
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
// Define the step labels outside the component definition
const vehicleStepLabels = {
  1: 'Location',
  2: 'Registration (CR)',
  3: 'Official Receipt (OR)',
  4: 'Vehicle Details',
  5: 'Features',
  6: 'Pricing',
  7: 'Safety Check',
  8: 'Photos',
  9: 'Review & Submit',
};

const motorcycleStepLabels = {
  1: 'Motorcycle Details',
  2: 'Location',
  3: 'Availability',
  4: 'Pricing',
  5: 'Photos',
  6: 'Review & Submit',
};

export default {
  name: 'FormStepSlider',
  props: {
    currentStep: {
      type: Number,
      required: true,
    },
    // NEW PROP: Determines which set of steps to show
    assetType: {
      type: String,
      default: 'vehicle', // 'vehicle' or 'motorcycle'
    }
  },
  emits: ['start-over', 'jump-to-step'],
  data() {
    return {
      isModalOpen: false,
      // stepLabels is no longer in data
    };
  },
  computed: {
    // stepLabels is now computed based on the assetType prop
    stepLabels() {
      if (this.assetType === 'motorcycle') {
        return motorcycleStepLabels;
      }
      return vehicleStepLabels; // Default to vehicle
    },
    totalSteps() {
      return Object.keys(this.stepLabels).length;
    },
    progressBarStyle() {
      const effectiveStep = Math.min(this.currentStep, this.totalSteps);
      const progressPercentage = (effectiveStep / this.totalSteps) * 100;
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
      if (this.stepLabels[step]) {
          this.$emit('jump-to-step', parseInt(step));
          this.isModalOpen = false;
      }
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: $text-color-medium;
}

.step-count {
  font-weight: 600;
  color: $text-color-dark;
}

.next-step {
  color: $text-color-medium;
  margin-left: 0.5rem; // Add space after step count
  a {
    color: $primary-color;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
      color: darken($primary-color, 10%);
    }
  }
}

.progress-bar-wrapper {
  // Removed flex properties, now just the bar background
  background-color: $border-color-light;
  border-radius: 0.375rem;
  overflow: hidden;
  height: 0.75rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(to right, lighten($primary-color, 15%), $primary-color);
  border-radius: 0.375rem;
  transition: width 0.4s ease-out;
}

// ============================================
// Updated Button Styles (inside .progress-info)
// ============================================
.all-steps-btn {
  // Inherits .button styles, add specifics
  padding: 0.5rem 1rem; // Adjust padding
  font-size: 0.85rem; // Slightly smaller font
  white-space: nowrap; // Prevent wrapping
  margin-left: 1rem; // Space from text
  i {
    margin-right: 0.4rem;
    font-size: 1em; // Match button text size
  }
}

// Basic Button Styles (Copied from previous examples for context)
.button {
  padding: 0.75rem 1.25rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
}
.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border-color: $primary-color;
  &:hover {
    background-color: lighten($primary-color, 45%);
    transform: translateY(-1px);
  }
}
// ============================================


/* Modal Styles */
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
  padding: 1.5rem 2rem;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 450px;
  box-shadow: $shadow-large;
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
      font-size: 1.35rem;
      font-weight: 700;
      color: $text-color-dark;
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: $text-color-medium;
  padding: 0.25rem;
  &:hover {
      color: $admin-color;
  }
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 0.5rem;
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
  padding: 0.85rem 0.5rem;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid $border-color-light;

  &:last-child {
      border-bottom: none;
  }

  &:hover {
    background-color: $background-light;
  }
}

.step-number {
  font-weight: 700;
  color: $text-color-medium;
  background-color: $border-color-light;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-label {
  color: $text-color-dark;
  font-weight: 500;
}

.step-item.completed {
    .step-number {
        background-color: lighten($secondary-color, 30%);
        color: darken($secondary-color, 15%);
    }
    .step-label {
        color: $text-color-medium;
        text-decoration: line-through;
    }
     &:hover {
         background-color: initial;
         cursor: default;
     }
}

.step-item.active {
  background-color: lighten($primary-color, 45%);
  .step-number {
    background-color: $primary-color;
    color: white;
  }
  .step-label {
    font-weight: 700;
    color: $primary-color;
  }
   &:hover {
       background-color: lighten($primary-color, 40%);
   }
}
</style>

