<!-- frontend/src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <!-- Hero Section with Background Image, New Title, and Centered Search Bar -->
    <section class="hero-section">
      <!-- The new hero title -->
      <h1 class="hero-title">Your Next Adventure, Your Way.</h1>
      
      <div class="search-bar">
        <div class="search-field where-field">
          <label class="field-label">Where</label>
          <input type="text" v-model="location" placeholder="City, airport, address or hotel" class="search-input">
        </div>
        <div class="search-divider"></div>
        <div class="search-field dates-field from-field">
          <label class="field-label">From</label>
          <div class="date-time-group">
            <div class="date-select" @click="isPickerVisible = true">
              <span class="date-placeholder">{{ fromDate || 'Select Date' }}</span>
            </div>
            <select v-model="fromTime" class="time-select" @click.stop>
              <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
        </div>
        <div class="search-divider"></div>
        <div class="search-field dates-field until-field">
          <label class="field-label">Until</label>
          <div class="date-time-group">
            <div class="date-select" @click="isPickerVisible = true">
              <span class="date-placeholder">{{ untilDate || 'Select Date' }}</span>
            </div>
            <select v-model="untilTime" class="time-select" @click.stop>
              <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
        </div>
        <button class="search-button" @click="searchVehicles">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </section>

    <!-- START OF NEW SECTION: Added based on user request -->
    <section class="skip-counter-section">
      <div class="container">
        <div class="skip-counter-content">
          <h2 class="main-title">Rent any car, anywhere, instantly.</h2>
          <p class="subtitle">Avoid the hassle of the rental counter and find a car to rent almost anywhere you go.</p>
        </div>
        <div class="airport-pickup-container">
          <div class="text-content">
            <h3 class="feature-title">Airport pickup made easy</h3>
            <p class="feature-description">
              Enjoy convenient vehicle pickup from local hosts at Mactan-Cebu International Airport.
            </p>
            <ul class="feature-list">
              <li><i class="bi bi-check-circle-fill check-icon"></i>Forget about waiting in lines or dealing with endless paperwork.</li>
              <li><i class="bi bi-check-circle-fill check-icon"></i>Effortlessly locate and access your booked vehicle using our simple website.</li>
              <li><i class="bi bi-check-circle-fill check-icon"></i>Travel with peace of mind thanks to round-the-clock support.</li>
            </ul>
            <button class="search-for-airports-button">Search for cars at airports</button>
          </div>
          <div class="illustration-container">
            <!-- Placeholder for the illustration -->
            <img src="https://airport-world.com/wp-content/uploads/2024/11/qwefqwefq.jpg" alt="Airport pickup illustration" class="illustration-image">
          </div>
        </div>
      </div>
    </section>
    <!-- END OF NEW SECTION -->

    <!-- Date Picker Component -->
    <DateRangePicker
      v-if="isPickerVisible"
      :start-date="fromDate"
      :end-date="untilDate"
      @update:startDate="fromDate = $event"
      @update:endDate="untilDate = $event"
      @close="isPickerVisible = false"
    />

    <!-- Add the BROWSE BY MAKES component here -->
    <BrowseByMake /> 

    <!-- Add the BROWSE BY CITIES component here -->
    <BrowseByCities /> 

        <!-- Add the BOOK OR BROWSE component here -->
    <BookOrHost /> 

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <h2 class="section-title">How It Works</h2>
      <div class="steps-grid">
        <div class="step-card">
          <i class="bi bi-search step-icon"></i>
          <h3>Find a Vehicle</h3>
          <p>Browse our wide selection of cars, trucks, and SUVs.</p>
        </div>
        <div class="step-card">
          <i class="bi bi-calendar-check step-icon"></i>
          <h3>Book Your Dates</h3>
          <p>Choose your pickup and return dates with flexible options.</p>
        </div>
        <div class="step-card">
          <i class="bi bi-car-front step-icon"></i>
          <h3>Enjoy Your Ride</h3>
          <p>Pick up your vehicle and start your journey!</p>
        </div>
      </div>
    </section>

    <!-- Featured Vehicles Section -->
    <section class="featured-vehicles-section">
      <h2 class="section-title">Featured Vehicles</h2>
      <div v-if="loadingVehicles" class="loading-message">
        <p>Loading featured vehicles...</p>
      </div>
      <div v-else-if="featuredVehicles.length === 0" class="no-vehicles-message">
        <p>No featured vehicles available at the moment.</p>
      </div>
      <div v-else class="vehicle-grid">
        <div v-for="vehicle in featuredVehicles" :key="vehicle.id" class="vehicle-card">
          <img :src="vehicle.imageUrl || getPlaceholderImage(300, 200, 'cccccc', '333333', 'No Image')"
              :alt="`${vehicle.make} ${vehicle.model}`"
              class="vehicle-image"
              @error="vehicle.imageUrl = getPlaceholderImage(300, 200, 'cccccc', '333333', 'No Image')">
          <div class="card-content">
            <h3 class="card-title">{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</h3>
            <p class="card-location"><i class="bi bi-geo-alt-fill"></i> {{ vehicle.location }}</p>
            <p class="card-price">₱{{ vehicle.rentalPricePerDay }} / day</p>
            <router-link :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }" class="view-details-button">
              View Details
            </router-link>
          </div>
        </div>
      </div>
      <div v-if="featuredVehicles.length > 0" class="view-all-button-container">
        <router-link to="/vehicles" class="button secondary-button">View All Vehicles</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DateRangePicker from '@/components/DateRangePicker.vue';
