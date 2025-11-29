<template>
  <div class="review-form-container">
    <h4 class="form-title">Leave a Review</h4>
    <form @submit.prevent="submitReview">
      <div class="star-rating-input">
        <label class="input-label">Overall Rating</label>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            :class="{ 'star-filled': star <= newReview.rating }"
            @click="newReview.rating = star"
            >★</span
          >
        </div>
      </div>

      <div class="categorical-sliders">
        <div
          v-for="(score, category) in newReview.categoricalRatings"
          :key="category"
          class="slider-item"
        >
          <label class="slider-label"
            >{{ formatCategoryName(category) }}: {{ score.toFixed(1) }}</label
          >
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            v-model.number="newReview.categoricalRatings[category]"
            class="slider-input"
          />
        </div>
      </div>

      <div class="comment-input-group">
        <label for="review-comment" class="input-label">Your Review</label>
        <textarea
          id="review-comment"
          v-model="newReview.comment"
          rows="4"
          placeholder="Share your experience..."
          class="comment-textarea"
        ></textarea>
      </div>

      <button type="submit" class="submit-review-btn" :disabled="isSubmitting">
        {{ isSubmitting ? "Submitting..." : "Submit Review" }}
      </button>
      <div v-if="submissionMessage" :class="submissionMessage.class">
        {{ submissionMessage.text }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
} from "firebase/firestore";

// Define props to receive data from the parent component
const props = defineProps({
  vehicleId: {
    type: String,
    required: true,
  },
});

// Use Vuex store and Vue router
const store = useStore();
const router = useRouter();

// Firestore initialization
const db = getFirestore();
const appId =
  typeof window.__app_id !== "undefined" ? window.__app_id : "default-app-id";

// Reactive state for the review form
const newReview = ref({
  rating: 0,
  comment: "",
  categoricalRatings: {
    cleanliness: 5,
    maintenance: 5,
    communication: 5,
    convenience: 5,
    accuracy: 5,
  },
});
const isSubmitting = ref(false);
const submissionMessage = ref(null);

const formatCategoryName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
};

/**
 * Submits a new review to Firestore and updates the vehicle's reviews summary.
 */
const submitReview = async () => {
  // Check if user is authenticated before doing anything else
  if (!store.state.isAuthenticated) {
    submissionMessage.value = {
      text: "You must be logged in to leave a review. Redirecting...",
      class: "message-error",
    };
    // Redirect to the login page
    setTimeout(() => router.push("/login"), 2000);
    return;
  }

  if (
    !newReview.value.rating ||
    !newReview.value.comment ||
    !props.vehicleId ||
    isSubmitting.value
  ) {
    submissionMessage.value = {
      text: "Please provide an overall rating and a comment.",
      class: "message-error",
    };
    return;
  }

  isSubmitting.value = true;
  submissionMessage.value = {
    text: "Submitting your review...",
    class: "message-info",
  };

  try {
    // Get the authenticated user's ID from the Vuex store
    const userId = store.state.user.uid;

    // 1. Create the new review document
    const reviewsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "reviews"
    );
    await addDoc(reviewsRef, {
      vehicleId: props.vehicleId,
      userId: userId,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      categoricalRatings: newReview.value.categoricalRatings,
      createdAt: new Date(),
    });

    // 2. Client-side update of the vehicle's reviews summary
    const vehicleDocRef = doc(db, "vehicles", props.vehicleId);
    const vehicleSnapshot = await getDoc(vehicleDocRef);
    const currentReviewsSummary = vehicleSnapshot.data().reviewsSummary || {
      totalReviews: 0,
      overallRating: 0,
      categoricalRatings: {
        cleanliness: 0,
        maintenance: 0,
        communication: 0,
        convenience: 0,
        accuracy: 0,
      },
    };

    const newTotalReviews = currentReviewsSummary.totalReviews + 1;
    const newOverallRating =
      (currentReviewsSummary.overallRating *
        currentReviewsSummary.totalReviews +
        newReview.value.rating) /
      newTotalReviews;

    // Calculate new categorical averages
    const newCategoricalRatings = {};
    for (const category in newReview.value.categoricalRatings) {
      const currentScore =
        currentReviewsSummary.categoricalRatings[category] || 0;
      const newScore =
        (currentScore * currentReviewsSummary.totalReviews +
          newReview.value.categoricalRatings[category]) /
        newTotalReviews;
      newCategoricalRatings[category] = newScore;
    }

    await updateDoc(vehicleDocRef, {
      reviewsSummary: {
        totalReviews: newTotalReviews,
        overallRating: newOverallRating,
        categoricalRatings: newCategoricalRatings,
      },
    });

    submissionMessage.value = {
      text: "Review submitted successfully!",
      class: "message-success",
    };
    // Clear the form
    newReview.value = {
      rating: 0,
      comment: "",
      categoricalRatings: {
        cleanliness: 5,
        maintenance: 5,
        communication: 5,
        convenience: 5,
        accuracy: 5,
      },
    };
  } catch (error) {
    console.error("Error submitting review:", error);
    submissionMessage.value = {
      text: "Failed to submit review. Please try again.",
      class: "message-error",
    };
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* Use SCSS for cleaner media queries */

.review-form-container {
  width: 100%;
  max-width: 600px;
  margin: 1rem auto; /* Reduced margin for mobile */
  padding: 1.5rem; /* Reduced padding for mobile */
  background-color: #fff;
  border-radius: 1rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  font-family: "Inter", sans-serif;
  box-sizing: border-box; /* Prevents padding from breaking width */

  @media (min-width: 768px) {
    margin: 2rem auto;
    padding: 2.5rem;
  }
}

.form-title {
  font-size: 1.25rem; /* Smaller on mobile */
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #1f2937;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.5rem;
    text-align: left;
  }
}

.star-rating-input {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center stars on mobile */

  @media (min-width: 768px) {
    align-items: flex-start;
  }
}

.stars {
  display: flex;
  gap: 0.5rem; /* More spacing for touch targets */
}

.stars .star-filled {
  color: #8c73ff;
}

.stars span {
  font-size: 2rem; /* Large touch targets */
  cursor: pointer;
  transition: color 0.2s;
  color: #d1d5db;
  line-height: 1;
}

.stars span:hover,
.stars span:hover ~ span {
  color: #8c73ff;
}

.categorical-sliders {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.slider-item {
  display: flex;
  flex-direction: column;
}

.slider-label {
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.slider-input {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 9999px;
  cursor: pointer;
  outline: none; /* Remove blue outline on touch */
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px; /* Larger touch target for mobile */
  width: 24px;
  background: #8c73ff;
  border-radius: 50%;
  border: 2px solid white; /* Add border for better visibility */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s;

  &:active {
    transform: scale(1.1);
  }
}

.slider-input::-webkit-slider-thumb:hover {
  background: #6a49e2;
}

.comment-input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem; /* 16px prevents zoom on iOS */
  resize: vertical;
  color: #374151;
  min-height: 100px;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #8c73ff;
    box-shadow: 0 0 0 3px rgba(140, 115, 255, 0.1);
  }
}

.submit-review-btn {
  width: 100%;
  padding: 0.85rem; /* Larger tap area */
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
}

.message-success,
.message-error,
.message-info {
  margin-top: 1.5rem;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.message-success {
  color: #065f46;
  background-color: #d1fae5;
}

.message-error {
  color: #991b1b;
  background-color: #fee2e2;
}

.message-info {
  color: #1e40af;
  background-color: #dbeafe;
}
</style>
