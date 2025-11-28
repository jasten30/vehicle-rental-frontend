<template>
  <div class="vehicle-list-container">
    <div class="filters-sort-section">
      <div class="filters-sort-row">
        <div class="filter-group dropdown-container" ref="categoryDropdown">
          <CategoryFilter
            :asset-type="filterForm.assetType"
            @update:assetType="updateAssetType"
            @toggle-dropdown="toggleDropdown('category')"
            :is-active="activeDropdown === 'category'"
          />
        </div>

        <div class="filter-group dropdown-container" ref="priceDropdown">
          <PriceFilter
            :min-price="filterForm.minPrice"
            :max-price="filterForm.maxPrice"
            :max-value="100000"
            @update:price="updateFilterRange"
            @reset="resetFilter('price')"
            @toggle-dropdown="toggleDropdown('price')"
            :is-active="activeDropdown === 'price'"
            :filtered-count="
              filteredAndSortedVehicles ? filteredAndSortedVehicles.length : 0
            "
            :total-count="allVehicles ? allVehicles.length : 0"
          />
        </div>

        <div
          class="filter-group dropdown-container"
          ref="typeDropdown"
          v-if="filterForm.assetType !== 'motorcycle'"
        >
          <TypeFilter
            :vehicle-type="filterForm.vehicleType"
            @update:type="updateVehicleType"
            @reset="resetFilter('vehicleType')"
            @toggle-dropdown="toggleDropdown('type')"
            :is-active="activeDropdown === 'type'"
            :filtered-count="
              filteredAndSortedVehicles ? filteredAndSortedVehicles.length : 0
            "
            :total-count="allVehicles ? allVehicles.length : 0"
          />
        </div>

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
            :filtered-count="
              filteredAndSortedVehicles ? filteredAndSortedVehicles.length : 0
            "
            :total-count="allVehicles ? allVehicles.length : 0"
          />
        </div>

        <div class="filter-group dropdown-container" ref="yearDropdown">
          <YearFilter
            :selected-year="filterForm.year"
            :all-vehicles="allVehicles"
            @update:year="updateYear"
            @reset="resetFilter('year')"
            @toggle-dropdown="toggleDropdown('year')"
            :is-active="activeDropdown === 'year'"
            :filtered-count="
              filteredAndSortedVehicles ? filteredAndSortedVehicles.length : 0
            "
            :total-count="allVehicles ? allVehicles.length : 0"
          />
        </div>

        <div
          class="filter-group dropdown-container"
          ref="seatsDropdown"
          v-if="filterForm.assetType !== 'motorcycle'"
        >
          <SeatsFilter
            :selected-seats="filterForm.seats"
            @update:seats="updateSeats"
            @reset="resetFilter('seats')"
            @toggle-dropdown="toggleDropdown('seats')"
            :is-active="activeDropdown === 'seats'"
            :filtered-count="
              filteredAndSortedVehicles ? filteredAndSortedVehicles.length : 0
            "
            :total-count="allVehicles ? allVehicles.length : 0"
          />
        </div>

        <div class="filter-spacer"></div>

        <div
          class="filter-group dropdown-container location-search-container"
          ref="locationDropdown"
        >
          <LocationFilter
            v-if="vehicleFilters"
            :location="filterForm.location"
            :all-vehicles="allVehicles"
            :is-active="activeDropdown === 'location'"
            @update:location="updateLocationFilter"
            @toggle-dropdown="toggleDropdown('location')"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-message">
      <p>Loading vehicles...</p>
    </div>

    <div
      v-else-if="!allVehicles || allVehicles.length === 0"
      class="no-vehicles-message empty-state-card"
    >
      <i class="bi bi-search icon-large"></i>
      <p>No vehicles available for listing at the moment.</p>
    </div>

    <div
      v-else-if="
        !filteredAndSortedVehicles || filteredAndSortedVehicles.length === 0
      "
      class="no-vehicles-message empty-state-card"
    >
      <i class="bi bi-funnel icon-large"></i>
      <p>
        No vehicles found matching your criteria. Try adjusting the filters.
      </p>
      <button @click="resetFilters" class="button secondary-button">
        Reset Filters
      </button>
    </div>

    <div v-else class="vehicle-grid">
      <transition-group
        name="vehicle-fade"
        tag="div"
        class="vehicle-grid-inner"
      >
        <template v-for="vehicle in displayedVehicles" :key="vehicle.id">
          <VehicleCard v-if="vehicle" :vehicle="vehicle" />
        </template>
      </transition-group>
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
import LocationFilter from "@/components/filters/LocationFilter.vue";
import CategoryFilter from "@/components/filters/CategoryFilter.vue";

