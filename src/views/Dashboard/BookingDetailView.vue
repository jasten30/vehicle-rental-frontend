<template>
  <div class="page-container">
    <div v-if="loading" class="loading-state">
      <p>Loading booking details...</p>
    </div>
    <div v-else-if="errorMessage" class="error-state">
      <i class="bi bi-exclamation-circle-fill icon"></i>
      <p>{{ errorMessage }}</p>
      <button @click="fetchBooking" class="button primary">Retry</button>
    </div>

    <div v-else-if="booking" class="booking-details-layout">

      <div class="main-content">
        <div class="header">
          <span class="booking-status" :class="getStatusClass(booking.paymentStatus)">
            {{ formatStatus(booking.paymentStatus) }}
          </span>
          <h1 class="booking-title">Booking Details</h1>
          <p class="booking-id">#{{ booking.id }}</p>
        </div>

        <div v-if="showOwnerActionCard" class="action-card owner-approval">
          <div class="card-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
          <div class="card-content">
            <h3 class="card-title">New Booking Request</h3>
            <p>Review the details and respond to the renter.</p>
            <div class="action-buttons">
              <button @click="handleApproval('decline')" class="button secondary">Decline</button>
              <button @click="handleApproval('approve')" class="button primary">Approve</button>
            </div>
          </div>
        </div>

        <div v-if="showPaymentActionCard" class="action-card renter-payment">
          <div class="card-icon"><i class="bi bi-credit-card-fill"></i></div>
          <div class="card-content">
            <h3 class="card-title">Payment Required</h3>
            <p>The owner approved your request. Pay the downpayment to confirm.</p>
            <button @click="openDownpaymentModal" class="button primary pay-now-button">
              Pay ₱{{ booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} Downpayment
            </button>
          </div>
        </div>

        <div v-if="showOwnerPaymentConfirmationCard" class="action-card owner-confirm">
          <div class="card-icon"><i class="bi bi-patch-check-fill"></i></div>
          <div class="card-content">
            <h3 class="card-title">Verify Downpayment</h3>
            <p>The renter submitted payment (Ref: {{ booking.paymentReferenceNumber || 'N/A' }}). Verify receipt of <strong>₱{{ booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong> to finalize.</p>
            <div class="action-buttons">
              <button @click="handleConfirmPayment" class="button primary">Confirm Payment Received</button>
            </div>
          </div>
        </div>
        
        <div v-if="showPayExtensionCard && latestPendingExtension" class="action-card renter-payment extension-payment">
          <div class="card-icon"><i class="bi bi-clock-history"></i></div>
          <div class="card-content">
            <h3 class="card-title">Extension Payment Required</h3>
            <p>
              Your extension request is pending payment. Please pay the extension fee of
              <strong>₱{{ latestPendingExtension.cost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
              to confirm the new return time: {{ formatFullDateTime(latestPendingExtension.newEndDate) || 'N/A' }}.
            </p>
            <button @click="openExtensionPaymentModal" class="button primary pay-now-button">
              Pay Extension Fee Now
            </button>
          </div>
        </div>

        <div v-if="showDownpaymentVerifiedMessage" class="info-card status-info-card downpayment-verified">
          <div class="card-icon"><i class="bi bi-shield-check"></i></div>
          <div class="card-content">
            <h3 class="card-title">Booking Confirmed</h3>
            <p>The owner has confirmed receipt of your payment. Your booking is secured!</p>
            <p class="next-steps">You can now contact the host via chat to coordinate pickup details.</p>
          </div>
        </div>

        <div class="info-card vehicle-card">
          <img
            :src="getVehicleImageUrl(booking.vehicleDetails)"
            alt="Vehicle"
            class="vehicle-image"
          />
          <div class="vehicle-info">
            <h2 class="vehicle-name">
              {{ booking.vehicleDetails?.make }} {{ booking.vehicleDetails?.model }}
            </h2>
            <p class="vehicle-year">{{ booking.vehicleDetails?.year }}</p>
            <p class="vehicle-location" v-if="booking.vehicleDetails?.location?.city">
              <i class="bi bi-geo-alt-fill"></i> {{ booking.vehicleDetails.location.city }}
            </p>
          </div>
        </div>

        <div class="info-card trip-details-card">
          <h3 class="card-section-title">Trip Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Pickup</span>
              <span class="value">{{ formatFullDateTime(booking.startDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Return</span>
              <span class="value">{{ formatFullDateTime(booking.endDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Booked On</span>
              <span class="value">{{ formatFullDateTime(booking.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Duration</span>
              <span class="value">{{ calculateDuration(booking.startDate, booking.endDate) }}</span>
            </div>
          </div>
        </div>

        <div class="info-card payment-details-card">
          <h3 class="card-section-title">Payment Details</h3>
          <div class="payment-grid">
            <div class="detail-item">
              <span class="label">Total Cost</span>
              <span class="value price total-price">₱{{ booking.totalCost ? booking.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Amount Paid</span>
              <span class="value price paid-price">₱{{ booking.amountPaid ? booking.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Downpayment Due</span>
              <span class="value price">₱{{ booking.downPayment ? booking.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Remaining Balance</span>
              <span class="value price remaining-price">₱{{ booking.remainingBalance ? booking.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00' }}</span>
            </div>
            <div class="detail-item" v-if="booking.paymentReferenceNumber">
              <span class="label">Payment Reference</span>
              <span class="value">{{ booking.paymentReferenceNumber }}</span>
            </div>
            <div class="detail-item" v-for="(ext, index) in booking.extensions" :key="`ext-${index}`">
              <span class="label">Extension {{ index + 1 }} ({{ ext.status }})</span>
              <span class="value price">₱{{ ext.cost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

      </div>

      <div class="sidebar-content">
        <div class="info-card participant-card">
          <h3 class="card-section-title">Host</h3>
          <div class="participant-details">
            <img 
              :src="booking.ownerDetails?.profilePhotoUrl || 'https://placehold.co/60x60/e2e8f0/666666?text=Host'" 
              alt="Host Avatar" 
              class="participant-avatar"
              @error="onImageError"
            />
            <div>
              <p class="name">{{ booking.ownerDetails?.name || 'N/A' }}</p>
              <p class="email">{{ booking.ownerDetails?.email || 'No email available' }}</p>
            </div>
          </div>
        </div>

        <div class="info-card participant-card">
          <h3 class="card-section-title">Renter</h3>
          <div class="participant-details">
            <img 
              :src="booking.renterDetails?.profilePhotoUrl || 'https://placehold.co/60x60/e2e8f0/666666?text=Renter'" 
              alt="Renter Avatar" 
              class="participant-avatar"
              @error="onImageError"
            />
            <div>
              <p class="name">{{ booking.renterDetails?.name || 'N/A' }}</p>
              <p class="email">{{ booking.renterDetails?.email || 'No email available' }}</p>
            </div>
          </div>
        </div>

        <div class="info-card sidebar-actions-card">
          <h3 class="card-section-title">Actions</h3>

          <div v-if="!isTripFinished">

            <div v-if="showCancelAction" class="action-group">
              <button
                @click="handleCancelBooking"
                class="button danger full-width"
                :disabled="isCancelling"
              >
                <span v-if="isCancelling">Cancelling...</span>
                <span v-else>
                  <i class="bi bi-x-circle" style="pointer-events: none;"></i>
                  Cancel Booking
                </span>
              </button>
            </div>

            <button
                v-if="showExtensionButton"
                @click="isExtensionModalOpen = true"
                class="button secondary full-width"
            >
              <i class="bi bi-clock-history"></i> Extend Booking
            </button>

            <button
              v-if="showMarkAsReturnedButton"
              @click="handleMarkAsReturned"
              class="button primary full-width"
              :disabled="isMarkingReturned"
            >
              <span v-if="isMarkingReturned">Updating...</span>
              <span v-else><i class="bi bi-check2-circle"></i> Mark as Returned</span>
            </button>
            
            <button
              v-if="showDownloadContractButton"
              @click="handleDownloadContract"
              class="button secondary full-width"
              :disabled="isDownloadingContract"
            >
              <span v-if="isDownloadingContract">Downloading...</span>
              <span v-else><i class="bi bi-file-earmark-arrow-down-fill"></i> Download Contract</span>
            </button>

            <button
              v-if="showReportButton"
              @click="isReportModalOpen = true"
              class="button secondary full-width"
            >
              <i class="bi bi-flag-fill"></i> Report Issue
            </button>

            <button @click="goBack" class="button secondary full-width">
              <i class="bi bi-arrow-left"></i> Go Back
            </button>

          </div>

          <div v-else class="completed-state">
            <i class="bi bi-patch-check-fill completed-icon"></i>
            <h4>Trip Completed</h4>
            <p>This trip finished successfully.</p>

            <button v-if="canSubmitReview" @click="isReviewModalOpen = true" class="button secondary full-width review-button">
              <i class="bi bi-star-fill"></i> Write a Review
            </button>

            <button
              v-if="showReportButton"
              @click="isReportModalOpen = true"
              class="button secondary full-width"
              style="margin-bottom: 0.5rem;"
            >
              <i class="bi bi-flag-fill"></i> Report Issue
            </button>

            <button @click="goBack" class="button secondary full-width">
              <i class="bi bi-arrow-left"></i> Go Back
            </button>
          </div>
        </div>

      </div>
    </div>

    <SubmitReviewModal
      v-if="booking && vehicle"
      :is-open="isReviewModalOpen"
      :booking="booking"
      :vehicle="vehicle"
      @close="isReviewModalOpen = false"
      @review-submitted="handleReviewSubmission"
    />
    <PaymentModal
      v-if="booking"
      :is-open="isPaymentModalOpen || isExtensionPaymentModalOpen"
      :booking="booking"
      :payment-type="paymentModalType"
      :amount-due="paymentAmountDue"
      :owner-details="booking.ownerDetails"
      @close="closePaymentModals"
      @payment-confirmed="handlePaymentSubmission"
    />
    <ReportIssueModal
      v-if="booking"
      :is-open="isReportModalOpen"
      :booking-id="booking.id"
      :user-role="userRole"
      @close="isReportModalOpen = false"
      @report-submitted="handleReportSubmission"
    />
    <BookingExtensionModal
      v-if="booking && vehicle"
      :is-open="isExtensionModalOpen"
      :booking="booking"
      :vehicle="vehicle"
      @close="isExtensionModalOpen = false"
      @extension-requested="handleExtensionRequested"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import SubmitReviewModal from '@/components/modals/SubmitReviewModal.vue';
import PaymentModal from '@/components/modals/PaymentModal.vue';
import ReportIssueModal from '@/components/modals/ReportIssueModal.vue';
import BookingExtensionModal from '@/components/modals/BookingExtensionModal.vue';

export default {
  name: 'BookingDetailView',
  components: {
    SubmitReviewModal,
    PaymentModal,
    ReportIssueModal,
    BookingExtensionModal
  },
  props: ['bookingId'],
  data() {
    return {
      loading: true,
      errorMessage: null,
      booking: null,
      vehicle: null,
      isReviewModalOpen: false,
      isPaymentModalOpen: false, // For initial downpayment
      isMarkingReturned: false,
      isReportModalOpen: false,
      isExtensionModalOpen: false, // For requesting extension
      isExtensionPaymentModalOpen: false, // For paying extension fee
      isCancelling: false,
      isDownloadingContract: false, // For contract download
      paymentModalType: 'downpayment', // 'downpayment' or 'extension'
      paymentAmountDue: 0,
    };
  },
  computed: {
    ...mapGetters(['userRole', 'user']),

    showOwnerActionCard() {
      if (!this.booking || !this.user) return false;
      const isOwner = this.user.uid === this.booking.ownerId;
      return isOwner && this.booking.paymentStatus === 'pending_owner_approval';
    },
    showPaymentActionCard() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      return isRenter && this.booking.paymentStatus === 'pending_payment';
    },
    showOwnerPaymentConfirmationCard() {
      if (!this.booking || !this.user) return false;
      const isOwner = this.user.uid === this.booking.ownerId;
      return isOwner && this.booking.paymentStatus === 'downpayment_pending_verification';
    },
    showDownpaymentVerifiedMessage() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      return isRenter && this.booking.paymentStatus === 'confirmed';
    },
    showCancelAction() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      const cancellableStatuses = [
        'pending_owner_approval',
        'pending_payment'
      ];
      return isRenter && cancellableStatuses.includes(this.booking.paymentStatus);
    },
    isCancellationWindowClosed() {
      return false; // Time limit removed previously
    },
    showMarkAsReturnedButton() {
      if (!this.booking || !this.user || !this.booking.vehicleDetails?.ownerId) return false;
      const isOwner = this.user.uid === this.booking.vehicleDetails.ownerId;
      const validStatuses = ['confirmed', 'pending_extension_payment', 'awaiting_return'];
      return isOwner && validStatuses.includes(this.booking.paymentStatus);
    },
    isTripFinished() {
      if (!this.booking) return false;
      return ['completed', 'returned', 'cancelled_by_renter', 'declined_by_owner'].includes(this.booking.paymentStatus);
    },
    canSubmitReview() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      const isFinished = ['completed', 'returned'].includes(this.booking.paymentStatus);
      const hasNotReviewed = !this.booking.reviewSubmitted;
      return isRenter && isFinished && hasNotReviewed;
    },
    showReportButton() {
      if (!this.booking) return false;
      const relevantStatuses = ['confirmed', 'returned', 'completed', 'pending_extension_payment', 'awaiting_return'];
      return relevantStatuses.includes(this.booking.paymentStatus);
    },
    showExtensionButton() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      return isRenter && this.booking.paymentStatus === 'confirmed';
    },
    latestPendingExtension() {
      if (!this.booking || !Array.isArray(this.booking.extensions) || this.booking.extensions.length === 0) {
        return null;
      }
      return [...this.booking.extensions].reverse().find(ext => ext.status === 'pending_payment');
    },
    showPayExtensionCard() {
      if (!this.booking || !this.user) return false;
      const isRenter = this.user.uid === this.booking.renterId;
      return isRenter && this.booking.paymentStatus === 'pending_extension_payment' && !!this.latestPendingExtension;
    },
    showDownloadContractButton() {
      if (!this.booking || !this.user) return false;
      const isOwner = this.user.uid === this.booking.ownerId;
      const isRenter = this.user.uid === this.booking.renterId;
      const validStatuses = ['confirmed', 'returned', 'completed', 'pending_extension_payment', 'awaiting_return'];
      return (isOwner || isRenter || this.userRole === 'admin') && validStatuses.includes(this.booking.paymentStatus);
    }
  },
  methods: {
    ...mapActions([
      'getBookingById',
      'updateBookingStatus',
      'getVehicleById',
      'approveBooking',
      'declineBooking',
      'confirmDownpaymentByUser',
      'confirmBookingPayment',
      'cancelBooking',
      'submitBookingReport',
      'requestBookingExtension',
      'confirmExtensionPayment',
      'downloadBookingContract' // Make sure this is in the store/modules/bookings.js
    ]),

    async fetchBooking() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const bookingData = await this.getBookingById(this.bookingId);
        if (!bookingData) throw new Error("Booking not found.");
        this.booking = bookingData;
        if (this.booking.vehicleId) {
          this.vehicle = await this.getVehicleById(this.booking.vehicleId);
        } else {
          console.warn("Vehicle ID missing from booking details.");
          this.vehicle = null;
        }
      } catch (error) {
        console.error("Failed to load booking/vehicle details:", error);
        this.errorMessage = error.message || 'Failed to load booking details.';
        this.booking = null;
        this.vehicle = null;
      } finally {
        this.loading = false;
      }
    },

    async handleApproval(action) {
      const confirmMessage = action === 'approve'
        ? 'Approve this booking request?'
        : 'Decline this booking request?';
      if (!window.confirm(confirmMessage)) return;
      try {
        if (action === 'approve') await this.approveBooking(this.booking.id);
        else await this.declineBooking(this.booking.id);
        alert(`Booking ${action}d successfully!`);
        await this.fetchBooking();
      } catch (error) {
        console.error(`Failed to ${action} booking:`, error);
        alert(`Error: Failed to ${action} booking. ${error.response?.data?.message || error.message}`);
      }
    },

    async handlePaymentSubmission() {
      this.closePaymentModals();
      if (this.paymentModalType === 'downpayment') {
        alert('Downpayment submitted for verification! The owner will confirm shortly.');
      } else if (this.paymentModalType === 'extension') {
        alert('Extension payment submitted! Your booking has been updated.');
      }
      await this.fetchBooking();
    },

    async handleConfirmPayment() { // OWNER confirms receipt
      if (!window.confirm('Confirm receipt of downpayment? This finalizes the booking.')) return;
      try {
        await this.confirmBookingPayment(this.booking.id);
        alert('Payment confirmed! Booking finalized.');
        await this.fetchBooking();
      } catch (error) {
        console.error('Error confirming payment:', error);
        alert(`Error: Failed to confirm payment. ${error.response?.data?.message || error.message}`);
      }
    },

    async handleCancelBooking() {
      if (!this.showCancelAction) {
        alert(`Booking cannot be cancelled in state: ${this.formatStatus(this.booking.paymentStatus)}.`);
        return;
      }
      if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
      this.isCancelling = true;
      try {
        await this.cancelBooking(this.booking.id);
        alert('Booking cancelled.');
        await this.fetchBooking();
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert(`Failed to cancel booking: ${error.response?.data?.message || error.message}`);
      } finally {
        this.isCancelling = false;
      }
    },

    async handleMarkAsReturned() {
      if (!confirm("Mark vehicle as returned? This completes the trip.")) return;
      this.isMarkingReturned = true;
      try {
        await this.updateBookingStatus({ bookingId: this.booking.id, newStatus: 'returned' });
        alert('Vehicle marked as returned.');
        await this.fetchBooking();
      } catch (error) {
        console.error("Error marking as returned:", error);
        alert(`Failed to mark as returned: ${error.response?.data?.message || error.message}`);
      } finally {
        this.isMarkingReturned = false;
      }
    },

    handleReviewSubmission() {
      this.isReviewModalOpen = false;
      if (this.booking) this.booking.reviewSubmitted = true;
      alert('Review submitted!');
    },

    handleReportSubmission() {
      this.isReportModalOpen = false;
      alert('Report submitted.');
    },

    handleExtensionRequested(result) {
      this.isExtensionModalOpen = false;
      alert(`Extension requested. Status updated. Please pay the fee: ₱${result?.extensionCost?.toFixed(2) || 'N/A'}`);
      this.fetchBooking();
    },

    openDownpaymentModal() {
      this.paymentModalType = 'downpayment';
      this.paymentAmountDue = this.booking.downPayment;
      this.isPaymentModalOpen = true;
      this.isExtensionPaymentModalOpen = false;
    },

    openExtensionPaymentModal() {
      const pendingExtension = this.latestPendingExtension;
      if (pendingExtension && pendingExtension.cost > 0) {
        this.paymentModalType = 'extension';
        this.paymentAmountDue = pendingExtension.cost;
        this.isExtensionPaymentModalOpen = true;
        this.isPaymentModalOpen = false;
      } else {
        console.error("Cannot open extension payment modal: No pending extension or cost is missing.");
        alert("Error: No pending extension payment found.");
      }
    },

    closePaymentModals() {
      this.isPaymentModalOpen = false;
      this.isExtensionPaymentModalOpen = false;
    },

    // --- THIS IS THE 100% CORRECT FUNCTION ---
    async handleDownloadContract() {
      this.isDownloadingContract = true;
      console.log('%c[Download] Starting download...', 'color: blue; font-weight: bold;');
      
      try {
        // 1. Calls the Vuex action we just added
        const { data, filename } = await this.downloadBookingContract(this.booking.id);
        
        // --- DEBUGGING ---
        // This will tell us *exactly* what the component received.
        console.log('[Download] Received data from Vuex:', data);
        console.log('[Download] Received filename from Vuex:', filename);
        console.log('[Download] Is data a Blob?', data instanceof Blob);
        console.log('[Download] Blob MIME type:', data.type); // Should be 'application/pdf'
        console.log('[Download] Blob size:', data.size);
        // --- END DEBUGGING ---

        // 2. Check if data is *actually* a blob.
        if (!(data instanceof Blob)) {
          console.error('[Download] CRITICAL ERROR: Data is NOT a blob!', data);
          alert('Download failed: Received invalid data from server.');
          this.isDownloadingContract = false;
          return;
        }

        // 3. This is the line that was broken before. 
        // It creates a URL from the blob directly.
        const url = window.URL.createObjectURL(data);
        
        console.log('[Download] Created object URL:', url);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BookingContract-${this.booking.id}.pdf`); // Uses the correct .pdf filename
        document.body.appendChild(link);
        link.click();
        
        // 4. Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('%c[Download] Download triggered successfully.', 'color: green; font-weight: bold;');
        
      } catch (error) {
          console.error("Error in handleDownloadContract:", error);
          if (error.response?.data instanceof Blob) {
            try {
              const errorText = await error.response.data.text();
              const errorJson = JSON.parse(errorText);
              alert(`Failed to download contract: ${errorJson.message || 'Server error'}`);
            } catch (e) {
                alert('Failed to download contract: An unknown server error occurred.');
            }
          } else {
            alert(`Failed to download contract: ${error.response?.data?.message || error.message}`);
          }
      } finally {
          this.isDownloadingContract = false;
      }
    },

    onImageError(event) {
      event.target.src = 'https://placehold.co/60x60/e2e8f0/666666?text=User';
    },

    // --- Formatting and Utility Methods ---
    getVehicleImageUrl(vehicle) {
      if (vehicle?.exteriorPhotos?.length > 0) return vehicle.exteriorPhotos[0];
      return 'https://placehold.co/200x150/e2e8f0/666666?text=No+Image';
    },
    formatFullDateTime(dateStr) {
      if (!dateStr) return 'N/A';
      const jsDate = dateStr && dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
      if (isNaN(jsDate.getTime())) return 'Invalid Date';
      const dt = DateTime.fromJSDate(jsDate);
      return dt.isValid ? dt.toLocaleString(DateTime.DATETIME_MED) : 'Invalid Date';
    },
    calculateDuration(startStr, endStr) {
      if (!startStr || !endStr) return 'N/A';
      const startDate = startStr.toDate ? startStr.toDate() : new Date(startStr);
      const endDate = endStr.toDate ? endStr.toDate() : new Date(endStr);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Invalid dates';

      const start = DateTime.fromJSDate(startDate);
      const end = DateTime.fromJSDate(endDate);
      if (!start.isValid || !end.isValid || start >= end) return 'Invalid dates';

      const diff = end.diff(start, ['days', 'hours']).normalize();
      let durationString = '';
      if (diff.days > 0) durationString += `${diff.days} day${diff.days > 1 ? 's' : ''}`;
      if (diff.hours > 0) durationString += `${durationString ? ', ' : ''}${Math.round(diff.hours)} hour${diff.hours > 1 ? 's' : ''}`;
      return durationString || 'Less than an hour';
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-default';
      if (['confirmed', 'completed', 'returned', 'downpayment_verified'].includes(status)) return 'status-success';
      if (['pending_owner_approval', 'pending_payment', 'downpayment_pending_verification', 'pending_extension_payment'].includes(status)) return 'status-warning';
      if (status?.includes('cancelled') || status?.includes('declined')) return 'status-danger';
      return 'status-default';
    },
    goBack() {
      this.$router.go(-1);
    },
  },
  created() {
    this.fetchBooking();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

/* --- Global Page Styles --- */
.page-container {
  max-width: 1100px;
  margin: $spacing-xl auto;
  padding: 0 $spacing-md;
}

/* --- Layout --- */
.booking-details-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @media (min-width: 992px) {
    grid-template-columns: 2fr 1fr;
    gap: $spacing-xl;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  position: sticky;
  top: $spacing-lg;

  @media (max-width: 991px) {
    position: static;
  }
}

/* --- Header --- */
.header {
  margin-bottom: $spacing-sm;
  border-bottom: 1px solid $border-color;
  padding-bottom: $spacing-md;
}

.booking-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: $text-color-dark;
  margin: 0 0 0.25rem;
}

.booking-id {
  font-size: 0.9rem;
  color: $text-color-medium;
  font-family: monospace;
  margin: 0;
}

.booking-status {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: $spacing-md;
  text-transform: capitalize;
}
.status-success { background-color: lighten($secondary-color, 40%); color: darken($secondary-color, 25%); border: 1px solid lighten($secondary-color, 30%); }
.status-warning { background-color: lighten($accent-color, 40%); color: darken($accent-color, 25%); border: 1px solid lighten($accent-color, 30%); }
.status-danger { background-color: lighten($admin-color, 45%); color: darken($admin-color, 25%); border: 1px solid lighten($admin-color, 35%); }
.status-default { background-color: $background-medium; color: $text-color-medium; border: 1px solid $border-color; }


/* --- General Card Styling --- */
.info-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 1px solid $border-color-light;
  box-shadow: $shadow-small;
}

.card-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 $spacing-md 0;
  color: $text-color-dark;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-color-light;
}

/* --- Action Cards --- */
.action-card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  border-left-width: 5px;
  border-left-style: solid;

  .card-icon {
    font-size: 1.8rem;
    margin-top: 0.25rem;
  }
  .card-content { flex-grow: 1; }
  .card-title { font-size: 1.1rem; margin: 0 0 $spacing-sm 0; }
  p { font-size: 0.9rem; color: $text-color-medium; margin: 0 0 $spacing-md 0; line-height: 1.5; }
  .action-buttons { display: flex; gap: $spacing-sm; margin-top: auto; }
}
.action-card.owner-approval {
  background-color: lighten($accent-color, 45%); border-left-color: $accent-color;
  .card-icon { color: $accent-color; } .card-title { color: darken($accent-color, 15%); }
}
.action-card.renter-payment {
  background-color: lighten($primary-color, 45%); border-left-color: $primary-color;
  .card-icon { color: $primary-color; } .card-title { color: darken($primary-color, 15%); }
  .pay-now-button { width: 100%; margin-top: $spacing-sm; }
}
.action-card.owner-confirm {
  background-color: lighten($secondary-color, 45%); border-left-color: $secondary-color;
  .card-icon { color: $secondary-color; } .card-title { color: darken($secondary-color, 15%); }
  p strong { color: darken($secondary-color, 25%); }
}
.action-card.extension-payment {
  background-color: lighten($accent-color, 45%);
  border-left-color: $accent-color;
  .card-icon { color: $accent-color; }
  .card-title { color: darken($accent-color, 15%); }
  p strong { color: darken($accent-color, 25%); }
}

/* Status Info Card (for verified message) */
.status-info-card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  border-left-width: 5px;
  border-left-style: solid;
  .card-icon { font-size: 1.8rem; margin-top: 0.25rem; }
  .card-content { flex-grow: 1; }
  .card-title { font-size: 1.1rem; margin: 0 0 $spacing-sm 0; }
  p { font-size: 0.9rem; color: $text-color-medium; margin: 0 0 $spacing-sm 0; line-height: 1.5; }
  .next-steps { font-style: italic; font-size: 0.85rem; margin-top: $spacing-sm; }
}
.status-info-card.downpayment-verified {
  background-color: lighten($secondary-color, 45%);
  border-left-color: $secondary-color;
  .card-icon { color: $secondary-color; }
  .card-title { color: darken($secondary-color, 15%); }
}


/* --- Vehicle Card --- */
.vehicle-card {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}
.vehicle-image {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: $border-radius-md;
  flex-shrink: 0;
}
.vehicle-info { flex-grow: 1; }
.vehicle-name { font-size: 1.3rem; font-weight: 600; margin: 0 0 0.25rem 0; }
.vehicle-year { font-size: 0.9rem; color: $text-color-medium; margin-bottom: $spacing-sm; }
.vehicle-location {
  font-size: 0.9rem; color: $text-color-medium; display: flex; align-items: center; gap: 0.3rem;
  i { font-size: 0.8rem; }
}

/* --- Details Grid (Trip & Payment) --- */
.details-grid, .payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: $spacing-md $spacing-lg;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.label {
  font-size: 0.75rem;
  color: $text-color-medium;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
}
.value {
  font-size: 1rem;
  font-weight: 500;
  color: $text-color-dark;

  &.price {
    font-weight: 600;
    &.total-price { font-size: 1.1rem; color: $primary-color; }
    &.paid-price { color: $secondary-color; }
    &.remaining-price { color: $text-color-medium; }
  }
}

/* --- Participant Cards (Sidebar) --- */
.participant-card {
  .participant-details { 
    display: flex; 
    align-items: center; 
    gap: $spacing-md; 
  }
  .participant-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid $border-color-light;
  }
  .name { font-size: 1rem; font-weight: 600; margin: 0 0 0.1rem 0; color: $text-color-dark; }
  .email { font-size: 0.85rem; color: $text-color-medium; font-weight: 400; word-break: break-all; }
}

/* --- Sidebar Actions Card --- */
.sidebar-actions-card {
  .button { margin-bottom: $spacing-sm; }
  .action-group { margin-bottom: $spacing-sm; } // Reduced margin
  .cancellation-info { font-size: 0.8rem; color: $text-color-medium; text-align: center; margin-top: $spacing-sm; }
}

.completed-state {
  text-align: center;
  .completed-icon { font-size: 2.5rem; color: $secondary-color; margin-bottom: $spacing-sm; }
  h4 { margin: 0 0 $spacing-sm 0; font-weight: 600; color: darken($secondary-color, 15%); }
  p { font-size: 0.9rem; color: $text-color-medium; margin: 0 0 $spacing-md 0; }
  .review-button { margin-top: $spacing-sm; margin-bottom: $spacing-sm; }
}

/* --- Buttons --- */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: 10px 18px;
  border-radius: $border-radius-md;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  line-height: 1.5;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: $shadow-light;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.full-width { width: 100%; }
}

.button.primary {
  background-color: $primary-color; color: white; border-color: $primary-color;
  &:hover:not(:disabled) { background-color: darken($primary-color, 8%); border-color: darken($primary-color, 8%); }
}
.button.secondary {
  background-color: $card-background; color: $primary-color; border-color: $primary-color;
  &:hover:not(:disabled) { background-color: lighten($primary-color, 45%); }
}
.button.approve-button { background-color: $secondary-color; color: white; border-color: $secondary-color; }
.button.approve-button:hover:not(:disabled) { background-color: darken($secondary-color, 8%); border-color: darken($secondary-color, 8%); }
.button.decline-button { background-color: #e2e8f0; color: #1f2937; border-color: #d1d5db; }
.button.decline-button:hover:not(:disabled) { background-color: darken(#e2e8f0, 5%); }
.button.danger { background-color: $admin-color; color: white; border-color: $admin-color; }
.button.danger:hover:not(:disabled) { background-color: darken($admin-color, 8%); border-color: darken($admin-color, 8%); }
.button.review-button { background-color: $card-background; color: darken($secondary-color, 15%); border-color: darken($secondary-color, 15%); }
.button.review-button:hover:not(:disabled) { background-color: lighten($secondary-color, 40%); }


/* --- Loading/Error States --- */
.loading-state, .error-state {
  text-align: center; padding: $spacing-xl; color: $text-color-medium;
  .icon { font-size: 2rem; color: $admin-color; margin-bottom: $spacing-sm; }
}

</style>