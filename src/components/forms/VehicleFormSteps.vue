<template>
  <div class="form-container">
    <div class="form-card">
      <form
        @submit.prevent="currentStep === 13 ? submitForm() : null"
        class="vehicle-form"
      >
        <!-- The step slider component, listening for the 'start-over' event -->
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
            v-model:payoutDetails="localVehicle.payoutDetails"
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
// Import all child components
import VehicleLocation from "@/components/forms/VehicleLocation.vue";
import VehicleDetails from "@/components/forms/VehicleDetails.vue";
import VehicleFeatures from "@/components/forms/VehicleFeatures.vue";
import FormStepSlider from "@/components/forms/FormStepSlider.vue";
import VehicleCOR from "@/components/forms/VehicleCOR.vue";
import VehicleOR from "@/components/forms/VehicleOR.vue";
import UserProfilePhoto from "@/components/forms/UserProfilePhoto.vue";
import UserMobileAndQR from "@/components/forms/UserMobileAndQR.vue";
import DriversLicense from "@/components/forms/DriversLicense.vue";
import VehicleAvailability from "@/components/forms/VehicleAvailability.vue";
import VehiclePricing from "@/components/forms/VehiclePricing.vue";
import VehicleSafety from "@/components/forms/VehicleSafety.vue";
import VehiclePhotos from "@/components/forms/VehiclePhotos.vue";
import SubmitListing from "@/components/forms/SubmitListing.vue";
import { getAuth } from "firebase/auth";
import { uploadImageToFirebase } from "@/views/services/firebaseStorageService";
import { getApp } from "firebase/app";

