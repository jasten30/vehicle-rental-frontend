<template>
  <div class="form-container">
    <div class="form-card">
      <form
        @submit.prevent="currentStep === 9 ? submitForm() : null"
        class="vehicle-form"
      >
        <FormStepSlider 
          :currentStep="currentStep" 
          :totalSteps="stepComponents.length" 
          @start-over="startOver" 
        />

        <VehicleLocation
          v-if="currentStep === 1"
          key="step1"
          v-model:address="localVehicle.location"
          @next="nextStep"
          @cancel="handleCancel"
        />

        <VehicleCOR
          v-if="currentStep === 2"
          key="step2"
          v-model="localVehicle.cor"
          @next="nextStep"
          @prev="prevStep"
        />

        <VehicleOR
          v-if="currentStep === 3"
          key="step3"
          v-model="localVehicle.or"
          @next="nextStep"
          @prev="prevStep"
        />
        
        <VehicleDetails
          v-if="currentStep === 4"
          key="step4"
          :modelValue="localVehicle"
          @update:modelValue="updateLocalVehicle"
          @next="nextStep"
          @prev="prevStep"
        />
        
        <VehicleFeatures
          v-if="currentStep === 5"
          key="step5"
          v-model="localVehicle.features"
          @next="nextStep"
          @prev="prevStep"
        />

        <VehiclePricing
          v-if="currentStep === 6"
          key="step6"
          v-model="localVehicle.pricing"
          :vehicleYear="localVehicle.year"
          @next="nextStep"
          @prev="prevStep"
        />

        <VehicleSafety
          v-if="currentStep === 7"
          key="step7"
          v-model="localVehicle.safety"
          @next="nextStep"
          @prev="prevStep"
        />

        <VehiclePhotos
          v-if="currentStep === 8"
          key="step8"
          v-model:profilePhotoUrl="localVehicle.profilePhotoUrl"
          v-model:exteriorPhotos="localVehicle.exteriorPhotos"
          v-model:interiorPhotos="localVehicle.interiorPhotos"
          @next="nextStep"
          @prev="prevStep"
        />

        <SubmitListing
          v-if="currentStep === 9"
          key="step9"
          :vehicle="localVehicle"
          :is-edit-mode="isEditMode"
          @submit="submitForm"
          @prev="prevStep"
          @start-over="startOver"
        />
        
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VehicleLocation from "@/components/forms/VehicleLocation.vue";
import VehicleDetails from "@/components/forms/VehicleDetails.vue";
import VehicleFeatures from "@/components/forms/VehicleFeatures.vue";
import FormStepSlider from "@/components/forms/FormStepSlider.vue";
import VehicleCOR from "@/components/forms/VehicleCOR.vue";
import VehicleOR from "@/components/forms/VehicleOR.vue";
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
    corImage: "",
  },
  or: {
    orNumber: "",
    dateIssued: "",
    orImageUrl: "",
    orImage: "",
  },
  make: "",
  model: "",
  year: null,
  seats: null,
  vehicleType: "",
  transmission: "",
  fuelType: "",
  features: {
    seatbeltsAndAirbags: false,
    abs: false,
    esc: false,
    backupCamera: false,
    bsm: false,
    tpms: false,
    fcw: false,
    bluetooth: false,
    usbPort: false,
    appleCarPlay: false,
    androidAuto: false,
    gps: false,
    keylessEntry: false,
    heatedSeats: false,
    sunroof: false,
    childSeat: false,
    bikeRack: false,
    roofBox: false,
    petFriendly: false,
  },
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
  components: {
    VehicleLocation,
    VehicleDetails,
    VehicleFeatures,
    FormStepSlider,
    VehicleCOR,
    VehicleOR,
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
  emits: ["success", "error", "start-over", "cancel"],

  data() {
    const initial = this.initialVehicle || {};
    // Start with defaults, then overwrite with any initial data
    const local = { ...defaultVehicleState, ...initial };

    // Safely merge nested objects to avoid null pointers
    local.location = { ...defaultVehicleState.location, ...(initial.location || {}) };
    local.cor = { ...defaultVehicleState.cor, ...(initial.cor || {}) };
    local.or = { ...defaultVehicleState.or, ...(initial.or || {}) };
    local.pricing = { ...defaultVehicleState.pricing, ...(initial.pricing || {}) };
    local.safety = { ...defaultVehicleState.safety, ...(initial.safety || {}) };
    local.features = { ...defaultVehicleState.features, ...(initial.features || {}) };

    local.exteriorPhotos = initial.exteriorPhotos || [];
    local.interiorPhotos = initial.interiorPhotos || [];
    local.profilePhotoUrl = initial.profilePhotoUrl || "";

    return {
      currentStep: 1,
      isSubmitting: false,
      localVehicle: local,
      stepComponents: [
        "VehicleLocation",
        "VehicleCOR",
        "VehicleOR",
        "VehicleDetails",
        "VehicleFeatures",
        "VehiclePricing",
        "VehicleSafety",
        "VehiclePhotos",
        "SubmitListing",
      ],
    };
  },
  methods: {
    ...mapActions(['addVehicle']),
    
    // --- FIX: Direct Redirect Handler ---
    handleCancel() {
      if (confirm("Are you sure you want to cancel? Any unsaved progress will be lost.")) {
        this.$router.push({ name: 'OwnerVehicles' });
      }
    },

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
        // Sync orImageUrl to orImage for SubmitListing consistency
        if (this.localVehicle.or.orImageUrl) {
            this.localVehicle.or.orImage = this.localVehicle.or.orImageUrl;
        }

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