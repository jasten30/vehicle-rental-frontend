<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="bi bi-wallet2"></i> Pay Platform Service Fee</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <div class="summary-box">
          <div class="row">
            <span>Period:</span>
            <strong>{{ monthName }} {{ year }}</strong>
          </div>
          <div class="row total-row">
            <span>Total Fee Due:</span>
            <span class="amount"
              >₱{{
                amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
              }}</span
            >
          </div>
          <p class="note">
            This covers the 10% service fee for confirmed bookings.
          </p>
        </div>

        <div class="payment-details">
          <h4>Scan to Pay (Admin)</h4>
          <div class="qr-container">
            <img :src="adminQrImage" alt="Admin QR Code" class="qr-image" />
            <p class="admin-name">RentCycle Admin</p>
            <p class="admin-number">0912-345-6789</p>
          </div>
        </div>

        <div class="input-group">
          <label>Payment Reference Number</label>
          <input
            type="text"
            v-model="referenceNumber"
            placeholder="e.g. 10023482912"
            class="form-input"
          />
          <small>Please enter the reference number from your receipt.</small>
        </div>
      </div>

      <div class="modal-footer">
        <button class="button secondary" @click="close">Cancel</button>
        <button
          class="button primary"
          :disabled="!referenceNumber || isSubmitting"
          @click="confirmPayment"
        >
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit Payment</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import adminQrCodeImg from "@/assets/images/QR Code admin.png";

export default {
  name: "PlatformFeePaymentModal",
  props: {
    isOpen: Boolean,
    monthName: String,
    year: [String, Number],
    amount: Number,
  },
  emits: ["close", "submit-payment"],
  data() {
    return {
      referenceNumber: "",
      isSubmitting: false,
      adminQrImage: adminQrCodeImg,
    };
  },
  methods: {
    close() {
      this.referenceNumber = "";
      this.$emit("close");
    },
    async confirmPayment() {
      if (!this.referenceNumber) return;

      this.isSubmitting = true;

      this.$emit("submit-payment", {
        referenceNumber: this.referenceNumber,
        month: this.monthName,
        year: this.year,
        amount: this.amount,
      });

      this.isSubmitting = false;
      this.close();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  /* --- CRITICAL LAYOUT FIXES --- */
  display: flex;
  flex-direction: column;
  width: 90%; /* Use percentage width for responsiveness */
  max-width: 450px; /* Cap the width for large screens */
  max-height: 90vh; /* Ensure it never exceeds 90% of screen height */
  /* ----------------------------- */
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: $text-color-dark;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
  }
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* Enable scrolling inside body */
  flex: 1; /* Take available space */
}

.summary-box {
  background: #fff7ed;
  border: 1px solid #ffedd5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #4b5563;
  }
  .total-row {
    font-size: 1.1rem;
    color: #c2410c;
    font-weight: 700;
    border-top: 1px dashed #fdba74;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
  .note {
    font-size: 0.75rem;
    color: #9a3412;
    margin: 0.5rem 0 0 0;
    font-style: italic;
  }
}

.payment-details {
  text-align: center;
  margin-bottom: 1.5rem;

  h4 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 1rem;
    letter-spacing: 0.5px;
  }

  .qr-container {
    border: 1px solid #e5e7eb;
    padding: 1rem;
    border-radius: 8px;
    display: inline-block;

    .qr-image {
      width: 150px;
      height: 150px;
      margin-bottom: 0.5rem;
      object-fit: contain;
      transition: all 0.3s ease;
    }
    .admin-name {
      font-weight: 700;
      margin: 0;
      color: $text-color-dark;
    }
    .admin-number {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
  }
}

.input-group {
  label {
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
  }
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
    }
  }
  small {
    display: block;
    margin-top: 0.25rem;
    color: #6b7280;
    font-size: 0.8rem;
  }
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

.button {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;

  &.secondary {
    background: white;
    border-color: #d1d5db;
    color: #374151;
    &:hover {
      background: #f3f4f6;
    }
  }
  &.primary {
    background: $primary-color;
    color: white;
    &:hover {
      background: darken($primary-color, 5%);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- SMALL LAPTOP / SHORT SCREEN OPTIMIZATION --- */
/* If the screen height is less than 800px (Common Laptop resolution) */
@media (max-height: 800px) {
  .modal-header {
    padding: 0.75rem 1rem;
  }
  .modal-body {
    padding: 1rem;
  }
  .modal-footer {
    padding: 0.75rem 1rem;
  }

  .summary-box {
    margin-bottom: 1rem;
    padding: 0.75rem;
  }
  .payment-details {
    margin-bottom: 1rem;
  }

  /* Shrink the QR code so user doesn't have to scroll */
  .payment-details .qr-container .qr-image {
    width: 100px;
    height: 100px;
  }
}
</style>
