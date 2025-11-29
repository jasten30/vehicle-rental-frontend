<!-- frontend/src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <!-- Hero Section Component -->
    <HeroSection class="scroll-animate" />

    <!-- Skip Counter Section Component -->
    <SkipCounterSection class="scroll-animate" />

    <!-- Date Picker Component -->
    <DateRangePicker
      v-if="isPickerVisible"
      :start-date="fromDate"
      :end-date="untilDate"
      @update:startDate="fromDate = $event"
      @update:endDate="untilDate = $event"
      @close="isPickerVisible = false"
    />

    <div class="listings-container scroll-animate">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading available vehicles...</p>
        <!-- You can add a spinner component here -->
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!vehiclesByCity || vehiclesByCity.length === 0"
        class="empty-state"
      >
        <h2 class="section-title">No vehicles found.</h2>
        <p>There are currently no vehicles listed. Check back soon!</p>
      </div>

      <!-- Vehicle Listings by City -->
      <div
        v-else
        v-for="group in vehiclesByCity"
        :key="group.city"
        class="location-group"
      >
        <div class="location-header">
          <h2 class="location-title">Top Picks in {{ group.city }}</h2>
          <router-link
            :to="{ name: 'VehicleList', query: { location: group.city } }"
            class="see-all-link"
          >
            See all ({{ group.vehicleCount }})
            <i class="bi bi-arrow-right-short"></i>
          </router-link>
        </div>

        <!-- Responsive Vehicle Grid -->
        <div class="vehicle-grid">
          <!-- We only show a limited number per city (e.g., first 4 or 5) -->
          <!-- UPDATED: Show 5 cards per row on large screens -->
          <VehicleCard
            v-for="vehicle in group.vehicles.slice(0, 5)"
            :key="vehicle.id"
            :vehicle="vehicle"
          />
        </div>
      </div>
    </div>
    <!-- ================================================ -->
    <!-- END NEW SECTION -->
    <!-- ================================================ -->

    <!-- Add the BOOK OR BROWSE component here -->
    <BookOrHost class="scroll-animate" />

    <!-- Add the FAQ SECTION component here -->
    <FAQSection class="scroll-animate" />

    <!-- REMOVED: FooterSection component moved to App.vue -->
    <!-- <FooterSection class="scroll-animate" /> -->
  </div>
</template>

<script>
// --- UPDATED IMPORTS ---
import { mapGetters, mapActions } from "vuex";
import HeroSection from "@/components/HomeViewComponents/HeroSection.vue";
import SkipCounterSection from "@/components/HomeViewComponents/SkipCounterSection.vue";
import DateRangePicker from "@/components/HomeViewComponents/DateRangePicker.vue";
// BrowseByMake import removed
import BookOrHost from "@/components/HomeViewComponents/BookOrHost.vue";
import FAQSection from "@/components/HomeViewComponents/FAQSection.vue";
import VehicleCard from "@/components/VehicleCard.vue"; // --- NEW IMPORT ---
// --- REMOVED: FooterSection import ---
// import FooterSection from '@/components/HomeViewComponents/FooterSection.vue';

