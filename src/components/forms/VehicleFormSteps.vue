<template>
  <div class="form-container">
    <div class="form-card">
      <form
        @submit.prevent="currentStep === 12 ? submitForm() : null"
        class="vehicle-form"
      >
        <FormStepSlider :currentStep="currentStep" @start-over="startOver" />

        <keep-alive>
          <component
            :is="currentStepComponent"
            :key="currentStep"
            v-if="currentStepComponent"
            v-model:address="localVehicle.location"
            v-model:corDetails="localVehicle.cor"
            v-model:orDetails="localVehicle.or"
            v-model:userProfileImageUrl="localVehicle.userProfileImageUrl"
            v-model:driversLicense="localVehicle.driversLicense"
            v-model:availability="localVehicle.availability"
            v-model:pricing="localVehicle.pricing"
            v-model:safety="localVehicle.safety"
            v-model:vehicleProfilePhotoUrl="localVehicle.profilePhotoUrl"
            v-model:exteriorPhotos="localVehicle.exteriorPhotos"
            v-model:interiorPhotos="localVehicle.interiorPhotos"
            v-model:features="localVehicle.features"
            :initialVehicle="localVehicle"
            :vehicleYear="localVehicle.year"
            :isEditMode="isEditMode"
            @next="nextStep"
            @prev="prevStep"
            @submit="submitForm"
            @update:vehicle="updateLocalVehicle"
            @cancel="$emit('cancel')"
            @error="$emit('error', $event)"
            @start-over="startOver"
          />
        </keep-alive>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
// 1. Ensure all components are imported
import VehicleLocation from "@/components/forms/VehicleLocation.vue";
import VehicleDetails from "@/components/forms/VehicleDetails.vue";
import VehicleFeatures from "@/components/forms/VehicleFeatures.vue";
import FormStepSlider from "@/components/forms/FormStepSlider.vue";
import VehicleCOR from "@/components/forms/VehicleCOR.vue";
import VehicleOR from "@/components/forms/VehicleOR.vue";
import UserProfilePhoto from "@/components/forms/UserProfilePhoto.vue";
import DriversLicense from "@/components/forms/DriversLicense.vue";
import VehicleAvailability from "@/components/forms/VehicleAvailability.vue";
import VehiclePricing from "@/components/forms/VehiclePricing.vue";
import VehicleSafety from "@/components/forms/VehicleSafety.vue";
import VehiclePhotos from "@/components/forms/VehiclePhotos.vue";
import SubmitListing from "@/components/forms/SubmitListing.vue";

const defaultVehicleState = {
  location: {
    country: "Philippines",
    region: "Region VII (Central Visayas)",
    city: "",
    barangay: "",
    latitude: null,
    longitude: null,
  },
  cor: {
    crNumber: "",
    plateNumber: "",
    dateIssued: "",
    crImageUrl: "",
  },
  or: {
    orNumber: "",
    dateIssued: "",
    orImageUrl: "",
  },
  userProfileImageUrl: "",
  driversLicense: {
    number: "",
    imageUrl: "",
  },
  availability: [],
  
  make: "",
  model: "",
  year: null,
  seats: null,
  vehicleType: "",
  transmission: "",
  fuelType: "",
  features: [],
  pricing: {
    marketValue: null,
    condition: "",
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
    notes: "",
  },
  profilePhotoUrl: "",
  exteriorPhotos: [],
  interiorPhotos: [],
};

export default {
  name: "VehicleFormSteps",
  // 2. Ensure all imported components are registered here
  components: {
    VehicleLocation,
    VehicleDetails,
    VehicleFeatures,
    FormStepSlider,
    VehicleCOR,
    VehicleOR,
    UserProfilePhoto,
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
    return {
      currentStep: 1,
      isSubmitting: false,
      localVehicle: { ...defaultVehicleState, ...this.initialVehicle },
      // 3. Ensure all names in this array match the registered component names exactly
      stepComponents: [
        "VehicleLocation",
        "VehicleCOR",
        "VehicleOR",
        "UserProfilePhoto",
        "DriversLicense",
        "VehicleAvailability",
        "VehicleDetails",
        "VehicleFeatures",
        "VehiclePricing",
        "VehicleSafety",
        "VehiclePhotos",
        "SubmitListing",
      ],
    };
  },
  computed: {
    currentStepComponent() {
      const index = this.currentStep - 1;
      return this.stepComponents[index] || null;
    },
  },
  methods: {
    ...mapActions(['addVehicle']),
    nextStep() {
      if (this.currentStep < this.stepComponents.length) {
        this.currentStep++;
      } else {
        this.submitForm();
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    startOver() {
      this.localVehicle = { ...defaultVehicleState };
      this.currentStep = 1;
      this.$emit("start-over");
    },
    updateLocalVehicle(updatedData) {
      this.localVehicle = { ...this.localVehicle, ...updatedData };
    },
    async submitForm() {
      this.isSubmitting = true;
      this.$emit("error", "");
      try {
        await this.addVehicle(this.localVehicle);
        this.$emit("success", "Your vehicle has been submitted!");
        this.$router.push({ name: 'OwnerVehicles' });
      } catch (error) {
        this.$emit("error", `Submission failed: ${error.message}`);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}
.form-card {
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: $shadow-medium;
  padding: 1.5rem;
}
.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>