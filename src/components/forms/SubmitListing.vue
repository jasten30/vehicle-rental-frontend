<template>
  <div class="form-section">
    <h3 class="step-title">Review and Submit</h3>
    <p class="step-info-text">
      Please review all the information you have provided before submitting
      your vehicle for approval.
    </p>

    <div class="review-container" v-if="initialVehicle">
      <div class="review-section">
        <h4>Owner Information</h4>
        <div class="review-grid">
          <div class="review-item">
            <label>Profile Photo</label>
            <img :src="initialVehicle.userProfileImageUrl" alt="Profile" class="review-image small" />
          </div>
          <div class="review-item">
            <label>Driver's License</label>
            <img :src="initialVehicle.driversLicense.imageUrl" alt="License" class="review-image large" />
          </div>
        </div>
      </div>

      <div class="review-section">
        <h4>Vehicle Details</h4>
        <div class="review-grid">
          <div class="review-item"><label>Make:</label><p>{{ initialVehicle.make }}</p></div>
          <div class="review-item"><label>Model:</label><p>{{ initialVehicle.model }}</p></div>
          <div class="review-item"><label>Year:</label><p>{{ initialVehicle.year }}</p></div>
          <div class="review-item"><label>Seating Capacity:</label><p>{{ initialVehicle.seats }}</p></div>
          <div class="review-item"><label>Vehicle Type:</label><p>{{ initialVehicle.vehicleType }}</p></div>
          <div class="review-item"><label>Transmission:</label><p>{{ initialVehicle.transmission }}</p></div>
        </div>
      </div>
      
      <div class="review-section">
          <h4>Vehicle Documents</h4>
          <div class="review-grid">
              <div class="review-item"><label>Plate Number:</label><p>{{ initialVehicle.cor.plateNumber }}</p></div>
              <div class="review-item"><label>CR Number:</label><p>{{ initialVehicle.cor.crNumber }}</p></div>
              <div class="review-item"><label>OR Number:</label><p>{{ initialVehicle.or.orNumber }}</p></div>
          </div>
          <div class="review-grid photo-review">
              <div class="review-item"><label>Certificate of Registration (CR)</label><img :src="initialVehicle.cor.crImageUrl" alt="CR" class="review-image large" /></div>
              <div class="review-item"><label>Official Receipt (OR)</label><img :src="initialVehicle.or.orImageUrl" alt="OR" class="review-image large" /></div>
          </div>
      </div>

      <div class="review-section">
        <h4>Vehicle Photos</h4>
        <div class="photo-container">
          <div class="photo-thumbnail profile">
            <img :src="initialVehicle.profilePhotoUrl" alt="Vehicle Profile" />
            <span class="photo-label">Profile</span>
          </div>
          <div class="photo-thumbnail" v-for="(photo, index) in initialVehicle.exteriorPhotos" :key="`ext-${index}`">
            <img :src="photo" alt="Exterior Photo" />
          </div>
          <div class="photo-thumbnail" v-for="(photo, index) in initialVehicle.interiorPhotos" :key="`int-${index}`">
            <img :src="photo" alt="Interior Photo" />
          </div>
        </div>
      </div>

    </div>

    <div class="button-group-step">
      <button type="button" @click="$emit('prev')" class="button secondary-button">
        Previous
      </button>
      <button type="button" @click="$emit('submit')" class="button primary-button">
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
    },
  },
  emits: ['prev', 'submit'],
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.form-section {
  padding: 1.5rem 0;
}
.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
}
.review-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.review-section {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: $border-radius-md;
  border: 1px solid $border-color;
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $border-color;
  }
}
.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  &.photo-review {
      grid-template-columns: 1fr 1fr;
  }
}
.review-item {
  margin-bottom: 0.5rem;
  label {
    font-weight: 500;
    color: $text-color-medium;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.25rem;
  }
  p {
    margin: 0;
    color: $text-color-dark;
    font-size: 1rem;
    font-weight: 500;
  }
}
.review-image {
    width: 100%;
    border-radius: $border-radius-sm;
    margin-top: 0.5rem;
    border: 1px solid $border-color;
    &.small { max-width: 100px; }
    &.large { max-width: 250px; }
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
  border-radius: $border-radius-sm;
  overflow: hidden;
  border: 1px solid $border-color;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &.profile img {
      border: 2px solid $primary-color;
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
.button-group-step {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid $border-color;
}
.button {
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.primary-button {
  background-color: $primary-color;
  color: white;
}
.secondary-button {
  background-color: #6b7280;
  color: white;
}
</style>