import BrowseByMake from '@/components/BrowseByMake.vue';
import BrowseByCities from '@/components/BrowseByCities.vue';
import BookOrHost from '@/components/BookOrHost.vue';


export default {
  name: 'HomeView',
  components: {
    DateRangePicker,
    BrowseByMake,
    BrowseByCities,
    BookOrHost,
  },
  data() {
    return {
      loadingVehicles: true,
      location: '',
      fromDate: '',
      fromTime: '',
      untilDate: '',
      untilTime: '',
      isPickerVisible: false,
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'allVehicles']),
    featuredVehicles() {
      // Ensure allVehicles is an array before attempting to slice
      if (Array.isArray(this.allVehicles)) {
        // Take the first 3 vehicles as featured
        return this.allVehicles.slice(0, 3);
      }
      return []; // Return an empty array if allVehicles is not an array
    },
    timeOptions() {
      const times = [];
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start at midnight
      for (let i = 0; i < 48; i++) {
        const date = new Date(now.getTime() + i * 30 * 60 * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        times.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
      }
      return times;
    },
  },
  methods: {
    ...mapActions(['fetchAllVehicles']),
    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    async loadFeaturedVehicles() {
      this.loadingVehicles = true;
      try {
        await this.fetchAllVehicles(); // Dispatch the action to load all vehicles into the store
      } catch (error) {
        console.error('Error loading featured vehicles:', error);
      } finally {
        this.loadingVehicles = false;
      }
    },
    setInitialDateTime() {
      const now = new Date();
      // Use toLocaleString to get PST date and time
      const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
      const pstDateTime = now.toLocaleString('en-US', options);

      // Split the string into date and time parts
      const [datePart, timePart] = pstDateTime.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');

      // Set 'From' date
      this.fromDate = `${year}-${month}-${day}`;
      // Find the closest 30-minute interval for 'From' time
      const initialFromTimeIndex = Math.floor((parseInt(hour) * 60 + parseInt(minute)) / 30);
      this.fromTime = this.timeOptions[initialFromTimeIndex] || '12:00 AM';

      // Set 'Until' date and time to 3 days later
      const untilDateObj = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      const pstUntilDateTime = untilDateObj.toLocaleString('en-US', options);
      const [untilDatePart, untilTimePart] = pstUntilDateTime.split(', ');
      const [untilMonth, untilDay, untilYear] = untilDatePart.split('/');
      const [untilHour, untilMinute] = untilTimePart.split(':');

      this.untilDate = `${untilYear}-${untilMonth}-${untilDay}`;
      // Find the closest 30-minute interval for 'Until' time
      const initialUntilTimeIndex = Math.floor((parseInt(untilHour) * 60 + parseInt(untilMinute)) / 30);
      this.untilTime = this.timeOptions[initialUntilTimeIndex] || '12:00 AM';
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
      this.$router.push({ name: 'VehicleList', query });
    },
  },
  created() {
    this.loadFeaturedVehicles();
    this.setInitialDateTime();
  },
};
</script>

<style lang="scss" scoped>
/* Import the Nunito font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
/* Import Bootstrap Icons CSS */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css');

@import '../assets/styles/variables.scss';

.home-container {
  /* Use Nunito as the primary font family */
  font-family: 'Nunito', sans-serif;
  color: $text-color-dark;
  background-color: #ffffff; // A light grey background
}

