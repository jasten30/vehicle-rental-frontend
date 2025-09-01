<template>
  <div class="booking-box">
    <div class="price-section">
      <span class="price-per-day">
        <span class="font-bold text-2xl">
          ₱ {{ vehicle.rentalPricePerDay.toFixed(2) }}
        </span>
        / day
      </span>
    </div>
    <div class="booking-form">
      <div class="form-row">
        <div class="input-group">
          <label for="start-date" class="input-label">Start Date</label>
          <input
            type="date"
            id="start-date"
            class="date-input"
            v-model="startDate"
          />
        </div>
        <div class="input-group">
          <label for="end-date" class="input-label">End Date</label>
          <input
            type="date"
            id="end-date"
            class="date-input"
            v-model="endDate"
          />
        </div>
      </div>
      <div class="price-summary">
        <div class="price-item">
          <span
            >₱ {{ vehicle.rentalPricePerDay.toFixed(2) }} x
            {{ numberOfDays }} days</span
          >
          <span class="font-bold">₱ {{ rentalFee.toFixed(2) }}</span>
        </div>
        <div class="price-item">
          <span>Service Fee</span>
          <span class="font-bold">₱ {{ serviceFee.toFixed(2) }}</span>
        </div>
        <hr class="summary-divider" />
        <div class="price-item total">
          <span class="font-bold">Total</span>
          <span class="font-bold">₱ {{ totalPrice.toFixed(2) }}</span>
        </div>
      </div>
      <button class="book-button">Book Now</button>

      <!-- NEW SECTION: Pickup and Return Locations -->
      <hr class="summary-divider" />
      <div class="location-section">
        <h5 class="location-title">Pickup & Return</h5>
        <div class="location-item" v-if="vehicle.location">
          <svg
            class="location-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.75"
            />
          </svg>
          <span class="location-text"
            >Pickup: {{ vehicle.location.barangay }},
            {{ vehicle.location.city }}</span
          >
        </div>
        <div class="location-item" v-if="vehicle.location">
          <svg
            class="location-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.75"
            />
          </svg>
          <span class="location-text"
            >Return: {{ vehicle.location.barangay }},
            {{ vehicle.location.city }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  vehicle: Object,
});

const startDate = ref(null);
const endDate = ref(null);
const serviceFeePercentage = 0.07; // 7% service fee

// Computed properties
const numberOfDays = computed(() => {
  if (!startDate.value || !endDate.value) {
    return 0;
  }
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

const rentalFee = computed(() => {
  if (!props.vehicle) return 0;
  return props.vehicle.rentalPricePerDay * numberOfDays.value;
});

const serviceFee = computed(() => {
  return rentalFee.value * serviceFeePercentage;
});

const totalPrice = computed(() => {
  return rentalFee.value + serviceFee.value;
});
</script>

<style scoped>
.booking-box {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  position: sticky;
  top: 2rem;
}

/* Booking Box Styles */
.price-section {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
  color: #4b5563;
}

.price-section .font-bold {
  color: #1f2937;
}

.booking-form .form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.booking-form .input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.date-input,
.guest-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #374151;
}

.guest-input {
  -moz-appearance: textfield;
}

.price-summary {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #4b5563;
}

.summary-divider {
  border: 0;
  height: 1px;
  background: #e0e0e0;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.book-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.book-button:hover {
  background-color: #2563eb;
}

.total {
  font-size: 1.25rem;
  color: #1f2937;
}

/* NEW STYLES for the Location Section */
.location-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.location-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.location-text {
  flex-grow: 1;
}

.location-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.location-icon:hover {
  color: #1f2937;
}
</style>
