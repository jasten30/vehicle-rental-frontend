<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Review and Submit</h3>
      <p class="step-info-text">
        Please review all the information you have provided before submitting
        your vehicle for approval.
      </p>

      <div class="review-container" v-if="vehicle">
        
        <div class="review-section">
          <h4>Vehicle Details</h4>
          <div class="review-grid">
            <div class="review-item"><label>Make:</label><p>{{ vehicle.make || 'N/A' }}</p></div>
            <div class="review-item"><label>Model:</label><p>{{ vehicle.model || 'N/A' }}</p></div>
            <div class="review-item"><label>Year:</label><p>{{ vehicle.year || 'N/A' }}</p></div>
            <div class="review-item"><label>Seats:</label><p>{{ vehicle.seats || 'N/A' }}</p></div>
            <div class="review-item"><label>Vehicle Type:</label><p>{{ vehicle.vehicleType || 'N/A' }}</p></div>
            <div class="review-item"><label>Transmission:</label><p>{{ vehicle.transmission || 'N/A' }}</p></div>
            <div class="review-item"><label>Fuel Type:</label><p>{{ vehicle.fuelType || 'N/A' }}</p></div>
          </div>
        </div>
        
        <div class="review-section">
          <h4>Pickup & Return Location</h4>
          <div class="review-grid">
            <div class="review-item"><label>City:</label><p>{{ vehicle.location?.city || 'N/A' }}</p></div>
            <div class="review-item"><label>Barangay:</label><p>{{ vehicle.location?.barangay || 'N/A' }}</p></div>
          </div>
        </div>
        
        <div class="review-section">
          <h4>Vehicle Documents</h4>
          <div class="review-grid">
            <div class="review-item"><label>Plate Number:</label><p>{{ vehicle.cor?.plateNumber || 'N/A' }}</p></div>
          </div>
          <div class="review-grid photo-review">
            <div class="review-item">
              <label>Certificate of Registration (CR)</label>
              <img :src="vehicle.cor?.corImage" alt="CR" class="review-image" @error="onImageError" />
            </div>
            <div class="review-item">
              <label>Official Receipt (OR)</label>
              <img :src="vehicle.or?.orImage" alt="OR" class="review-image" @error="onImageError" />
            </div>
          </div>
        </div>

        <div class="review-section">
          <h4>Pricing</h4>
          <div class="review-grid">
            <div class="review-item"><label>Market Value:</label><p>₱{{ vehicle.pricing?.marketValue?.toLocaleString() || 'N/A' }}</p></div>
            <div class="review-item"><label>Condition:</label><p style="text-transform: capitalize;">{{ vehicle.pricing?.condition || 'N/A' }}</p></div>
            <div class="review-item"><label>Recommended Price:</label><p>₱{{ vehicle.pricing?.recommendedPrice?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A' }} / day</p></div>
            <div class="review-item"><label>Your Price:</label><p class="final-price">₱{{ (vehicle.pricing?.manualPrice || vehicle.pricing?.recommendedPrice || 0).toLocaleString(undefined, {maximumFractionDigits: 0}) }} / day</p></div>
          </div>
        </div>

        <div class="review-section">
          <h4>Features</h4>
          <div v-if="selectedFeatures.length > 0" class="features-pills-group">
            <span v-for="featureName in selectedFeatures" :key="featureName" class="feature-pill">
              {{ featureName }}
            </span>
          </div>
          <p v-else class="no-data-text">No additional features listed.</p>
        </div>

        <div class="review-section">
          <h4>Safety & Quality Checklist</h4>
          <ul class="safety-list">
            <li :class="{ 'checked': vehicle.safety?.tiresChecked }">Tires in good condition</li>
            <li :class="{ 'checked': vehicle.safety?.brakesChecked }">Brakes functional</li>
            <li :class="{ 'checked': vehicle.safety?.lightsChecked }">All lights working</li>
            <li :class="{ 'checked': vehicle.safety?.wipersChecked }">Horn & wipers functional</li>
            <li :class="{ 'checked': vehicle.safety?.emergencyToolsChecked }">Emergency tools included</li>
            <li :class="{ 'checked': vehicle.safety?.registrationChecked }">Valid registration</li>
            <li :class="{ 'checked': vehicle.safety?.cleanlinessChecked }">Vehicle is clean</li>
          </ul>
          <div v-if="vehicle.safety?.notes" class="review-item">
            <label>Additional Notes:</label>
            <p class="notes-text">"{{ vehicle.safety.notes }}"</p>
          </div>
        </div>

        <div class="review-section">
          <h4>Vehicle Photos</h4>
          <div class="photo-container">
            <div class="photo-thumbnail profile">
              <img :src="vehicle.profilePhotoUrl" alt="Vehicle Profile" @error="onImageError" />
              <span class="photo-label">Profile</span>
            </div>
            <div class="photo-thumbnail" v-for="(photo, index) in vehicle.exteriorPhotos" :key="`ext-${index}`">
              <img :src="photo" alt="Exterior Photo" @error="onImageError" />
            </div>
            <div class="photo-thumbnail" v-for="(photo, index) in vehicle.interiorPhotos" :key="`int-${index}`">
              <img :src="photo" alt="Interior Photo" @error="onImageError" />
            </div>
          </div>
        </div>
      </div>

      <div class="navigation-buttons">
        <button type="button" @click="$emit('prev')" class="nav-button secondary">
          Previous
        </button>
        <button type="button" @click="$emit('submit')" class="nav-button primary">
          Submit Listing
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SubmitListing',
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
    isEditMode: {
        type: Boolean,
        default: false
    }
  },
  emits: ['prev', 'submit'],
  
  data() {
    return {
      // This map is used to translate keys (e.g., 'appleCarPlay') 
      // back to display names (e.g., 'Apple CarPlay')
      featuresList: {
        Safety: [
          { name: "Seatbelts and Airbags", key: "seatbeltsAndAirbags" },
          { name: "Anti-lock Braking System (ABS)", key: "abs" },
          { name: "Electronic Stability Control (ESC)", key: "esc" },
          { name: "Back-up Camera", key: "backupCamera" },
          { name: "Blind Spot Monitoring (BSM)", key: "bsm" },
          { name: "Tire Pressure Monitoring System (TPMS)", key: "tpms" },
          { name: "Forward Collision Warning (FCW)", key: "fcw" },
        ],
        "Device Connectivity": [
          { name: "Bluetooth", key: "bluetooth" },
          { name: "USB Port", key: "usbPort" },
          { name: "Apple CarPlay", key: "appleCarPlay" },
          { name: "Android Auto", key: "androidAuto" },
        ],
        Convenience: [
          { name: "GPS Navigation", key: "gps" },
          { name: "Keyless Entry", key: "keylessEntry" },
          { name: "Heated Seats", key: "heatedSeats" },
          { name: "Sunroof", key: "sunroof" },
        ],
        // ======================================================
        //  FIXED TYPOS HERE
        // ======================================================
        "Additional Features": [
          { name: "Child Seat", key: "childSeat" },
          { name: "Bike Rack", key: "bikeRack" }, 
          { name: "Roof Box", key: "roofBox" },
          { name: "Pet Friendly", key: "petFriendly" },
        ],
        // ======================================================
      },
    };
  },
  computed: {
    // 1. Creates a simple map: { bluetooth: 'Bluetooth', ... }
    featureNameMap() {
      const map = {};
      for (const category in this.featuresList) {
        for (const feature of this.featuresList[category]) {
          map[feature.key] = feature.name;
        }
      }
      return map;
    },
    // 2. Creates an array of names for all selected (true) features
    selectedFeatures() {
      if (!this.vehicle.features) {
        return [];
      }
      return Object.keys(this.vehicle.features)
        // Find all keys where the value is true
        .filter(key => this.vehicle.features[key] === true)
        // Map those keys to their display names
        .map(key => this.featureNameMap[key] || key); // Fallback to key if name not found
    }
  },

  methods: {
      onImageError(event) {
          // Set a generic placeholder if an image fails to load
          event.target.src = 'https://placehold.co/400x300/e2e8f0/666660?text=Image+Error';
      }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* --- Entrance Animation --- */
.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.form-step-fade-enter-from,
.form-step-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.form-step-container {
  padding: 1rem 0;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.step-info-text {
  font-size: 0.95rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  line-height: 1.6;
}
.review-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.review-section {
  background-color: $background-light;
  padding: 1.5rem;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color-light;
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $border-color-light;
    color: $primary-color;
  }
}
.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  &.photo-review {
    grid-template-columns: 1fr 1fr;
    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
  }
}
.review-item {
  margin-bottom: 0.5rem;
  label {
    font-weight: 600;
    color: $text-color-medium;
    font-size: 0.8rem;
    display: block;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
  }
  p {
    margin: 0;
    color: $text-color-dark;
    font-size: 1rem;
    font-weight: 500;
    &.final-price {
        font-weight: 700;
        color: $secondary-color;
        font-size: 1.1rem;
    }
    &.notes-text {
        font-style: italic;
        color: $text-color-medium;
        font-size: 0.9rem;
        white-space: pre-wrap;
    }
  }
}
.review-image {
    width: 100%;
    max-width: 250px;
    height: auto;
    border-radius: $border-radius-md;
    margin-top: 0.5rem;
    border: 1px solid $border-color;
    background-color: white;
}
.photo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}
.photo-thumbnail {
  position: relative;
  width: 100px;
  height: 75px;
  border-radius: $border-radius-md;
  overflow: hidden;
  border: 1px solid $border-color;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &.profile {
    border: 3px solid $primary-color;
  }
  .photo-label {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0,0,0,0.5);
      color: white;
      font-size: 0.7rem;
      padding: 0.1rem;
      text-align: center;
  }
}
.features-pills-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.feature-pill {
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: $border-radius-pill;
  border: 1px solid $secondary-color;
  background-color: lighten($secondary-color, 45%);
  color: darken($secondary-color, 20%);
}
.no-data-text {
    font-size: 0.9rem;
    color: $text-color-medium;
    font-style: italic;
}
.safety-list {
    list-style-type: none;
    padding-left: 0;
    li {
        font-size: 0.9rem;
        color: $text-color-medium;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        &::before {
            content: '☐';
            font-size: 1.2rem;
            margin-right: 0.5rem;
            color: $text-color-medium;
        }
        &.checked {
            color: $text-color-dark;
            &::before {
                content: '☑';
                color: $secondary-color;
            }
        }
    }
}


.navigation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color-light;
}
.nav-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px;
  text-align: center;
  &.primary {
    background-color: $secondary-color; // Use success color for final submit
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($secondary-color, 10%);
      transform: translateY(-2px);
      box-shadow: $shadow-medium;
    }
  }
  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $border-color;
    &:hover {
      color: $text-color-dark;
      background-color: $background-light;
    }
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>