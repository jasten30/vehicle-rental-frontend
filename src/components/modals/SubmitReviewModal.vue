<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">Write a Review</h3>
      <p v-if="vehicle" class="modal-subtitle">
        Share your experience with the {{ vehicle.make }} {{ vehicle.model }}.
      </p>

      <div v-if="!reviewSent" class="form-content">
        <div class="ratings-section">
          <div v-for="category in Object.keys(ratings)" :key="category" class="rating-category">
            <label>{{ formatCategoryName(category) }}</label>
            <div class="stars" @mouseleave="resetHover(category)">
              <i
                v-for="star in 5"
                :key="star"
                class="bi"
                :class="getStarClass(category, star)"
                @click="setRating(category, star)"
                @mouseover="hoverRating(category, star)"
              ></i>
            </div>
          </div>
        </div>

        <div class="comment-section">
          <label for="comment">Your Review</label>
          <textarea
            id="comment"
            v-model="comment"
            rows="5"
            placeholder="Describe your trip, the vehicle's condition, and your interaction with the host..."
          ></textarea>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button @click="submitReview" :disabled="isSubmitting" class="action-button">
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit Review</span>
        </button>
      </div>

      <div v-else class="success-message">
            <h4><i class="bi bi-check-circle-fill"></i> Thank You!</h4>
            <p>Your review has been submitted and will help other guests.</p>
            <button @click="$emit('close')" class="action-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'SubmitReviewModal',
  props: {
    isOpen: Boolean,
    booking: Object,
    vehicle: Object,
  },
  emits: ['close', 'review-submitted'],
  data() {
    return {
      ratings: {
        cleanliness: 0,
        maintenance: 0,
        communication: 0,
        convenience: 0,
        accuracy: 0,
      },
      hoveredRatings: {
        cleanliness: 0,
        maintenance: 0,
        communication: 0,
        convenience: 0,
        accuracy: 0,
      },
      comment: '',
      isSubmitting: false,
      errorMessage: '',
      reviewSent: false,
    };
  },
    watch: {
    isOpen(newVal) {
      if (newVal) {
        this.resetForm();
      }
    },
  },
  methods: {
    ...mapActions({
      dispatchSubmitReview: 'submitReview'
    }),
    formatCategoryName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    },
    getStarClass(category, star) {
        const ratingToShow = this.hoveredRatings[category] || this.ratings[category];
        return star <= ratingToShow ? 'bi-star-fill' : 'bi-star';
    },
    setRating(category, rating) {
      this.ratings[category] = rating;
    },
    hoverRating(category, rating) {
      this.hoveredRatings[category] = rating;
    },
    resetHover(category) {
      this.hoveredRatings[category] = 0;
    },
    resetForm() {
        this.ratings = { cleanliness: 0, maintenance: 0, communication: 0, convenience: 0, accuracy: 0 };
        this.hoveredRatings = { cleanliness: 0, maintenance: 0, communication: 0, convenience: 0, accuracy: 0 };
        this.comment = '';
        this.isSubmitting = false;
        this.errorMessage = '';
        this.reviewSent = false;
    },
    async submitReview() {
      this.errorMessage = '';
      const overallRating = Object.values(this.ratings).reduce((sum, val) => sum + val, 0) / 5;
      
      if (overallRating === 0 || !this.comment.trim()) {
        this.errorMessage = 'Please provide a rating for all categories and write a comment.';
        return;
      }

      this.isSubmitting = true;
      try {
        // --- FIX: Added validation to ensure vehicle and vehicle.id exist ---
        if (!this.vehicle || !this.vehicle.id) {
          this.errorMessage = 'Vehicle information is missing. Cannot submit review.';
          console.error('[SubmitReviewModal] Critical Error: The "vehicle" prop is missing or does not have an ID.');
          this.isSubmitting = false;
          return;
        }

        const reviewPayload = {
          bookingId: this.booking.id,
          vehicleId: this.vehicle.id,
          rating: overallRating,
          categoricalRatings: this.ratings,
          comment: this.comment,
        };

        await this.dispatchSubmitReview(reviewPayload);

        this.reviewSent = true;
        this.$emit('review-submitted');

      } catch (error) {
        console.error('[SubmitReviewModal] An error occurred while dispatching the Vuex action:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to submit review.';
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 0.75rem;
  width: 90%; max-width: 550px;
}
.modal-title {
  font-size: 1.5rem; font-weight: 600; text-align: center; margin: 0 0 0.5rem;
}
.modal-subtitle {
  margin: 0 0 1.5rem; color: #64748b; text-align: center;
}
.ratings-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.rating-category {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.rating-category label {
    font-weight: 500;
}
.stars {
    display: flex;
    gap: 0.25rem;
    font-size: 1.5rem;
    color: #f59e0b; /* Amber 500 */
    cursor: pointer;
}
.comment-section label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
}
textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    resize: vertical;
    min-height: 100px;
}
.action-button {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}
.error-message {
  color: #ef4444;
  text-align: center;
  margin-top: 1rem;
}
.success-message {
    text-align: center; padding: 1rem;
}
.success-message h4 {
    font-size: 1.25rem; margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #16a34a; /* Green 600 */
}
</style>