.button {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  border-radius: $border-radius-md;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
  text-align: center;
  cursor: pointer;

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

.hero-section {
  background-image: url('https://blog.carousell.ph/wp-content/uploads/PH_BlogCoverImages-8thSet_1024x536-2-696x364.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  min-height: 600px;
  display: flex;
  flex-direction: column; /* Stack children vertically */
  justify-content: center; /* Center content vertically */
  align-items: center; /* Center content horizontally */
  box-shadow: none;
  margin: 0;
  padding: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  text-align: center;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  z-index: 2;
  margin-bottom: 2rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-top: 5rem;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 9999px;
  padding: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  max-width: 1100px;
  width: 95%;
  position: static; /* Removed absolute positioning for desktop */
  z-index: 2;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 90%;
    border-radius: $border-radius-md;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.95);
    position: absolute; /* Re-applied absolute positioning for mobile */
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
}

.search-field {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  flex-grow: 1;
  cursor: pointer;
  
  .field-label {
    font-weight: 700;
    font-size: 0.8rem;
    color: $text-color-dark;
    margin-bottom: 0.25rem;
  }
  
  .search-input {
    border: none;
    background: transparent;
    font-size: 0.9rem;
    color: $text-color-dark;
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
  }
  
  .date-select {
    display: flex;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
    position: relative;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%236c757d' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.342 4 3.204 4h9.592c.863 0 1.32 1.013.754 1.658l-4.796 5.482a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.8rem 0.8rem;
    padding-right: 1.5rem;
  }
  
  .date-placeholder {
    font-size: 0.9rem;
    color: $text-color-medium;
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
    flex-basis: 0;
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%236c757d' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.342 4 3.204 4h9.592c.863 0 1.32 1.013.754 1.658l-4.796 5.482a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.8rem 0.8rem;
    padding-right: 2rem;
  }
}

.search-divider {
  width: 1px;
  height: 40px;
  background-color: #ddd;
  margin: 0 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.search-button {
  background-color: #6a0dad; // A purple color to match the reference image
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  font-size: 0.85rem;

  &:hover {
    background-color: darken($primary-color, 10%);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 1rem;
    border-radius: $border-radius-md;
    padding: 0.75rem;
  }
}

/* New section styling added based on the user's request */
.skip-counter-section {
  padding: 4rem 2rem;
  text-align: center;
  background-color: white;
  .main-title {
    font-size: 3rem;
    font-weight: 700;
    color: #191c2b;
    margin-bottom: 0.5rem;
  }
  .subtitle {
    font-size: 1.2rem;
    color: #4b4b4b;
    margin-bottom: 3rem;
  }
  .airport-pickup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    text-align: left;
    @media (max-width: 992px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .text-content {
      max-width: 500px;
      flex-basis: 50%; // Distribute space evenly
      @media (max-width: 992px) {
          text-align: center;
      }
    }
    .feature-title {
      font-size: 2rem;
      font-weight: 700;
      color: #191c2b;
      margin-bottom: 1rem;
    }
    .feature-description {
      font-size: 1.1rem;
      color: #4b4b4b;
      margin-bottom: 1.5rem;
    }
    .feature-list {
      list-style-type: none;
      padding: 0;
      margin: 0 0 2rem 0;
      li {
        display: flex;
        align-items: center;
        font-size: 1.1rem;
        color: #4b4b4b;
        margin-bottom: 0.75rem;
      }
      .check-icon {
        color: #6a0dad;
        margin-right: 0.75rem;
      }
    }
    .search-for-airports-button {
      background-color: #6a0dad;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      &:hover {
        background-color: darken(#6a0dad, 10%);
      }
    }
    .illustration-container {
        max-width: 500px; // Set a max-width for the container
        flex-basis: 50%; // Distribute space evenly
        text-align: center;
        @media (max-width: 992px) {
          max-width: 90%;
        }
    }
    .illustration-image {
      max-width: 100%; // Made the image fill its container
      height: auto;
      border-radius: 8px;
    }
  }
}
/* End of new section styling */


.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $primary-color;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  padding-bottom: 0.5rem;
  margin-left: 3rem;
  margin-right: 3rem;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: $secondary-color;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    margin: 2rem;
  }
}

.how-it-works-section {
  padding: 4rem 2rem;
  border-radius: $border-radius-lg;
  margin: 3rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.step-card {
  background-color: white;
  padding: 2rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  text-align: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-hover;
  }

  .step-icon {
    font-size: 3.5rem;
    color: $primary-color;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.6rem;
    font-weight: 700;
    color: $text-color-dark;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.1rem;
    color: $text-color-medium;
  }
}

.featured-vehicles-section {
  padding: 4rem 2rem;
  border-radius: $border-radius-lg;
  margin: 3rem;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.vehicle-card {
  background-color: white;
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
  flex-grow: 1;
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
  margin-top: auto;
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

.view-all-button-container {
  text-align: center;
  margin-top: 3rem;
}
</style>
