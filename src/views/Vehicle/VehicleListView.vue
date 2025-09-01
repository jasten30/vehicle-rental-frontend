<template>
  <div class="vehicle-list-container">
    <!-- Filters and Sort Section -->
    <div class="filters-sort-section">
      <div class="filters-sort-row">
        <!-- Daily Price Filter -->
        <div class="filter-group dropdown-container" ref="priceDropdown">
          <PriceFilter
            :min-price="filterForm.minPrice"
            :max-price="filterForm.maxPrice"
            :max-value="100000"
            @update:price="updateFilterRange"
            @reset="resetFilter('price')"
            @toggle-dropdown="toggleDropdown('price')"
            :is-active="activeDropdown === 'price'"
            :filtered-count="filteredAndSortedVehicles.length"
            :total-count="allVehicles.length"
          />
        </div>

        <!-- Vehicle Type Filter -->
        <div class="filter-group dropdown-container" ref="typeDropdown">
          <TypeFilter
            :vehicle-type="filterForm.vehicleType"
            @update:type="updateVehicleType"
            @reset="resetFilter('vehicleType')"
            @toggle-dropdown="toggleDropdown('type')"
            :is-active="activeDropdown === 'type'"
            :filtered-count="filteredAndSortedVehicles.length"
            :total-count="allVehicles.length"
          />
        </div>

        <!-- Make & Model Filter -->
        <div
          class="filter-group dropdown-container make-model-dropdown"
          ref="makeModelDropdown"
        >
          <MakeModelFilter
            :selected-make="filterForm.make"
            :selected-model="filterForm.model"
            :all-vehicles="allVehicles"
            @update:make="updateMake"
            @update:model="updateModel"
            @reset="resetFilter('make-model')"
            @toggle-dropdown="toggleDropdown('make-model')"
            :is-active="activeDropdown === 'make-model'"
            :filtered-count="filteredAndSortedVehicles.length"
            :total-count="allVehicles.length"
          />
        </div>

        <!-- Years Filter -->
        <div class="filter-group dropdown-container" ref="yearDropdown">
          <YearFilter
            :selected-year="filterForm.year"
            :all-vehicles="allVehicles"
            @update:year="updateYear"
            @reset="resetFilter('year')"
            @toggle-dropdown="toggleDropdown('year')"
            :is-active="activeDropdown === 'year'"
            :filtered-count="filteredAndSortedVehicles.length"
            :total-count="allVehicles.length"
          />
        </div>

        <!-- Seats Filter -->
        <div class="filter-group dropdown-container" ref="seatsDropdown">
          <SeatsFilter
            :selected-seats="filterForm.seats"
            @update:seats="updateSeats"
            @reset="resetFilter('seats')"
            @toggle-dropdown="toggleDropdown('seats')"
            :is-active="activeDropdown === 'seats'"
            :filtered-count="filteredAndSortedVehicles.length"
            :total-count="allVehicles.length"
          />
        </div>

        <!-- Filter button to open the modal -->
        <div class="filter-group">
          <button @click="showModal = true" class="dropdown-button">
            Filter
          </button>
        </div>
      </div>
    </div>

    <!-- AllFilterModal Component -->
    <AllFilterModal
      :show="showModal"
      :all-vehicles="allVehicles"
      :filter-form="filterForm"
      :sort-form="sortForm"
      :max-price="100000"
      @close-modal="showModal = false"
      @reset-filters="resetFilters"
      @update:sort-key="updateSortKey"
      @update:sort-order="updateSortOrder"
      @update:filter-form="updateFilterForm"
    />

    <!-- Vehicle Grid and Infinite Scrolling -->
    <div v-if="loading" class="loading-message">
      <p>Loading vehicles...</p>
    </div>

    <div v-else-if="!allVehicles.length" class="no-vehicles-message">
      <p>No vehicles found.</p>
    </div>

    <div
      v-else-if="filteredAndSortedVehicles.length === 0"
      class="no-vehicles-message"
    >
      <p>No vehicles found matching your criteria.</p>
    </div>

    <div v-else class="vehicle-grid">
      <template v-for="vehicle in displayedVehicles" :key="vehicle.id">
        <!-- Only render the card if the vehicle object is valid -->
        <VehicleCard v-if="vehicle && vehicle.location" :vehicle="vehicle" />
      </template>
    </div>

    <!-- Observer element for infinite scrolling -->
    <div v-if="showObserver" ref="bottomObserver" class="observer-element">
      <div v-if="loadingMore" class="loading-message">
        <p>Loading more vehicles...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import PriceFilter from "@/components/filters/PriceFilter.vue";
