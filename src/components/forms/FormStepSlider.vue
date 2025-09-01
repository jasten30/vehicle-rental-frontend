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
      <button class="all-steps-btn" @click.prevent="$emit('viewAllSteps')">
        View all steps
      </button>
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
  data() {
    return {
      totalSteps: 12,
      stepLabels: {
        1: 'Vehicle Location',
        2: 'Vehicle COR',
        3: 'Vehicle OR',
        4: 'User Profile Photo',
        5: 'Drivers License',
        6: 'User Mobile & QR',
        7: 'Vehicle Availability',
        8: 'Vehicle Details',
        9: 'Vehicle Pricing',
        10: 'Vehicle Safety',
        11: 'Vehicle Photos',
        12: 'Submit Listing',
        13: 'Submission Complete'
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
  color: #6b7280; // gray-500
}

.step-count {
  font-weight: 600;
  color: #1f2937; // gray-800
  margin-right: 0.5rem;
}

.next-step {
  .next-label {
    font-weight: 500;
  }
  a {
    color: #4f46e5; // indigo-600
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
  background-color: #a78bfa; // violet-400
  border-radius: 0.375rem;
  transition: width 0.3s ease-in-out;
  flex-grow: 1;
}

.progress-bar-fill {
  background: linear-gradient(to right, #6d28d9, #8b5cf6, #a78bfa); // From violet-700 to violet-400
  border-radius: 0.375rem;
  transition: width 0.3s ease-in-out;
  height: 0.75rem;
}

.all-steps-btn {
  background-color: #fff;
  border: 1px solid #d1d5db; // gray-300
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #1f2937; // gray-800
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  
  &:hover {
    background-color: #f3f4f6; // gray-100
  }
}
</style>
