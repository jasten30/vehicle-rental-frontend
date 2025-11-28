<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <div class="header-section">
        <h3>Review and Submit</h3>
        <p class="step-info-text">
          Please review all the information below. Once submitted, your vehicle
          will be sent to our team for approval.
        </p>
      </div>

      <div class="review-container" v-if="vehicle">
        <div class="review-card">
          <div class="card-header">
            <h4><i class="fas fa-car"></i> Vehicle Details</h4>
          </div>
          <div class="card-body">
            <div class="review-grid">
              <div class="review-item">
                <label>Make</label>
                <p>{{ vehicle.make || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Model</label>
                <p>{{ vehicle.model || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Year</label>
                <p>{{ vehicle.year || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Seats</label>
                <p>{{ vehicle.seats || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Type</label>
                <p>{{ vehicle.vehicleType || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Transmission</label>
                <p>{{ vehicle.transmission || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Fuel</label>
                <p>{{ vehicle.fuelType || "N/A" }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="review-card-row">
          <div class="review-card half">
            <div class="card-header">
              <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
            </div>
            <div class="card-body">
              <div class="review-item">
                <label>City</label>
                <p>{{ vehicle.location?.city || "N/A" }}</p>
              </div>
              <div class="review-item">
                <label>Barangay</label>
                <p>{{ vehicle.location?.barangay || "N/A" }}</p>
              </div>
            </div>
          </div>

          <div class="review-card half">
            <div class="card-header">
              <h4><i class="fas fa-file-alt"></i> Documents</h4>
            </div>
            <div class="card-body">
              <div class="review-item">
                <label>Plate Number</label>
                <p class="plate-text">
                  {{ vehicle.cor?.plateNumber || "N/A" }}
                </p>
              </div>
              <div class="mini-doc-grid">
                <div class="doc-preview">
                  <span>CR</span>
                  <img :src="vehicle.cor?.corImage" @error="onImageError" />
                </div>
                <div class="doc-preview">
                  <span>OR</span>
                  <img :src="vehicle.or?.orImage" @error="onImageError" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="review-card highlight-card">
          <div class="card-header">
            <h4><i class="fas fa-tag"></i> Pricing Strategy</h4>
          </div>
          <div class="card-body">
            <div class="review-grid">
              <div class="review-item">
                <label>Market Value</label>
                <p>
                  ₱{{ vehicle.pricing?.marketValue?.toLocaleString() || "N/A" }}
                </p>
              </div>
              <div class="review-item">
                <label>Condition</label>
                <p style="text-transform: capitalize">
                  {{ vehicle.pricing?.condition || "N/A" }}
                </p>
              </div>
              <div class="review-item">
                <label>Recommended</label>
                <p>
                  ₱{{
                    vehicle.pricing?.recommendedPrice?.toLocaleString() || "N/A"
                  }}
                  / day
                </p>
              </div>
              <div class="review-item final-price-item">
                <label>Your Listing Price</label>
                <p class="final-price">
                  ₱{{
                    (
                      vehicle.pricing?.manualPrice ||
                      vehicle.pricing?.recommendedPrice ||
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
            <h4><i class="fas fa-list-ul"></i> Features</h4>
          </div>
          <div class="card-body">
            <div
              v-if="selectedFeatures.length > 0"
              class="features-pills-group"
            >
              <span
                v-for="featureName in selectedFeatures"
                :key="featureName"
                class="feature-pill"
              >
                <i class="fas fa-check"></i> {{ featureName }}
              </span>
            </div>
            <p v-else class="no-data-text">No additional features listed.</p>
          </div>
        </div>

        <div class="review-card">
          <div class="card-header">
            <h4><i class="fas fa-shield-alt"></i> Safety Checklist</h4>
          </div>
          <div class="card-body">
            <ul class="safety-list">
              <li :class="{ checked: vehicle.safety?.tiresChecked }">
                Tires condition
              </li>
              <li :class="{ checked: vehicle.safety?.brakesChecked }">
                Brakes functional
              </li>
              <li :class="{ checked: vehicle.safety?.lightsChecked }">
                All lights working
              </li>
              <li :class="{ checked: vehicle.safety?.wipersChecked }">
                Wipers/Horn
              </li>
              <li :class="{ checked: vehicle.safety?.emergencyToolsChecked }">
                Emergency tools
              </li>
              <li :class="{ checked: vehicle.safety?.registrationChecked }">
                Valid Reg
              </li>
              <li :class="{ checked: vehicle.safety?.cleanlinessChecked }">
                Clean Interior
              </li>
            </ul>
            <div v-if="vehicle.safety?.notes" class="notes-box">
              <strong>Owner Notes:</strong> "{{ vehicle.safety.notes }}"
            </div>
          </div>
        </div>

        <div class="review-card">
          <div class="card-header">
            <h4><i class="fas fa-camera"></i> Photos</h4>
          </div>
          <div class="card-body">
            <div class="photo-container">
              <div class="photo-wrapper profile">
                <img :src="vehicle.profilePhotoUrl" @error="onImageError" />
                <span class="photo-badge">Main Profile</span>
              </div>
              <div
                class="photo-wrapper"
                v-for="(photo, index) in vehicle.exteriorPhotos"
                :key="`ext-${index}`"
              >
                <img :src="photo" @error="onImageError" />
              </div>
              <div
                class="photo-wrapper"
                v-for="(photo, index) in vehicle.interiorPhotos"
                :key="`int-${index}`"
              >
                <img :src="photo" @error="onImageError" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="navigation-buttons">
        <button
          type="button"
          @click="$emit('prev')"
          class="nav-button secondary"
          :disabled="isSubmitting"
        >
          Back to Edit
        </button>

        <button
          type="button"
          @click="$emit('submit')"
          class="nav-button primary"
          :disabled="isSubmitting"
          :class="{ 'is-loading': isSubmitting }"
        >
          <span v-if="isSubmitting" class="loading-text">
            <i class="fas fa-circle-notch fa-spin"></i> Uploading...
          </span>
          <span v-else>
            Confirm & Submit <i class="fas fa-arrow-right"></i>
          </span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "SubmitListing",
  props: {
    vehicle: { type: Object, required: true },
    isEditMode: { type: Boolean, default: false },
    isSubmitting: { type: Boolean, default: false },
  },
  emits: ["prev", "submit"],
  data() {
    return {
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
        "Additional Features": [
          { name: "Child Seat", key: "childSeat" },
          { name: "Bike Rack", key: "bikeRack" },
          { name: "Roof Box", key: "roofBox" },
          { name: "Pet Friendly", key: "petFriendly" },
        ],
      },
    };
  },
  computed: {
    featureNameMap() {
      const map = {};
      for (const category in this.featuresList) {
        for (const feature of this.featuresList[category]) {
          map[feature.key] = feature.name;
        }
      }
      return map;
    },
    selectedFeatures() {
      if (!this.vehicle.features) return [];
      return Object.keys(this.vehicle.features)
        .filter((key) => this.vehicle.features[key] === true)
        .map((key) => this.featureNameMap[key] || key);
    },
  },
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

/* --- ANIMATION --- */
.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}
.form-step-fade-enter-from,
.form-step-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* --- LAYOUT --- */
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

/* --- CARDS --- */
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

.review-card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

/* --- GRID ITEMS --- */
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

/* --- SPECIAL ITEMS --- */
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

.mini-doc-grid {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  .doc-preview {
    flex: 1;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    height: 80px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    span {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 0.65rem;
      text-align: center;
      padding: 2px;
    }
  }
}

/* --- FEATURES PILLS --- */
.features-pills-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.feature-pill {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 50px;
  background-color: #f3f4f6;
  color: $text-color-dark;
  border: 1px solid #e5e7eb;
  i {
    color: $secondary-color;
    margin-right: 4px;
  }
}

/* --- SAFETY LIST --- */
.safety-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }

  li {
    font-size: 0.9rem;
    color: $text-color-medium;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.5;

    &.checked {
      color: $text-color-dark;
      font-weight: 500;
      opacity: 1;
      &::before {
        content: "\f058"; /* FontAwesome check-circle */
        font-family: "Font Awesome 5 Free";
        font-weight: 900;
        color: $secondary-color;
      }
    }
    &:not(.checked)::before {
      content: "\f111"; /* FontAwesome circle */
      font-family: "Font Awesome 5 Free";
      font-weight: 400;
    }
  }
}
.notes-box {
  margin-top: 1rem;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #92400e;
}

/* --- PHOTOS --- */
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

/* --- BUTTONS --- */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
    color: $text-color-medium;
    &:hover {
      background: #f9fafb;
      color: $text-color-dark;
    }
  }

  &.primary {
    background: $secondary-color;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba($secondary-color, 0.2);

    &:hover:not(:disabled) {
      background: darken($secondary-color, 5%);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba($secondary-color, 0.3);
    }

    &:disabled {
      background: lighten($secondary-color, 15%);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
}
</style>