import TypeFilter from "@/components/filters/TypeFilter.vue";
import MakeModelFilter from "@/components/filters/MakeModelFilter.vue";
import YearFilter from "@/components/filters/YearFilter.vue";
import SeatsFilter from "@/components/filters/SeatsFilter.vue";
import VehicleCard from "@/components/VehicleCard.vue";
import AllFilterModal from "@/components/modal/AllFilterModal.vue";

export default {
  name: "VehicleListView",
  components: {
    VehicleCard,
    PriceFilter,
    TypeFilter,
    MakeModelFilter,
    YearFilter,
    SeatsFilter,
    AllFilterModal,
  },
  data() {
    return {
      loading: true,
      // Infinite scroll variables
      displayedVehicles: [],
      itemsPerPage: 6,
      loadingMore: false,
      observer: null,
      showObserver: false,
      // --- end of infinite scroll variables
      activeDropdown: null,
      makeModelPanelState: "makes",
      filterForm: {
        make: "",
        model: "",
        year: null,
        location: "",
        minPrice: 0,
        maxPrice: 100000,
        vehicleType: "",
        seats: null,
      },
      sortForm: {
        key: "rentalPricePerDay",
        order: "asc",
      },
      isDragging: false,
      draggedThumb: null,
      isSortModalOpen: false,
      showModal: false,
    };
  },
  computed: {
    ...mapGetters([
      "allVehicles",
      "filteredAndSortedVehicles",
      "currentVehicleFilters",
      "vehicleSort",
    ]),
  },
  methods: {
    ...mapActions([
      "fetchAllVehicles",
      "setVehicleFilter",
      "setVehicleSort",
      "resetVehicleFilters",
    ]),
    async loadVehicles() {
      this.loading = true;
      try {
        await this.fetchAllVehicles();
        this.resetDisplayedVehicles();
      } catch (error) {
        console.error("Error loading vehicles:", error);
      } finally {
        this.loading = false;
      }
    },
    // NEW: Load the next batch of vehicles for infinite scrolling
    loadMoreVehicles() {
      if (
        this.loadingMore ||
        this.displayedVehicles.length >= this.filteredAndSortedVehicles.length
      ) {
        return;
      }

      this.loadingMore = true;
      const startIndex = this.displayedVehicles.length;
      const endIndex = startIndex + this.itemsPerPage;
      const newVehicles = this.filteredAndSortedVehicles.slice(
        startIndex,
        endIndex
      );
      this.displayedVehicles.push(...newVehicles);
      this.loadingMore = false;
    },
    // NEW: Resets the list and loads the first batch
    resetDisplayedVehicles() {
      this.displayedVehicles = [];
      this.loadMoreVehicles();
    },
    // NEW: Sets up the IntersectionObserver
    setupIntersectionObserver() {
      const options = {
        root: null, // use the viewport as the container
        rootMargin: "0px",
        threshold: 1.0, // trigger when the element is fully visible
      };
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.loadMoreVehicles();
        }
      }, options);
      // Wait for the DOM to be ready before observing
      this.$nextTick(() => {
        if (this.$refs.bottomObserver) {
          this.observer.observe(this.$refs.bottomObserver);
        }
      });
    },
    // --- rest of the original methods
    updateFilterRange({ min, max }) {
      this.setVehicleFilter({ key: "minPrice", value: min });
      this.setVehicleFilter({ key: "maxPrice", value: max });
    },
    updateMake(make) {
      this.filterForm.make = make;
      this.filterForm.model = "";
      this.setVehicleFilter({ key: "make", value: make });
      this.setVehicleFilter({ key: "model", value: "" });
      this.makeModelPanelState = "models";
    },
    updateModel(model) {
      this.filterForm.model = model;
      this.setVehicleFilter({ key: "model", value: model });
    },
    updateYear(year) {
      this.filterForm.year = year;
      this.setVehicleFilter({ key: "year", value: year });
    },
    updateSeats(seats) {
      this.filterForm.seats = seats;
      this.setVehicleFilter({ key: "seats", value: seats });
    },
    updateSortKey(newKey) {
      this.setVehicleSort({ key: newKey, order: this.sortForm.order });
    },
    updateSortOrder(newOrder) {
      this.setVehicleSort({ key: this.sortForm.key, order: newOrder });
    },
    updateFilterForm(newForm) {
      for (const key in newForm) {
        this.setVehicleFilter({ key, value: newForm[key] });
      }
    },
    resetFilter(filterType) {
      switch (filterType) {
        case "price":
          this.filterForm.minPrice = 0;
          this.filterForm.maxPrice = 100000;
          this.setVehicleFilter({ key: "minPrice", value: 0 });
          this.setVehicleFilter({ key: "maxPrice", value: 100000 });
          break;
        case "vehicleType":
          this.filterForm.vehicleType = "";
          this.setVehicleFilter({ key: "vehicleType", value: "" });
          break;
        case "make-model":
          this.filterForm.make = "";
          this.filterForm.model = "";
          this.setVehicleFilter({ key: "make", value: "" });
          this.setVehicleFilter({ key: "model", value: "" });
          this.makeModelPanelState = "makes";
          break;
        case "year":
          this.filterForm.year = null;
          this.setVehicleFilter({ key: "year", value: null });
          break;
        case "seats":
          this.filterForm.seats = null;
          this.setVehicleFilter({ key: "seats", value: null });
          break;
      }
    },
    resetFilters() {
      this.resetVehicleFilters();
      this.filterForm = {
        make: "",
        model: "",
        year: null,
        location: "",
        minPrice: 0,
        maxPrice: 100000,
        vehicleType: "",
        seats: null,
      };
      this.sortForm = {
        key: "rentalPricePerDay",
        order: "asc",
      };
      this.makeModelPanelState = "makes";
    },
    applyUrlFilters() {
      const query = this.$route.query;
      const filterKeys = Object.keys(this.filterForm);
      for (const key in query) {
        if (filterKeys.includes(key)) {
          this.filterForm[key] = query[key];
          let processedValue = query[key];
          if (["year", "minPrice", "maxPrice", "seats"].includes(key)) {
            processedValue =
              processedValue === "" ? null : parseFloat(processedValue);
            if (isNaN(processedValue)) processedValue = null;
          }
          this.setVehicleFilter({ key, value: processedValue });
        }
      }
    },
    toggleDropdown(dropdownName) {
      this.activeDropdown =
        this.activeDropdown === dropdownName ? null : dropdownName;
      if (this.activeDropdown === "make-model") {
        this.makeModelPanelState = "makes";
      }
    },
    updateVehicleType(type) {
      this.filterForm.vehicleType = type;
      this.setVehicleFilter({ key: "vehicleType", value: type });
    },
    handleClickOutside(event) {
      const dropdowns = [
        "priceDropdown",
        "typeDropdown",
        "makeModelDropdown",
        "yearDropdown",
        "seatsDropdown",
      ];
      let clickedInsideDropdown = false;

      for (const refName of dropdowns) {
        const dropdownElement = this.$refs[refName];
        if (dropdownElement && dropdownElement.contains(event.target)) {
          clickedInsideDropdown = true;
          break;
        }
      }

      if (!clickedInsideDropdown) {
        this.activeDropdown = null;
      }
    },
  },
  watch: {
    "$route.query": {
      handler() {
        this.applyUrlFilters();
      },
      immediate: true,
    },
    filteredAndSortedVehicles() {
      // Log the number of vehicles to the console to help with debugging
      console.log(
        `Number of filtered vehicles available: ${this.filteredAndSortedVehicles.length}`
      );
      // Whenever filters or sorting changes, reset and load the first batch
      this.resetDisplayedVehicles();
      // Only show the observer if there are vehicles to load
      this.showObserver =
        this.displayedVehicles.length < this.filteredAndSortedVehicles.length;
    },
  },
  created() {
    this.loadVehicles();
    this.filterForm = { ...this.currentVehicleFilters };
    if (!this.filterForm.minPrice) {
      this.filterForm.minPrice = 0;
    }
    if (!this.filterForm.maxPrice) {
      this.filterForm.maxPrice = 100000;
    }
    this.sortForm = { ...this.vehicleSort };
  },
  mounted() {
    this.setupIntersectionObserver();
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    this.observer.disconnect();
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
.vehicle-list-container {
  padding: 0 2rem;
  font-family: "Inter", sans-serif;
  background-color: #fff;
}

.filters-sort-section {
  background-color: #f7fafc;
  border-radius: 12px;
  padding: 0.5rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}

.filters-sort-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-group {
  position: relative;
  flex-shrink: 0;
}

.dropdown-button {
  background-color: white;
  color: #4a5268;
  padding: 0.2rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dropdown-button.active {
  background-color: #2c52ff;
  color: white;
  border-color: #2c52ff;
}

.dropdown-button:hover {
  border-color: #cbd5e0;
  box-shadow: 4px 6px rgba(0, 0, 0, 0.1);
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.vehicle-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.vehicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 8px 24px rgba(0, 0, 0, 0.15);
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.card-location {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.card-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c52ff;
  margin-bottom: 1rem;
}

.view-details-button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #2c52ff;
  color: white;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.view-details-button:hover {
  background-color: #2544d6;
}

.loading-message,
.no-vehicles-message {
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  color: #718096;
}

.observer-element {
  height: 1px;
  margin-top: -1px;
}
</style>