// Helper function to convert base64 to a Blob
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// A reusable default vehicle object to reset the form state.
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
  payoutDetails: {
    mobileNumber: "",
    qrCodeUrl: "",
  },
  availability: {
    startDate: "",
    endDate: "",
  },
  make: "",
  model: "",
  year: null,
  seats: null, // The key for seating capacity on the front end
  vehicleType: "",
  transmission: "",
  fuelType: "",
  features: [], // Added the features property here
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
  // New photo properties
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
    return {
      currentStep: 1,
      localVehicle: { ...defaultVehicleState, ...this.initialVehicle },
      stepComponents: [
        "VehicleLocation",
        "VehicleCOR",
        "VehicleOR",
        "UserProfilePhoto",
        "DriversLicense",
        "UserMobileAndQR",
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
      return index >= 0 && index < this.stepComponents.length
        ? this.stepComponents[index]
        : null;
    },
  },
  created() {
    if (this.isEditMode) {
      this.currentStep = 13;
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
        this.$emit("error", "Please fill in all required fields to proceed.");
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    /**
     * Resets the entire form to its initial state.
     * The parent component must also listen to the 'start-over' event and
     * update its own state to fully reset the form.
     */
    startOver() {
      this.localVehicle = { ...defaultVehicleState };
      this.currentStep = 1;
      this.$emit("start-over");
    },
    updateLocalVehicle(updatedData) {
      this.localVehicle = { ...this.localVehicle, ...updatedData };
    },
    /**
     * Performs a check for the current step's required fields.
     */
    validateStep() {
      this.$emit("error", ""); // Clear any previous errors
      switch (this.currentStep) {
        case 1:
          return (
            this.localVehicle.location.city &&
            this.localVehicle.location.barangay
          );
        case 2:
          return (
            this.localVehicle.cor.crNumber &&
            this.localVehicle.cor.plateNumber &&
            this.localVehicle.cor.crImageUrl
          );
        case 3:
          return (
            this.localVehicle.or.orNumber && this.localVehicle.or.orImageUrl
          );
        case 4:
          return this.localVehicle.userProfileImageUrl;
        case 5:
          return (
            this.localVehicle.driversLicense.number &&
            this.localVehicle.driversLicense.imageUrl
          );
        case 6:
          return (
            this.localVehicle.payoutDetails.mobileNumber &&
            this.localVehicle.payoutDetails.qrCodeUrl
          );
        case 7:
          return (
            this.localVehicle.availability.startDate &&
            this.localVehicle.availability.endDate
          );
        case 8:
          // Ensure all fields in this step are filled, including `seats`
          return (
            this.localVehicle.make &&
            this.localVehicle.model &&
            this.localVehicle.year &&
            typeof this.localVehicle.seats === "number" &&
            this.localVehicle.seats > 0 &&
            this.localVehicle.vehicleType &&
            this.localVehicle.transmission &&
            this.localVehicle.fuelType
          );
        case 9:
          return this.localVehicle.features.length > 0;
        case 10:
          return (
            this.localVehicle.pricing.marketValue > 0 &&
            this.localVehicle.pricing.condition &&
            this.localVehicle.pricing.manualPrice > 0
          );
        case 11:
          return (
            this.localVehicle.safety.tiresChecked &&
            this.localVehicle.safety.brakesChecked &&
            this.localVehicle.safety.lightsChecked &&
            this.localVehicle.safety.wipersChecked &&
            this.localVehicle.safety.emergencyToolsChecked &&
            this.localVehicle.safety.registrationChecked &&
            this.localVehicle.safety.cleanlinessChecked
          );
        case 12:
          return (
            this.localVehicle.profilePhotoUrl &&
            this.localVehicle.exteriorPhotos.length > 0 &&
            this.localVehicle.interiorPhotos.length > 0
          );
        case 13:
          return true; // Final step, always allow moving forward.
        default:
          return false;
      }
    },
    /**
     * Validates all required fields across all steps before final submission.
     * @returns {string | null} An error message if validation fails, otherwise null.
     */
    validateAllFields() {
      if (
        !this.localVehicle.location.city ||
        !this.localVehicle.location.barangay
      ) {
        return "Please complete the Vehicle Location step.";
      }
      if (
        !this.localVehicle.cor.crNumber ||
        !this.localVehicle.cor.plateNumber ||
        !this.localVehicle.cor.crImageUrl
      ) {
        return "Please complete the Vehicle COR step.";
      }
      if (!this.localVehicle.or.orNumber || !this.localVehicle.or.orImageUrl) {
        return "Please complete the Vehicle OR step.";
      }
      if (!this.localVehicle.userProfileImageUrl) {
        return "Please upload a user profile photo.";
      }
      if (
        !this.localVehicle.driversLicense.number ||
        !this.localVehicle.driversLicense.imageUrl
      ) {
        return "Please complete the Drivers License step.";
      }
      if (
        !this.localVehicle.payoutDetails.mobileNumber ||
        !this.localVehicle.payoutDetails.qrCodeUrl
      ) {
        return "Please complete the Payout Details step.";
      }
      if (
        !this.localVehicle.availability.startDate ||
        !this.localVehicle.availability.endDate
      ) {
        return "Please complete the Vehicle Availability step.";
      }
      // Added a more robust check to ensure `seats` is a valid number.
      if (
        !this.localVehicle.make ||
        !this.localVehicle.model ||
        !this.localVehicle.year ||
        typeof this.localVehicle.seats !== "number" ||
        this.localVehicle.seats <= 0 ||
        !this.localVehicle.vehicleType ||
        !this.localVehicle.transmission ||
        !this.localVehicle.fuelType
      ) {
        return "Please complete the Vehicle Details step.";
      }
      if (
        !this.localVehicle.features ||
        this.localVehicle.features.length === 0
      ) {
        return "Please select at least one feature for your vehicle.";
      }
      if (
        !this.localVehicle.pricing.marketValue ||
        !this.localVehicle.pricing.condition ||
        !this.localVehicle.pricing.manualPrice
      ) {
        return "Please complete the Vehicle Pricing step.";
      }
      if (
        !this.localVehicle.safety.tiresChecked ||
        !this.localVehicle.safety.brakesChecked ||
        !this.localVehicle.safety.lightsChecked ||
        !this.localVehicle.safety.wipersChecked ||
        !this.localVehicle.safety.emergencyToolsChecked ||
        !this.localVehicle.safety.registrationChecked ||
        !this.localVehicle.safety.cleanlinessChecked
      ) {
        return "Please complete all safety checks.";
      }
      if (
        !this.localVehicle.profilePhotoUrl ||
        this.localVehicle.exteriorPhotos.length === 0 ||
        this.localVehicle.interiorPhotos.length === 0
      ) {
        return "Please upload at least one photo for each category.";
      }
      return null;
    },
    async submitUserProfileData() {
      const auth = getAuth();
      const user = auth.currentUser;
      const firebaseApp = getApp();

      if (!user) {
        throw new Error("User not authenticated for profile submission.");
      }

      const userAuthToken = await user.getIdToken();
      const apiUrl = "http://localhost:5001/api/users";

      // Helper function to convert base64 to a Blob
      const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      // Helper function to check if data is a base64 URL and upload if so
      const uploadIfNeeded = async (imageData, path) => {
        if (
          typeof imageData === "string" &&
          imageData.startsWith("data:image")
        ) {
          const blob = dataURLtoBlob(imageData);
          const url = await uploadImageToFirebase(blob, path, firebaseApp);
          return url;
        }
        return imageData; // Already a URL or other valid data
      };

      // Upload user-specific documents (e.g., license and profile photo)
      const userProfileImageUrl = await uploadIfNeeded(
        this.localVehicle.userProfileImageUrl,
        `users/${user.uid}/profile.png`
      );
      const driversLicenseImageUrl = await uploadIfNeeded(
        this.localVehicle.driversLicense?.imageUrl,
        `users/${user.uid}/drivers_license.png`
      );
      const qrCodeUrl = await uploadIfNeeded(
        this.localVehicle.payoutDetails?.qrCodeUrl,
        `users/${user.uid}/payout_qr.png`
      );

      // Create the payload for the user endpoint
      const userPayload = {
        userId: user.uid,
        userProfileImageUrl: userProfileImageUrl,
        driversLicense: {
          ...this.localVehicle.driversLicense,
          imageUrl: driversLicenseImageUrl,
        },
        payoutDetails: { ...this.localVehicle.payoutDetails, qrCodeUrl },
      };

      console.log(
        "Final User Payload before sending:",
        JSON.stringify(userPayload, null, 2)
      );

      // Send the user payload to the new user API endpoint
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAuthToken}`,
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("User profile successfully updated:", data);
    },

    async submitForm() {
      this.$emit("error", "");
      console.log("Attempting to submit form with data:", this.localVehicle);

      // Perform the final, comprehensive validation before proceeding
      const validationError = this.validateAllFields();
      if (validationError) {
        this.$emit("error", `Submission failed: ${validationError}`);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        this.$emit("error", "You must be logged in to submit a listing.");
        return;
      }

      const userAuthToken = await user.getIdToken();
      const apiUrl = "http://localhost:5001/api/vehicles";
      const vehicleId = this.localVehicle.vehicleId || crypto.randomUUID();

      // Get the Firebase app instance
      const firebaseApp = getApp();

      try {
        this.$emit("error", "Submitting user data...");
        // First, submit the user profile data and wait for it to complete.
        await this.submitUserProfileData();

        this.$emit("error", "Uploading vehicle images...");

        // Helper function to check if data is a base64 URL and upload if so
        const uploadIfNeeded = async (imageData, path) => {
          if (
            typeof imageData === "string" &&
            imageData.startsWith("data:image")
          ) {
            const blob = dataURLtoBlob(imageData);
            const url = await uploadImageToFirebase(blob, path, firebaseApp);
            return url;
          }
          return imageData; // Already a URL or other valid data
        };

        // Upload vehicle-specific documents.
        const crImageUrl = await uploadIfNeeded(
          this.localVehicle.cor?.crImageUrl,
          `vehicles/${vehicleId}/cor.png`
        );
        const orImageUrl = await uploadIfNeeded(
          this.localVehicle.or?.orImageUrl,
          `vehicles/${vehicleId}/or.png`
        );

        // Handle the new photo properties
        const profilePhotoUrl = await uploadIfNeeded(
          this.localVehicle.profilePhotoUrl,
          `vehicles/${vehicleId}/profile.png`
        );

        const uploadedExteriorPhotos = await Promise.all(
          (this.localVehicle.exteriorPhotos || []).map(async (photoData) => {
            const photoPath = `vehicles/${vehicleId}/exterior/${crypto.randomUUID()}.png`;
            return await uploadIfNeeded(photoData, photoPath);
          })
        );

        const uploadedInteriorPhotos = await Promise.all(
          (this.localVehicle.interiorPhotos || []).map(async (photoData) => {
            const photoPath = `vehicles/${vehicleId}/interior/${crypto.randomUUID()}.png`;
            return await uploadIfNeeded(photoData, photoPath);
          })
        );

        // Create the final vehicle payload with the new URLs
        const payload = {
          ownerId: user.uid,
          vehicleId,
          make: this.localVehicle.make,
          model: this.localVehicle.model,
          year: this.localVehicle.year,
          seatingCapacity: this.localVehicle.seats, // Corrected field name for the database
          rentalPricePerDay: this.localVehicle.pricing.manualPrice,
          location: this.localVehicle.location,
          availability: this.localVehicle.availability,
          vehicleType: this.localVehicle.vehicleType,
          transmission: this.localVehicle.transmission,
          fuelType: this.localVehicle.fuelType,
          features: this.localVehicle.features, // Added the features property to the payload
          pricing: {
            marketValue: this.localVehicle.pricing.marketValue,
            condition: this.localVehicle.pricing.condition,
            manualPrice: this.localVehicle.pricing.manualPrice,
            recommendedPrice: this.localVehicle.pricing.recommendedPrice,
          },
          safety: this.localVehicle.safety,
          cor: {
            crNumber: this.localVehicle.cor.crNumber,
            plateNumber: this.localVehicle.cor.plateNumber,
            dateIssued: this.localVehicle.cor.dateIssued,
            crImageUrl,
          },
          or: {
            orNumber: this.localVehicle.or.orNumber,
            dateIssued: this.localVehicle.or.dateIssued,
            orImageUrl,
          },
          // Assign the new photo properties to the payload
          profilePhotoUrl,
          exteriorPhotos: uploadedExteriorPhotos,
          interiorPhotos: uploadedInteriorPhotos,
        };

        console.log(
          "Final Vehicle Payload before sending:",
          JSON.stringify(payload, null, 2)
        );

        // Send the cleaned vehicle payload to the server
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAuthToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! Status: ${response.status}, Message: ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Vehicle successfully added:", data);
        this.$emit("success", "Your vehicle has been submitted for approval!");
      } catch (error) {
        console.error("Error submitting vehicle:", error);
        this.$emit("error", `Submission failed: ${error.message}`);
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

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.form-card {
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
