<template>
  <div class="admin-page-container">
    <div class="page-header">
      <div>
        <h2 class="section-title">Manage Vehicles</h2>
        <p class="section-subtitle">
          View, edit, or remove any vehicle listing on the platform.
        </p>
      </div>
      <div class="header-actions">
        <div class="search-bar">
          <i class="bi bi-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search vehicles..."
          />
        </div>
        <button @click="goToAddVehicle" class="button primary">
          <i class="bi bi-plus-lg"></i>
          Add Vehicle
        </button>
      </div>
    </div>

    <!-- UPDATED: Tabbed navigation now includes a "Completed" tab -->
    <div class="vehicle-filters">
        <button class="filter-tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">All Vehicles</button>
        <button class="filter-tab" :class="{ active: activeTab === 'available' }" @click="activeTab = 'available'">Available</button>
        <button class="filter-tab" :class="{ active: activeTab === 'on trip' }" @click="activeTab = 'on trip'">On Trip</button>
        <button class="filter-tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">Pending Request</button>
        <button class="filter-tab" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">Completed</button>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading all vehicles...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>Failed to load vehicles. Please try again.</p>
    </div>
    <div v-else-if="paginatedVehicles.length === 0" class="empty-state">
      <p>No vehicles found matching your criteria.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Owner</th>
            <th>Price / Day</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in paginatedVehicles" :key="vehicle.id">
            <td>
              <div class="vehicle-cell">
                <img
                  :src="vehicle.exteriorPhotos[0]"
                  alt="Vehicle"
                  class="vehicle-thumb"
                />
                <div class="vehicle-info">
                  <span class="vehicle-name"
                    >{{ vehicle.year }} {{ vehicle.make }}
                    {{ vehicle.model }}</span
                  >
                  <span class="vehicle-plate">{{ vehicle.licensePlate }}</span>
                </div>
              </div>
            </td>
            <td>{{ vehicle.ownerEmail || 'N/A' }}</td>
            <td>₱{{ vehicle.rentalPricePerDay.toLocaleString() }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(vehicle.dynamicStatus)]">{{
                vehicle.dynamicStatus
              }}</span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  @click="viewVehicle(vehicle.id)"
                  class="button icon-button"
                  title="View"
                >
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button
                  @click="editVehicle(vehicle.id)"
                  class="button icon-button"
                  title="Edit"
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button
                  @click="deleteVehicle(vehicle.id)"
                  class="button icon-button danger"
                  title="Delete"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-controls" v-if="totalPages > 1">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="button secondary"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="button secondary"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'AdminVehiclesView',
  data() {
    return {
      loading: true,
      error: null,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      activeTab: 'all',
    };
  },
  computed: {
    ...mapGetters(['allVehicles', 'allBookings']),
    filteredAndSortedVehicles() {
      const today = DateTime.now().startOf('day');

      let vehiclesWithStatus = this.allVehicles.map(vehicle => {
        let dynamicStatus = 'available';

        const vehicleBookings = this.allBookings.filter(b => b.vehicleId === vehicle.id);

        const hasPending = vehicleBookings.some(b => b.paymentStatus === 'pending_owner_approval');
        const onTripBooking = vehicleBookings.find(b => {
            if (b.paymentStatus !== 'confirmed') return false;
            const startDate = DateTime.fromISO(b.startDate).startOf('day');
            const endDate = DateTime.fromISO(b.endDate).startOf('day');
            return today >= startDate && today <= endDate;
        });
        
        if (hasPending) {
            dynamicStatus = 'pending';
        } else if (onTripBooking) {
            dynamicStatus = 'on trip';
        } else {
            const pastBookings = vehicleBookings
                .filter(b => ['completed', 'returned'].includes(b.paymentStatus) && DateTime.fromISO(b.endDate).startOf('day') < today)
                .sort((a, b) => DateTime.fromISO(b.endDate) - DateTime.fromISO(a.endDate));
            
            if (pastBookings.length > 0) {
                dynamicStatus = 'completed';
            }
        }
        
        return { ...vehicle, dynamicStatus };
      });

      if (this.activeTab !== 'all') {
          vehiclesWithStatus = vehiclesWithStatus.filter(v => v.dynamicStatus === this.activeTab);
      }

      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        vehiclesWithStatus = vehiclesWithStatus.filter(
          (v) =>
            v.make?.toLowerCase().includes(lowerQuery) ||
            v.model?.toLowerCase().includes(lowerQuery) ||
            v.ownerEmail?.toLowerCase().includes(lowerQuery)
        );
      }

      return vehiclesWithStatus.sort(
        (a, b) =>
          new Date(b.createdAt?.seconds * 1000) -
          new Date(a.createdAt?.seconds * 1000)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredAndSortedVehicles.length / this.itemsPerPage);
    },
    paginatedVehicles() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAndSortedVehicles.slice(start, end);
    },
  },
  methods: {
    ...mapActions(['fetchAllVehicles', 'fetchAllBookings', 'deleteVehicle']),
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([this.fetchAllVehicles(), this.fetchAllBookings()]);
      } catch (err) {
        this.error = 'An error occurred while fetching data.';
      } finally {
        this.loading = false;
      }
    },
    goToAddVehicle() {
      this.$router.push({ name: 'AddVehicle' });
    },
    viewVehicle(vehicleId) {
      this.$router.push({ name: 'VehicleDetail', params: { id: vehicleId } });
    },
    editVehicle(vehicleId) {
      this.$router.push({ name: 'EditVehicle', params: { vehicleId } });
    },
    async deleteVehicle(vehicleId) {
      if (confirm('Are you sure you want to permanently delete this vehicle? This action cannot be undone.')) {
        try {
            await this.deleteVehicle(vehicleId);
            alert('Vehicle deleted successfully.');
            await this.fetchData();
        } catch(error) {
            alert('Failed to delete vehicle. Please try again.');
            console.error("Vehicle deletion error:", error);
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
      if (status === 'available') return 'status-success';
      if (status === 'on trip') return 'status-booked';
      if (status === 'pending') return 'status-warning';
      if (status === 'completed') return 'status-returned'; // Using a new style
      return 'status-default';
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}
.section-subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-top: 0.25rem;
}
.header-actions {
  display: flex;
  gap: 1rem;
}
.search-bar {
  position: relative;
  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-color-medium;
  }
  input {
    padding: 0.75rem 1rem 0.75rem 3rem;
    border-radius: $border-radius-pill;
    border: 1px solid $border-color;
    width: 300px;
    font-size: 1rem;
  }
}
.vehicle-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid $border-color;
}
.filter-tab {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: $text-color-medium;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;

    &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
    }
    &:hover:not(.active) {
        background-color: #f9fafb;
    }
}
.table-container {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th,
td {
  padding: 1rem;
  border-bottom: 1px solid $border-color;
  vertical-align: middle;
}
thead th {
  font-size: 0.8rem;
  font-weight: 600;
  color: $text-color-medium;
  text-transform: uppercase;
}
tbody tr:last-child td {
  border-bottom: none;
}
.vehicle-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.vehicle-thumb {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: $border-radius-sm;
}
.vehicle-info {
  display: flex;
  flex-direction: column;
}
.vehicle-name {
  font-weight: 600;
}
.vehicle-plate {
  font-size: 0.85rem;
  color: $text-color-medium;
}
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: capitalize;
  &.status-success, &.status-available {
    background-color: lighten($secondary-color, 35%);
    color: darken($secondary-color, 20%);
  }
   &.status-booked, &.status-on-trip {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 20%);
  }
  &.status-warning, &.status-pending {
    background-color: lighten($accent-color, 35%);
    color: darken($accent-color, 20%);
  }
  &.status-returned, &.status-completed {
    background-color: #e0e7ff;
    color: #3730a3;
  }
  &.status-default {
    background-color: #e5e7eb;
    color: #4b5568;
  }
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  color: $text-color-medium;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f3f4f6;
    color: $primary-color;
  }
  i {
    font-size: 1.1rem;
  }
  &.danger:hover {
    color: $admin-color;
  }
}
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.button.primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

