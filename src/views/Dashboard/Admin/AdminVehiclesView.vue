<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h2 class="section-title">Manage Vehicles</h2>
        <p class="section-subtitle">View, edit, or remove vehicle listings.</p>
      </div>
      <button @click="goToAddVehicle" class="button primary-btn header-action">
        <i class="bi bi-plus-lg"></i> Add Vehicle
      </button>
    </header>

    <div class="control-bar">
      <div class="tabs-wrapper">
        <button
          v-for="tab in ['all', 'available', 'on trip', 'pending', 'completed']"
          :key="tab"
          class="filter-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>

      <div class="search-wrapper">
        <i class="bi bi-search search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search vehicle, owner name, or email..."
          class="search-input"
        />
      </div>
    </div>

    <div class="content-area">
      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Loading fleet data...</p>
      </div>

      <div v-else-if="error" class="state-container error">
        <i class="bi bi-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchData" class="button primary-btn">Retry</button>
      </div>

      <div
        v-else-if="paginatedVehicles.length === 0"
        class="state-container empty"
      >
        <i class="bi bi-car-front"></i>
        <p>No vehicles found.</p>
      </div>

      <div v-else>
        <div class="desktop-view table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Vehicle Info</th>
                <th>Owner</th>
                <th>Price / Day</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in paginatedVehicles" :key="vehicle.id">
                <td>
                  <div class="vehicle-info-cell">
                    <img
                      :src="vehicle.exteriorPhotos[0]"
                      alt="Car"
                      class="vehicle-thumb"
                    />
                    <div class="vehicle-text">
                      <span class="model"
                        >{{ vehicle.year }} {{ vehicle.make }}
                        {{ vehicle.model }}</span
                      >
                      <span class="plate">{{ vehicle.licensePlate }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="owner-info-cell">
                    <span class="owner-name">{{
                      vehicle.resolvedOwnerName
                    }}</span>
                    <span class="owner-email">{{
                      vehicle.resolvedOwnerEmail
                    }}</span>
                  </div>
                </td>
                <td class="price-cell">
                  ₱{{ vehicle.rentalPricePerDay.toLocaleString() }}
                </td>
                <td>
                  <span
                    :class="[
                      'status-badge',
                      getStatusClass(vehicle.dynamicStatus),
                    ]"
                  >
                    {{ vehicle.dynamicStatus }}
                  </span>
                </td>
                <td>
                  <div class="actions-cell">
                    <button
                      @click="viewVehicle(vehicle.id)"
                      class="action-btn view"
                      title="View"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      @click="editVehicle(vehicle.id)"
                      class="action-btn edit"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="handleDeleteVehicle(vehicle.id)"
                      class="action-btn delete"
                      title="Delete"
                    >
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-view grid-layout">
          <div
            v-for="vehicle in paginatedVehicles"
            :key="vehicle.id"
            class="vehicle-card"
          >
            <div class="card-image-wrapper">
              <img
                :src="vehicle.exteriorPhotos[0]"
                alt="Car"
                class="card-image"
              />
              <span
                :class="[
                  'status-badge card-badge',
                  getStatusClass(vehicle.dynamicStatus),
                ]"
              >
                {{ vehicle.dynamicStatus }}
              </span>
            </div>

            <div class="card-body">
              <h3 class="card-title">
                {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
              </h3>
              <p class="card-plate">{{ vehicle.licensePlate }}</p>

              <div class="card-details">
                <div class="detail-item">
                  <i class="bi bi-person"></i>
                  <span>{{ vehicle.resolvedOwnerName }}</span>
                </div>
                <div class="detail-item">
                  <i class="bi bi-envelope"></i>
                  <span>{{ vehicle.resolvedOwnerEmail }}</span>
                </div>
                <div class="detail-item price">
                  <i class="bi bi-tag"></i>
                  <span
                    >₱{{ vehicle.rentalPricePerDay.toLocaleString() }}/day</span
                  >
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button
                @click="viewVehicle(vehicle.id)"
                class="btn-card secondary"
              >
                Details
              </button>
              <div class="icon-group">
                <button @click="editVehicle(vehicle.id)" class="btn-icon edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  @click="handleDeleteVehicle(vehicle.id)"
                  class="btn-icon delete"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-controls" v-if="totalPages > 1">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <i class="bi bi-chevron-left"></i> Prev
          </button>
          <span class="page-info"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "AdminVehiclesView",
  data() {
    return {
      loading: true,
      error: null,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      activeTab: "all",
    };
  },
  computed: {
    ...mapGetters(["allVehicles", "allBookings", "allUsers"]),

    filteredAndSortedVehicles() {
      const today = DateTime.now().startOf("day");

      // 1. Map vehicles to calculate dynamic status
      let vehiclesWithStatus = this.allVehicles.map((vehicle) => {
        let dynamicStatus = "available";
        const vehicleBookings = this.allBookings.filter(
          (b) => b.vehicleId === vehicle.id
        );

        // Check for Pending Requests
        const hasPending = vehicleBookings.some(
          (b) => b.paymentStatus === "pending_owner_approval"
        );

        // Check for Active Trips (Confirmed & Date overlaps today)
        const onTripBooking = vehicleBookings.find((b) => {
          if (b.paymentStatus !== "confirmed") return false;
          const startDate = DateTime.fromISO(b.startDate).startOf("day");
          const endDate = DateTime.fromISO(b.endDate).startOf("day");
          return today >= startDate && today <= endDate;
        });

        if (hasPending) {
          dynamicStatus = "pending";
        } else if (onTripBooking) {
          dynamicStatus = "on trip";
        } else {
          // Optional: Mark as 'completed' if it has past history but is free now
          const pastBookings = vehicleBookings
            .filter(
              (b) =>
                ["completed", "returned"].includes(b.paymentStatus) &&
                DateTime.fromISO(b.endDate).startOf("day") < today
            )
            .sort(
              (a, b) =>
                DateTime.fromISO(b.endDate) - DateTime.fromISO(a.endDate)
            );

          if (pastBookings.length > 0) {
            dynamicStatus = "completed"; // Or 'available' depending on preference
          }
        }

        // Resolve Owner Details
        let resolvedOwnerName = "Unknown Owner";
        let resolvedOwnerEmail = "No Email";

        if (this.allUsers && this.allUsers.length > 0) {
          const owner = this.allUsers.find(
            (user) =>
              user.uid === vehicle.ownerId || user.id === vehicle.ownerId
          );
          if (owner) {
            resolvedOwnerName = owner.name || owner.fullName || "No Name Set";
            resolvedOwnerEmail = owner.email || "No Email";
          }
        }

        return {
          ...vehicle,
          dynamicStatus,
          resolvedOwnerName,
          resolvedOwnerEmail,
        };
      });

      // 2. Filter by Tab
      if (this.activeTab !== "all") {
        vehiclesWithStatus = vehiclesWithStatus.filter(
          (v) => v.dynamicStatus === this.activeTab
        );
      }

      // 3. Filter by Search Query
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        vehiclesWithStatus = vehiclesWithStatus.filter(
          (v) =>
            v.make?.toLowerCase().includes(lowerQuery) ||
            v.model?.toLowerCase().includes(lowerQuery) ||
            v.resolvedOwnerEmail?.toLowerCase().includes(lowerQuery) ||
            v.resolvedOwnerName?.toLowerCase().includes(lowerQuery)
        );
      }

      // 4. Sort by Created Date (Newest First)
      return vehiclesWithStatus.sort(
        (a, b) =>
          new Date(b.createdAt?.seconds * 1000) -
          new Date(a.createdAt?.seconds * 1000)
      );
    },

    totalPages() {
      return Math.ceil(
        this.filteredAndSortedVehicles.length / this.itemsPerPage
      );
    },
    paginatedVehicles() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAndSortedVehicles.slice(start, end);
    },
  },
  methods: {
    ...mapActions([
      "fetchAllVehicles",
      "fetchAllBookings",
      "fetchAllUsers",
      "deleteVehicle",
    ]),

    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.fetchAllVehicles(),
          this.fetchAllBookings(),
          this.fetchAllUsers(),
        ]);
      } catch (err) {
        console.error("Error fetching admin vehicle data:", err);
        this.error = "An error occurred while fetching data.";
      } finally {
        this.loading = false;
      }
    },

    goToAddVehicle() {
      this.$router.push({ name: "AddVehicle" });
    },
    viewVehicle(vehicleId) {
      this.$router.push({ name: "VehicleDetail", params: { id: vehicleId } });
    },
    editVehicle(vehicleId) {
      this.$router.push({ name: "EditVehicle", params: { vehicleId } });
    },

    // --- UPDATED DELETE LOGIC WITH SAFEGUARD ---
    async handleDeleteVehicle(vehicleId) {
      // 1. Find the vehicle object to check its dynamic status
      const targetVehicle = this.filteredAndSortedVehicles.find(
        (v) => v.id === vehicleId
      );

      // 2. Safeguard Check
      if (targetVehicle) {
        if (targetVehicle.dynamicStatus === "on trip") {
          alert(
            'ACTION BLOCKED: This vehicle is currently "On Trip". You cannot delete it until the trip is completed/returned.'
          );
          return;
        }

        if (targetVehicle.dynamicStatus === "pending") {
          // Warning for pending requests (optional but recommended)
          if (
            !confirm(
              "WARNING: This vehicle has pending booking requests. Deleting it will leave those requests unresolved. Do you really want to proceed?"
            )
          ) {
            return;
          }
        }
      }

      // 3. Perform Delete
      if (
        confirm(
          "Are you sure you want to permanently delete this vehicle? This action cannot be undone."
        )
      ) {
        try {
          await this.deleteVehicle(vehicleId);
          alert("Vehicle deleted successfully.");
          await this.fetchData(); // Refresh list
        } catch (error) {
          console.error("Vehicle deletion error:", error);
          alert(
            "Failed to delete vehicle. Please check the console for details."
          );
        }
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    getStatusClass(status) {
      if (status === "available") return "status-success";
      if (status === "on trip") return "status-booked";
      if (status === "pending") return "status-warning";
      if (status === "completed") return "status-returned";
      return "status-default";
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

// --- Variables ---
$bg-color: #f8f9fa;
$text-main: #1f2937;
$text-light: #6b7280;
$border-color: #e5e7eb;
$card-shadow:
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem; /* Reduced padding for mobile */
  color: $text-main;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

// --- Header ---
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Better alignment for multiline titles */
  margin-bottom: 2rem;
  flex-direction: column; /* Stack by default on mobile */
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }

  .section-title {
    font-size: 1.75rem; /* Smaller on mobile */
    font-weight: 800;
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.025em;

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }
  .section-subtitle {
    color: $text-light;
    margin: 0;
    font-size: 0.95rem;
  }

  .header-action {
    width: 100%;

    @media (min-width: 768px) {
      width: auto;
    }
  }
}

// --- Control Bar ---
.control-bar {
  display: flex;
  flex-direction: column-reverse; /* Stack filters below search on mobile */
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: $card-shadow;
  margin-bottom: 2rem;

  @media (min-width: 992px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
  }
}

.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto; /* Horizontal scroll for filters */
  padding-bottom: 5px;
  width: 100%;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    height: 0px;
    background: transparent;
  }

  @media (min-width: 992px) {
    width: auto;
    overflow-x: visible;
    padding-bottom: 0;
  }

  .filter-tab {
    border: none;
    background: $bg-color;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: $text-light;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    flex-shrink: 0; /* Prevent shrinking on mobile */

    &:hover {
      color: $text-main;
    }
    &.active {
      background: $primary-color; /* Active color background */
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.search-wrapper {
  position: relative;
  width: 100%;

  @media (min-width: 992px) {
    width: 300px;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-light;
  }
  .search-input {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid $border-color;
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.2s;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
    }
  }
}

// --- View Toggling ---
/* Desktop Table View */
.desktop-view {
  display: none; /* Hidden on mobile */

  @media (min-width: 992px) {
    display: block; /* Visible on Desktop */
  }
}

.table-responsive {
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;
  overflow: hidden;
  width: 100%;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;

  thead th {
    text-align: left;
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $text-light;
    background: #fafafa;
    border-bottom: 1px solid $border-color;
  }

  tbody td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $border-color;
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #f9fafb;
  }

  .text-right {
    text-align: right;
  }
}

