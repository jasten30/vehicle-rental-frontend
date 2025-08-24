<template>
  <div class="form-container">
    <div class="form-card">
      <form @submit.prevent="currentStep === 12 ? submitForm() : null" class="vehicle-form">
        <!-- The step slider component -->
        <FormStepSlider :currentStep="currentStep" />
        
        <keep-alive>
          <component
            :is="currentStepComponent"
            :key="currentStep"
            v-if="currentStepComponent"
            v-model:address="localVehicle.location"
            v-model:corDetails="localVehicle.cor"
            v-model:orDetails="localVehicle.or"
            v-model:profileImageUrl="localVehicle.userProfileImageUrl"
            v-model:driversLicense="localVehicle.driversLicense"
            v-model:payoutDetails="localVehicle.payoutDetails"
            v-model:availability="localVehicle.availability"
            v-model:pricing="localVehicle.pricing"
            v-model:safety="localVehicle.safety"
            v-model:photos="localVehicle.photos"
            :initialVehicle="localVehicle"
            :vehicleYear="localVehicle.year"
            :isEditMode="isEditMode"
            @next="nextStep"
            @prev="prevStep"
            @submit="submitForm"
            @update:vehicle="updateLocalVehicle"
            @cancel="$emit('cancel')"
            @error="$emit('error', $event)"
          />
        </keep-alive>
      </form>
    </div>
  </div>
</template>

<script>
// Import all child components
import VehicleLocation from '@/components/forms/VehicleLocation.vue';
import VehicleDetails from '@/components/forms/VehicleDetails.vue';
import FormStepSlider from '@/components/forms/FormStepSlider.vue';
import VehicleCOR from '@/components/forms/VehicleCOR.vue';
import VehicleOR from '@/components/forms/VehicleOR.vue';
import UserProfilePhoto from '@/components/forms/UserProfilePhoto.vue';
import UserMobileAndQR from '@/components/forms/UserMobileAndQR.vue';
import DriversLicense from '@/components/forms/DriversLicense.vue';
import VehicleAvailability from '@/components/forms/VehicleAvailability.vue';
import VehiclePricing from '@/components/forms/VehiclePricing.vue';
import VehicleSafety from '@/components/forms/VehicleSafety.vue';
import VehiclePhotos from '@/components/forms/VehiclePhotos.vue';
import SubmitListing from '@/components/forms/SubmitListing.vue';
import { getAuth } from 'firebase/auth';
import { uploadImageToFirebase } from '@/views/services/firebaseStorageService';

