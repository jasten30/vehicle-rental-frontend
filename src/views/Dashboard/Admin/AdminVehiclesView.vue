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
              <span :class="['status-badge', getStatusClass(vehicle.status)]">{{
                vehicle.status
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

export default {
  name: 'AdminVehiclesView',
  data() {
    return {
      loading: true,
      error: null,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    ...mapGetters(['allVehicles']),
    filteredAndSortedVehicles() {
      let vehicles = [...this.allVehicles];
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        vehicles = vehicles.filter(
          (v) =>
            v.make?.toLowerCase().includes(lowerQuery) ||
            v.model?.toLowerCase().includes(lowerQuery) ||
            v.ownerEmail?.toLowerCase().includes(lowerQuery)
        );
      }
      return vehicles.sort(
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
    ...mapActions(['fetchAllVehicles']),
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchAllVehicles();
      } catch (err) {
        this.error = 'An error occurred while fetching vehicle data.';
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
    deleteVehicle(vehicleId) {
      if (confirm('Are you sure?')) {
        console.log(`Request to delete vehicle with ID: ${vehicleId}`);
        alert('Delete functionality is not yet implemented.');
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    getStatusClass(status) {
      if (status === 'active') return 'status-success';
      if (status === 'inactive') return 'status-danger';
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
  margin: 0 auto;
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
  &.status-success {
    background-color: lighten($secondary-color, 35%);
    color: darken($secondary-color, 20%);
  }
  &.status-danger {
    background-color: lighten($admin-color, 40%);
    color: darken($admin-color, 20%);
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