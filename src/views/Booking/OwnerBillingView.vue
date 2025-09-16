<template>
  <div class="verification-container">
    <div class="verification-card">
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h1 class="title">Awaiting Confirmation</h1>
      <p class="subtitle">
        We've notified the owner. You will be redirected automatically once your payment is confirmed.
      </p>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default {
  name: 'PaymentVerificationView',
  props: {
    bookingId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    const error = ref(null);
    let unsubscribe = null;

    onMounted(() => {
      const userId = store.getters.user?.uid;
      const appId = process.env.VUE_APP_FIREBASE_APP_ID;

      if (!userId) {
        error.value = 'User could not be identified. Please log in again.';
        return;
      }
      if (!props.bookingId) {
        error.value = 'No booking ID provided.';
        return;
      }
      if (!appId) {
        console.error("Firebase App ID is not defined in your environment variables (.env.local)");
        error.value = 'Application configuration error.';
        return;
      }

      // This path assumes your bookings are in a nested subcollection.
      // If your bookings are in a top-level collection, the path should be:
      // const bookingRef = doc(db, 'bookings', props.bookingId);
      const bookingRef = doc(db, `artifacts/${appId}/users/${userId}/bookings`, props.bookingId);
      
      unsubscribe = onSnapshot(bookingRef, (docSnap) => {
        if (docSnap.exists()) {
          const bookingData = docSnap.data();
          
          if (bookingData.paymentStatus === 'confirmed') {
            console.log('Payment confirmed! Redirecting to summary...');
            router.push({ name: 'BookingSummary', params: { bookingId: props.bookingId } });
          }
        } else {
          error.value = 'This booking could not be found.';
        }
      }, (err) => {
        console.error("Error listening to booking updates:", err);
        if (err.code === 'permission-denied') {
             error.value = "You don't have permission to view this booking's status.";
        } else {
             error.value = "An error occurred while checking the payment status.";
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    return {
      error,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
.verification-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $background-color;
}
.verification-card {
  background-color: $card-background;
  padding: 3rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  text-align: center;
  max-width: 500px;
}
.spinner {
  animation: spin 1s linear infinite;
  height: 3rem;
  width: 3rem;
  color: $primary-color;
  margin: 0 auto 1.5rem auto;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1rem;
  color: $text-color-medium;
  line-height: 1.6;
}
.error-message {
  margin-top: 1rem;
  color: $admin-color;
}
</style>