/* Mobile Card View */
.mobile-view {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on tablets */
  }

  @media (min-width: 992px) {
    display: none; /* Hide on Desktop */
  }
}

.vehicle-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: $card-shadow;
  display: flex;
  flex-direction: column;
  border: 1px solid $border-color;

  .card-image-wrapper {
    position: relative;
    height: 160px;

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .card-body {
    padding: 1rem;
    flex: 1;

    .card-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: $text-main;
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: $text-light;

        i {
          width: 16px;
          text-align: center;
        }

        &.price {
          color: $text-main;
          font-weight: 600;
          margin-top: 0.5rem;
        }
      }
    }
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-top: 1px solid $border-color;
    background: #fcfcfc;

    .btn-card {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      border: 1px solid $border-color;
      background: white;
      color: $text-main;
      cursor: pointer;
      text-decoration: none;

      &:hover {
        background: #f3f4f6;
      }
    }
    .icon-group {
      display: flex;
      gap: 0.5rem;
    }
  }
}

// --- Table Cells Content ---
.vehicle-info-cell {
  display: flex;
  align-items: center;
  gap: 1rem;

  .vehicle-thumb {
    width: 50px;
    height: 35px;
    object-fit: cover;
    border-radius: 4px;
    background-color: $bg-color;
  }
  .vehicle-text {
    display: flex;
    flex-direction: column;
    .model {
      font-weight: 600;
      color: $text-main;
      font-size: 0.95rem;
    }
    .plate {
      font-size: 0.75rem;
      color: $text-light;
      text-transform: uppercase;
    }
  }
}

