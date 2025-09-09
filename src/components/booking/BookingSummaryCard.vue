<template>
  <div class="right-section-redesigned">
    <h2 class="summary-title">Booking Summary</h2>
    <div class="summary-card">
      <div v-if="!booking" class="loading-state">
        <p>Loading summary...</p>
      </div>
      <div v-else class="summary-content">
        <div class="vehicle-header">
          <img
            :src="vehicleProfileImageUrl"
            alt="Vehicle Image"
            class="summary-vehicle-image"
          />
          <div class="vehicle-details">
            <h3 class="summary-vehicle-name">
              {{ booking.vehicle.year }} {{ booking.vehicle.make }}
              {{ booking.vehicle.model }}
            </h3>
            <p class="summary-location">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                ></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ formattedLocation }}</span>
            </p>
          </div>
        </div>
        <hr class="summary-divider" />
        <div class="rental-period">
          <div class="period-item">
            <span class="period-label">Pickup</span>
            <span class="period-value">{{
              formatDate(booking.startDate)
            }}</span>
          </div>
          <div class="period-arrow">→</div>
          <div class="period-item">
            <span class="period-label">Return</span>
            <span class="period-value">{{ formatDate(booking.endDate) }}</span>
          </div>
        </div>
        <hr class="summary-divider" />
        <div class="price-total">
          <span class="price-label">Total Price</span>
          <span class="price-value">{{ formattedTotalPrice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingSummaryCard',
  props: {
    booking: {
      type: Object,
      default: null,
    },
  },
  computed: {
    vehicleProfileImageUrl() {
      const vehicle = this.booking?.vehicle;
      if (
        vehicle &&
        vehicle.exteriorPhotos &&
        vehicle.exteriorPhotos.length > 0
      ) {
        return vehicle.exteriorPhotos[0];
      }
      return 'https://placehold.co/80x80/e2e8f0/666666?text=No+Image';
    },
    formattedLocation() {
      const city = this.booking?.vehicle?.location?.city;
      return city || 'Location not available';
    },
    formattedTotalPrice() {
      const price = this.booking?.totalCost;
      if (typeof price === 'number') {
        return `₱${price.toLocaleString()}`;
      }
      return 'Calculating...';
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = dateString.toDate
        ? dateString.toDate()
        : new Date(dateString);
      // FIXED: Removed the incorrect 'new' keyword
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.right-section-redesigned {
  background-color: $background-color;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 1px solid $border-color;
  height: fit-content;
}
.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: $spacing-md;
}
.summary-card {
  background-color: $card-background;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  overflow: hidden;
}
.summary-content {
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.vehicle-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}
.summary-vehicle-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: $border-radius-md;
  flex-shrink: 0;
  border: 1px solid $border-color;
  background-color: #f8f9fa;
}
.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: $border-radius-sm;
}
.summary-vehicle-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-color-dark;
  line-height: 1.4;
}
.summary-location {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.875rem;
  color: $text-color-medium;
  svg {
    flex-shrink: 0;
  }
}
.summary-divider {
  border: 0;
  border-top: 1px solid $border-color;
  margin: 0;
}
.rental-period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}
.period-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  flex: 1;
}
.period-label {
  font-size: 0.75rem;
  color: $text-color-medium;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.period-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: $text-color-dark;
}
.period-arrow {
  font-size: 1.5rem;
  color: $text-color-medium;
  flex-shrink: 0;
}
.price-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: $spacing-sm;
}
.price-label {
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-color-medium;
}
.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: $primary-color;
}
</style>