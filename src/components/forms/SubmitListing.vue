<template>
  <div class="form-section step-12">
    <h3>Step 12: Review and Submit</h3>
    <p class="step-info-text">
      Please review all the information you have provided before submitting your vehicle for approval.
    </p>

    <!-- FIX: Added v-if to ensure all necessary data is present before rendering -->
    <div class="review-container" v-if="initialVehicle && initialVehicle.photos && initialVehicle.location">
      <!-- User Profile and License Photos -->
      <div class="review-section">
        <h4>Owner Information</h4>
        <div class="review-item">
          <label>Profile Photo:</label>
          <img :src="initialVehicle.userProfileImageUrl" alt="Owner's Profile" class="review-image profile-image" v-if="initialVehicle.userProfileImageUrl"/>
          <span v-else>No profile photo provided.</span>
        </div>
        <div class="review-item">
          <label>Driver's License:</label>
          <img :src="initialVehicle.driversLicense.imageUrl" alt="Driver's License" class="review-image license-image" v-if="initialVehicle.driversLicense && initialVehicle.driversLicense.imageUrl"/>
          <span v-else>No license photo provided.</span>
        </div>
        <div class="review-item">
          <label>Mobile Number for Payout:</label>
          <p v-if="initialVehicle.payoutDetails">{{ initialVehicle.payoutDetails.mobileNumber }}</p>
        </div>
      </div>

      <!-- Vehicle Details -->
      <div class="review-section">
        <h4>Vehicle Details</h4>
        <div class="review-item">
          <label>Make:</label>
          <p>{{ initialVehicle.make }}</p>
        </div>
        <div class="review-item">
          <label>Model:</label>
          <p>{{ initialVehicle.model }}</p>
        </div>
        <div class="review-item">
          <label>Year:</label>
          <p>{{ initialVehicle.year }}</p>
        </div>
        <div class="review-item">
          <label>Seating Capacity:</label>
          <p>{{ initialVehicle.seatingCapacity }}</p>
        </div>
        <div class="review-item">
          <label>Condition:</label>
          <p>{{ initialVehicle.pricing.condition }}</p>
        </div>
        <div class="review-item">
          <label>Market Value:</label>
          <p>₱{{ initialVehicle.pricing.marketValue ? initialVehicle.pricing.marketValue.toLocaleString() : 'N/A' }}</p>
        </div>
        <div class="review-item">
          <label>Manual Price:</label>
          <p>₱{{ initialVehicle.pricing.manualPrice ? initialVehicle.pricing.manualPrice.toLocaleString() : 'N/A' }}</p>
        </div>
      </div>

      <!-- Vehicle Documents -->
      <div class="review-section">
        <h4>Vehicle Documents & Photos</h4>
        <div class="review-item">
          <label>CR Number:</label>
          <p>{{ initialVehicle.cor.crNumber }}</p>
        </div>
        <div class="review-item">
          <label>Plate Number:</label>
          <p>{{ initialVehicle.cor.plateNumber }}</p>
        </div>
        <div class="review-item">
          <label>OR Number:</label>
          <p>{{ initialVehicle.or.orNumber }}</p>
        </div>
        <div class="review-item photo-grid">
          <label>Vehicle Photos:</label>
          <div class="photo-thumbnail" v-for="photo in initialVehicle.photos" :key="photo">
            <img :src="photo" alt="Vehicle Photo"/>
          </div>
        </div>
      </div>

      <!-- Safety & Location -->
      <div class="review-section">
        <h4>Safety & Location</h4>
        <div class="review-item">
          <label>Location:</label>
          <p v-if="initialVehicle.location">{{ initialVehicle.location.barangay }}, {{ initialVehicle.location.city }}, {{ initialVehicle.location.region }}</p>
        </div>
        <div class="review-item">
          <label>Safety Checklist:</label>
          <ul v-if="initialVehicle.safety">
            <li>Tires Checked: {{ initialVehicle.safety.tiresChecked ? 'Yes' : 'No' }}</li>
            <li>Brakes Checked: {{ initialVehicle.safety.brakesChecked ? 'Yes' : 'No' }}</li>
            <li>Lights Checked: {{ initialVehicle.safety.lightsChecked ? 'Yes' : 'No' }}</li>
            <li>Wipers Checked: {{ initialVehicle.safety.wipersChecked ? 'Yes' : 'No' }}</li>
            <li>Emergency Tools: {{ initialVehicle.safety.emergencyToolsChecked ? 'Yes' : 'No' }}</li>
            <li>Registration: {{ initialVehicle.safety.registrationChecked ? 'Yes' : 'No' }}</li>
            <li>Cleanliness: {{ initialVehicle.safety.cleanlinessChecked ? 'Yes' : 'No' }}</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="button-group-step">
      <button type="button" @click="$emit('prev')" class="button secondary-button">Previous</button>
      <button 
        type="submit" 
        class="button primary-button"
      >
        Submit Listing
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubmitListing',
  props: {
    initialVehicle: {
      type: Object,
      required: true,
      default: () => ({
        location: {},
        cor: {},
        or: {},
        payoutDetails: {},
        driversLicense: {},
        pricing: {},
        safety: {},
        photos: [],
      })
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-section {
  padding: 1.5rem;
  border-radius: $border-radius-md;
  background-color: #f9fafb;
}

.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.review-container {
  display: grid;
  gap: 2rem;
}

.review-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: $border-radius-sm;
  box-shadow: $box-shadow-sm;
  
  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: $primary-color;
    border-bottom: 2px solid $border-color;
    padding-bottom: 0.5rem;
  }
}

.review-item {
  margin-bottom: 1rem;
  
  label {
    font-weight: 600;
    color: $text-color-dark;
    margin-bottom: 0.25rem;
    display: block;
  }
  
  p {
    margin: 0;
    color: $text-color-light;
  }
}

.review-image {
  max-width: 100%;
  height: auto;
  border-radius: $border-radius-sm;
  margin-top: 0.5rem;
  object-fit: cover;
  border: 1px solid $border-color;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.license-image {
  max-width: 300px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  
  .photo-thumbnail {
    width: 100%;
    height: 100px;
    position: relative;
    border-radius: $border-radius-sm;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease-in-out;
      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

.button-group-step {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: $border-radius-sm;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
}

.secondary-button {
  background-color: #6b7280;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#6b7280, 10%);
  }
}
</style>