.owner-info-cell {
  display: flex;
  flex-direction: column;
  .owner-name {
    font-weight: 600;
    color: $text-main;
    font-size: 0.9rem;
  }
  .owner-email {
    font-size: 0.8rem;
    color: $text-light;
  }
}

.price-cell {
  font-family: monospace;
  font-weight: 600;
  color: $text-main;
}

// --- Status Badges ---
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  &.status-success {
    background: #d1fae5;
    color: #065f46;
  }
  &.status-booked {
    background: #e0f2fe;
    color: #075985;
  }
  &.status-warning {
    background: #fef3c7;
    color: #92400e;
  }
  &.status-returned {
    background: #e0e7ff;
    color: #3730a3;
  }
  &.status-default {
    background: #f3f4f6;
    color: #4b5563;
  }
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn,
.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: $primary-color;
  }
  &.view:hover {
    background: #e0f2fe;
    color: #0284c7;
  }
  &.edit:hover {
    background: #fef3c7;
    color: #d97706;
  }
  &.delete:hover {
    background: #fee2e2;
    color: #ef4444;
  }
}

// --- Pagination ---
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap; /* Allow wrap on very small screens */

  .pagination-btn {
    background: white;
    border: 1px solid $border-color;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    color: $text-main;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &:not(:disabled):hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .page-info {
    font-size: 0.9rem;
    color: $text-light;
  }
}

// --- Loading State ---
.state-container {
  text-align: center;
  padding: 4rem 1rem;
  color: $text-light;
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;

  .spinner {
    margin: 0 auto 1rem;
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba($primary-color, 0.3);
    border-radius: 50%;
    border-top-color: $primary-color;
    animation: spin 1s ease-in-out infinite;
  }
  i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: block;
    opacity: 0.5;
  }

  &.error i {
    color: #ef4444;
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
