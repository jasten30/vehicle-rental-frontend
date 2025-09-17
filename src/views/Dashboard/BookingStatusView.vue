<template>
  <div class="status-container">
    <div v-if="loading" class="status-card">
      <p>Loading booking status...</p>
    </div>
    <div v-else-if="error" class="status-card error">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="booking" class="status-card">
      <div class="icon-wrapper" :class="statusClass">
        <i v-if="isPending" class="bi bi-hourglass-split"></i>
        <i v-if="isConfirmed" class="bi bi-patch-check-fill"></i>
        <i v-if="isDeclined" class="bi bi-x-circle-fill"></i>
      </div>
      <h1 class="title">{{ statusTitle }}</h1>
      <p class="subtitle">{{ statusSubtitle }}</p>
      <div class="button-group">
          <router-link to="/dashboard/my-bookings" class="button secondary">View All Bookings</router-link>
          <button v-if="isConfirmed" class="button primary">Start Chat</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default {
  name: 'BookingStatusView',
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      error: null,
      booking: null,
      unsubscribe: null, // To store the listener cleanup function
    };
  },
  computed: {
    isPending() {
      return this.booking?.paymentStatus === 'pending_owner_approval';
    },
    isConfirmed() {
      return this.booking?.paymentStatus === 'confirmed';
    },
    isDeclined() {
      return this.booking?.paymentStatus === 'declined_by_owner';
    },
    statusClass() {
      if (this.isConfirmed) return 'confirmed';
      if (this.isDeclined) return 'declined';
      return 'pending';
    },
    statusTitle() {
      if (this.isConfirmed) return 'Booking Confirmed!';
      if (this.isDeclined) return 'Booking Declined';
      return 'Awaiting Confirmation';
    },
    statusSubtitle() {
      if (this.isConfirmed) return "The owner has accepted your request. You can now coordinate your trip details.";
      if (this.isDeclined) return "Unfortunately, the owner has declined your booking request for the selected dates.";
      return "We've notified the owner. You will be updated here automatically once they respond.";
    }
  },
  created() {
    this.listenForBookingUpdates();
  },
  beforeUnmount() {
    // Clean up the listener when the component is destroyed
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    listenForBookingUpdates() {
      const bookingRef = doc(db, 'bookings', this.bookingId);
      this.unsubscribe = onSnapshot(bookingRef, (docSnap) => {
        if (docSnap.exists()) {
          this.booking = { id: docSnap.id, ...docSnap.data() };
        } else {
          this.error = 'This booking could not be found.';
        }
        this.loading = false;
      }, (err) => {
        this.error = 'Failed to listen for booking updates.';
        this.loading = false;
        console.error(err);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
/* Using similar styles from your existing 'Awaiting Confirmation' screenshot */
.status-container { display: flex; align-items: center; justify-content: center; min-height: 80vh; }
.status-card { text-align: center; padding: 3rem; background-color: $card-background; border-radius: $border-radius-lg; box-shadow: $shadow-medium; max-width: 500px; }
.icon-wrapper { font-size: 4rem; margin-bottom: 1.5rem; &.pending { color: $accent-color; } &.confirmed { color: $secondary-color; } &.declined { color: $admin-color; } }
.title { font-size: 2rem; font-weight: 700; color: $text-color-dark; margin-bottom: 1rem; }
.subtitle { font-size: 1.1rem; color: $text-color-medium; margin-bottom: 2rem; line-height: 1.6; }
.button-group { display: flex; gap: 1rem; justify-content: center; }
.button { padding: 0.75rem 1.5rem; border-radius: $border-radius-pill; text-decoration: none; font-weight: 600; border: none; &.primary { background-color: $primary-color; color: white; } &.secondary { background-color: #e5e7eb; color: $text-color-dark; } }
</style>