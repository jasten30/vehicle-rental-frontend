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
          <VehicleOR
            v-model="applicationForm.vehicleOR"
            :show-navigation="false"
          />
          <VehicleCOR
            v-model="applicationForm.vehicleCOR"
            :show-navigation="false"
          />
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
        <button
          @click="nextStep"
          class="nav-button primary"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">{{ submissionStatus }}</span>
          <span v-else>{{ nextButtonText }}</span>
        </button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { uploadBase64Image } from '@/utils/imageUploader';
import UserProfilePhoto from '@/components/forms/UserProfilePhoto.vue';
import DriversLicense from '@/components/forms/DriversLicense.vue';
import VehicleOR from '@/components/forms/VehicleOR.vue';
import VehicleCOR from '@/components/forms/VehicleCOR.vue';
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
      isSubmitting: false,
      errorMessage: null,
      submissionStatus: 'Submitting...',
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
        vehiclePhotos: {
          profilePhotoUrl: null,
          exteriorPhotos: [],
          interiorPhotos: [],
        },
      },
    };
  },
  computed: {
    nextButtonText() {
      return this.currentStep === 3 ? 'Submit Application' : 'Next';
    },
  },
  methods: {
    ...mapActions(['submitHostApplication']),
    nextStep() {
      if (this.currentStep === 3) {
        this.submitApplication();
      } else {
        this.currentStep++;
      }
    },
    prevStep() {
      this.currentStep--;
    },
    async submitApplication() {
      this.isSubmitting = true;
      this.errorMessage = null;
      try {
        // Step 1: Upload all images and get their URLs
        const profilePhotoUrl = await uploadBase64Image(this.applicationForm.userProfilePhoto, 'user_photos');
        const licenseUrl = await uploadBase64Image(this.applicationForm.driversLicense.licenseImage, 'documents');
        const orUrl = await uploadBase64Image(this.applicationForm.vehicleOR.orImage, 'documents');
        const corUrl = await uploadBase64Image(this.applicationForm.vehicleCOR.corImage, 'documents');
        const vehicleProfileUrl = await uploadBase64Image(this.applicationForm.vehiclePhotos.profilePhotoUrl, 'vehicle_photos');
        const exteriorPhotoUrls = await Promise.all(
            (this.applicationForm.vehiclePhotos.exteriorPhotos || []).map(photo => uploadBase64Image(photo, 'vehicle_photos'))
        );
        const interiorPhotoUrls = await Promise.all(
            (this.applicationForm.vehiclePhotos.interiorPhotos || []).map(photo => uploadBase64Image(photo, 'vehicle_photos'))
        );
        
        // Step 2: Create a clean data object with ONLY the data you want to save
        const finalApplicationData = {
          // Keep the text data, but remove the base64 string
          driversLicense: { 
            firstName: this.applicationForm.driversLicense.firstName,
            lastName: this.applicationForm.driversLicense.lastName,
            licenseNumber: this.applicationForm.driversLicense.licenseNumber,
            licenseImageUrl: licenseUrl 
          },
          vehicleOR: { 
            orImageUrl: orUrl 
          },
          vehicleCOR: { 
            plateNumber: this.applicationForm.vehicleCOR.plateNumber,
            corImageUrl: corUrl 
          },
          vehicleDetails: this.applicationForm.vehicleDetails,
          userProfilePhotoUrl: profilePhotoUrl,
          vehiclePhotos: {
            profilePhotoUrl: vehicleProfileUrl,
            exteriorPhotos: exteriorPhotoUrls.filter(url => url),
            interiorPhotos: interiorPhotoUrls.filter(url => url),
          },
        };

        // Step 3: Send the small, clean data object to your backend
        await this.submitHostApplication(finalApplicationData);
        
        this.$router.push({ name: 'ApplicationSubmitted' });
      } catch (error) {
        this.errorMessage = 'Failed to submit application. Please check your inputs.';
        console.error("Submission Error:", error);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

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
    &:hover:not(:disabled) {
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
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
.error-message {
  margin-top: 1rem;
  color: $admin-color;
  font-weight: 500;
  text-align: center;
}
</style>