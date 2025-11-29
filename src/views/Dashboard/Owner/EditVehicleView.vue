<template>
  <div class="edit-vehicle-container">
    <h1 class="page-title">Edit Vehicle Listing</h1>

    <div v-if="loading" class="loading-state">
      <p>Loading vehicle details...</p>
      <!-- Add a spinner or visual loader if desired -->
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">Failed to load vehicle details: {{ error }}</p>
      <button @click="fetchVehicle" class="button secondary-button">
        Retry
      </button>
      <button @click="goBack" class="button cancel-button">Go Back</button>
    </div>

    <div v-else-if="vehicleData" class="edit-form-wrapper">
      <!-- Pass the fetched vehicle data down and listen for events -->
      <EditVehicleSections
        :vehicle="vehicleData"
        @update:vehicle="handleVehicleUpdate"
        @save="handleSaveChanges"
        @cancel="goBack"
      />
    </div>

    <div v-else class="error-state">
      <p class="error-message">Vehicle data could not be loaded or found.</p>
      <button @click="goBack" class="button cancel-button">Go Back</button>
    </div>

    <!-- Optional: Add a success/error message display area for save actions -->
    <div
      v-if="saveMessage"
      :class="['save-status', { success: !saveError, error: saveError }]"
    >
      {{ saveMessage }}
    </div>
  </div>
</template>

<script>
// Removed unused 'computed' import
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex"; // Import useStore for Vuex Composition API
import EditVehicleSections from "@/components/forms/EditVehicleSections.vue";

export default {
  name: "EditVehicleView",
  components: {
    EditVehicleSections,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore(); // Get Vuex store instance

    const vehicleId = ref(route.params.vehicleId);
    const vehicleData = ref(null); // Holds the fetched vehicle data
    const loading = ref(true);
    const error = ref(null);
    const saveMessage = ref("");
    const saveError = ref(false);

    // --- Data Fetching ---
    const fetchVehicle = async () => {
      loading.value = true;
      error.value = null;
      saveMessage.value = ""; // Clear previous save messages
      saveError.value = false;
      try {
        const fetchedVehicle = await store.dispatch(
          "getVehicleById",
          vehicleId.value
        );

        // Convert availability dates received from backend (ISO strings)
        // into the 'YYYY-MM-DD' format expected by the VehicleAvailability component
        if (
          fetchedVehicle.availability &&
          Array.isArray(fetchedVehicle.availability)
        ) {
          fetchedVehicle.availability = fetchedVehicle.availability
            .map((range) => {
              const start = range.start
                ? new Date(range.start).toISOString().split("T")[0]
                : null;
              const end = range.end
                ? new Date(range.end).toISOString().split("T")[0]
                : null;
              return { start, end };
            })
            .filter((r) => r.start && r.end); // Filter invalid ranges
        } else {
          fetchedVehicle.availability = []; // Ensure it's always an array
        }

        // Ensure features is an object
        if (
          typeof fetchedVehicle.features !== "object" ||
          fetchedVehicle.features === null
        ) {
          fetchedVehicle.features = {}; // Default to empty object if missing/invalid
        }

        // console.log('[EditVehicleView] Fetched and processed vehicle data:', JSON.stringify(fetchedVehicle)); // Removed debug log
        vehicleData.value = fetchedVehicle;
      } catch (err) {
        console.error("Error fetching vehicle:", err); // Keep error log
        error.value = err.message || "Could not retrieve vehicle data.";
        vehicleData.value = null; // Clear data on error
      } finally {
        loading.value = false;
      }
    };

    // --- Event Handlers ---

    // Keep local data synced if needed before save
    // Prefix parameter with underscore to satisfy ESLint rule for unused variables
    const handleVehicleUpdate = (_updatedVehicleData) => {
      // This handler might not be strictly necessary with the new EditVehicleSections setup
      // as we only rely on the @save event, but keep it for potential future use or debugging.
      // console.log('[EditVehicleView] Received update:vehicle event (data kept internally in child until save)'); // Removed debug log
      // The actual update logic is commented out as it might cause issues if EditVehicleSections manages its own state fully
      // if (JSON.stringify(updatedVehicleData) !== JSON.stringify(vehicleData.value)) {
      //      vehicleData.value = updatedVehicleData; // Be cautious with uncommenting this
      // }
    };

    // Triggered when "Save Changes" is clicked in EditVehicleSections
    const handleSaveChanges = async (finalVehicleDataFromChild) => {
      saveMessage.value = "Saving...";
      saveError.value = false;
      // console.log('[EditVehicleView] handleSaveChanges received payload:', JSON.stringify(finalVehicleDataFromChild)); // Removed debug log

      try {
        await store.dispatch("updateVehicle", {
          id: vehicleId.value,
          updates: finalVehicleDataFromChild,
        });

        saveMessage.value = "Vehicle updated successfully!";
        saveError.value = false;
        // Fetch data again after save to reflect changes immediately
        await fetchVehicle();
      } catch (err) {
        console.error(
          "Error updating vehicle:",
          err.response?.data || err.message
        ); // Keep error log
        saveMessage.value = `Failed to update vehicle: ${err.response?.data?.message || err.message || "Please try again."}`;
        saveError.value = true;
      }
    };

    const goBack = () => {
      router.push({ name: "OwnerVehicles" });
    };

    // --- Lifecycle Hook ---
    onMounted(() => {
      if (vehicleId.value) {
        fetchVehicle();
      } else {
        error.value = "No vehicle ID provided in the URL.";
        loading.value = false;
      }
    });

    return {
      vehicleData,
      loading,
      error,
      fetchVehicle,
      handleVehicleUpdate,
      handleSaveChanges,
      goBack,
      saveMessage,
      saveError,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

/* --- Main Container --- */
.edit-vehicle-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem; /* Reduced padding for mobile */
  box-sizing: border-box;

  @media (min-width: 768px) {
    margin: 2rem auto;
    padding: 2rem;
  }
}

/* --- Typography --- */
.page-title {
  font-size: 1.5rem; /* Smaller size on mobile */
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
}

/* --- Status States (Loading/Error) --- */
.loading-state,
.error-state {
  text-align: center;
  padding: 2rem 1rem; /* Tighter padding on mobile */
  background-color: $background-light;
  border-radius: $border-radius-lg;
  border: 1px dashed $border-color;
  margin-top: 1.5rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
    margin-top: 2rem;
  }

  p {
    font-size: 1rem;
    color: $text-color-medium;
    margin-bottom: 1rem;

    @media (min-width: 768px) {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
  }
}

.error-state p.error-message {
  color: $admin-color;
  font-weight: 600;
}

.edit-form-wrapper {
  margin-top: 1rem;
}

/* --- Status Messages --- */
.save-status {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  border-radius: $border-radius-md;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;

  &.success {
    background-color: lighten($secondary-color, 40%);
    color: darken($secondary-color, 15%);
    border: 1px solid lighten($secondary-color, 20%);
  }

  &.error {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }
}

/* --- Buttons --- */
.button {
  padding: 0.75rem 1.25rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Mobile: Add slight margin for wrapping */
  margin: 0.25rem;

  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    margin-left: 0.5rem;
    margin-right: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
}

.primary-button {
  background-color: $primary-color;
  color: white;
  border-color: $primary-color;
  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: transparent;
  color: $text-color-medium;
  border-color: $border-color;
  &:hover {
    background-color: $background-light;
    color: $text-color-dark;
    border-color: $border-color;
  }
}

.cancel-button {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
  &:hover {
    background-color: darken(#ef4444, 10%);
  }
}
</style>
