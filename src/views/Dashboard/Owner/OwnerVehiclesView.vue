<template>
  <div class="owner-vehicles-container">
    <h2 class="section-title">My Listings</h2>

    <div v-if="isSuspended" class="suspension-banner">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>
        <strong>Account Suspended:</strong> You cannot list new vehicles at this
        time. You may still manage or remove your existing listings.
      </span>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="loading" key="loading" class="loading-message">
        <p>Loading your vehicle listings...</p>
        <div class="spinner"></div>
      </div>

      <div
        v-else-if="errorMessage"
        key="error"
        class="error-message error-card"
      >
        <p>{{ errorMessage }}</p>
        <button @click="loadPageData" class="button primary-button">
          Retry Load Vehicles
        </button>
      </div>

      <div
        v-else-if="!vehicles || vehicles.length === 0"
        key="empty"
        class="no-vehicles-message empty-card"
      >
        <i class="bi bi-car-front-fill icon-large"></i>
        <div class="message-text">
          You haven't listed any vehicles yet. Let's get your first asset
          online!
        </div>

        <button
          @click="openChoiceModal"
          class="button primary-button"
          :disabled="isSuspended"
          :title="isSuspended ? 'Account suspended' : 'Add Listing'"
        >
          <span v-if="isSuspended">
            <i class="bi bi-slash-circle"></i> Listing Disabled
          </span>
          <span v-else>Add New Listing</span>
        </button>
      </div>

      <div v-else key="list" class="vehicle-list-wrapper">
        <transition-group name="list-fade" tag="div" class="vehicle-list">
          <div
            v-for="(vehicle, index) in vehicles"
            :key="vehicle.id"
            class="vehicle-card"
            :style="{ '--i': index }"
          >
            <div class="image-wrapper">
              <img
                :src="getVehicleImageUrl(vehicle)"
                :alt="`${vehicle.make} ${vehicle.model}`"
                class="vehicle-image"
                @error="
                  $event.target.src =
                    'https://placehold.co/400x200/e2e8f0/666666?text=No+Image'
                "
              />
              <span
                :class="[
                  'status-badge',
                  vehicle.status ? vehicle.status.toLowerCase() : 'pending',
                ]"
              >
                {{ vehicle.status || "Draft" }}
              </span>
            </div>

            <div class="vehicle-details">
              <h3 class="vehicle-title">
                {{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})
              </h3>
              <p class="detail-row">
                <i class="bi bi-cash"></i>
                <strong>Rate:</strong> ₱{{
                  vehicle.rentalPricePerDay
                    ? vehicle.rentalPricePerDay.toLocaleString()
                    : "N/A"
                }}/day
              </p>
              <p class="detail-row">
                <i class="bi bi-geo-alt-fill"></i>
                <strong>Location:</strong>
                {{ formatLocation(vehicle.location) }}
              </p>
            </div>

            <div class="vehicle-actions">
              <button
                @click="editVehicle(vehicle.id)"
                class="button secondary-button icon-button"
                title="Edit Listing"
              >
                <i class="bi bi-pencil-square"></i> Edit
              </button>
              <button
                @click="deleteVehicle(vehicle.id)"
                class="button cancel-button icon-button"
                title="Delete Listing"
              >
                <i class="bi bi-trash-fill"></i> Delete
              </button>
            </div>
          </div>
        </transition-group>

        <button
          @click="openChoiceModal"
          class="button primary-button add-new-button"
          :disabled="isSuspended"
          :title="isSuspended ? 'Account suspended' : 'Add Listing'"
        >
          <i v-if="!isSuspended" class="bi bi-plus-circle"></i>
          {{ isSuspended ? "Adding Disabled" : "Add New Listing" }}
        </button>
      </div>
    </transition>

    <VehicleTypeChoiceModal
      :show="isChoiceModalVisible"
      @close="isChoiceModalVisible = false"
      @navigate="handleTypeChoice"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { DateTime } from "luxon";
import VehicleTypeChoiceModal from "@/components/modals/VehicleTypeChoiceModal.vue";

