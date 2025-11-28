<template>
  <div class="motorcycle-form-container">
    <div class="form-card">
      <FormStepSlider
        :currentStep="currentStep"
        :totalSteps="stepComponents.length"
        :assetType="localMotorcycle.assetType"
        @jump-to-step="jumpToStep"
        @start-over="startOver"
      />

      <MotorcycleDetails
        v-if="currentStep === 1"
        key="step1"
        v-model="localMotorcycle"
        @next="nextStep"
        @prev="goBack"
      />

      <VehicleLocation
        v-if="currentStep === 2"
        key="step2"
        v-model:address="localMotorcycle.location"
        :showNavigation="true"
        @next="nextStep"
        @prev="prevStep"
      />

      <VehicleAvailability
        v-if="currentStep === 3"
        key="step3"
        v-model="localMotorcycle.availability"
        :showNavigation="true"
        @next="nextStep"
        @prev="prevStep"
      />

      <VehiclePricing
        v-if="currentStep === 4"
        key="step4"
        v-model="localMotorcycle.pricing"
        :vehicleYear="localMotorcycle.year"
        :showNavigation="true"
        @next="nextStep"
        @prev="prevStep"
      />

      <VehiclePhotos
        v-if="currentStep === 5"
        key="step5"
        v-model:profilePhotoUrl="localMotorcycle.profilePhotoUrl"
        v-model:exteriorPhotos="localMotorcycle.exteriorPhotos"
        v-model:interiorPhotos="localMotorcycle.interiorPhotos"
        :showNavigation="true"
        :assetType="localMotorcycle.assetType"
        @next="nextStep"
        @prev="prevStep"
      />

      <SubmitMotorcycle
        v-if="currentStep === 6"
        key="step6"
        :motorcycle="localMotorcycle"
        :isEditMode="isEditMode"
        :busy="isSubmitting"
        @submit="submitForm"
        @prev="prevStep"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import FormStepSlider from "@/components/forms/FormStepSlider.vue";
import VehicleLocation from "@/components/forms/VehicleLocation.vue";
import VehicleAvailability from "@/components/forms/VehicleAvailability.vue";
import VehiclePricing from "@/components/forms/VehiclePricing.vue";
import VehiclePhotos from "@/components/forms/VehiclePhotos.vue";
import MotorcycleDetails from "./MotorcycleDetails.vue";
import SubmitMotorcycle from "@/components/forms/motorcyle/SubmitMotorcycle.vue";

const defaultMotorcycleState = {
  assetType: "motorcycle",
  make: "",
  model: "",
  year: null,
  licensePlate: "",
  engineDisplacement: null,
  motorcycleType: "",
  location: {
    country: "Philippines",
    region: "Region VII (Central Visayas)",
    city: "",
    barangay: "",
    latitude: null,
    longitude: null,
  },
  availability: [],
  pricing: {
    marketValue: null,
    condition: "",
    manualPrice: null,
    recommendedPrice: null,
  },
  profilePhotoUrl: "",
  exteriorPhotos: [],
  interiorPhotos: [],
  safety: { helmetProvided: false, workingLights: false, tireTreadGood: false },
};

export default {
  name: "MotorcycleFormSteps",
  components: {
    FormStepSlider,
    VehicleLocation,
    VehicleAvailability,
    VehiclePricing,
    VehiclePhotos,
    MotorcycleDetails,
    SubmitMotorcycle,
  },
  props: {
    initialVehicle: { type: Object, default: () => ({}) },
    isEditMode: { type: Boolean, default: false },
  },
  data() {
    return {
      currentStep: 1,
      isSubmitting: false, // 👈 ADD THIS VARIABLE
      localMotorcycle: this.initializeData(),
      stepComponents: [
        "MotorcycleDetails",
        "VehicleLocation",
        "VehicleAvailability",
        "VehiclePricing",
        "VehiclePhotos",
        "SubmitMotorcycle",
      ],
    };
  },
  methods: {
    ...mapActions(["addVehicle"]),

    initializeData() {
      const data = { ...defaultMotorcycleState, ...this.initialVehicle };
      // Ensure nested objects exist
      data.location = {
        ...defaultMotorcycleState.location,
        ...(this.initialVehicle.location || {}),
      };
      data.pricing = {
        ...defaultMotorcycleState.pricing,
        ...(this.initialVehicle.pricing || {}),
      };
      data.safety = {
        ...defaultMotorcycleState.safety,
        ...(this.initialVehicle.safety || {}),
      };
      data.availability = Array.isArray(this.initialVehicle.availability)
        ? this.initialVehicle.availability
        : [];
      data.exteriorPhotos = Array.isArray(this.initialVehicle.exteriorPhotos)
        ? this.initialVehicle.exteriorPhotos
        : [];
      data.interiorPhotos = Array.isArray(this.initialVehicle.interiorPhotos)
        ? this.initialVehicle.interiorPhotos
        : [];
      return data;
    },

    nextStep() {
      if (this.currentStep < this.stepComponents.length) this.currentStep++;
    },
    prevStep() {
      if (this.currentStep > 1) this.currentStep--;
    },
    jumpToStep(step) {
      if (step > 0 && step <= this.stepComponents.length)
        this.currentStep = step;
    },

    startOver() {
      this.localMotorcycle = this.initializeData();
      this.currentStep = 1;
    },
    goBack() {
      this.$router.push({ name: "OwnerVehicles" });
    },

    // --- UPDATED SUBMIT LOGIC ---
    async submitForm() {
      console.log("Submitting motorcycle...", this.localMotorcycle);

      // 1. Set Busy State
      this.isSubmitting = true;

      try {
        // 2. Call API
        await this.addVehicle(this.localMotorcycle);

        // 3. Success & Redirect
        alert("Motorcycle submitted successfully!");
        this.$router.push({ name: "OwnerVehicles" });
      } catch (error) {
        console.error("Failed to submit motorcycle:", error);
        alert("Failed to submit: " + error.message);

        // 4. Reset state ONLY on error
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.motorcycle-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}
.form-card {
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: $shadow-medium;
  padding: 1.5rem 2rem;
}
</style>
