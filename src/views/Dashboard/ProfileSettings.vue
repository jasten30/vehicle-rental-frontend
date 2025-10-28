<template>
  <div class="profile-container">
    <VerificationReminder
      v-if="profileData && isOwnProfile"
      :is-email-verified="isEmailVerified"
      :is-mobile-verified="isMobileVerified"
      :is-approved-to-drive="isApprovedToDrive"
      @verify-now="startEmailVerification"
      @approve-to-drive="goToApplicationPage"
    />

    <div v-if="!profileData" class="loading-state">
      <p>Loading profile...</p>
    </div>

    <div v-else class="profile-content">
      <div class="profile-left-section">
        <div class="profile-photo-container">
          <img
            v-if="profileData.profilePhotoUrl"
            :src="profileData.profilePhotoUrl"
            alt="Profile Photo"
            class="profile-photo"
          />
          <img
            v-else
            :src="initialsDataUrl"
            alt="Profile Initials"
            class="profile-photo initials-photo"
          />
        </div>

        <div class="profile-info-header">
          <h4>{{ profileData.firstName }} {{ profileData.lastName }}</h4>
          <button
            v-if="isOwnProfile"
            @click="openEditModal"
            class="edit-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
              />
              <path
                fill-rule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div class="profile-info-block">
          <h4>Address</h4>
          <p>{{ formattedAddress }}</p>
        </div>

        <div class="profile-info-block">
          <h4>Joined</h4>
          <p>{{ formattedJoinDate }}</p>
        </div>

        <div class="profile-info-block">
          <h4>Verified info</h4>
          <ul class="verification-list">
            <li class="verification-item">
              <div class="item-label">
                <span v-if="isApprovedToDrive" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Approved to Drive
              </div>
            </li>
            <li class="verification-item">
              <div class="item-label">
                <span v-if="isMobileVerified" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Mobile Number
              </div>
              <div class="value-and-action">
                <span class="item-value">{{
                  profileData.phoneNumber || 'Not set'
                }}</span>
                 <button
                  v-if="isOwnProfile && !isMobileVerified"
                  @click="startPhoneVerificationViaEmail"
                  class="change-button verify-button"
                >
                  Verify
                </button>
                 <button
                  v-if="isOwnProfile && isMobileVerified"
                  @click="openChangePhoneModal"
                  class="change-button"
                >
                  Change
                </button>
              </div>
            </li>
            <li v-if="isVerifyingPhone" class="email-verification-ui">
                <p class="verification-instructions">To verify your phone, enter the 6-digit code we sent to your email address: {{profileData.email}}.</p>
                <div class="form-group">
                    <input type="text" v-model="verificationCode" placeholder="123456" maxlength="6" />
                    <button @click="submitPhoneVerificationCode" :disabled="verificationLoading" class="submit-otp-button">
                        <span v-if="verificationLoading">Verifying...</span>
                        <span v-else>Submit</span>
                    </button>
                </div>
                 <p v-if="verificationMessage" :class="verificationStatusIsError ? 'error-message small' : 'success-message small'">{{ verificationMessage }}</p>
            </li>
            <li class="verification-item">
              <div class="item-label">
                <span v-if="isEmailVerified" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Email Address
              </div>
               <div class="value-and-action">
                <span class="item-value">{{ profileData.email }}</span>
                 <button
                  v-if="isOwnProfile && !isEmailVerified"
                  @click="startEmailVerification"
                  class="change-button verify-button"
                >
                  Verify
                </button>
              </div>
            </li>
            <li v-if="isVerifyingEmail" class="email-verification-ui">
                <p v-if="!emailCodeSent" class="verification-instructions">Click the button to send a verification code to your email.</p>
                <p v-else class="verification-instructions">Enter the 6-digit code sent to {{profileData.email}}.</p>

                <div v-if="emailCodeSent" class="form-group">
                    <input type="text" v-model="emailOtpCode" placeholder="123456" maxlength="6" />
                    <button @click="submitEmailCode" :disabled="verificationLoading" class="submit-otp-button">
                        <span v-if="verificationLoading">Verifying...</span>
                        <span v-else>Submit</span>
                    </button>
                </div>
                 <p v-if="emailVerificationMessage" :class="emailVerificationStatusIsError ? 'error-message small' : 'success-message small'">{{ emailVerificationMessage }}</p>
            </li>

            <!-- ================================== -->
            <!-- NEW QR Code Section -->
            <!-- ================================== -->
             <li class="verification-item">
              <div class="item-label">
                <span v-if="payoutQRCodeUrl" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Payment QR Code
              </div>
               <div class="value-and-action">
                 <img v-if="payoutQRCodeUrl" :src="payoutQRCodeUrl" alt="QR Code" class="qr-code-thumb" />
                 <span v-else class="item-value">Not set</span>
                 <button
                  v-if="isOwnProfile"
                  @click="startQRCodeUpdateVerification"
                  class="change-button"
                >
                  {{ payoutQRCodeUrl ? 'Update' : 'Add' }}
                </button>
              </div>
            </li>
            
            <!-- QR Code Verification UI -->
            <li v-if="isVerifyingQRCode" class="email-verification-ui">
              
              <!-- Step 1: Send & Verify Code -->
              <template v-if="!isQRCodeUpdateUnlocked">
                <p class="verification-instructions">For your security, we need to verify your identity. A verification code will be sent to your email.</p>
                <button @click="sendVerificationCode('qr')" :disabled="verificationLoading" class="button primary full-width">
                  <span v-if="verificationLoading">Sending...</span>
                  <span v-else>Send Code to {{ profileData.email }}</span>
                </button>

                <div v-if="qrCodeVerificationMessage && !qrCodeVerificationError" class="form-group" style="margin-top: 1rem;">
                    <input type="text" v-model="qrCodeVerificationCode" placeholder="123456" maxlength="6" />
                    <button @click="submitQRCodeVerificationCode" :disabled="verificationLoading" class="submit-otp-button">
                        <span v-if="verificationLoading">Verifying...</span>
                        <span v-else>Submit</span>
                    </button>
                </div>
              </template>

              <!-- Step 2: Upload Image -->
              <template v-else>
                <p class="verification-instructions">Verification successful! You can now upload your new QR code image.</p>
                <input type="file" ref="qrCodeInput" @change="handleQRCodeUpload" accept="image/png, image/jpeg" class="hidden-file-input" />
                <button @click="triggerQRCodeUpload" :disabled="qrCodeUploadLoading" class="button primary full-width">
                  <span v-if="qrCodeUploadLoading">Uploading...</span>
                  <span v-else>
                    <i class="bi bi-upload"></i> Upload New QR Code
                  </span>
                </button>
              </template>

              <!-- Messages -->
              <p v-if="qrCodeVerificationMessage" :class="qrCodeVerificationError ? 'error-message small' : 'success-message small'">
                {{ qrCodeVerificationMessage }}
              </p>
            </li>
            <!-- ================================== -->
            <!-- END QR Code Section -->
            <!-- ================================== -->
          </ul>
        </div>

        <div class="profile-info-block">
          <h4>About</h4>
          <p class="about-text">
            {{ profileData.about || 'No information provided.' }}
          </p>
        </div>
      </div>

      <div class="profile-right-section">
          <h4>{{ isOwnProfile ? 'My' : `${profileData.firstName}'s` }} Vehicles</h4>
          <p>Your listed vehicles will appear here.</p>
      </div>
    </div>

    <!-- The modal no longer needs the start-step prop -->
    <EditProfileModal
      v-if="profileData"
      :is-open="isEditModalOpen"
      :profile-data="profileData"
      @close="isEditModalOpen = false"
      @profile-updated="handleProfileUpdate"
    />

    <UpdatePhoneNumberModal
      :is-open="isChangePhoneModalOpen"
      @close="isChangePhoneModalOpen = false"
      @phone-updated="handleProfileUpdate"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import EditProfileModal from '@/components/modals/EditProfileModal.vue';
