<template>
  <div class="vehicle-list-container">
    <!-- Filters and Sort Section with a new, cleaner design -->
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

        <!-- Main "All Filters" button to open the modal -->
        <div class="filter-group">
          <button @click="showModal = true" class="all-filters-button">
             <i class="bi bi-sliders"></i>
            <span>All Filters</span>
          </button>
        </div>
      </div>
    </div>

    <!-- AllFilterModal Component (no changes) -->
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

    <!-- Vehicle Grid and Infinite Scrolling (no changes) -->
    <div v-if="loading" class="loading-message">
      <p>Loading vehicles...</p>
    </div>
    <div v-else-if="!allVehicles.length" class="no-vehicles-message">
      <p>No vehicles found.</p>
    </div>
    <div v-else-if="filteredAndSortedVehicles.length === 0" class="no-vehicles-message">
      <p>No vehicles found matching your criteria.</p>
    </div>
    <div v-else class="vehicle-grid">
      <template v-for="vehicle in displayedVehicles" :key="vehicle.id">
        <VehicleCard v-if="vehicle" :vehicle="vehicle" />
      </template>
    </div>
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
import AllFilterModal from "@/components/modals/AllFilterModal.vue";

// The entire script section remains unchanged as the logic is the same.
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
      displayedVehicles: [],
      itemsPerPage: 12, // <-- UPDATED: Changed from 6 to 12
      loadingMore: false,
      observer: null,
      showObserver: false,
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
    resetDisplayedVehicles() {
      this.displayedVehicles = [];
      this.loadMoreVehicles();
    },
    setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      };
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.loadMoreVehicles();
        }
      }, options);
      this.$nextTick(() => {
        if (this.$refs.bottomObserver) {
          this.observer.observe(this.$refs.bottomObserver);
        }
      });
    },
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
      this.resetDisplayedVehicles();
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

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.vehicle-list-container {
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* --- NEW MODERN FILTER BAR STYLES --- */
.filters-sort-section {
  position: sticky;
  top: 80px; /* Adjust based on your header height */
  background-color: #fff;
  z-index: 50;
  padding: 1rem 0;
  border-bottom: 1px solid $border-color;
  margin-bottom: 2rem;
}

.filters-sort-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap; /* Allows filters to wrap on smaller screens */
}

.filter-group {
  position: relative;
}

/* This is a new button style for the main "All Filters" modal button */
.all-filters-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid $text-color-dark;
  border-radius: $border-radius-md;
  background-color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
  }

  i {
    font-size: 1.1rem;
  }
}

/* The rest of your styles for grid, cards, etc. remain unchanged */
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem 1.5rem;
}

.loading-message,
.no-vehicles-message {
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  color: $text-color-medium;
}

.observer-element {
  height: 50px;
}
</style>

