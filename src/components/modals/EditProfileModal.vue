<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Your Profile</h2>
          <button @click="$emit('close')" class="close-modal-button">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div v-if="currentStep === 1">
            <p class="step-info-text">Update your name.</p>
            <div class="name-grid">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  id="firstName"
                  v-model="editableProfile.firstName"
                  type="text"
                  placeholder="Enter your first name"
                />
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  id="lastName"
                  v-model="editableProfile.lastName"
                  type="text"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          <div v-if="currentStep === 2">
            <p class="step-info-text">Update your address.</p>
            <div class="form-group">
              <label for="address-brgy">Barangay</label>
              <input
                id="address-brgy"
                v-model="editableProfile.address.barangay"
                type="text"
                placeholder="e.g., Apas"
              />
            </div>
            <div class="form-group">
              <label for="address-city">City</label>
              <input
                id="address-city"
                v-model="editableProfile.address.city"
                type="text"
                placeholder="e.g., Cebu City"
              />
            </div>
          </div>

          <div v-if="currentStep === 3">
            <p class="step-info-text">
              Tell potential renters a little about yourself.
            </p>
            <div class="form-group">
              <label for="about">About</label>
              <textarea
                id="about"
                v-model="editableProfile.about"
                rows="5"
                placeholder="e.g., I'm a car enthusiast..."
              ></textarea>
            </div>
          </div>

          <div v-if="currentStep === 4">
            <div v-if="profileData.isMobileVerified" class="already-verified-box">
              <i class="status-icon success bi bi-check-circle-fill"></i>
              <h4>Phone Number Verified</h4>
              <p>Your phone number is already verified and secure.</p>
            </div>
            <div v-else>
              <p class="step-info-text">
                Verify your phone number for added security.
              </p>
              <div class="form-group">
                <label for="phoneNumber">Phone Number (e.g., +639...)</label>
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
                <div class="otp-input-wrapper">
                  <input
                    id="otp-code"
                    v-model="otpCode"
                    type="text"
                    placeholder="123456"
                    maxlength="6"
                    :class="{
                      success: otpStatus === 'success',
                      error: otpStatus === 'error',
                    }"
                  />
                  <i v-if="otpStatus === 'verifying'" class="spinner bi bi-arrow-repeat"></i>
                  <i v-if="otpStatus === 'success'" class="status-icon success bi bi-check-circle-fill"></i>
                  <i v-if="otpStatus === 'error'" class="status-icon error bi bi-x-circle-fill"></i>
                </div>
              </div>
              <button
                v-if="!otpSent"
                @click="sendSmsOtp"
                class="action-button"
                :disabled="isVerifying"
              >
                {{ isVerifying ? 'Sending...' : 'Send Verification Code' }}
              </button>
            </div>
          </div>

          <div v-if="currentStep === 5">
            <div v-if="profileData.emailVerified" class="already-verified-box">
              <i class="status-icon success bi bi-check-circle-fill"></i>
              <h4>Email Address Verified</h4>
              <p>Your email address is already verified.</p>
            </div>
            <div v-else-if="!editableProfile.email">
              <p class="step-info-text">Add an email address to your account.</p>
              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  v-model="editableProfile.email"
                  type="email"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            <div v-else>
              <p class="step-info-text">Verify your email address.</p>
              <div class="verification-display">
                <strong>{{ editableProfile.email }}</strong>
              </div>
              <div v-if="emailOtpSent" class="form-group">
                <label for="email-otp-code">Verification Code</label>
                <input
                  id="email-otp-code"
                  v-model="emailOtpCode"
                  type="text"
                  placeholder="123456"
                  maxlength="6"
                />
              </div>
              <button
                v-if="!emailOtpSent"
                @click="sendEmailOtp"
                class="action-button"
                :disabled="isSaving"
              >
                {{ isSaving ? 'Sending...' : 'Send Verification Code' }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <div class="navigation-controls">
            <button v-if="currentStep > 1" @click="prevStep" class="nav-button secondary">Back</button>
            <button
              @click="nextStep"
              class="nav-button primary"
              :disabled="isNextButtonDisabled"
            >
              {{ isSaving ? 'Saving...' : nextButtonText }}
            </button>
          </div>
        </div>
      </div>
      <div id="recaptcha-container-wrapper">
        <div id="recaptcha-container" ref="recaptchaContainer"></div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex';
import { getAuth, RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';

export default {
  name: 'EditProfileModal',
  props: {
    isOpen: { type: Boolean, required: true },
    profileData: { type: Object, required: true },
  },
  emits: ['close', 'profile-updated'],
  data() {
    return {
      currentStep: 1,
      otpSent: false,
      otpCode: '',
      emailOtpSent: false,
      emailOtpCode: '',
      editableProfile: {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        address: { barangay: '', city: '' },
        about: '',
      },
      isSaving: false,
      isVerifying: false,
      successMessage: '',
      errorMessage: '',
      recaptchaVerifier: null,
      confirmationResult: null,
      otpStatus: 'idle',
      isMobileNowVerified: false,
      isEmailNowVerified: false,
    };
  },
  computed: {
    nextButtonText() {
      if (this.currentStep === 5) return 'Save Changes';
      return 'Next';
    },
    localPhoneNumber: {
      get() {
        return this.editableProfile.phoneNumber.replace(/^\+63/, '');
      },
      set(value) {
        this.editableProfile.phoneNumber = `+63${value}`;
      },
    },
    isNextButtonDisabled() {
      if (this.isVerifying || this.isSaving) return true;
      if (this.currentStep === 4) {
        return !this.profileData.isMobileVerified && this.otpStatus !== 'success';
      }
      return false;
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.populateEditForm(this.profileData);
        this.successMessage = '';
        this.errorMessage = '';
        this.currentStep = 1;
        this.otpSent = false;
        this.otpCode = '';
        this.emailOtpSent = false;
        this.emailOtpCode = '';
        this.otpStatus = 'idle';
        this.isMobileNowVerified = false;
        this.isEmailNowVerified = false;
        this.$nextTick(() => {
          this.initializeRecaptcha();
        });
      } else {
        if (this.recaptchaVerifier) {
          this.recaptchaVerifier.clear();
          this.recaptchaVerifier = null;
        }
      }
    },
    otpCode(newValue) {
      this.errorMessage = '';
      this.otpStatus = 'idle';
      if (newValue.length === 6) {
        this.verifySmsOtp();
      }
    },
  },
  methods: {
    ...mapActions(['updateUserProfile', 'sendEmailVerificationCode', 'verifyEmailCode']),
    initializeRecaptcha() {
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
      }
      const auth = getAuth();
      if (this.$refs.recaptchaContainer) {
        try {
          this.recaptchaVerifier = new RecaptchaVerifier(auth, this.$refs.recaptchaContainer, { size: 'invisible' });
        } catch (error) {
          console.warn('Could not initialize reCAPTCHA verifier', error);
        }
      }
    },
    populateEditForm(data) {
      this.editableProfile.firstName = data.firstName || '';
      this.editableProfile.lastName = data.lastName || '';
      this.editableProfile.phoneNumber = data.phoneNumber || '';
      this.editableProfile.email = data.email || '';
      this.editableProfile.about = data.about || '';
      if (typeof data.address === 'object' && data.address !== null) {
        this.editableProfile.address.barangay = data.address.barangay || '';
        this.editableProfile.address.city = data.address.city || '';
      } else {
        this.editableProfile.address.barangay = '';
        this.editableProfile.address.city = '';
      }
    },
    nextStep() {
      this.successMessage = '';
      this.errorMessage = '';
      if (this.currentStep < 5) {
        this.currentStep++;
      } else {
        this.saveProfile();
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async sendSmsOtp() {
      this.isVerifying = true;
      this.errorMessage = '';
      this.successMessage = '';
      if (!this.editableProfile.phoneNumber.startsWith('+')) {
        this.errorMessage = 'Please use the international format (e.g., +639...).';
        this.isVerifying = false;
        return;
      }
      try {
        const auth = getAuth();
        const appVerifier = this.recaptchaVerifier;
        await appVerifier.render();
        const phoneNumber = this.editableProfile.phoneNumber;
        this.confirmationResult = await linkWithPhoneNumber(auth.currentUser, phoneNumber, appVerifier);
        this.otpSent = true;
        this.successMessage = `Code sent to ${phoneNumber}`;
      } catch (error) {
        this.errorMessage = 'Failed to send SMS. Please try again.';
        console.error('SMS send error:', error);
      } finally {
        this.isVerifying = false;
      }
    },
    async verifySmsOtp() {
      this.isVerifying = true;
      this.otpStatus = 'verifying';
      this.errorMessage = '';
      try {
        await this.confirmationResult.confirm(this.otpCode);
        this.otpStatus = 'success';
        this.isMobileNowVerified = true;
        this.successMessage = 'Phone number verified!';
        setTimeout(() => this.nextStep(), 1000);
      } catch (error) {
        this.otpStatus = 'error';
        this.errorMessage = 'Invalid code. Please try again.';
        this.otpCode = '';
      } finally {
        this.isVerifying = false;
      }
    },
    async sendEmailOtp() {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await this.sendEmailVerificationCode();
        this.emailOtpSent = true;
        this.successMessage = 'Verification code sent to your email!';
      } catch (error) {
        this.errorMessage = 'Failed to send email code. Please try again.';
      } finally {
        this.isSaving = false;
      }
    },
    async saveProfile() {
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        if (this.emailOtpSent) {
          if (!this.emailOtpCode || this.emailOtpCode.length < 6) {
            throw new Error('Please enter the 6-digit code from your email.');
          }
          await this.verifyEmailCode(this.emailOtpCode);
          this.isEmailNowVerified = true;
        }
        const profileUpdate = {
          firstName: this.editableProfile.firstName,
          lastName: this.editableProfile.lastName,
          phoneNumber: this.editableProfile.phoneNumber,
          address: this.editableProfile.address,
          about: this.editableProfile.about,
          email: this.editableProfile.email,
        };
        if (this.isMobileNowVerified || this.profileData.isMobileVerified) {
          profileUpdate.isMobileVerified = true;
        }
        if (this.isEmailNowVerified || this.profileData.emailVerified) {
          profileUpdate.emailVerified = true;
        }
        await this.updateUserProfile(profileUpdate);
        this.successMessage = 'Profile updated successfully!';
        this.$emit('profile-updated');
        setTimeout(() => this.$emit('close'), 1500);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || 'Failed to update profile.';
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

#recaptcha-container-wrapper {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: -1;
    opacity: 0;
}
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
.modal-content {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid $border-color;
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
}
.close-modal-button {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: $text-color-medium;
  cursor: pointer;
  &:hover {
    color: $text-color-dark;
  }
}
.modal-body {
  padding: 1.5rem;
}
.modal-footer {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid $border-color;
}
.step-info-text {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 1.5rem;
  text-align: center;
}
.name-grid {
  display: flex;
  gap: 1rem;
}
.form-group {
  margin-bottom: 1.25rem;
  flex: 1;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    font-family: inherit;
  }
  textarea {
    resize: vertical;
    min-height: 120px;
  }
}
.phone-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.phone-prefix {
  position: absolute;
  left: 0.75rem;
  font-size: 1rem;
  color: $text-color-medium;
  pointer-events: none;
}
#phoneNumber {
  padding-left: 3.5rem;
}
.otp-input-wrapper {
  position: relative;
  input {
    padding-right: 3rem;
    &.success {
      border-color: $secondary-color;
      box-shadow: 0 0 0 3px lighten($secondary-color, 35%);
    }
    &.error {
      border-color: $admin-color;
      box-shadow: 0 0 0 3px lighten($admin-color, 40%);
    }
  }
}
.status-icon,
.spinner {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
}
.status-icon.success {
  color: $secondary-color;
}
.status-icon.error {
  color: $admin-color;
}
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
.already-verified-box {
  text-align: center;
  padding: 2rem;
  background-color: lighten($secondary-color, 38%);
  border: 1px solid lighten($secondary-color, 25%);
  border-radius: $border-radius-lg;
  .status-icon {
    font-size: 2.5rem;
    color: $secondary-color;
    margin-bottom: 1rem;
    position: static;
    transform: none;
  }
  h4 {
    font-size: 1.25rem;
    color: darken($secondary-color, 20%);
    margin: 0 0 0.5rem 0;
  }
  p {
    color: darken($secondary-color, 15%);
    margin: 0;
  }
}
.verification-display {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
#otp-code,
#email-otp-code {
  text-align: center;
  letter-spacing: 0.5em;
  font-size: 1.25rem;
}
.action-button {
  width: 100%;
  padding: 0.85rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.nav-button {
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  flex: 1;
  &.primary {
    background-color: $primary-color;
    color: white;
  }
  &.secondary {
    background-color: #e5e7eb;
    color: $text-color-dark;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
.success-message,
.error-message {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 500;
}
.success-message {
  color: $secondary-color;
}
.error-message {
  color: $admin-color;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>