export default {
  name: 'VehicleFormSteps',
  components: {
    VehicleLocation,
    VehicleDetails,
    FormStepSlider,
    VehicleCOR,
    VehicleOR,
    UserProfilePhoto,
    UserMobileAndQR,
    DriversLicense,
    VehicleAvailability,
    VehiclePricing,
    VehicleSafety,
    VehiclePhotos,
    SubmitListing,
  },
  props: {
    initialVehicle: {
      type: Object,
      required: true,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const defaultVehicle = {
      location: {
        country: 'Philippines',
        region: 'Region VII (Central Visayas)',
        city: '',
        barangay: '',
        latitude: null,
        longitude: null,
      },
      cor: {
        crNumber: '',
        plateNumber: '',
        dateIssued: '',
        crImageUrl: '',
      },
      or: {
        orNumber: '',
        dateIssued: '',
        orImageUrl: '',
      },
      userProfileImageUrl: '',
      driversLicense: {
        number: '',
        imageUrl: '',
      },
      payoutDetails: {
        mobileNumber: '',
        qrCodeUrl: '',
      },
      availability: {
        startDate: '',
        endDate: '',
      },
      make: '',
      model: '',
      year: null,
      seatingCapacity: null,
      pricing: {
        marketValue: null,
        condition: '',
        manualPrice: null,
        recommendedPrice: null,
      },
      safety: {
        tiresChecked: false,
        brakesChecked: false,
        lightsChecked: false,
        wipersChecked: false,
        emergencyToolsChecked: false,
        registrationChecked: false,
        cleanlinessChecked: false,
        notes: '',
      },
      exteriorPhotoUrl: '',
      interiorPhotoUrl: '',
      photos: [],
    };

    return {
      currentStep: 1,
      localVehicle: { ...defaultVehicle, ...this.initialVehicle },
      stepComponents: [
        'VehicleLocation',
        'VehicleCOR',
        'VehicleOR',
        'UserProfilePhoto',
        'DriversLicense',
        'UserMobileAndQR',
        'VehicleAvailability',
        'VehicleDetails',
        'VehiclePricing',
        'VehicleSafety',
        'VehiclePhotos',
        'SubmitListing'
      ]
    };
  },
  computed: {
    currentStepComponent() {
      const index = this.currentStep - 1;
      return (index >= 0 && index < this.stepComponents.length) ? this.stepComponents[index] : null;
    },
  },
  created() {
    if (this.isEditMode) {
      this.currentStep = 12;
    }
  },
  methods: {
    nextStep() {
      if (this.validateStep()) {
        if (this.currentStep < this.stepComponents.length) {
          this.currentStep++;
        } else {
          this.submitForm();
        }
      } else {
        this.$emit('error', 'Please fill in all required fields to proceed.');
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    updateLocalVehicle(updatedData) {
      this.localVehicle = { ...this.localVehicle, ...updatedData };
    },
    validateStep() {
      this.$emit('error', ''); // Clear any previous errors
      switch (this.currentStep) {
        case 1:
          return this.localVehicle.location.city && this.localVehicle.location.barangay;
        case 2:
          return this.localVehicle.cor.crNumber && this.localVehicle.cor.plateNumber && this.localVehicle.cor.crImageUrl;
        case 3:
          return this.localVehicle.or.orNumber && this.localVehicle.or.orImageUrl;
        case 4:
          return this.localVehicle.userProfileImageUrl;
        case 5:
          return this.localVehicle.driversLicense.number && this.localVehicle.driversLicense.imageUrl;
        case 6:
          return this.localVehicle.payoutDetails.mobileNumber && this.localVehicle.payoutDetails.qrCodeUrl;
        case 7:
          return this.localVehicle.availability.startDate && this.localVehicle.availability.endDate;
        case 8:
          return this.localVehicle.make && this.localVehicle.model && this.localVehicle.year && this.localVehicle.seatingCapacity;
        case 9:
          return this.localVehicle.pricing.marketValue > 0 && this.localVehicle.pricing.condition;
        case 10:
          return this.localVehicle.safety.tiresChecked && this.localVehicle.safety.brakesChecked && this.localVehicle.safety.lightsChecked && this.localVehicle.safety.wipersChecked && this.localVehicle.safety.emergencyToolsChecked && this.localVehicle.safety.registrationChecked && this.localVehicle.safety.cleanlinessChecked;
        case 11:
          return this.localVehicle.photos && this.localVehicle.photos.length > 0;
        case 12:
          return true; // Final step, always allow moving forward.
        default:
          return false;
      }
    },
    async submitForm() {
      this.$emit('error', '');
      console.log('Attempting to submit form with data:', this.localVehicle);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        this.$emit('error', 'You must be logged in to submit a listing.');
        return;
      }
      
      const userAuthToken = await user.getIdToken();
      const apiUrl = 'http://localhost:5001/api/vehicles'; 
      const vehicleId = this.localVehicle.vehicleId || crypto.randomUUID();

      // IMPORTANT: Use a try-catch block to handle the upload process.
      try {
        this.$emit('error', 'Uploading images...');
        
        // Step 1: Upload all images and get their URLs
        const crImageUrl = this.localVehicle.cor?.crImageFile
          ? await uploadImageToFirebase(this.localVehicle.cor.crImageFile, `vehicles/${vehicleId}/cor.png`)
          : this.localVehicle.cor.crImageUrl; // Use existing URL if no new file
        
        const orImageUrl = this.localVehicle.or?.orImageFile
          ? await uploadImageToFirebase(this.localVehicle.or.orImageFile, `vehicles/${vehicleId}/or.png`)
          : this.localVehicle.or.orImageUrl;
          
        const userProfileImageUrl = this.localVehicle.userProfileImageFile
          ? await uploadImageToFirebase(this.localVehicle.userProfileImageFile, `users/${user.uid}/profile.png`)
          : this.localVehicle.userProfileImageUrl;
          
        const driversLicenseImageUrl = this.localVehicle.driversLicense?.imageFile
          ? await uploadImageToFirebase(this.localVehicle.driversLicense.imageFile, `users/${user.uid}/drivers_license.png`)
          : this.localVehicle.driversLicense.imageUrl;

        const uploadedPhotos = await Promise.all(
          (this.localVehicle.photos || []).map(async (file, index) => {
            if (file instanceof File) {
              const photoPath = `vehicles/${vehicleId}/photos/${crypto.randomUUID()}-${index}.png`;
              return await uploadImageToFirebase(file, photoPath);
            }
            return file; // If it's already a URL, just return it.
          })
        );
        
        // Step 2: Create the final payload with the new URLs
        const payload = {
          ...this.localVehicle,
          vehicleId,
          rentalPricePerDay: this.localVehicle.pricing.manualPrice,
          cor: { ...this.localVehicle.cor, crImageUrl },
          or: { ...this.localVehicle.or, orImageUrl },
          driversLicense: { ...this.localVehicle.driversLicense, imageUrl: driversLicenseImageUrl },
          userProfileImageUrl,
          photos: uploadedPhotos,
        };

        // Remove the temporary file objects
        delete payload.cor.crImageFile;
        delete payload.or.orImageFile;
        delete payload.driversLicense.imageFile;
        delete payload.userProfileImageFile;
        delete payload.payoutDetails.qrCodeUrl;
        delete payload.exteriorPhotoUrl;
        delete payload.interiorPhotoUrl;
        
        console.log('Final Payload before sending:', JSON.stringify(payload, null, 2));

        // Step 3: Send the cleaned payload to the server
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAuthToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Vehicle successfully added:', data);
        this.$emit('success', 'Your vehicle has been submitted for approval!');
      } catch (error) {
        console.error('Error submitting vehicle:', error);
        this.$emit('error', `Submission failed: ${error.message}`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.form-card {
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