export default {
  name: "HomeView",
  components: {
    HeroSection,
    SkipCounterSection,
    DateRangePicker,
    // BrowseByMake, // Removed
    BookOrHost,
    FAQSection,
    VehicleCard, // --- NEW COMPONENT ---
    // FooterSection, // --- REMOVED ---
  },
  data() {
    return {
      location: "",
      fromDate: "",
      fromTime: "",
      untilDate: "",
      untilTime: "",
      isPickerVisible: false,
      loading: true, // --- NEW ---
      observer: null, // --- NEW for scroll animation ---
    };
  },
  computed: {
    // --- NEW VUEX GETTERS ---
    // FIX: Assuming root getters, removed namespace
    ...mapGetters(["allVehicles"]),

    // --- NEW COMPUTED PROPERTY ---
    vehiclesByCity() {
      if (!this.allVehicles || this.allVehicles.length === 0) {
        return [];
      }

      // 1. Group vehicles by city and count them
      const grouped = {};
      const cityCounts = {};

      for (const vehicle of this.allVehicles) {
        const city = vehicle.location?.city;
        if (!city) continue; // Skip vehicles with no city

        if (!grouped[city]) {
          grouped[city] = [];
          cityCounts[city] = 0;
        }

        grouped[city].push(vehicle);
        cityCounts[city]++;
      }

      // 2. Sort the cities by popularity (most vehicles first)
      const sortedCities = Object.keys(grouped).sort((a, b) => {
        return cityCounts[b] - cityCounts[a];
      });

      // 3. Create the final array, sorting vehicles within each city
      return sortedCities.map((city) => {
        const vehiclesInCity = grouped[city];

        // Sort vehicles by Year (newest first) as a stand-in for ratings
        vehiclesInCity.sort((a, b) => (b.year || 0) - (a.year || 0));

        return {
          city: city,
          vehicleCount: cityCounts[city],
          vehicles: vehiclesInCity,
        };
      });
    },

    timeOptions() {
      const times = [];
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start at midnight
      for (let i = 0; i < 48; i++) {
        const date = new Date(now.getTime() + i * 30 * 60 * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        times.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
      }
      return times;
    },
  },
  methods: {
    // --- NEW VUEX ACTION ---
    // FIX: Assuming root action, removed namespace
    ...mapActions(["fetchAllVehicles"]),

    setInitialDateTime() {
      const now = new Date();
      // Use toLocaleString to get PST date and time
      const options = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const pstDateTime = now.toLocaleString("en-US", options);

      // Split the string into date and time parts
      const [datePart, timePart] = pstDateTime.split(", ");
      const [month, day, year] = datePart.split("/");
      const [hour, minute] = timePart.split(":");

      // Set 'From' date
      this.fromDate = `${year}-${month}-${day}`;
      // Find the closest 30-minute interval for 'From' time
      const initialFromTimeIndex = Math.floor(
        (parseInt(hour) * 60 + parseInt(minute)) / 30
      );
      this.fromTime = this.timeOptions[initialFromTimeIndex] || "12:00 AM";

      // Set 'Until' date and time to 3 days later
      const untilDateObj = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const pstUntilDateTime = untilDateObj.toLocaleString("en-US", options);
      const [untilDatePart, untilTimePart] = pstUntilDateTime.split(", ");
      const [untilMonth, untilDay, untilYear] = untilDatePart.split("/");
      // FIX: Correctly use untilMinute
      const [untilHour, untilMinute] = untilTimePart.split(":");

      this.untilDate = `${untilYear}-${untilMonth}-${untilDay}`;
      // Find the closest 30-minute interval for 'Until' time
      // FIX: Use parseInt(untilMinute) instead of parseInt(minute)
      const initialUntilTimeIndex = Math.floor(
        (parseInt(untilHour) * 60 + parseInt(untilMinute)) / 30
      );
      this.untilTime = this.timeOptions[initialUntilTimeIndex] || "12:00 AM";
    },
    searchVehicles() {
      // Correctly route to the 'VehicleList' page, which is the correct name
      // defined in your router/index.js file for the vehicles page.
      const query = {
        location: this.location,
        fromDate: this.fromDate,
        fromTime: this.fromTime,
        untilDate: this.untilDate,
        untilTime: this.untilTime,
      };

      // Changed the name from "Vehicles" to "VehicleList"
      this.$router.push({ name: "VehicleList", query });
    },
  },
  async created() {
    this.setInitialDateTime();
    // --- NEW: Fetch vehicles on load ---
    this.loading = true;
    try {
      await this.fetchAllVehicles();
    } catch (error) {
      console.error("HomeView: Failed to fetch vehicles", error);
    } finally {
      this.loading = false;
    }
  },
  // --- NEW: mounted() hook for scroll animation ---
  mounted() {
    const options = {
      root: null, // relative to the viewport
      threshold: 0.2, // 20% of the item must be visible
      rootMargin: "0px 0px -50px 0px", // trigger 50px before it's fully in view
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.observer.unobserve(entry.target); // Animate only once
        }
      });
    }, options);

    // Observe all elements with the .scroll-animate class
    this.$nextTick(() => {
      // Check if $el exists before querying
      if (this.$el) {
        const sections = this.$el.querySelectorAll(".scroll-animate");
        sections.forEach((section) => {
          if (section) {
            // Check if section is not null
            this.observer.observe(section);
          }
        });
      }
    });
  },
  // --- NEW: beforeUnmount() hook to clean up ---
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
};
</script>

<style lang="scss" scoped>
/* Import the Nunito font from Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap");
/* Import Bootstrap Icons CSS */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

@import "../assets/styles/variables.scss";

.home-container {
  font-family: "Nunito", sans-serif;
  color: $text-color-dark;
  background-color: #ffffff;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll on mobile */
}

