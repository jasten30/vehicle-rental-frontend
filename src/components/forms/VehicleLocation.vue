<template>
  <div>
    <h3>Step 1: Address Details</h3>
    <p class="step-info-text">Please provide the specific address and pin the exact location on the map below.</p>
    
    <div class="form-group">
      <label for="country">Country</label>
      <input type="text" id="country" value="Philippines" disabled class="disabled-input">
    </div>

    <div class="form-group">
      <label for="region">Region</label>
      <input type="text" id="region" value="Region VII (Central Visayas)" disabled class="disabled-input">
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
        <option v-for="cityName in cities" :key="cityName" :value="cityName">{{ cityName }}</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="barangay">Barangay</label>
      <select 
        id="barangay" 
        v-model="location.barangay" 
        :disabled="!location.city"
        required
      >
        <option value="" disabled>Select a Barangay</option>
        <option v-for="barangayName in barangays" :key="barangayName" :value="barangayName">{{ barangayName }}</option>
      </select>
    </div>
    
    <h4 class="map-heading">Pin Location on Map</h4>
    <p class="help-text">Click on the map to set the exact pick-up point.</p>
    
    <div id="map"></div>
    
    <p v-if="location.latitude && location.longitude" class="coordinates-display">
      Latitude: {{ location.latitude.toFixed(6) }} | Longitude: {{ location.longitude.toFixed(6) }}
    </p>

    <div class="button-group-step">
      <button type="button" @click="$emit('cancel')" class="button secondary-button">Cancel</button>
      <button 
        type="button" 
        @click="nextStep" 
        class="button primary-button" 
        :disabled="!isValid"
      >
        Next
      </button>
    </div>

    <div v-if="showToast" class="toast">
      Location Pinned Successfully!
    </div>
  </div>
</template>

<script>
/* global L:readonly */

import { cebuAddresses } from '@/assets/data/cebu-addresses';

export default {
  name: 'VehicleLocation',
  props: {
    address: {
      type: Object,
      required: true,
      default: () => ({}),
    }
  },
  emits: ['update:address', 'next', 'cancel'],
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
        this.$emit('update:address', value);
      }
    },
    cities() {
      return Object.keys(this.cebuAddresses);
    },
    barangays() {
      return this.location.city ? this.cebuAddresses[this.location.city] : [];
    },
    isValid() {
      const allFieldsSelected = this.location.city && this.location.barangay;
      const locationPinned = this.location.latitude !== null && this.location.longitude !== null;
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
        if (typeof L !== 'undefined' && document.getElementById('map')) {
          const cebuCoordinates = [10.3157, 123.8854]; 
          const initialZoom = 13;

          this.map = L.map('map').setView(cebuCoordinates, initialZoom);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(this.map);
          
          this.map.on('click', this.pinLocation);
        } else {
          setTimeout(tryInitializeMap, 50);
        }
      };

      tryInitializeMap();
    },
    resetBarangay() {
      this.location.barangay = '';
    },
    pinLocation(event) {
      const { lat, lng } = event.latlng;
      
      this.location.latitude = lat;
      this.location.longitude = lng;
      
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      
      this.marker = L.marker([lat, lng]).addTo(this.map);
      
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    nextStep() {
      this.$emit('next');
    }
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';


h3 {
  font-size: 1.5rem;
  color: $primary-color;
  margin-bottom: 1rem;
}

.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }

  input[type="text"],
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    background-color: #ffffff;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
    }
  }
  
  .disabled-input {
    background-color: #e5e7eb;
    cursor: not-allowed;
    color: #6b7280;
  }
}

.map-heading {
  font-size: 1.25rem;
  color: $text-color-dark;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.help-text {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

#map {
  width: 100%;
  height: 400px;
  border-radius: $border-radius-sm;
  margin-bottom: 1.5rem;
}

.coordinates-display {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: $text-color-medium;
  text-align: center;
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

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: 0;
  animation: fadeInOut 3s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
