<!-- frontend/src/views/Vehicle/VehicleListView.vue -->
<template>
  <div class="vehicle-list-container">
    <h1 class="page-title">Available Vehicles</h1>

    <div class="filters-sort-section">
      <h3 class="section-heading">Filter & Sort</h3>
      <div class="filters-grid">
        <div class="form-group">
          <label for="filterMake">Make:</label>
          <input type="text" id="filterMake" v-model="filterForm.make" @input="updateFilter('make', $event.target.value)" class="form-input">
        </div>
        <div class="form-group">
          <label for="filterModel">Model:</label>
          <input type="text" id="filterModel" v-model="filterForm.model" @input="updateFilter('model', $event.target.value)" class="form-input">
        </div>
        <div class="form-group">
          <label for="filterYear">Year:</label>
          <input type="number" id="filterYear" v-model="filterForm.year" @input="updateFilter('year', $event.target.value)" class="form-input">
        </div>
        <div class="form-group">
          <label for="filterLocation">Location:</label>
          <input type="text" id="filterLocation" v-model="filterForm.location" @input="updateFilter('location', $event.target.value)" class="form-input">
        </div>
        <div class="form-group">
          <label for="filterMinPrice">Min Price:</label>
          <input type="number" id="filterMinPrice" v-model="filterForm.minPrice" @input="updateFilter('minPrice', $event.target.value)" class="form-input">
        </div>
        <div class="form-group">
          <label for="filterMaxPrice">Max Price:</label>
          <input type="number" id="filterMaxPrice" v-model="filterForm.maxPrice" @input="updateFilter('maxPrice', $event.target.value)" class="form-input">
        </div>
        <div class="form-group">
          <label for="sortBy">Sort By:</label>
          <select id="sortBy" v-model="sortForm.key" @change="updateSort" class="form-select">
            <option value="rentalPricePerDay">Price</option>
            <option value="year">Year</option>
            <option value="make">Make</option>
            <option value="model">Model</option>
          </select>
        </div>
        <div class="form-group">
          <label for="sortOrder">Order:</label>
          <select id="sortOrder" v-model="sortForm.order" @change="updateSort" class="form-select">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <button @click="resetFilters" class="button reset-button">Reset Filters</button>
      </div>
    </div>

    <div v-if="loading" class="loading-message">
      <p>Loading vehicles...</p>
    </div>

    <div v-else-if="paginatedVehicles.length === 0" class="no-vehicles-message">
      <p>No vehicles found matching your criteria.</p>
    </div>

    <div v-else class="vehicle-grid">
      <div v-for="vehicle in paginatedVehicles" :key="vehicle.id" class="vehicle-card">
        <img :src="vehicle.imageUrl || getPlaceholderImage(300, 200, 'cccccc', '333333', 'No Image')"
             :alt="`${vehicle.make} ${vehicle.model}`"
             class="vehicle-image"
             @error="vehicle.imageUrl = getPlaceholderImage(300, 200, 'cccccc', '333333', 'No Image')">
        <div class="card-content">
          <h2 class="card-title">{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</h2>
          <p class="card-location"><i class="fas fa-map-marker-alt"></i> {{ vehicle.location }}</p>
          <p class="card-price">₱{{ vehicle.rentalPricePerDay }} / day</p>
          <router-link :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }" class="view-details-button">
            View Details
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="filteredAndSortedVehicles.length > 0" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">Next</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'VehicleListView',
  data() {
    return {
      loading: true,
      currentPage: 1,
      itemsPerPage: 6, // Number of vehicles per page
      filterForm: { // Local state for filter inputs, initialized from Vuex
        make: '',
        model: '',
        year: null,
        location: '',
        minPrice: null,
        maxPrice: null,
        availabilityStartDate: null,
        availabilityEndDate: null,
      },
      sortForm: { // Local state for sort inputs, initialized from Vuex
        key: 'rentalPricePerDay',
        order: 'asc',
      }
    };
  },
  computed: {
    ...mapGetters(['allVehicles', 'filteredAndSortedVehicles', 'currentVehicleFilters', 'vehicleSort']), // Added vehicleSort getter
    
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
    ...mapActions(['fetchAllVehicles', 'setVehicleFilter', 'setVehicleSort', 'resetVehicleFilters']),

    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    async loadVehicles() {
      this.loading = true;
      try {
        await this.fetchAllVehicles(); // Correctly dispatching fetchAllVehicles
      } catch (error) {
        console.error('Error loading vehicles:', error);
        // Optionally, display an error message to the user
      } finally {
        this.loading = false;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    updateFilter(key, value) {
      // Ensure numeric values are parsed correctly
      let processedValue = value;
      if (['year', 'minPrice', 'maxPrice'].includes(key)) {
        processedValue = value === '' ? null : parseFloat(value);
        if (isNaN(processedValue)) processedValue = null; // Handle invalid numeric input
      }
      this.setVehicleFilter({ key, value: processedValue });
      this.currentPage = 1; // Reset to first page on filter change
    },
    updateSort() {
      this.setVehicleSort({ key: this.sortForm.key, order: this.sortForm.order });
      this.currentPage = 1; // Reset to first page on sort change
    },
    resetFilters() {
      this.resetVehicleFilters();
      // Reset local filter form state to match Vuex state
      this.filterForm = {
        make: '',
        model: '',
        year: null,
        location: '',
        minPrice: null,
        maxPrice: null,
        availabilityStartDate: null,
        availabilityEndDate: null,
      };
      this.sortForm = {
        key: 'rentalPricePerDay',
        order: 'asc',
      };
      this.currentPage = 1; // Reset to first page
    }
  },
  watch: {
    // Watch for changes in filteredAndSortedVehicles to reset current page if needed
    filteredAndSortedVehicles() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
      } else if (this.totalPages === 0) {
        this.currentPage = 1; // If no vehicles, ensure page is 1
      }
    }
  },
  created() {
    this.loadVehicles();
    // Initialize local filter/sort forms from Vuex state on creation
    // Use deep copy for objects to avoid direct mutation of Vuex state
    this.filterForm = { ...this.currentVehicleFilters };
    this.sortForm = { ...this.vehicleSort }; // Initialize sort form
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.vehicle-list-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: $primary-color;
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
}

.filters-sort-section {
  background-color: $card-background;
  padding: 1.5rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.6rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 1rem;
  border-bottom: 2px solid lighten($primary-color, 30%);
  padding-bottom: 0.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  align-items: flex-end; /* Align buttons/inputs at the bottom of their rows */
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: $text-color-dark;
  font-size: 0.95rem;
}

.form-input, .form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  width: 100%;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}

.reset-button {
  background-color: $secondary-color;
  color: white;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  align-self: flex-end; /* Align to the bottom */

  &:hover {
    background-color: darken($secondary-color, 10%);
  }
}

.loading-message, .no-vehicles-message {
  text-align: center;
  color: $text-color-medium;
  font-style: italic;
  font-size: 1.2rem;
  padding: 3rem;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.vehicle-card {
  background-color: $card-background;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-hover;
  }
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allows content to push button to bottom */
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.card-location {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 0.75rem;

  .fas {
    margin-right: 0.5rem;
    color: $primary-color;
  }
}

.card-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: $secondary-color;
  margin-top: auto; /* Pushes price and button to bottom */
  margin-bottom: 1rem;
}

.view-details-button {
  display: block;
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background-color: $card-background;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
}

.pagination-button {
  background-color: $primary-color;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }

  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.pagination-controls span {
  font-size: 1rem;
  color: $text-color-dark;
  font-weight: 500;
}
</style>