export default {
  name: "OwnerVehiclesView",
  components: {
    VehicleTypeChoiceModal,
  },
  data() {
    return {
      loading: true,
      errorMessage: null,
      vehicles: [],
      isChoiceModalVisible: false,
    };
  },
  computed: {
    ...mapGetters(["user"]),

    // We need bookings to check if a vehicle is "On Trip" before deleting
    ...mapState("owner", {
      ownerBookings: (state) => state.ownerBookings || [],
    }),

    isSuspended() {
      return this.user?.isSuspended === true;
    },
  },
  created() {
    this.loadPageData();
  },
  methods: {
    // 1. ALIAS THE DELETE ACTION (Fixes the infinite loop crash)
    ...mapActions({
      getVehiclesByOwner: "getVehiclesByOwner",
      deleteVehicleAction: "deleteVehicle", // <--- Renamed to avoid conflict
      fetchUserProfile: "fetchUserProfile",
    }),
    // Map the booking action to check for active trips
    ...mapActions("owner", ["fetchOwnerBookings"]),

    async loadPageData() {
      this.loading = true;
      this.errorMessage = null;
      try {
        await Promise.all([
          this.fetchUserProfile(), // 1. Check suspension status
          this.getVehiclesByOwner(), // 2. Get vehicles
          this.fetchOwnerBookings(), // 3. Get bookings (for safety check)
        ]).then((results) => {
          // results[1] is the output of getVehiclesByOwner
          this.vehicles = results[1];
        });
      } catch (error) {
        console.error("[OwnerVehiclesView] Error fetching data:", error);
        this.errorMessage =
          "Failed to load your vehicle listings. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    openChoiceModal() {
      if (this.isSuspended) {
        alert("Your account is suspended. You cannot list new vehicles.");
        return;
      }
      this.isChoiceModalVisible = true;
    },

    handleTypeChoice(routeName) {
      this.isChoiceModalVisible = false;
      this.$router.push({ name: routeName });
    },

    editVehicle(vehicleId) {
      this.$router.push({
        name: "EditVehicle",
        params: { vehicleId: vehicleId },
      });
    },

    // --- UPDATED DELETE LOGIC ---
    async deleteVehicle(vehicleId) {
      // 1. SAFEGUARD: Check if vehicle is currently on a trip
      const hasActiveTrip = this.ownerBookings.some((b) => {
        if (b.vehicleId !== vehicleId) return false; // Ignore other vehicles

        // Check if status implies the car is out or committed
        const activeStatuses = [
          "confirmed",
          "active",
          "pending_payment",
          "downpayment_verified",
        ];
        if (!activeStatuses.includes(b.paymentStatus)) return false;

        // Check Date Overlap (Is it happening today or in future?)
        const today = DateTime.now().startOf("day");
        const end =
          b.endDate && b.endDate.seconds
            ? DateTime.fromSeconds(b.endDate.seconds).startOf("day")
            : DateTime.fromISO(b.endDate).startOf("day");

        // If the booking hasn't ended yet, block delete
        return end >= today;
      });

      if (hasActiveTrip) {
        alert(
          "Unable to delete: This vehicle has active or upcoming bookings. Please complete or cancel them first."
        );
        return;
      }

      // 2. CONFIRMATION
      if (
        confirm(
          "Are you sure you want to permanently delete this vehicle? This cannot be undone."
        )
      ) {
        try {
          // 3. CALL THE ALIASED ACTION
          await this.deleteVehicleAction(vehicleId);

          // 4. REFRESH
          const updatedList = await this.getVehiclesByOwner();
          this.vehicles = updatedList;

          alert("Vehicle deleted successfully.");
        } catch (error) {
          console.error(error);
          alert("Failed to delete vehicle. Please check console for details.");
        }
      }
    },

    // Helpers
    getVehicleImageUrl(vehicle) {
      if (vehicle.profilePhotoUrl) return vehicle.profilePhotoUrl;
      if (vehicle.exteriorPhotos && vehicle.exteriorPhotos.length > 0) {
        return vehicle.exteriorPhotos[0];
      }
      return "https://placehold.co/300x200/e2e8f0/666666?text=No+Image";
    },
    formatLocation(location) {
      if (location) {
        if (location.barangay && location.city) {
          return `${location.barangay}, ${location.city}`;
        }
        if (location.city) return location.city;
      }
      if (typeof location === "string") return location;
      return "Location not set";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/styles/variables.scss";

.owner-vehicles-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.section-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: $text-color-dark;
  margin-bottom: 2rem;
  text-align: center;
}

/* Suspension Banner */
.suspension-banner {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  font-weight: 600;

  i {
    font-size: 1.2rem;
  }
}

.empty-card,
.error-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.loading-message {
  padding: 3rem;
  text-align: center;
  font-size: 1.2rem;
  color: $text-color-medium;
}
.error-message {
  color: $admin-color;
  font-weight: 600;
  border-radius: $border-radius-md;
}
.no-vehicles-message {
  .icon-large {
    font-size: 4rem;
    color: $primary-color;
  }
  .message-text {
    font-size: 1.1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
    max-width: 400px;
    text-align: center;
  }
}
.spinner {
  border: 4px solid $border-color-light;
  border-top: 4px solid $primary-color;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-top: 1rem;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.vehicle-list-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.vehicle-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
  position: relative;
}
.vehicle-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-large;
  }
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}
.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-bottom: 1px solid #e0e0e0;
}
.status-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: $border-radius-pill;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;

  &.active {
    background-color: $secondary-color;
  }
  &.pending {
    background-color: #f59e0b;
  }
  &.draft {
    background-color: $text-color-medium;
  }
}
.vehicle-details {
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  .vehicle-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: $text-color-dark;
    margin: 0 0 1rem 0;
    line-height: 1.3;
  }
  .detail-row {
    font-size: 0.95rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;

    i {
      font-size: 1rem;
      margin-right: 0.5rem;
      color: $primary-color;
    }
    strong {
      font-weight: 600;
      color: $text-color-medium;
      margin-right: 0.25rem;
    }
  }
}
.vehicle-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid $border-color-light;
  background-color: #f9fafb;
}
.button {
  padding: 0.75rem 1.25rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;

  &.icon-button i {
    margin-right: 0.5rem;
  }

  /* Disabled Style */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #e5e7eb !important;
    color: #9ca3af !important;
    border-color: #d1d5db !important;
    transform: none !important;
    box-shadow: none !important;
  }
}
.primary-button {
  background-color: $primary-color;
  color: white;
  border-color: $primary-color;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
    transform: translateY(-1px);
  }
}
.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border-color: $primary-color;
  &:hover:not(:disabled) {
    background-color: lighten($primary-color, 45%);
    transform: translateY(-1px);
  }
}
.cancel-button {
  background-color: $admin-color;
  color: white;
  border-color: $admin-color;
  &:hover:not(:disabled) {
    background-color: darken($admin-color, 10%);
    transform: translateY(-1px);
  }
}
.add-new-button {
  margin-top: 2.5rem;
  width: fit-content;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  i {
    margin-right: 0.5rem;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.list-fade-enter-active {
  transition: all 0.5s ease-out;
  transition-delay: calc(0.1s * var(--i));
}
.list-fade-leave-active {
  transition: all 0.5s ease-in;
  position: absolute;
  width: 100%;
}
.list-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.98);
}
.vehicle-list {
  position: relative;
}
</style>
