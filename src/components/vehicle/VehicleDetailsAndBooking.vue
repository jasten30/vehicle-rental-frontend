<template>
  <div class="details-and-booking-container">
    <!-- Details Box -->
    <div class="details-box">
      <!-- New Header Section -->
      <div class="vehicle-header">
        <h2 class="vehicle-name">{{ vehicle.model }}</h2>
        <div class="vehicle-info">
          <span class="vehicle-make">{{ vehicle.make }}</span>
          <!-- Star icon is still an inline SVG for reliability -->
          <div class="vehicle-rating">
            <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span>4.5 (25 trips)</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Features are still using v-for -->
      <div class="vehicle-features">
        <div class="feature-tag" v-for="(feature, index) in vehicle.features" :key="index">
          <span class="feature-icon-wrapper">
             <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" v-html="feature.icon"></svg>
          </span>
          <span>{{ feature.text }}</span>
        </div>
      </div>
      
      <!-- Hosted By Section -->
      <hr class="divider">
      <div class="hosted-by-section">
        <h4 class="hosted-by-title">Hosted by</h4>
        <div class="host-profile">
          <img :src="host.profilePicture" alt="Host Profile Picture" class="host-avatar">
          <div class="host-details">
            <span class="host-name">{{ host.name }}</span>
            <span class="host-member-date">Member since {{ host.memberSince }}</span>
          </div>
        </div>
      </div>
      <hr class="divider">

      <!-- Details Section with two columns of static features -->
      <div class="details-list">
        <h4>Vehicle Features</h4>
        <div class="features-two-column-layout">
          <!-- Left Column -->
          <div class="left-column">
            <div class="feature-category">
              <h5>Device Connectivity</h5>
              <ul>
                <li>Apple CarPlay and Android Auto compatibility</li>
                <li>8-inch Touchscreen Infotainment System</li>
                <li>Bluetooth connectivity with hands-free function</li>
                <li>USB ports and 12V power outlets</li>
              </ul>
            </div>
            <div class="feature-category">
              <h5>Additional Features</h5>
              <ul>
                <li>LED Headlamps and Foglamps</li>
                <li>Leather Seats</li>
                <li>Power Adjustable Driver Seat</li>
                <li>Cool Box</li>
                <li>220V AC Outlet</li>
              </ul>
            </div>
          </div>
          <!-- Right Column -->
          <div class="right-column">
            <div class="feature-category">
              <h5>Safety</h5>
              <ul>
                <li>7 SRS Airbags (Front, Side, Curtain Shield, Driver Knee)</li>
                <li>Anti-Lock Brake System (ABS) with EBD</li>
                <li>Vehicle Stability Control (VSC)</li>
                <li>Hill-Start Assist Control (HAC)</li>
                <li>Downhill Assist Control (DAC)</li>
                <li>Tire Pressure Monitoring System (TPMS)</li>
                <li>Parking Sensors (Front & Rear)</li>
              </ul>
            </div>
            <div class="feature-category">
              <h5>Convenience</h5>
              <ul>
                <li>Smart Entry and Push Start System</li>
                <li>Power Back Door</li>
                <li>Cruise Control</li>
                <li>Paddle Shifters</li>
                <li>Automatic Climate Control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Section -->
    <div class="booking-section">
      <div class="sticky-booking">
        <h3>Book This Vehicle</h3>
        <div class="form-group">
          <label for="pickupDate">Pick-up Date:</label>
          <input type="date" id="pickupDate" v-model="localBookingForm.startDate" class="form-input" required>
        </div>
        <div class="form-group">
          <label for="returnDate">Return Date:</label>
          <input type="date" id="returnDate" v-model="localBookingForm.endDate" class="form-input" required>
        </div>
        <button @click="$emit('book-vehicle')" :disabled="bookingLoading" class="button primary-button">
          <span v-if="bookingLoading">Booking...</span>
          <span v-else>Reserve</span>
        </button>
        <div v-if="bookingErrorMessage" class="error-message booking-error">
          {{ bookingErrorMessage }}
        </div>
        <div v-if="bookingSuccessMessage" class="success-message booking-success">
          {{ bookingSuccessMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleDetailsAndBooking',
  props: {
    vehicle: {
      type: Object,
      required: false,
      default: () => ({
        make: 'Toyota',
        model: 'Fortuner 2022',
        licensePlate: 'PQR-5678',
        rentalPricePerDay: 2500,
        location: 'Manila, PH',
        description: 'A powerful and robust SUV, ideal for family trips and rugged roads.',
        status: 'Available',
        ownerId: 'owner-456',
        features: [
          // Using inline SVG paths for reliability
          { icon: `<path d="M16 17.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M2.5 12c.28 0 .5-.22.5-.5S2.78 11 2.5 11 2 11.22 2 11.5s.22.5.5.5z"/><path d="M21.5 12c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M12 2.5c0 .28-.22.5-.5.5S11 2.78 11 2.5s.22-.5.5-.5.5.22.5.5z"/><path d="M12 21.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5.22-.5.5-.5.5.22.5.5z"/>`, text: '7 seats' },
          { icon: `<path d="M20 11a8 8 0 1 0-16 0c0 4.41 3.59 8 8 8s8-3.59 8-8zM12 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6h-4V4zM4 12c0 4.41 3.59 8 8 8s8-3.59 8-8H4z"/>`, text: 'Diesel or Petrol' },
          { icon: `<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM12 9a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z"/>`, text: '~14.2 km/L' },
          { icon: `<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM12 9a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z"/>`, text: '6-speed automatic' },
        ],
        // The data is still here but no longer used for the static list
        details: {
          safety: [
            '7 SRS Airbags (Front, Side, Curtain Shield, Driver Knee)',
            'Anti-Lock Brake System (ABS) with Electronic Brake-Force Distribution (EBD)',
            'Vehicle Stability Control (VSC)',
            'Hill-Start Assist Control (HAC)',
            'Downhill Assist Control (DAC)',
            'Tire Pressure Monitoring System (TPMS)',
            'Parking Sensors (Front & Rear)'
          ],
          deviceConnectivity: [
            'Apple CarPlay and Android Auto compatibility',
            '8-inch Touchscreen Infotainment System',
            'Bluetooth connectivity with hands-free function',
            'USB ports and 12V power outlets'
          ],
          convenience: [
            'Smart Entry and Push Start System',
            'Power Back Door',
            'Cruise Control',
            'Paddle Shifters',
            'Automatic Climate Control'
          ],
          additionalFeatures: [
            'LED Headlamps and Foglamps',
            'Leather Seats',
            'Power Adjustable Driver Seat',
            'Cool Box',
            '220V AC Outlet'
          ]
        }
      }),
    },
    host: {
      type: Object,
      required: false,
      default: () => ({
        name: 'Jane Doe',
        profilePicture: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=JD',
        memberSince: 'July 2023',
      }),
    },
    bookingForm: {
      type: Object,
      required: true,
    },
    bookingLoading: {
      type: Boolean,
      required: true,
    },
    bookingErrorMessage: {
      type: String,
      default: null,
    },
    bookingSuccessMessage: {
      type: String,
      default: null,
    },
  },
  computed: {
    localBookingForm: {
      get() {
        return this.bookingForm;
      },
      set(newValue) {
        this.$emit('update:booking-form', newValue);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.details-and-booking-container {
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.details-box {
  flex: 1 0 65%;
  background-color: transparent;
  // Removed the border here
  border-radius: $border-radius-md;
  padding: 1.5rem;
}

.vehicle-header {
  margin-bottom: 1rem;
}

.vehicle-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: $text-color-dark;
  margin: 0;
}

.vehicle-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.25rem;
}

.vehicle-make {
  font-size: 1rem;
  color: $text-color-medium;
  font-weight: 500;
}

.vehicle-rating {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: $text-color-dark;
  
  .star-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
    color: $text-color-dark;
  }
}

.vehicle-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: $text-color-dark;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  color: $text-color-dark;
}

.feature-icon-wrapper svg {
    width: 100%;
    height: 100%;
}

.details-list {
  padding-top: 1.5rem;
}

h4 {
  font-size: 1.25rem;
  color: $primary-color;
  margin-bottom: 1rem;
}

.detail-line {
  font-size: 1rem;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
  strong {
    font-weight: 600;
  }
}

/* Hosted by section styles */
.divider {
  border: 0;
  height: 1px;
  background: #e0e0e0;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.hosted-by-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hosted-by-title {
  font-size: 1.25rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.host-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.host-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.host-details {
  display: flex;
  flex-direction: column;
}

.host-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #000;
}

.host-member-date {
  font-size: 0.85rem;
  color: $text-color-medium;
}

.booking-section {
  flex: 1 0 35%;
  
  @media (min-width: 769px) {
    align-self: stretch;
  }
}

.sticky-booking {
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  padding: 1.5rem;
  
  @media (min-width: 769px) {
    position: sticky;
    top: 20px;
  }

  h3 {
    font-size: 1.5rem;
    color: $primary-color;
    margin-bottom: 1.5rem;
    text-align: center;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: $text-color-dark;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
  width: 100%;
  margin-top: 1rem;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.booking-error, .booking-success {
  margin-top: 1rem;
  text-align: center;
}

.feature-category {
  margin-bottom: 1.5rem;

  h5 {
    font-size: 1rem;
    color: $text-color-dark;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0;
  }

  li {
    font-size: 1rem;
    color: $text-color-dark;
    margin-bottom: 0.25rem;
  }
}

.features-two-column-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.left-column, .right-column {
  flex: 1;
}

.left-column {
  order: 1; /* Left column comes first on larger screens */
  @media (max-width: 768px) {
    order: 2; /* Move to the bottom on smaller screens */
  }
}

.right-column {
  order: 2; /* Right column comes second on larger screens */
  @media (max-width: 768px) {
    order: 1; /* Move to the top on smaller screens */
  }
}
</style>