export default {
  name: "VehicleListView",
  components: {
    VehicleCard,
    PriceFilter,
    TypeFilter,
    MakeModelFilter,
    YearFilter,
    SeatsFilter,
    LocationFilter,
    CategoryFilter,
  },
  data() {
    return {
      loading: true,
      displayedVehicles: [],
      itemsPerPage: 12,
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
        assetType: null,
      },
      sortForm: {
        key: "rentalPricePerDay",
        order: "asc",
      },
    };
  },
  computed: {
    ...mapGetters([
      "allVehicles",
      "filteredAndSortedVehicles",
      "currentVehicleFilters",
      "vehicleSort",
    ]),
    vehicleFilters() {
      return this.currentVehicleFilters || {};
    },
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

        const current = this.currentVehicleFilters || {};
        this.filterForm = {
          make: current.make || "",
          model: current.model || "",
          year: current.year || null,
          location: current.location || "",
          minPrice: current.minPrice || 0,
          maxPrice: current.maxPrice || 100000,
          vehicleType: current.vehicleType || "",
          seats: current.seats || null,
          assetType: current.assetType || null,
        };

        this.sortForm = { ...(this.vehicleSort || {}) };
        this.applyUrlFilters();
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
        !this.filteredAndSortedVehicles ||
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
      this.showObserver =
        this.displayedVehicles.length < this.filteredAndSortedVehicles.length;
    },

    resetDisplayedVehicles() {
      this.displayedVehicles = [];
      if (
        this.filteredAndSortedVehicles &&
        this.filteredAndSortedVehicles.length > 0
      ) {
        this.loadMoreVehicles();
      }
      if (this.filteredAndSortedVehicles) {
        this.showObserver =
          this.displayedVehicles.length < this.filteredAndSortedVehicles.length;
      } else {
        this.showObserver = false;
      }
      this.$nextTick(() => {
        if (this.observer && this.$refs.bottomObserver) {
          this.observer.disconnect();
          if (this.showObserver) {
            this.observer.observe(this.$refs.bottomObserver);
          }
        } else if (this.showObserver) {
          this.setupIntersectionObserver();
        }
      });
    },

    setupIntersectionObserver() {
      const options = { root: null, rootMargin: "0px", threshold: 1.0 };
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.loadMoreVehicles();
        }
      }, options);

      this.$nextTick(() => {
        if (this.$refs.bottomObserver && this.showObserver) {
          this.observer.observe(this.$refs.bottomObserver);
        }
      });
    },

    updateLocationFilter(city) {
      this.filterForm.location = city;
      this.setVehicleFilter({ key: "location", value: city });
      this.activeDropdown = null;
    },

    updateFilterRange({ min, max }) {
      this.filterForm.minPrice = min;
      this.filterForm.maxPrice = max;
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

    updateVehicleType(type) {
      this.filterForm.vehicleType = type;
      this.setVehicleFilter({ key: "vehicleType", value: type });
    },

    updateAssetType(type) {
      this.filterForm.assetType = type;
      this.setVehicleFilter({ key: "assetType", value: type });
      if (type === "motorcycle") {
        this.resetFilter("vehicleType");
        this.resetFilter("seats");
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
        case "assetType":
          this.filterForm.assetType = null;
          this.setVehicleFilter({ key: "assetType", value: null });
          break;
      }
      this.activeDropdown = null;
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
        assetType: null,
      };
      this.activeDropdown = null;
    },

    applyUrlFilters() {
      const query = this.$route.query;
      const filterKeys = Object.keys(this.filterForm);
      let needsVuexUpdate = false;
      for (const key in query) {
        if (filterKeys.includes(key)) {
          let queryValue = query[key];
          let processedValue = queryValue;
          if (["year", "minPrice", "maxPrice", "seats"].includes(key)) {
            processedValue =
              queryValue === "" ||
              queryValue === null ||
              queryValue === undefined
                ? null
                : parseFloat(queryValue);
            if (isNaN(processedValue)) processedValue = null;
          }

          if (
            key === "assetType" &&
            !["vehicle", "motorcycle"].includes(processedValue)
          ) {
            processedValue = null;
          }

          if (this.filterForm[key] !== processedValue) {
            this.filterForm[key] = processedValue;
            needsVuexUpdate = true;
          }
        }
      }
      if (needsVuexUpdate) {
        for (const key in this.filterForm) {
          if (Object.prototype.hasOwnProperty.call(this.filterForm, key)) {
            this.setVehicleFilter({ key, value: this.filterForm[key] });
          }
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

    handleClickOutside(event) {
      const dropdownRefs = [
        this.$refs.priceDropdown,
        this.$refs.typeDropdown,
        this.$refs.makeModelDropdown,
        this.$refs.yearDropdown,
        this.$refs.seatsDropdown,
        this.$refs.categoryDropdown,
        this.$refs.locationDropdown,
      ];
      const clickedOutsideAll = dropdownRefs.every((ref) => {
        return ref && !ref.contains(event.target);
      });

      if (clickedOutsideAll) {
        this.activeDropdown = null;
      }
    },
  },
  watch: {
    "$route.query": {
      handler() {
        this.applyUrlFilters();
      },
      deep: true,
    },
    filteredAndSortedVehicles() {
      this.resetDisplayedVehicles();
    },
  },
  async created() {
    if (Object.keys(this.$route.query).length === 0) {
      await this.resetVehicleFilters();
    }
    await this.loadVehicles();
  },
  mounted() {
    if (this.showObserver) {
      this.setupIntersectionObserver();
    }
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.vehicle-list-container {
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* --- MODERN FILTER BAR STYLES --- */
.filters-sort-section {
  position: sticky;
  top: 70px;
  background-color: #ffffff;
  z-index: 50;
  padding: 1rem 0;
  border-bottom: 1px solid $border-color-light;
  margin-bottom: 2.5rem;
}

.filters-sort-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-group {
  position: relative;
}

/* General Button Style for Filters */
.filter-group > :deep(button) {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid $border-color;
  border-radius: $border-radius-pill;
  background-color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  color: $text-color-dark;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: $text-color-dark;
    background-color: $background-light;
  }

  &.active,
  &:has(+ .dropdown-content.active) {
    background-color: lighten($primary-color, 45%);
    border-color: $primary-color;
    color: $primary-color;
    font-weight: 600;
  }
}

/* --- LOCATION SEARCH SPECIFIC STYLES (The Search Feature) --- */
.location-search-container {
  // Ensure it doesn't shrink too small
  min-width: 240px;

  // On mobile, take full width
  @media (max-width: 992px) {
    width: 100%;
    order: -1; // Move to top on mobile
    margin-bottom: 0.5rem;
  }

  // Customize the trigger button to look like a search bar
  > :deep(button) {
    border-radius: 8px; // Less round than pills
    justify-content: space-between;
    width: 100%;
    border: 1px solid $primary-color; // Distinct border
    background-color: #fff;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }
}

.filter-spacer {
  flex-grow: 1;
  @media (max-width: 992px) {
    display: none;
  }
}

/* --- Grid & Card Styles --- */
.vehicle-grid-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem 1.5rem;
}

.loading-message,
.no-vehicles-message {
  text-align: center;
  padding: 4rem 1rem;
  font-size: 1.1rem;
  color: $text-color-medium;
}

.empty-state-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  border: 1px dashed $border-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem auto;
  max-width: 500px;

  .icon-large {
    font-size: 3rem;
    color: $text-color-light;
  }
  p {
    font-size: 1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
  }
}

.observer-element {
  height: 50px;
  width: 100%;
}

/* Vehicle Fade Animation */
.vehicle-fade-enter-active,
.vehicle-fade-leave-active {
  transition: opacity 0.5s ease;
}
.vehicle-fade-enter-from,
.vehicle-fade-leave-to {
  opacity: 0;
}

/* Basic Button Style */
.button {
  padding: 0.75rem 1.25rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
}
.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border-color: $primary-color;
  &:hover {
    background-color: lighten($primary-color, 45%);
  }
}
</style>