.button {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  border-radius: $border-radius-md;
  text-decoration: none;
  font-weight: 600;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;

  &.primary-button {
    background-color: $primary-color;
    color: white;
    border: 1px solid $primary-color;

    &:hover {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
    }
  }

  &.secondary-button {
    background-color: transparent;
    color: $primary-color;
    border: 1px solid $primary-color;

    &:hover {
      background-color: lighten($primary-color, 40%);
      transform: translateY(-2px);
    }
  }
}

/* --- SEARCH BAR STYLES --- */
/* Note: Assuming these fields are wrapped in a .search-bar container in your template */
.search-field {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem; /* Larger touch target */
  flex-grow: 1;
  cursor: pointer;
  border-bottom: 1px solid #eee; /* Divider for mobile stack */

  @media (min-width: 992px) {
    border-bottom: none;
    padding: 0.5rem 1rem;
  }

  .field-label {
    font-weight: 700;
    font-size: 0.75rem;
    color: $text-color-dark;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .search-input {
    border: none;
    background: transparent;
    font-size: 1rem; /* 16px to prevent zoom on iOS */
    color: $text-color-dark;
    width: 100%;
    &:focus {
      outline: none;
    }
  }
}

.where-field {
  flex-grow: 2;
}

.dates-field {
  flex-shrink: 0;

  .date-time-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap; /* Allow wrapping on tiny screens */
  }

  .date-select {
    display: flex;
    align-items: center;
    flex-grow: 1;
    position: relative;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%236c757d' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.342 4 3.204 4h9.592c.863 0 1.32 1.013.754 1.658l-4.796 5.482a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 0.7rem 0.7rem;
    padding-right: 1.2rem;
  }

  .date-placeholder {
    font-size: 0.9rem;
    color: $text-color-medium;
    white-space: nowrap;
  }

  .time-select {
    border: none;
    background: transparent;
    font-size: 0.9rem;
    color: $text-color-medium;
    &:focus {
      outline: none;
    }
    flex-grow: 1;
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%236c757d' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.342 4 3.204 4h9.592c.863 0 1.32 1.013.754 1.658l-4.796 5.482a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 0.7rem 0.7rem;
    padding-right: 1.5rem;
  }
}

.search-divider {
  width: 1px;
  height: 40px;
  background-color: #ddd;
  margin: 0 0.5rem;

  /* Hide divider on mobile since they stack */
  @media (max-width: 991px) {
    display: none;
  }
}

.search-button {
  background-color: #6a0dad;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  font-size: 1rem;
  font-weight: 700;

  &:hover {
    background-color: darken($primary-color, 10%);
  }

  /* Full width button on mobile */
  @media (max-width: 991px) {
    width: 90%;
    margin: 1rem auto; /* Center with margin */
    border-radius: $border-radius-md;
    padding: 1rem;
  }
}

/* --- SECTION TITLES --- */
.section-title {
  font-size: 1.8rem; /* Smaller on mobile */
  font-weight: 800;
  color: $primary-color;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
  margin-left: 1rem;
  margin-right: 1rem;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: $secondary-color;
    border-radius: 2px;
  }

  @media (min-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 3rem;

    &::after {
      width: 80px;
    }
  }
}

/* --- LISTINGS CONTAINER --- */
.listings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  max-width: 1400px;
  margin: 0 auto 3rem auto;
  padding: 0 1rem; /* Reduced padding on mobile */

  @media (min-width: 768px) {
    padding: 0 2rem;
    gap: 3rem;
  }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.1rem;
  color: $text-color-medium;

  p {
    font-size: 1rem;
  }
}

/* --- LOCATION GROUP HEADER --- */
.location-group {
  width: 100%;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid $border-color-light;
  padding-bottom: 0.75rem;
  flex-wrap: wrap; /* Allow wrapping on very small phones */
  gap: 0.5rem;
}

.location-title {
  font-size: 1.25rem; /* Smaller on mobile */
  font-weight: 700;
  color: $text-color-dark;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
}

.see-all-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: $primary-color;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    font-size: 1rem;
  }

  &:hover {
    color: darken($primary-color, 10%);
    text-decoration: underline;
    i {
      transform: translateX(3px);
    }
  }

  i {
    font-size: 1.1rem;
    transition: transform 0.2s ease;
  }
}

/* --- VEHICLE GRID --- */
.vehicle-grid {
  display: grid;

  /* Mobile: 1 column (default) or tight 2 columns */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;

  /* Small Mobile Optimizations */
  @media (max-width: 480px) {
    grid-template-columns: 1fr; /* Force single column on small phones */
    gap: 1.25rem;
  }

  /* Desktop Optimizations */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }
}

/* --- ANIMATIONS --- */
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
