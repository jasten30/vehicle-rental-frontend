<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <div class="header-section">
        <h3>Review and Submit</h3>
        <p class="step-info-text">
          Please review your motorcycle's details below.
        </p>
      </div>

      <div class="review-container" v-if="motorcycle">
        <div class="review-card">
          <div class="card-header">
            <h4><i class="fas fa-motorcycle"></i> Motorcycle Details</h4>
          </div>
          <div class="card-body">
            <div class="review-grid">
              <div class="review-item">
                <label>Make</label>
                <p>{{ motorcycle.make || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Model</label>
                <p>{{ motorcycle.model || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Year</label>
                <p>{{ motorcycle.year || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Type</label>
                <p>{{ motorcycle.motorcycleType || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Engine</label>
                <p>{{ motorcycle.engineDisplacement || "N/A" }} cc</p>
              </div>
              <div class="review-item">
                <label>Plate</label>
                <p class="plate-text">
                  {{
                    motorcycle.cor?.plateNumber ||
                    motorcycle.licensePlate ||
                    "N/A"
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="review-card">
          <div class="card-header">
            <h4><i class="fas fa-map-marker-alt"></i> Pickup Location</h4>
          </div>
          <div class="card-body">
            <div class="review-grid">
              <div class="review-item">
                <label>City</label>
                <p>{{ motorcycle.location?.city || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Barangay</label>
                <p>{{ motorcycle.location?.barangay || "N/A" }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="review-card highlight-card">
          <div class="card-header">
            <h4><i class="fas fa-tag"></i> Pricing</h4>
          </div>
          <div class="card-body">
            <div class="review-grid">
              <div class="review-item final-price-item">
                <label>Your Daily Rate</label>
                <p class="final-price">
                  ₱{{
                    (
                      motorcycle.pricing?.manualPrice ||
                      motorcycle.pricing?.recommendedPrice ||
                      0
                    ).toLocaleString()
                  }}
                  <span class="per-day">/ day</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="review-card">
          <div class="card-header">
            <h4><i class="fas fa-camera"></i> Photos</h4>
          </div>
          <div class="card-body">
            <div class="photo-container">
              <div
                class="photo-wrapper profile"
                v-if="motorcycle.profilePhotoUrl"
              >
                <img
                  :src="motorcycle.profilePhotoUrl"
                  alt="Profile"
                  @error="onImageError"
                />
                <span class="photo-badge">Main Profile</span>
              </div>

              <div
                class="photo-wrapper"
                v-for="(photo, index) in motorcycle.exteriorPhotos"
                :key="`ext-${index}`"
              >
                <img :src="photo" alt="Gallery Photo" @error="onImageError" />
              </div>

              <p
                v-if="
                  !motorcycle.profilePhotoUrl &&
                  (!motorcycle.exteriorPhotos ||
                    motorcycle.exteriorPhotos.length === 0)
                "
                class="no-data-text"
              >
                No photos uploaded.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="action-area">
        <div class="navigation-buttons">
          <button
            type="button"
            @click="$emit('prev')"
            class="nav-button secondary"
            :disabled="busy"
          >
            Back to Edit
          </button>

          <button
            type="button"
            @click="$emit('submit')"
            class="nav-button primary"
            :disabled="busy"
            :class="{ 'is-loading': busy }"
          >
            <span v-if="busy" class="loading-text">
              <i class="fas fa-circle-notch fa-spin"></i> Uploading...
            </span>

            <span v-else>
              Submit Listing <i class="fas fa-arrow-right"></i>
            </span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="busy" class="upload-status-container">
            <div class="loader"></div>
            <p class="status-text">
              <strong>Listing is uploading...</strong><br />
              Please do not close this page.
            </p>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "SubmitMotorcycle",
  props: {
    motorcycle: { type: Object, required: true },
    isEditMode: { type: Boolean, default: false },
    // Using 'busy' to avoid variable conflicts
    busy: { type: Boolean, default: false },
  },
  emits: ["prev", "submit"],
  methods: {
    onImageError(event) {
      event.target.src =
        "https://placehold.co/400x300/e2e8f0/666660?text=No+Image";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

/* --- UPLOAD STATUS MESSAGE (NEW) --- */
.action-area {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.upload-status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f0fdf4; /* Light green bg */
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  animation: pulse-green 2s infinite;
}

.loader {
  border: 3px solid #d1d5db;
  border-top: 3px solid $secondary-color;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.status-text {
  color: $secondary-color;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.4;
  margin: 0;
  strong {
    font-weight: 700;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- EXISTING STYLES --- */
.form-step-container {
  padding: 0.5rem 0 2rem 0;
  max-width: 100%;
}
.header-section {
  text-align: center;
  margin-bottom: 2rem;
  h3 {
    font-size: 1.75rem;
    font-weight: 800;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
  }
  .step-info-text {
    font-size: 1rem;
    color: $text-color-medium;
    max-width: 600px;
    margin: 0 auto;
  }
}
.review-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.review-card {
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.06);
  }
  &.highlight-card {
    border: 2px solid lighten($secondary-color, 30%);
    background-color: lighten($secondary-color, 48%);
    .card-header h4 {
      color: darken($secondary-color, 10%);
    }
  }
}
.card-header {
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: $text-color-dark;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    i {
      color: $secondary-color;
    }
  }
}
.card-body {
  padding: 1.5rem;
}
.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
}
.review-item {
  label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: $text-color-medium;
    font-weight: 600;
    margin-bottom: 0.25rem;
    letter-spacing: 0.05em;
  }
  p {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: $text-color-dark;
  }
}
.plate-text {
  font-family: "Roboto Mono", monospace;
  background: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  letter-spacing: 1px;
}
.final-price {
  font-size: 1.5rem !important;
  color: $secondary-color !important;
  font-weight: 800 !important;
  .per-day {
    font-size: 0.9rem;
    font-weight: 500;
    color: $text-color-medium;
  }
}
.no-data-text {
  font-size: 0.9rem;
  color: $text-color-medium;
  font-style: italic;
}
.photo-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}
.photo-wrapper {
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e5e7eb;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  &:hover img {
    transform: scale(1.1);
  }
  &.profile {
    border: 2px solid $secondary-color;
    .photo-badge {
      position: absolute;
      top: 0;
      left: 0;
      background: $secondary-color;
      color: white;
      font-size: 0.6rem;
      padding: 2px 6px;
      border-bottom-right-radius: 8px;
      font-weight: 700;
    }
  }
}

/* NAVIGATION */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-button {
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &.secondary {
    background: white;
    border: 1px solid #d1d5db;
    color: #6b7280;
    &:hover {
      background: #f9fafb;
      color: #1f2937;
    }
  }
  &.primary {
    background: $secondary-color;
    color: white;
    border: none;
    &:hover:not(:disabled) {
      background: darken($secondary-color, 5%);
      transform: translateY(-2px);
    }
    &:disabled {
      background: lighten($secondary-color, 15%);
      cursor: not-allowed;
    }
  }
}
</style>
