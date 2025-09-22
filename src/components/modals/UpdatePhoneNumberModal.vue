<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <h3 class="modal-title">Change Phone Number</h3>

      <!-- Step 1: Enter Password -->
      <div v-if="currentStep === 'password'" class="form-step">
        <p class="modal-subtitle">
          For your security, please enter your password to continue.
        </p>
        <div class="input-group">
          <label for="current-password">Password</label>
          <input
            id="current-password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            @keyup.enter="handlePasswordVerification"
          />
        </div>
        <button @click="handlePasswordVerification" :disabled="isLoading" class="action-button">
          <span v-if="isLoading">Verifying...</span>
          <span v-else>Continue</span>
        </button>
      </div>

      <!-- Step 2: Enter New Phone & Email Code -->
      <div v-if="currentStep === 'verify'" class="form-step">
        <p class="modal-subtitle">
          Please enter your new phone number and the 6-digit code we sent to your email.
        </p>
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
          <span v-if="isLoading">Verifying & Saving...</span>
          <span v-else>Verify & Save</span>
        </button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'UpdatePhoneNumberModal',
  props: {
    isOpen: Boolean,
  },
  emits: ['close', 'phone-updated'],
  data() {
    return {
      currentStep: 'password', // 'password' or 'verify'
      password: '',
      phoneNumber: '',
      otpCode: '',
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
    ...mapActions(['reauthenticate', 'sendEmailVerificationCode', 'verifyEmailCode', 'updateUserProfile']),
    closeModal() {
      this.resetState();
      this.$emit('close');
    },
    resetState() {
        this.currentStep = 'password';
        this.password = '';
        this.phoneNumber = '';
        this.otpCode = '';
        this.isLoading = false;
        this.errorMessage = '';
    },
    async handlePasswordVerification() {
      if (!this.password) {
          this.errorMessage = "Please enter your password.";
          return;
      }
      this.isLoading = true;
      this.errorMessage = '';
      try {
        // Step 1: Verify the user's current password.
        await this.reauthenticate(this.password);
        
        // Step 2: If password is correct, send the verification code to their email.
        await this.sendEmailVerificationCode();

        // Step 3: Advance to the next step in the modal.
        this.currentStep = 'verify';
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Password verification failed. Please try again.';
        console.error("Re-authentication error:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async verifyCodeAndUpdatePhone() {
      this.isLoading = true;
      this.errorMessage = '';
      if (this.phoneNumber.length !== 13) {
        this.errorMessage = 'Please enter a valid 10-digit phone number.';
        this.isLoading = false;
        return;
      }
       if (!this.otpCode || this.otpCode.length < 6) {
        this.errorMessage = "Please enter the 6-digit code from your email.";
        this.isLoading = false;
        return;
      }

      try {
        // Step 1: Verify the code sent to their email.
        await this.verifyEmailCode(this.otpCode);
        
        // Step 2: If the code is correct, update their profile with the new number.
        await this.updateUserProfile({
            phoneNumber: this.phoneNumber,
            isMobileVerified: true // Mark the new number as verified
        });
        this.$emit('phone-updated');
        this.closeModal();
      } catch (error) {
        console.error("Code verification or phone update error:", error);
        this.errorMessage = error.response?.data?.message || 'Verification failed. The code may be incorrect.';
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
  text-align: center;
}
.modal-subtitle {
  margin: 0 0 1.5rem;
  color: #64748b;
  text-align: center;
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
    box-sizing: border-box;
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
.action-button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}
.error-message {
  color: #ef4444;
  background-color: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-top: 1rem;
}
</style>

