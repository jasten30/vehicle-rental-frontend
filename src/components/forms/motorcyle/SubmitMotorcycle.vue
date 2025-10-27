<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Review and Submit</h3>
      <p class="step-info-text">
        Review your motorcycle's details. You can go back to any step to make changes.
      </p>

      <div class="review-container" v-if="motorcycle">
        <!-- Motorcycle Details Section -->
        <div class="review-section">
          <h4>Motorcycle Details</h4>
          <div class="review-grid">
            <div class="review-item"><label>Make:</label><p>{{ motorcycle.make || 'N/A' }}</p></div>
            <div class="review-item"><label>Model:</label><p>{{ motorcycle.model || 'N/A' }}</p></div>
            <div class="review-item"><label>Year:</label><p>{{ motorcycle.year || 'N/A' }}</p></div>
            <div class="review-item"><label>Type:</label><p>{{ motorcycle.motorcycleType || 'N/A' }}</p></div>
            <div class="review-item"><label>Engine:</label><p>{{ motorcycle.engineDisplacement || 'N/A' }} cc</p></div>
            <div class="review-item"><label>Plate:</label><p>{{ motorcycle.licensePlate || 'N/A' }}</p></div>
          </div>
        </div>

        <!-- Location Section -->
        <div class="review-section">
          <h4>Location</h4>
          <div class="review-grid">
            <div class="review-item"><label>City:</label><p>{{ motorcycle.location?.city || 'N/A' }}</p></div>
            <div class="review-item"><label>Barangay:</label><p>{{ motorcycle.location?.barangay || 'N/A' }}</p></div>
          </div>
        </div>

        <!-- Pricing Section -->
        <div class="review-section">
          <h4>Pricing</h4>
          <div class="review-grid">
            <div class="review-item"><label>Your Price:</label><p class="final-price">₱{{ (motorcycle.pricing?.manualPrice || motorcycle.pricing?.recommendedPrice || 0).toLocaleString() }} / day</p></div>
          </div>
        </div>

        <!-- Photos Section -->
        <div class="review-section">
          <h4>Photos</h4>
          <div class="photo-container">
             <img :src="motorcycle.profilePhotoUrl" alt="Profile" class="review-image" v-if="motorcycle.profilePhotoUrl" />
             <p v-else>No profile photo uploaded.</p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="navigation-buttons">
        <button type="button" @click="$emit('prev')" class="nav-button secondary">Previous</button>
        <button type="button" @click="$emit('submit')" class="nav-button primary">Submit Listing</button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "SubmitMotorcycle",
  props: {
    motorcycle: {
      type: Object,
      required: true,
    },
    isEditMode: Boolean,
  },
  emits: ['prev', 'submit'],
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
/* You can reuse the styles from SubmitListing.vue or create new ones */
.form-step-container { padding: 1rem 0; }
h3 { font-size: 1.25rem; font-weight: 600; color: $text-color-dark; margin-bottom: 0.5rem; }
.step-info-text { font-size: 0.95rem; color: $text-color-medium; margin-bottom: 2rem; line-height: 1.6; }

.review-container { display: flex; flex-direction: column; gap: 1.5rem; }
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
}
.review-item {
  label {
    font-weight: 600;
    color: $text-color-medium;
    font-size: 0.8rem;
    display: block;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
  }
  p { margin: 0; color: $text-color-dark; font-size: 1rem; font-weight: 500; }
  .final-price { font-weight: 700; color: $secondary-color; }
}
.photo-container {
  .review-image {
    width: 100%;
    max-width: 250px;
    height: auto;
    border-radius: $border-radius-md;
    border: 1px solid $border-color;
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
  &.primary {
    background-color: $secondary-color; // Use success color
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($secondary-color, 10%);
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
}
</style>
