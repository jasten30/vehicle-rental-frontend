<template>
  <div class="application-container">
    <div class="form-wrapper">
      <h1 class="main-title">Become a Host</h1>
      <p class="main-subtitle">
        Let's get you and your vehicle verified. We'll guide you through the
        necessary steps.
      </p>

      <div class="step-content">
        <div v-if="currentStep === 1" :key="1">
          <h2 class="step-title">Step 1: Your Information</h2>
          <UserProfilePhoto
            v-model="applicationForm.userProfilePhoto"
            :show-navigation="false"
          />
          <DriversLicense
            v-model="applicationForm.driversLicense"
            :show-navigation="false"
          />
        </div>

        <div v-if="currentStep === 2" :key="2">
          <h2 class="step-title">Step 2: Vehicle Documents</h2>
          <p class="step-description">
            Please upload clear copies of your vehicle's Official Receipt (OR)
            and Certificate of Registration (CR). The name on the CR must match
            your verified ID.
          </p>
          <VehicleOR v-model="applicationForm.vehicleOR" :show-navigation="false" />
          <VehicleCOR v-model="applicationForm.vehicleCOR" :show-navigation="false" />
        </div>

        <div v-if="currentStep === 3" :key="3">
          <h2 class="step-title">Step 3: Vehicle Details & Photos</h2>
          <p class="step-description">
            Provide some basic details about your car and upload photos that
            showcase it.
          </p>
          <VehicleDetails
            v-model="applicationForm.vehicleDetails"
            :show-navigation="false"
          />
          <VehiclePhotos
            v-model="applicationForm.vehiclePhotos"
            :show-navigation="false"
          />
        </div>
      </div>

      <div class="navigation-controls">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="nav-button secondary"
        >
          Back
        </button>
        <button @click="nextStep" class="nav-button primary">
          {{ nextButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Step 1 Components
import UserProfilePhoto from '@/components/forms/UserProfilePhoto.vue';
import DriversLicense from '@/components/forms/DriversLicense.vue';
// Step 2 Components
import VehicleOR from '@/components/forms/VehicleOR.vue';
import VehicleCOR from '@/components/forms/VehicleCOR.vue';
// NEW: Step 3 Components
import VehicleDetails from '@/components/forms/VehicleDetails.vue';
import VehiclePhotos from '@/components/forms/VehiclePhotos.vue';

export default {
  name: 'BecomeOwnerApplication',
  components: {
    UserProfilePhoto,
    DriversLicense,
    VehicleOR,
    VehicleCOR,
    VehicleDetails,
    VehiclePhotos,
  },
  data() {
    return {
      currentStep: 1,
      // This object will hold all the data from the different form steps
      applicationForm: {
        userProfilePhoto: null,
        driversLicense: {},
        vehicleOR: {},
        vehicleCOR: {},
        vehicleDetails: {
          make: '',
          model: '',
          year: null,
          vehicleType: '',
          seats: null,
          transmission: '',
          fuelType: '',
        },
        vehiclePhotos: [],
      },
    };
  },
  computed: {
    // NEW: Determines the text for the main action button
    nextButtonText() {
      return this.currentStep === 3 ? 'Submit Application' : 'Next';
    },
  },
  methods: {
    nextStep() {
      // If on the last step, submit the form. Otherwise, go to the next step.
      if (this.currentStep === 3) {
        this.submitApplication();
      } else {
        this.currentStep++;
      }
    },
    prevStep() {
      this.currentStep--;
    },
    // NEW: Method to handle the final form submission
    submitApplication() {
      console.log('Submitting application with the following data:');
      console.log(JSON.stringify(this.applicationForm, null, 2));

      // TODO: Add logic to handle loading/disabled state
      
      // This is where you would dispatch a Vuex action to send the data
      // to your backend for review.
      // For example:
      // this.$store.dispatch('submitHostApplication', this.applicationForm)
      //   .then(() => {
      //     // Redirect to a success page
      //     this.$router.push({ name: 'ApplicationSubmitted' });
      //   })
      //   .catch(error => {
      //     // Display an error message
      //     console.error("Failed to submit application:", error);
      //   });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
// All styles from the previous step remain the same
.application-container {
  background-color: #f7fafc;
  min-height: 100vh;
  padding: 4rem 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.form-wrapper {
  width: 100%;
  max-width: 700px;
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
}
.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
.main-subtitle {
  font-size: 1.1rem;
  text-align: center;
  color: $text-color-medium;
  margin-bottom: 3rem;
}
.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 1rem;
  border-bottom: 1px solid $border-color;
  padding-bottom: 1rem;
}
.step-description {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  line-height: 1.6;
}
.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color;
}
.nav-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &.primary {
    background-color: $primary-color;
    color: white;
    &:hover {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
      box-shadow: $shadow-medium;
    }
  }
  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    &:hover {
      color: $text-color-dark;
    }
  }
}
</style>