import VerificationReminder from '@/components/utils/VerificationReminder.vue';
import UpdatePhoneNumberModal from '@/components/modals/UpdatePhoneNumberModal.vue';

export default {
  name: 'ProfileSettingsView',
  components: {
    EditProfileModal,
    VerificationReminder,
    UpdatePhoneNumberModal,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      profileUser: null,
      isEditModalOpen: false,
      isChangePhoneModalOpen: false,
      initialsDataUrl: null,
      // Email Verification
      isVerifyingEmail: false,
      emailCodeSent: false,
      emailOtpCode: '',
      emailVerificationMessage: '',
      emailVerificationStatusIsError: false,
      // Phone Verification
      isVerifyingPhone: false,
      verificationCode: '',
      verificationMessage: '',
      verificationStatusIsError: false,
      verificationLoading: false, // Shared loading state for OTPs
      // QR Code Verification
      isVerifyingQRCode: false,
      isQRCodeUpdateUnlocked: false,
      qrCodeVerificationCode: '',
      qrCodeVerificationMessage: '',
      qrCodeVerificationError: false,
      qrCodeUploadLoading: false,
    };
  },
  computed: {
    ...mapGetters(['user']),
    isOwnProfile() {
      if (!this.user) return false;
      return !this.userId || this.userId === this.user.uid;
    },
    profileData() {
      return this.isOwnProfile ? this.user : this.profileUser;
    },
    isApprovedToDrive() {
      return this.profileData?.isApprovedToDrive === true;
    },
    isMobileVerified() {
      return this.profileData?.isMobileVerified === true;
    },
    isEmailVerified() {
      return this.profileData?.emailVerified === true;
    },
    // --- NEW: Payout QR Code URL ---
    payoutQRCodeUrl() {
      return this.profileData?.payoutQRCodeUrl || null;
    },
     initials() {
      if (!this.profileData) return '';
      const name = this.profileData.firstName || this.profileData.name || 'User';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    formattedJoinDate() {
      if (this.profileData && this.profileData.createdAt) {
        const createdAt = this.profileData.createdAt;
        let date;
        if (typeof createdAt.toDate === 'function') {
          date = createdAt.toDate();
        } else if (createdAt._seconds) {
          date = new Date(createdAt._seconds * 1000);
        } else {
          date = new Date(createdAt);
        }
        if (!isNaN(date)) {
          const options = { year: 'numeric', month: 'long' };
          return `Joined in ${date.toLocaleDateString('en-US', options)}`;
        }
      }
      return 'N/A';
    },
    formattedAddress() {
      const address = this.profileData?.address;
      if (address?.barangay && address?.city) {
        return `${address.barangay}, ${address.city}`;
      }
      return 'Address not set';
    },
  },
  watch: {
     initials: {
      immediate: true,
      handler(newInitials) {
        if (newInitials) this.generateInitialsImage(newInitials);
      },
    },
    userId: {
      immediate: true,
      handler(newId) {
        if (newId && !this.isOwnProfile) {
          this.fetchOtherUserProfile(newId);
        }
      },
    },
  },
  methods: {
    ...mapActions(['fetchUserProfile', 'sendEmailVerificationCode', 'verifyEmailCode', 'updateUserProfile']),
     generateInitialsImage(initials) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 150;
      canvas.width = size;
      canvas.height = size;
      context.fillStyle = '#C0C0C0';
      context.fillRect(0, 0, size, size);
      context.fillStyle = '#FFFFFF';
      context.font = `bold ${size / 2}px Nunito`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(initials, size / 2, size / 2);
      this.initialsDataUrl = canvas.toDataURL();
    },
    openEditModal() {
      this.isEditModalOpen = true;
    },
    openChangePhoneModal() {
      this.isChangePhoneModalOpen = true;
    },
    handleProfileUpdate() {
      // This is the success callback
      this.isEditModalOpen = false;
      this.isChangePhoneModalOpen = false;
      this.isVerifyingQRCode = false;
      this.isQRCodeUpdateUnlocked = false;
      this.qrCodeUploadLoading = false;
      this.fetchUserProfile();
    },
    async fetchOtherUserProfile(id) {
      const userRef = doc(db, 'users', id);
      try {
        const docSnap = await getDoc(userRef);
        this.profileUser = docSnap.exists() ? docSnap.data() : null;
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    async startEmailVerification() {
        this.isVerifyingEmail = true;
        this.verificationLoading = true;
        this.emailVerificationMessage = 'Sending code...';
        this.emailVerificationStatusIsError = false;
        try {
            await this.sendEmailVerificationCode();
            this.emailCodeSent = true;
            this.emailVerificationMessage = 'A verification code has been sent to your email.';
        } catch (error) {
            this.emailVerificationMessage = 'Failed to send code. Please try again.';
            this.emailVerificationStatusIsError = true;
        } finally {
            this.verificationLoading = false;
        }
    },
    async submitEmailCode() {
        if (!this.emailOtpCode || this.emailOtpCode.length < 6) {
            this.emailVerificationMessage = "Please enter the 6-digit code.";
            this.emailVerificationStatusIsError = true;
            return;
        }
        this.verificationLoading = true;
        try {
            await this.verifyEmailCode(this.emailOtpCode);
            this.emailVerificationMessage = 'Success! Your email has been verified.';
            await this.fetchUserProfile();
            setTimeout(() => { this.isVerifyingEmail = false; }, 2000);
        } catch (error) {
            this.emailVerificationMessage = error.response?.data?.message || 'Verification failed.';
            this.emailVerificationStatusIsError = true;
        } finally {
            this.verificationLoading = false;
        }
    },
    async startPhoneVerificationViaEmail() {
        if (!this.profileData.phoneNumber) {
            alert('Please add a phone number in your profile before verifying.');
            this.openEditModal();
            return;
        }
        this.isVerifyingPhone = true;
        this.verificationLoading = true;
        this.verificationMessage = 'Sending verification code to your email...';
        this.verificationStatusIsError = false;
        try {
            await this.sendEmailVerificationCode();
            this.verificationMessage = 'Code sent! Please check your email.';
        } catch (error) {
            this.verificationMessage = 'Failed to send code. Please try again.';
            this.verificationStatusIsError = true;
        } finally {
            this.verificationLoading = false;
        }
    },
    async submitPhoneVerificationCode() {
        if (!this.verificationCode || this.verificationCode.length < 6) {
            this.verificationMessage = "Please enter the 6-digit code from your email.";
            this.verificationStatusIsError = true;
            return;
        }
        this.verificationLoading = true;
        try {
            await this.verifyEmailCode(this.verificationCode);
            await this.updateUserProfile({ isMobileVerified: true });
            this.verificationMessage = 'Success! Your phone number is now verified.';
            this.verificationStatusIsError = false;
            await this.fetchUserProfile();
            setTimeout(() => {
                this.isVerifyingPhone = false;
                this.verificationCode = '';
            }, 2000);
        } catch (error) {
            this.verificationMessage = error.response?.data?.message || 'Verification failed. The code may be incorrect.';
            this.verificationStatusIsError = true;
        } finally {
            this.verificationLoading = false;
        }
    },
    goToApplicationPage() {
        this.$router.push({ name: 'BecomeDriveVerified' });
    },

    // --- NEW METHODS FOR QR CODE ---
    startQRCodeUpdateVerification() {
      // First, check if email is verified. If not, they can't get the code.
      if (!this.isEmailVerified) {
        alert("Please verify your email address before updating payment information.");
        this.startEmailVerification();
        return;
      }
      // Reset states
      this.isVerifyingQRCode = true;
      this.isQRCodeUpdateUnlocked = false;
      this.qrCodeVerificationCode = '';
      this.qrCodeVerificationMessage = '';
      this.qrCodeVerificationError = false;
    },

    async sendVerificationCode(type) {
      // This method is now generic
      this.verificationLoading = true;
      // FIX: Prefix unused variable with _
      let _msgSubject = type === 'qr' ? 'qrCode' : 'phone';
      let msgStateVar = type === 'qr' ? 'qrCodeVerificationMessage' : 'verificationMessage';
      let errStateVar = type === 'qr' ? 'qrCodeVerificationError' : 'verificationStatusIsError';

      this[msgStateVar] = 'Sending code...';
      this[errStateVar] = false;
      try {
        await this.sendEmailVerificationCode();
        this[msgStateVar] = 'Code sent! Please check your email.';
      } catch (error) {
        this[msgStateVar] = 'Failed to send code. Please try again.';
        this[errStateVar] = true;
      } finally {
        this.verificationLoading = false;
      }
    },

    async submitQRCodeVerificationCode() {
      if (!this.qrCodeVerificationCode || this.qrCodeVerificationCode.length < 6) {
        this.qrCodeVerificationMessage = "Please enter the 6-digit code.";
        this.qrCodeVerificationError = true;
        return;
      }
      this.verificationLoading = true;
      this.qrCodeVerificationError = false;
      try {
        await this.verifyEmailCode(this.qrCodeVerificationCode);
        this.qrCodeVerificationMessage = 'Success! You can now upload your QR code.';
        this.isQRCodeUpdateUnlocked = true; // <-- Unlock the upload!
      } catch (error) {
        this.qrCodeVerificationMessage = error.response?.data?.message || 'Verification failed. The code may be incorrect.';
        this.qrCodeVerificationError = true;
      } finally {
        this.verificationLoading = false;
      }
    },
    
    triggerQRCodeUpload() {
      this.$refs.qrCodeInput.click();
    },

    handleQRCodeUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.qrCodeUploadLoading = true;
      this.qrCodeVerificationMessage = "Reading file...";
      this.qrCodeVerificationError = false;

      // Validate file
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.qrCodeVerificationMessage = "File is too large (Max 2MB).";
        this.qrCodeVerificationError = true;
        this.qrCodeUploadLoading = false;
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        this.qrCodeVerificationMessage = "Invalid file type. Please use PNG or JPG.";
        this.qrCodeVerificationError = true;
        this.qrCodeUploadLoading = false;
        return;
      }

      // Read file as Base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result;
        this.qrCodeVerificationMessage = "Uploading QR Code...";
        try {
          // Send the Base64 string to be updated
          await this.updateUserProfile({ payoutQRCode: base64String });
          // The handleProfileUpdate method (called on success from store)
          // will reset the state and fetch the new profile info.
          // We don't need to do it here.
          this.qrCodeVerificationMessage = "QR Code updated successfully!";
          // handleProfileUpdate will be triggered by the action,
          // which will reset all states.
        } catch (error) {
          this.qrCodeVerificationMessage = "Upload failed. Please try again.";
          this.qrCodeVerificationError = true;
          this.qrCodeUploadLoading = false;
        }
      };
      reader.onerror = () => {
        this.qrCodeVerificationMessage = "Failed to read file.";
        this.qrCodeVerificationError = true;
        this.qrCodeUploadLoading = false;
      };
      reader.readAsDataURL(file);
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
/* All your existing styles remain the same */
.profile-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.profile-content {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
  @media (max-width: 992px) {
    flex-direction: column;
  }
}
.profile-left-section,
.profile-right-section {
  flex: 1;
}
.profile-photo-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 2rem auto;
  border: 4px solid white;
  box-shadow: $shadow-medium;
}
.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-info-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid $border-color;
  h4 {
    margin: 0;
    font-size: 1.75rem;
  }
}
.profile-info-block {
  padding: 1rem 0;
  border-bottom: 1px solid $border-color;
  &:last-child {
    border-bottom: none;
  }
  p {
    font-size: 1.1rem;
    color: $text-color-dark;
    margin: 0;
  }
}
.about-text {
  white-space: pre-wrap;
  color: $text-color-medium;
  line-height: 1.6;
}
.edit-button {
  background: none;
  border: none;
  border-radius: 50%;
  padding: 0.5rem;
  cursor: pointer;
  color: $text-color-medium;
  svg {
    width: 20px;
    height: 20px;
  }
  &:hover {
    background-color: #f3f4f6;
    color: $primary-color;
  }
}
.verification-list {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.verification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
}
.item-value {
  font-size: 1rem;
  color: $text-color-medium;
}
.check-icon,
.cross-icon {
  font-weight: bold;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check-icon {
  background-color: lighten($secondary-color, 35%);
  color: darken($secondary-color, 15%);
}
.cross-icon {
  background-color: #fee2e2;
  color: #b91c1c;
}
.value-and-action {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.change-button {
  background: none;
  border: none;
  color: $primary-color;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  &.verify-button {
    color: $secondary-color;
  }
  &:hover {
    text-decoration: underline;
  }
}
.email-verification-ui {
    background-color: #f9fafb;
    border-radius: $border-radius-md;
    padding: 1rem;
    margin-top: 1rem;
    border: 1px solid $border-color;
    display: flex;
    flex-direction: column;
}
.verification-instructions {
    font-size: 0.9rem;
    color: $text-color-medium;
    margin: 0 0 1rem 0;
    text-align: center;
}
.form-group {
    display: flex;
    gap: 0.5rem;
    input {
        flex-grow: 1;
        padding: 0.5rem;
        border: 1px solid $border-color;
        border-radius: $border-radius-md;
        text-align: center;
        font-size: 1.1rem;
        letter-spacing: 0.5em;
    }
}
.submit-otp-button {
    padding: 0.5rem 1rem;
    background-color: $secondary-color;
    color: white;
    border: none;
    border-radius: $border-radius-md;
    cursor: pointer;
    &:disabled {
        opacity: 0.7;
    }
}
.error-message.small, .success-message.small {
    font-size: 0.8rem;
    margin-top: 0.75rem;
    text-align: center;
    font-weight: 500;
}
.success-message.small {
    color: $secondary-color;
}
.error-message.small {
    color: $admin-color;
}
.button.primary.full-width {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: $primary-color;
    color: white;
    border: none;
    border-radius: $border-radius-md;
    cursor: pointer;
    font-weight: 600;
     &:disabled {
        opacity: 0.7;
     }
     i {
       margin-right: 0.5rem;
     }
}
.hidden-file-input {
    display: none;
}
.qr-code-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: $border-radius-sm;
  border: 1px solid $border-color;
}
</style>

