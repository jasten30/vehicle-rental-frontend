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
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <div v-if="numberOfDays > 0" class="price-summary">
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

      <button class="book-button" @click="requestToBook" :disabled="isBooking">
        <span v-if="isBooking">Requesting...</span>
        <span v-else>Request to Book</span>
      </button>

      <hr class="summary-divider" />
      <div class="location-section">
        <h5 class="location-title">Pickup & Return</h5>
        <div class="location-item" v-if="vehicle.location">
          <span class="location-text"
            >Pickup: {{ vehicle.location.barangay }},
            {{ vehicle.location.city }}</span
          >
        </div>
        <div class="location-item" v-if="vehicle.location">
          <span class="location-text"
            >Return: {{ vehicle.location.barangay }},
            {{ vehicle.location.city }}</span
          >
        </div>
      </div>

      <hr class="summary-divider" />
      <div class="cancellation-section">
        <h5 class="cancellation-title">Cancellation Policy</h5>
        <div class="cancellation-item">
          <span class="cancellation-text">Free Cancellation</span>
        </div>
        <p class="cancellation-info">Full refund by {{ cancellationDate }}.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { DateTime } from 'luxon';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const props = defineProps({
  vehicle: Object,
});

const store = useStore();
const router = useRouter();

const startDate = ref(null);
const endDate = ref(null);
const errorMessage = ref('');
const serviceFeePercentage = 0.07;
const isBooking = ref(false);

const numberOfDays = computed(() => {
  if (!startDate.value || !endDate.value) {
    return 0;
  }
  const start = DateTime.fromISO(startDate.value);
  const end = DateTime.fromISO(endDate.value);

  if (end <= start) {
    return 0;
  }
  const diff = end.diff(start, 'days').toObject();
  return Math.ceil(diff.days);
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

const cancellationDate = computed(() => {
  if (!startDate.value) {
    return 'your selected start date';
  }
  const date = DateTime.fromISO(startDate.value).plus({ days: 2 });
  return date.toFormat('MMMM d, yyyy');
});

// UPDATED: This method now implements the "Request to Book" flow
const requestToBook = async () => {
  errorMessage.value = '';
  if (isBooking.value) return;

  if (!store.getters.isAuthenticated) {
    errorMessage.value = 'Please log in to book a vehicle.';
    router.push('/login');
    return;
  }

  if (!startDate.value || !endDate.value || numberOfDays.value <= 0) {
    errorMessage.value = 'Please select a valid date range.';
    return;
  }

  isBooking.value = true;
  try {
    const bookingData = {
      vehicleId: props.vehicle.id,
      startDate: new Date(startDate.value).toISOString(),
      endDate: new Date(endDate.value).toISOString(),
      totalCost: totalPrice.value,
    };
    
    // This action now creates the request and redirects to 'My Bookings'
    await store.dispatch('createBooking', bookingData);
    
    // The redirect to the payment page is no longer needed here
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Failed to create booking request.';
  } finally {
    isBooking.value = false;
  }
};
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
.date-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #374151;
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
.cancellation-section {
  display: flex;
  flex-direction: column;
}
.cancellation-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}
.cancellation-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
}
.cancellation-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}
.cancellation-info {
  font-size: 0.8rem;
  color: #6b7280;
  padding-left: 1.75rem; /* Aligns with the text above */
}
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style>