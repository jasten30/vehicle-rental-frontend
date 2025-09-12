<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Change Phone Number</h2>
          <button @click="resetAndClose" class="close-modal-button">&times;</button>
        </div>

        <div class="modal-body">
          <div v-if="step === 1">
            <p class="step-info-text">For your security, please confirm your password to continue.</p>
            <form @submit.prevent="checkPassword">
              <div class="form-group">
                <label for="password">Password</label>
                <input id="password" v-model="password" type="password" required />
              </div>
              <button type="submit" :disabled="isLoading" class="action-button">
                <span v-if="isLoading">Verifying...</span>
                <span v-else>Continue</span>
              </button>
            </form>
          </div>

          <div v-if="step === 2">
            <p class="step-info-text">Enter your new phone number and verify it with the code we send you.</p>
            <div class="form-group">
              <label for="phoneNumber">New Phone Number</label>
              <div class="phone-input-wrapper">
                <span class="phone-prefix">+63</span>
                <input
                  id="phoneNumber"
                  v-model="localPhoneNumber"
                  type="text"
                  placeholder="9171234567"
                  :disabled="otpSent"
                />
              </div>
            </div>
            <div v-if="otpSent" class="form-group">
              <label for="otp-code">Verification Code</label>
              <input id="otp-code" v-model="otpCode" type="text" placeholder="123456" maxlength="6" />
            </div>
            <button v-if="!otpSent" @click="sendSmsOtp" :disabled="isLoading" class="action-button">
              {{ isLoading ? 'Sending...' : 'Send Code' }}
            </button>
            <button v-if="otpSent" @click="saveNewPhoneNumber" :disabled="isLoading" class="action-button">
              {{ isLoading ? 'Saving...' : 'Verify & Save' }}
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </div>
      </div>
      <div id="recaptcha-container-phone-update" ref="recaptchaContainer"></div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex';
import { getAuth, RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';

export default {
  name: 'UpdatePhoneNumberModal',
  props: { isOpen: Boolean },
  emits: ['close', 'phone-updated'],
  data() {
    return {
      step: 1,
      password: '',
      newPhoneNumber: '',
      otpSent: false,
      otpCode: '',
      isLoading: false,
      error: null,
      successMessage: null,
      confirmationResult: null,
    };
  },
  computed: {
    localPhoneNumber: {
      get() { return this.newPhoneNumber.replace(/^\+63/, ''); },
      set(value) { this.newPhoneNumber = `+63${value}`; },
    },
  },
  methods: {
    ...mapActions(['reauthenticate', 'updateUserProfile']),
    resetAndClose() {
        this.step = 1;
        this.password = '';
        this.newPhoneNumber = '';
        this.otpSent = false;
        this.otpCode = '';
        this.error = null;
        this.successMessage = null;
        this.$emit('close');
    },
    async checkPassword() {
      this.isLoading = true;
      this.error = null;
      try {
        await this.reauthenticate(this.password);
        this.step = 2;
      } catch (err) {
        this.error = err.response?.data?.message || 'Incorrect password.';
      } finally {
        this.isLoading = false;
      }
    },
    async initializeRecaptcha() {
      const auth = getAuth();
      if (this.$refs.recaptchaContainer) {
        this.$refs.recaptchaContainer.innerHTML = '';
      }
      try {
        const verifier = new RecaptchaVerifier(auth, this.$refs.recaptchaContainer, { size: 'invisible' });
        await verifier.render();
        return verifier;
      } catch (error) {
        return null;
      }
    },
    async sendSmsOtp() {
        this.isLoading = true;
        this.error = null;
        try {
            const auth = getAuth();
            if(!auth.currentUser) throw new Error("Not logged in.");
            const appVerifier = await this.initializeRecaptcha();
            if(!appVerifier) throw new Error("reCAPTCHA failed.");

            this.confirmationResult = await linkWithPhoneNumber(auth.currentUser, this.newPhoneNumber, appVerifier);
            this.otpSent = true;
            this.successMessage = "Verification code sent!";
        } catch (error) {
            this.error = "Failed to send SMS. The number may already be in use.";
        } finally {
            this.isLoading = false;
        }
    },
    async saveNewPhoneNumber() {
        this.isLoading = true;
        this.error = null;
        try {
            if (!this.otpCode || this.otpCode.length < 6) {
                throw new Error("Please enter the 6-digit code.");
            }
            await this.confirmationResult.confirm(this.otpCode);
            await this.updateUserProfile({
                phoneNumber: this.newPhoneNumber,
                isMobileVerified: true,
            });
            this.successMessage = "Phone number updated successfully!";
            this.$emit('phone-updated');
            setTimeout(() => this.resetAndClose(), 2000);
        } catch (error) {
            this.error = "Failed to verify code. Please try again.";
        } finally {
            this.isLoading = false;
        }
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
/* Using similar styles from EditProfileModal for consistency */
.modal-overlay { z-index: 1000; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; }
#recaptcha-container-phone-update { position: fixed; bottom: 0; right: 0; z-index: -1; opacity: 0; }
.modal-content { width: 100%; max-width: 450px; background: white; border-radius: $border-radius-lg; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid $border-color; h2 { margin: 0; font-size: 1.5rem; } }
.close-modal-button { background: none; border: none; font-size: 2rem; cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 0 1.5rem 1.5rem; text-align: center; }
.step-info-text { font-size: 1rem; color: $text-color-medium; margin-bottom: 1.5rem; text-align: center; }
.form-group { margin-bottom: 1.25rem; label { display: block; font-weight: 600; margin-bottom: 0.5rem; } input { width: 100%; padding: 0.75rem; border: 1px solid $border-color; border-radius: $border-radius-sm; font-size: 1rem; } }
.phone-input-wrapper { position: relative; display: flex; align-items: center; }
.phone-prefix { position: absolute; left: 0.75rem; font-size: 1rem; color: $text-color-medium; pointer-events: none; }
#phoneNumber { padding-left: 3.5rem; }
.action-button { width: 100%; padding: 0.85rem; background-color: $primary-color; color: white; border: none; border-radius: $border-radius-md; font-size: 1rem; font-weight: 600; cursor: pointer; &:disabled { opacity: 0.7; } }
.error-message { color: $admin-color; font-weight: 500; }
.success-message { color: $secondary-color; font-weight: 500; }
</style>