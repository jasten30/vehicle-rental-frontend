<!-- frontend/src/views/Payment/PaymentReturnView.vue -->
<template>
  <div class="payment-return-container">
    <div v-if="loading" class="loading-message">
      <p>Processing your payment and booking details...</p>
    </div>

    <div v-else class="payment-status-card">
      <h1 class="card-title">Booking & Payment Status</h1>

      <div v-if="errorMessage" class="error-section">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p class="error-message">{{ errorMessage }}</p>
        <router-link to="/vehicles" class="button primary-button">Browse More Vehicles</router-link>
      </div>

      <!-- Added key to force re-render when bookingId changes -->
      <div v-else-if="displayData" class="success-section" :key="displayData.bookingId">
        <i class="fas fa-check-circle success-icon"></i>
        <p class="success-message">Your booking has been successfully initiated!</p>

        <div class="booking-summary">
          <h2>Booking Summary (ID: {{ displayData.bookingId }})</h2>
          <!-- Re-added v-if for vehicleDetails for clarity -->
          <p v-if="displayData.vehicleDetails">
            <strong>Vehicle:</strong> {{ displayData.vehicleDetails.make }} {{ displayData.vehicleDetails.model }} ({{ displayData.vehicleDetails.year }})
          </p>
          <p v-else>
            <strong>Vehicle:</strong> Details not available.
          </p>
          
          <p><strong>Dates:</strong> {{ formatDate(displayData.startDate) }} to {{ formatDate(displayData.endDate) }}</p>
          <p><strong>Total Cost:</strong> ₱{{ displayData.totalCost }}</p>
          <p><strong>Payment Method:</strong> {{ formatPaymentMethod(displayData.paymentMethodType) }}</p>
          <p><strong>Current Status:</strong> <span :class="getStatusClass(displayData.paymentStatus)">{{ formatStatus(displayData.paymentStatus) }}</span></p>
        </div>

        <div class="payment-instructions">
          <h3>Next Steps for Payment</h3>
          <div v-if="displayData.paymentMethodType === 'cash'">
            <p>
              Your downpayment of <strong>₱{{ displayData.downpaymentAmount }}</strong> is due in cash upon vehicle pickup.
              The remaining <strong>₱{{ displayData.fullPaymentAmount }}</strong> will also be collected at pickup.
            </p>
            <p class="note">
              Please ensure you have the exact cash amount ready at pickup.
            </p>
          </div>
          <div v-else-if="displayData.paymentMethodType === 'qr_manual' && displayData.qrCodeInfo">
            <p>
              Please complete your downpayment of <strong>₱{{ displayData.downpaymentAmount }}</strong> by scanning the QR code below.
              The remaining <strong>₱{{ displayData.fullPaymentAmount }}</strong> is due upon vehicle pickup.
            </p>
            <div class="qr-code-display">
              <img :src="displayData.qrCodeInfo.qrCodeImageUrl" alt="QR Code" class="qr-image">
              <p class="qr-instructions">{{ displayData.qrCodeInfo.instructions }}</p>
              <p class="qr-account">
                <strong>Account Name:</strong> RentCycle PH <br>
                <strong>GCash/Maya Number:</strong> 0917-XXX-XXXX (Example)
              </p>
            </div>
            <p class="note">
              Your booking will be confirmed after we manually verify your QR payment.
              You can check the updated status on your "My Bookings" page.
            </p>
            <button @click="confirmQrPayment" :disabled="confirmingQr" class="button secondary-button confirm-qr-button">
              <span v-if="confirmingQr">Confirming...</span>
              <span v-else>I Have Paid via QR</span>
            </button>
          </div>
          <p class="due-date" v-if="displayData.downpaymentDueDate">
            Downpayment Due: {{ formatDate(displayData.downpaymentDueDate) }}
          </p>
        </div>

        <div class="action-buttons">
          <router-link to="/my-bookings" class="button primary-button">Go to My Bookings</router-link>
          <router-link to="/vehicles" class="button secondary-button">Browse More Vehicles</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'PaymentReturnView',
  data() {
    return {
      loading: true,
      errorMessage: null,
      displayData: null,
      confirmingQr: false,
    };
  },
  computed: {
    ...mapGetters(['user', 'allVehicles']),
  },
  methods: {
    ...mapActions(['getPaymentStatus', 'confirmManualQrPayment', 'fetchAllVehicles']),

    formatDate(isoString) {
      if (!isoString) return 'N/A';
      const date = typeof isoString === 'string' ? DateTime.fromISO(isoString) : DateTime.fromJSDate(isoString);
      return date.toLocaleString(DateTime.DATE_FULL);
    },
    formatPaymentMethod(method) {
      if (method === 'cash') return 'Cash on Pickup';
      if (method === 'qr_manual') return 'GCash/Maya QR Scan & Pay (Manual Verification)';
      return method;
    },
    formatStatus(status) {
      switch (status) {
        case 'pending_cash_downpayment': return 'Pending Cash Downpayment';
        case 'awaiting_qr_downpayment': return 'Awaiting QR Downpayment';
        case 'qr_downpayment_confirmed_by_user': return 'QR Downpayment Confirmed (Awaiting Verification)';
        case 'downpayment_received': return 'Downpayment Received';
        case 'full_payment_received': return 'Full Payment Received';
        case 'cancelled_no_downpayment': return 'Cancelled (No Downpayment)';
        case 'cancelled_by_user_after_grace_period': return 'Cancelled (Downpayment Forfeited)';
        case 'cancelled_within_grace_period': return 'Cancelled (Refund Eligible)';
        case 'refunded': return 'Refunded';
        default: return status;
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 'downpayment_received':
        case 'full_payment_received': return 'status-success';
        case 'pending_cash_downpayment':
        case 'awaiting_qr_downpayment':
        case 'qr_downpayment_confirmed_by_user': return 'status-pending';
        case 'cancelled_no_downpayment':
        case 'cancelled_by_user_after_grace_period': return 'status-cancelled';
        case 'cancelled_within_grace_period':
        case 'refunded': return 'status-info';
        default: return 'status-default';
      }
    },
    async handlePaymentReturn() {
      this.loading = true;
      this.errorMessage = null;
      this.displayData = null;

      const { bookingId, _status, totalCost, downpaymentAmount, fullPaymentAmount, downpaymentDueDate, paymentMethodType, qrCodeImageUrl, qrInstructions, qrAmountToPay } = this.$route.query;

      console.log('[PaymentReturnView] Route Query Params:', this.$route.query);

      if (!bookingId) {
        this.errorMessage = 'Missing booking ID in URL. Cannot retrieve payment status.';
        this.loading = false;
        return;
      }

      // Ensure allVehicles is fetched and up-to-date at the very beginning
      // This is crucial if the component mounts before the global allVehicles state is populated.
      console.log('[PaymentReturnView] Forcing fetchAllVehicles at start of handlePaymentReturn...');
      await this.fetchAllVehicles();
      console.log('[PaymentReturnView] allVehicles after forced fetch:', this.allVehicles.length);


      let tempDisplayData = {
        bookingId: bookingId,
        totalCost: parseFloat(totalCost),
        downpaymentAmount: parseFloat(downpaymentAmount),
        fullPaymentAmount: parseFloat(fullPaymentAmount),
        downpaymentDueDate: downpaymentDueDate,
        paymentMethodType: paymentMethodType,
        startDate: null,
        endDate: null,
        paymentStatus: null,
        qrCodeInfo: null,
        vehicleDetails: null,
      };

      if (paymentMethodType === 'qr_manual') {
        tempDisplayData.qrCodeInfo = {
          qrCodeImageUrl: qrCodeImageUrl,
          instructions: qrInstructions,
          amountToPay: parseFloat(qrAmountToPay),
        };
      }

      try {
        const response = await this.getPaymentStatus(bookingId);
        console.log('[PaymentReturnView] Fetched payment status (backend response):', response);

        tempDisplayData.paymentStatus = response.status;
        tempDisplayData.startDate = response.startDate;
        tempDisplayData.endDate = response.endDate;
        tempDisplayData.totalCost = response.totalCost;
        tempDisplayData.downpaymentAmount = response.downpaymentAmount;
        tempDisplayData.fullPaymentAmount = response.fullPaymentAmount;
        tempDisplayData.downpaymentDueDate = response.downpaymentDueDate;
        tempDisplayData.cancellationGracePeriodEnd = response.cancellationGracePeriodEnd;
        tempDisplayData.paymentMethodType = response.paymentMethodType || paymentMethodType;

        // Handle vehicle details
        if (response.vehicleDetails) {
            tempDisplayData.vehicleDetails = response.vehicleDetails;
            console.log('[PaymentReturnView] Vehicle details from backend response (direct):', tempDisplayData.vehicleDetails);
        } else if (response.vehicleId) {
            console.log('[PaymentReturnView] Vehicle details not in response, attempting to find in store...');
            // allVehicles should now be populated due to the forced fetch at the start
            const foundVehicle = this.allVehicles.find(v => v.id === response.vehicleId);
            if (foundVehicle) {
                tempDisplayData.vehicleDetails = foundVehicle;
                console.log('[PaymentReturnView] Vehicle details found from store:', tempDisplayData.vehicleDetails);
            } else {
                console.warn(`[PaymentReturnView] Vehicle details not found for ID: ${response.vehicleId} even after fetching all vehicles.`);
                tempDisplayData.vehicleDetails = { make: 'Unknown', model: 'Vehicle', year: '', rentalPricePerDay: 0 };
            }
        } else {
             console.warn('[PaymentReturnView] No vehicleId found in backend response or query.');
             tempDisplayData.vehicleDetails = { make: 'N/A', model: 'N/A', year: 'N/A', rentalPricePerDay: 'N/A' };
        }

        this.displayData = tempDisplayData; // Set the consolidated data
        console.log('[PaymentReturnView] Final displayData set:', this.displayData);

      } catch (error) {
        console.error('[PaymentReturnView] Error fetching payment status:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to retrieve booking status. Please check "My Bookings" page.';
      } finally {
        this.loading = false;
      }
    },
    async confirmQrPayment() {
      this.confirmingQr = true;
      this.errorMessage = null;
      try {
        const response = await this.confirmManualQrPayment(this.displayData.bookingId);
        this.displayData.paymentStatus = response.status;
        alert(response.message);
      } catch (error) {
        console.error('[PaymentReturnView] Error confirming QR payment:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to confirm QR payment. Please try again.';
      } finally {
        this.confirmingQr = false;
      }
    }
  },
  mounted() {
    this.handlePaymentReturn();
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.payment-return-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - #{$header-height} - #{$footer-height});
  padding: 2rem;
  background-color: $background-color;
}

.payment-status-card {
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  padding: 3rem;
  width: 100%;
  max-width: 700px;
  text-align: center;
}

.loading-message {
  font-size: 1.2rem;
  color: $text-color-medium;
  margin-top: 2rem;
}

.card-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 2rem;
}

.error-section {
  .error-icon {
    font-size: 4rem;
    color: #ef4444;
    margin-bottom: 1rem;
  }
  .error-message {
    font-size: 1.2rem;
    color: #ef4444;
    margin-bottom: 1.5rem;
  }
}

.success-section {
  .success-icon {
    font-size: 4rem;
    color: #22c55e;
    margin-bottom: 1rem;
  }
  .success-message {
    font-size: 1.4rem;
    color: #22c55e;
    font-weight: 600;
    margin-bottom: 2rem;
  }
}

.booking-summary, .payment-instructions {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;

  h2, h3 {
    color: $primary-color;
    font-size: 1.6rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  strong {
    font-weight: 700;
  }

  .note {
    font-size: 0.9rem;
    color: $text-color-medium;
    font-style: italic;
    margin-top: 1rem;
  }
}

.status-success {
  color: #22c55e;
  font-weight: 700;
}
.status-pending {
  color: #f59e0b;
  font-weight: 700;
}
.status-cancelled {
  color: #ef4444;
  font-weight: 700;
}
.status-info {
  color: #3b82f6;
  font-weight: 700;
}
.status-default {
  color: $text-color-dark;
  font-weight: 700;
}

.qr-code-display {
  text-align: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: white;
  border: 1px dashed #ccc;
  border-radius: $border-radius-sm;
}

.qr-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 1rem;
  border: 1px solid #eee;
  border-radius: $border-radius-sm;
}

.qr-instructions {
  font-size: 0.95rem;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
}

.qr-account {
  font-size: 0.9rem;
  color: $text-color-medium;
  line-height: 1.4;
}

.confirm-qr-button {
  margin-top: 1.5rem;
  width: auto;
  padding: 0.75rem 1.5rem;
}

.due-date {
  font-size: 0.9rem;
  color: #ef4444;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  border-radius: $border-radius-md;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
  text-align: center;
  cursor: pointer;

  &.primary-button {
    background-color: $primary-color;
    color: white;
    border: 1px solid $primary-color;

    &:hover {
      background-color: darken($primary-color, 10%);
      transform: translateY(-2px);
    }
  }

  &.secondary-button {
    background-color: transparent;
    color: $primary-color;
    border: 1px solid $primary-color;

    &:hover {
      background-color: lighten($primary-color, 40%);
      transform: translateY(-2px);
    }
  }
}
</style>