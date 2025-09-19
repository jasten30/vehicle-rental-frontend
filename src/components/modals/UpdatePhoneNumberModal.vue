<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <h3 class="modal-title">Change Phone Number</h3>
      <p class="modal-subtitle">
        Enter your new phone number. We'll send a code to verify it.
      </p>

      <!-- Step 1: Enter Phone Number -->
      <div v-if="!confirmationResult" class="form-step">
        <div class="input-group">
          <label for="new-phone-number">New Phone Number</label>
          <div class="phone-input-wrapper">
            <span class="phone-prefix">+63</span>
            <input
              id="new-phone-number"
              v-model="localPhoneNumber"
              type="tel"
              placeholder="9171234567"
              autocomplete="tel"
            />
          </div>
        </div>
        <button @click="sendVerificationCode" :disabled="isLoading" class="action-button">
          <span v-if="isLoading">Sending...</span>
          <span v-else>Send Code</span>
        </button>
      </div>

      <!-- Step 2: Enter Verification Code -->
      <div v-else class="form-step">
        <div class="input-group">
          <label for="otp-code">Verification Code</label>
          <input
            id="otp-code"
            v-model="otpCode"
            type="text"
            placeholder="123456"
            maxlength="6"
          />
        </div>
        <button @click="verifyCodeAndUpdatePhone" :disabled="isLoading" class="action-button">
          <span v-if="isLoading">Verifying...</span>
          <span v-else>Verify & Save</span>
        </button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      
      <!-- This container is required for the invisible reCAPTCHA's privacy badge -->
      <div id="recaptcha-container-modal"></div>
    </div>
  </div>
</template>

<script>
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { mapActions } from 'vuex';

export default {
  name: 'UpdatePhoneNumberModal',
  props: {
    isOpen: Boolean,
  },
  emits: ['close', 'phone-updated'],
  data() {
    return {
      phoneNumber: '',
      otpCode: '',
      confirmationResult: null,
      recaptchaVerifier: null,
      isLoading: false,
      errorMessage: '',
    };
  },
  computed: {
    localPhoneNumber: {
      get() {
        return this.phoneNumber.replace(/^\+63/, '');
      },
      set(value) {
        const sanitized = value.replace(/\D/g, '').slice(0, 10);
        this.phoneNumber = `+63${sanitized}`;
      },
    },
  },
  methods: {
    ...mapActions(['updateUserProfile']),
    closeModal() {
      this.resetState();
      this.$emit('close');
    },
    resetState() {
        this.phoneNumber = '';
        this.otpCode = '';
        this.confirmationResult = null;
        this.isLoading = false;
        this.errorMessage = '';
    },
    async sendVerificationCode() {
      this.isLoading = true;
      this.errorMessage = '';
      if (this.phoneNumber.length !== 13) {
        this.errorMessage = 'Please enter a valid 10-digit phone number.';
        this.isLoading = false;
        return;
      }
      
      // Use setTimeout with a 0ms delay to push this logic to the end of the
      // browser's execution queue. This guarantees the DOM is fully rendered
      // and the reCAPTCHA container exists before the script runs.
      setTimeout(async () => {
          try {
            const auth = getAuth();
            this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-modal', { size: 'invisible' });
            
            // Explicitly render and wait for it to be ready
            await this.recaptchaVerifier.render();

            this.confirmationResult = await signInWithPhoneNumber(auth, this.phoneNumber, this.recaptchaVerifier);
            this.isLoading = false; // Stop loading only on success
          } catch (error) {
            console.error("Firebase SMS send error:", error);
            this.errorMessage = 'Failed to send SMS. Please try again later.';
            this.isLoading = false; // Stop loading on error
          }
      }, 0);
    },
    async verifyCodeAndUpdatePhone() {
      this.isLoading = true;
      this.errorMessage = '';
      if (!this.otpCode || this.otpCode.length < 6) {
        this.errorMessage = "Please enter a valid 6-digit code.";
        this.isLoading = false;
        return;
      }
      try {
        await this.confirmationResult.confirm(this.otpCode);
        await this.updateUserProfile({ 
            phoneNumber: this.phoneNumber, 
            isMobileVerified: true 
        });
        this.$emit('phone-updated');
        this.closeModal();
      } catch (error) {
        console.error("Firebase OTP verification error:", error);
        this.errorMessage = 'The verification code is invalid. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 450px;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}
.modal-subtitle {
  margin: 0 0 1.5rem;
  color: #64748b;
}
.input-group {
  margin-bottom: 1rem;
}
.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
.phone-input-wrapper {
    position: relative;
    display: flex;
}
.phone-prefix {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
}
#new-phone-number {
    padding-left: 3.5rem;
}
.input-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
}
.action-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}
.error-message {
  color: #ef4444;
  background-color: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-top: 1rem;
}
#recaptcha-container-modal {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
</style>

