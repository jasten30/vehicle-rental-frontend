<template>
  <transition name="form-step-fade" appear>
    <div class="form-step-container">
      <h3>Address Details</h3>
      <p class="step-info-text">
        Please provide the specific address and pin the exact location on the
        map below.
      </p>

      <div class="form-grid">
        <div class="form-group">
          <label for="country">Country</label>
          <input
            type="text"
            id="country"
            value="Philippines"
            disabled
            class="disabled-input"
          />
        </div>

        <div class="form-group">
          <label for="region">Region</label>
          <input
            type="text"
            id="region"
            value="Region VII (Central Visayas)"
            disabled
            class="disabled-input"
          />
        </div>

        <div class="form-group">
          <label for="city">City/Municipality</label>
          <select
            id="city"
            v-model="location.city"
            @change="resetBarangay"
            required
          >
            <option value="" disabled>Select a City/Municipality</option>
            <option
              v-for="cityName in cities"
              :key="cityName"
              :value="cityName"
            >
              {{ cityName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="barangay">Barangay</label>
          <select
            id="barangay"
            v-model="location.barangay"
            :disabled="!location.city"
            required
            @change="emitUpdate"
          >
            <option value="" disabled>Select a Barangay</option>
            <option
              v-for="barangayName in barangays"
              :key="barangayName"
              :value="barangayName"
            >
              {{ barangayName }}
            </option>
          </select>
        </div>
      </div>

      <h4 class="map-heading">Pin Location on Map</h4>
      <p class="help-text">Click on the map to set the exact pick-up point.</p>

      <div id="map"></div>

      <p
        v-if="location.latitude && location.longitude"
        class="coordinates-display"
      >
        Pinned at: {{ location.latitude.toFixed(6) }},
        {{ location.longitude.toFixed(6) }}
      </p>

      <div v-if="showNavigation" class="navigation-buttons">
        <button
          type="button"
          @click="$emit('cancel')"
          class="nav-button secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="nextStep"
          class="nav-button primary"
          :disabled="!isValid"
        >
          Next
        </button>
      </div>

      <transition name="toast-fade">
        <div v-if="showToast" class="toast">
          <i class="bi bi-geo-alt-fill"></i>
          Location Pinned Successfully!
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
/* global L:readonly */
import { cebuAddresses } from "@/assets/data/cebu-addresses";

export default {
  name: "VehicleLocation",
  props: {
    address: {
      type: Object,
      required: true,
      default: () => ({
        city: "",
        barangay: "",
        latitude: null,
        longitude: null,
      }),
    },
    // NEW PROP: Controls visibility of buttons
    showNavigation: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:address", "next", "cancel"],
  data() {
    return {
      cebuAddresses: cebuAddresses,
      map: null,
      marker: null,
      showToast: false,
    };
  },
  computed: {
    location: {
      get() {
        return this.address;
      },
      set(value) {
        this.$emit("update:address", value);
      },
    },
    cities() {
      return Object.keys(this.cebuAddresses);
    },
    barangays() {
      return this.location.city ? this.cebuAddresses[this.location.city] : [];
    },
    isValid() {
      const allFieldsSelected = this.location.city && this.location.barangay;
      const locationPinned =
        this.location.latitude !== null && this.location.longitude !== null;
      return allFieldsSelected && locationPinned;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeMap();
    });
  },
  methods: {
    initializeMap() {
      const tryInitializeMap = () => {
        if (typeof L !== "undefined" && document.getElementById("map")) {
          const cebuCoordinates = [10.3157, 123.8854];
          const initialCoords =
            this.location.latitude && this.location.longitude
              ? [this.location.latitude, this.location.longitude]
              : cebuCoordinates;

          const initialZoom =
            this.location.latitude && this.location.longitude ? 16 : 13;

          this.map = L.map("map").setView(initialCoords, initialZoom);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }).addTo(this.map);

          if (this.location.latitude && this.location.longitude) {
            this.marker = L.marker(initialCoords).addTo(this.map);
          }

          this.map.on("click", this.pinLocation);
        } else {
          setTimeout(tryInitializeMap, 100);
        }
      };

      tryInitializeMap();
    },
    resetBarangay() {
      this.location.barangay = "";
      this.emitUpdate();
    },
    pinLocation(event) {
      const { lat, lng } = event.latlng;

      this.location = {
        ...this.location,
        latitude: lat,
        longitude: lng,
      };

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.map.setView([lat, lng], 16);

      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2500);
    },
    emitUpdate() {
      this.$emit("update:address", this.location);
    },
    nextStep() {
      if (this.isValid) {
        this.$emit("next");
      }
    },
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.form-step-fade-enter-active,
.form-step-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  margin-bottom: 0;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  input[type="text"],
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-family: $font-family-base;
    box-sizing: border-box;
    transition:
      border-color 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px lighten($primary-color, 40%);
    }
  }

  .disabled-input {
    background-color: $background-light;
    cursor: not-allowed;
    color: $text-color-medium;
  }

  select:disabled {
    background-color: $background-light;
    cursor: not-allowed;
  }
}

.map-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-top: 2.5rem;
  margin-bottom: 0.25rem;
}

.help-text {
  font-size: 0.9rem;
  color: $text-color-medium;
  margin-bottom: 1rem;
}

#map {
  width: 100%;
  height: 350px;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color-light;
  margin-bottom: 1rem;
  z-index: 1;
}

.coordinates-display {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: $text-color-medium;
  text-align: center;
}

/* Navigation Buttons */
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
    background-color: $primary-color;
    color: white;
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
      box-shadow: $shadow-medium;
    }
  }
  &.secondary {
    background-color: transparent;
    color: $text-color-medium;
    border: 1px solid $border-color;
    &:hover {
      background-color: $background-light;
      color: $text-color-dark;
    }
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* Toast Style */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: $text-color-dark;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: $border-radius-pill;
  box-shadow: $shadow-medium;
  z-index: 1001;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Toast Animation */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
