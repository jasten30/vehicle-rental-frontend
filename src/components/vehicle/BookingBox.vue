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
      <!-- Display an error message if the date selection is invalid -->
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

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
      <button class="book-button" @click="bookNow" :disabled="isBooking">
        <span v-if="isBooking">Booking...</span>
        <span v-else>Book Now</span>
      </button>

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

      <!-- NEW SECTION: Cancellation Policy -->
      <hr class="summary-divider" />
      <div class="cancellation-section">
        <h5 class="cancellation-title">Cancellation Policy</h5>
        <div class="cancellation-item">
          <svg
            class="cancellation-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.25 6.75L12 9l-.75-1.5M12 18L9.75 15.75m4.5 0L12 15.75m-4.5 0l2.25 2.25M12 21a9 9 0 100-18 9 9 0 000 18z"
            />
          </svg>
          <span class="cancellation-text">Free Cancellation</span>
        </div>
        <p class="cancellation-info">Full refund by {{ cancellationDate }}.</p>
      </div>

      <!-- NEW SECTION: Action Buttons & Social Media -->
      <hr class="summary-divider" />
      <div class="flex flex-col items-center">
        <button class="save-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clip-rule="evenodd"
            />
          </svg>
          Save as Favorites
        </button>
        <div class="action-buttons">
          <button class="action-button">Report</button>
          <button class="action-button">Cancellation Policy</button>
        </div>
        <div class="social-buttons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            class="social-icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 5.011 3.657 9.155 8.411 9.873V15.5H8v-3.5h2.411v-2.1c0-2.316 1.4-3.585 3.487-3.585 1.042 0 1.936.077 2.2.112v2.417h-1.428c-1.127 0-1.346.536-1.346 1.32v1.736h2.693l-.465 3.5h-2.228V21.873C18.343 21.155 22 17.011 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="social-icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.606 1.18 5.612 2.186a8.214 8.214 0 012.186 5.61c.058 1.267.07 1.647.07 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.18 4.606-2.186 5.612a8.214 8.214 0 01-5.61 2.186c-1.267.058-1.647.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.606-1.18-5.612-2.186a8.214 8.214 0 01-2.186-5.61c-.058-1.267-.07-1.647-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.18-4.606 2.186-5.612a8.214 8.214 0 015.61-2.186c1.267-.058 1.647-.07 4.85-.07zm-7.25 10c0 4.156 3.394 7.55 7.55 7.55s7.55-3.394 7.55-7.55-3.394-7.55-7.55-7.55-7.55 3.394-7.55 7.55zm13.14-7.791c-.571 0-1.033.462-1.033 1.033s.462 1.033 1.033 1.033 1.033-.462 1.033-1.033-.462-1.033-1.033-1.033zm-6.091 10.455c-2.458 0-4.455-1.997-4.455-4.455s1.997-4.455 4.455-4.455 4.455 1.997 4.455 4.455-1.997 4.455-4.455 4.455z"
              />
            </svg>
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            class="social-icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M18.901 1.153C20.686 1.153 22 2.502 22 4.286v15.428c0 1.784-1.314 3.133-3.099 3.133H5.099C3.314 22.847 2 21.498 2 19.714V4.286C2 2.502 3.314 1.153 5.099 1.153h13.802zm-5.462 12.593l-3.248-3.248v6.495h-2.189V7.838l-3.247 3.248V8.901l5.436-5.436h2.188v6.495l3.248-3.247v2.188L14.439 12.746z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { DateTime } from "luxon";
import { useRouter } from "vue-router";
import api from "@/views/services/api";

const props = defineProps({
  vehicle: Object,
});

const startDate = ref(null);
const endDate = ref(null);
const errorMessage = ref("");
const serviceFeePercentage = 0.07; // 7% service fee
const isBooking = ref(false);

const router = useRouter();

// Computed properties
const numberOfDays = computed(() => {
  if (!startDate.value || !endDate.value) {
    return 0;
  }
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Ensure end date is not before start date
  if (end < start) {
    return 0;
  }
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

const cancellationDate = computed(() => {
  if (!startDate.value) {
    return "your selected start date";
  }
  const date = DateTime.fromISO(startDate.value).plus({ days: 2 });
  return date.toFormat("MMMM d, yyyy");
});

// Method to handle the "Book Now" action and route to the payment page
const bookNow = async () => {
  errorMessage.value = "";
  if (isBooking.value) return; // Prevent multiple clicks

  if (!startDate.value || !endDate.value) {
    errorMessage.value = "Please select both a start and end date.";
    return;
  }

  if (numberOfDays.value <= 0) {
    errorMessage.value = "The end date must be after the start date.";
    return;
  }

  isBooking.value = true;
  try {
    const response = await api.createBooking({
      vehicleId: props.vehicle.id,
      startDate: startDate.value,
      endDate: endDate.value,
      totalPrice: totalPrice.value,
      serviceFee: serviceFee.value,
      rentalFee: rentalFee.value,
      numberOfDays: numberOfDays.value,
    });

    // Now we have the bookingId from the backend.
    const bookingId = response.data.id;

    // Navigate using the bookingId as a route parameter.
    router.push({
      name: "BookingPayment",
      params: { bookingId },
    });
  } catch (error) {
    console.error("Booking failed:", error);
    errorMessage.value =
      error.response?.data?.message ||
      "Failed to create booking. Please try again.";
  } finally {
    isBooking.value = false;
  }
};
</script>

<style scoped>
/*
This CSS makes the booking box "stick" to the top of the viewport
when the user scrolls down the page, creating a cool animation effect.
*/
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

/* NEW STYLES for the Cancellation Section */
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

/* NEW STYLES for Favorites and Social Buttons */
.save-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  margin-top: 1rem;
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #3b82f6;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #f3f4f6;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.action-button {
  background: none;
  border: none;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  transition: text-decoration 0.2s ease;
}

.action-button:hover {
  text-decoration: underline;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.social-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px; /* This makes it a perfect circle */
  background-color: #f3f4f6;
  color: #6b7280;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.social-icon:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
