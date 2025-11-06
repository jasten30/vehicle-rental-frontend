<template>
  <div class="review-card">
    <div class="review-header">
      <div class="reviewer-info">
        <img :src="review.reviewerPhotoUrl || 'https://placehold.co/60x60/e2e8f0/666666?text=User'" alt="Reviewer" class="reviewer-avatar" />
        <div>
          <span class="reviewer-name">{{ review.reviewerName || 'Anonymous' }}</span>
          <span class="review-date">{{ formattedDate }}</span>
        </div>
      </div>
      <div class="review-rating">
        <i class="bi bi-star-fill"></i>
        <span>{{ review.overallRating }}</span>
      </div>
    </div>
    <p class="review-comment">{{ review.comment }}</p>
    
    <!-- ===== REMOVED "For: Vehicle" Footer ===== -->
    <!--
    <div class="review-footer" v-if="review.vehicleMake && review.vehicleModel">
      <span>For: <strong>{{ review.vehicleMake }} {{ review.vehicleModel }}</strong></span>
    </div>
    -->

    <!-- ===== Host Reply Section ===== -->
    <div v-if="review.reply" class="host-reply">
      <div class="reply-header">
        <span class="reply-label">Host's Reply</span>
        <span class="reply-date">{{ formatReplyDate(review.reply.createdAt) }}</span>
      </div>
      <p class="reply-text">{{ review.reply.text }}</p>
    </div>

    <!-- Reply Button/Form -->
    <div v-if="canReply" class="reply-action-section">
      <button v-if="!showReplyForm" @click="showReplyForm = true" class="button reply-button">
        <i class="bi bi-chat-left-dots-fill"></i> Reply to this review
      </button>

      <form v-if="showReplyForm" @submit.prevent="submitReply" class="reply-form">
        <textarea
          v-model="replyText"
          placeholder="Write your public reply..."
          rows="3"
          required
        ></textarea>
        <div class="reply-form-actions">
          <button type="button" @click="cancelReply" class="button secondary-button">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="button primary-button">
            <span v-if="isSubmitting">Posting...</span>
            <span v-else>Post Reply</span>
          </button>
        </div>
      </form>
    </div>
    <!-- ===== END NEW SECTION ===== -->

  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'ProfileReviewCard',
  props: {
    review: {
      type: Object,
      required: true
    },
    // This prop will be passed down from ProfileSettingsView
    isOwner: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit-reply'], // New event
  data() {
    return {
      showReplyForm: false,
      replyText: '',
      isSubmitting: false, // Local loading state
    }
  },
  computed: {
    formattedDate() {
      if (!this.review.createdAt) return '';
      const ts = this.review.createdAt;
      const date = ts.toDate ? ts.toDate() : (ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts));
      return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);
    },
    formatReplyDate() {
      return (timestamp) => {
         if (!timestamp) return '';
         const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp._seconds * 1000);
         return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);
      }
    },
    canReply() {
      // Show reply button if:
      // 1. You are the owner of this profile
      // 2. The review doesn't already have a reply
      return this.isOwner && !this.review.reply;
    }
  },
  methods: {
    submitReply() {
      if (this.replyText.trim() === '') return;
      this.isSubmitting = true;
      // Emit the data to the parent (ProfileSettingsView) to handle the API call
      this.$emit('submit-reply', {
        reviewId: this.review.id,
        text: this.replyText,
        callback: this.onReplySuccess // Pass a callback to stop loading
      });
    },
    cancelReply() {
      this.showReplyForm = false;
      this.replyText = '';
      this.isSubmitting = false;
    },
    onReplySuccess() {
      this.isSubmitting = false;
      this.showReplyForm = false;
      this.replyText = '';
      // The parent component (ProfileSettingsView) will refresh the review list
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.review-card {
  background-color: $card-background;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 600;
  color: $text-color-dark;
  display: block;
}

.review-date {
  font-size: 0.85rem;
  color: $text-color-medium;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1rem;
  font-weight: 700;
  color: $text-color-dark;
  
  i {
    color: #f59e0b; // Yellow star
  }
}

.review-comment {
  font-size: 0.95rem;
  color: $text-color-dark;
  line-height: 1.6;
  margin: 0; // UPDATED: Removed bottom margin
}

/* --- REMOVED .review-footer styles --- */

/* --- NEW REPLY STYLES --- */
.host-reply {
  background-color: $background-light;
  border-radius: $border-radius-md;
  padding: 1rem;
  margin-top: 1rem; // This now creates space after the comment
  border: 1px solid $border-color-light;
}
.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.reply-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: $primary-color;
}
.reply-date {
  font-size: 0.8rem;
  color: $text-color-medium;
}
.reply-text {
  font-size: 0.9rem;
  color: $text-color-dark;
  line-height: 1.5;
  margin: 0;
}

.reply-action-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed $border-color;
}
.reply-form {
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 0.9rem;
    font-family: $font-family-base;
    box-sizing: border-box;
    margin-bottom: 0.75rem;
  }
}
.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.button {
  padding: 0.5rem 1rem;
  border-radius: $border-radius-md;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &.reply-button {
    background: transparent;
    color: $primary-color;
    border-color: $primary-color;
    &:hover {
      background-color: lighten($primary-color, 45%);
    }
  }
  &.primary-button {
    background-color: $primary-color;
    color: white;
    &:disabled { opacity: 0.7; }
  }
  &.secondary-button {
    background-color: transparent;
    color: $text-color-medium;
    border-color: $border-color;
    &:hover { background-color: $background-light; }
  }
}
</style>