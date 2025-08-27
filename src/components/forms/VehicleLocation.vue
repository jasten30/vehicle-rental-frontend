<template>
  <div>
    <h3>Address Details</h3>
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

// A mock addresses object to replace the imported file.
const cebuAddresses = {
    'Cebu City': ['Apas', 'Banilad', 'Barangay 1', 'Barangay 2'],
    'Mandaue City': ['Subangdaku', 'Tipolo', 'Maguikay'],
    'Lapu-Lapu City': ['Basak', 'Pajo', 'Pusok'],
};

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
// Define a color palette and spacing for a more consistent design
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --text-color-dark: #1f2937;
  --text-color-medium: #4b5563;
  --bg-color-light: #f9fafb;
  --border-color: #d1d5db;
  --border-radius: 0.25rem;
  --padding-xs: 0.5rem;
  --padding-sm: 0.625rem;
  --padding-md: 1rem;
  --margin-sm: 0.5rem;
  --margin-md: 1rem;
}

h3 {
  font-size: 1.5rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.step-info-text {
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  input[type="text"],
  select {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-bottom: 1px solid #d1d5db;
    border-radius: 0;
    font-size: 1rem;
    transition: border-bottom-color 0.2s ease-in-out;
    background-color: transparent;

    &:focus {
      outline: none;
      border-bottom-color: #3b82f6;
    }
  }
  
  .disabled-input {
    background-color: transparent;
    cursor: not-allowed;
    color: #6b7280;
  }
}

.map-heading {
  font-size: 1.25rem;
  color: #1f2937;
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
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
}

.coordinates-display {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #4b5563;
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
  border-radius: 0.25rem;
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
  background-color: #3b82f6;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#3b82f6, 10%);
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
