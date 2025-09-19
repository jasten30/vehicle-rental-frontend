<template>
  <div class="profile-container">
    <VerificationReminder
      v-if="profileData && isOwnProfile"
      :is-email-verified="isEmailVerified"
      :is-mobile-verified="isMobileVerified"
      @verify-now="openEditModal"
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
                Verified
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
                  @click="startPhoneVerification"
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
            <li v-if="isVerifyingPhone" class="phone-verification-ui">
                <p class="verification-instructions">Enter the code sent to {{ profileData.phoneNumber }}.</p>
                <div class="form-group">
                    <input type="text" v-model="otpCode" placeholder="123456" maxlength="6" />
                    <button @click="submitVerificationCode" :disabled="verificationLoading" class="submit-otp-button">
                        <span v-if="verificationLoading">Verifying...</span>
                        <span v-else>Submit Code</span>
                    </button>
                </div>
                <!-- This container will now be reliably present when the verification UI is visible -->
                <div id="recaptcha-container-profile"></div>
                <p v-if="verificationError" class="error-message small">{{ verificationError }}</p>
            </li>
            <li class="verification-item">
              <div class="item-label">
                <span v-if="isEmailVerified" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Email Address
              </div>
              <span class="item-value">{{ profileData.email }}</span>
            </li>
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
        <h4>
          {{ isOwnProfile ? 'My' : `${profileData.firstName}'s` }} Vehicles
        </h4>
        <p>
          {{
            isOwnProfile
              ? 'Your listed vehicles will appear here.'
              : `Vehicles hosted by ${profileData.firstName} will appear here.`
          }}
        </p>
      </div>
    </div>

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
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
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
      isVerifyingPhone: false,
      verificationLoading: false,
      otpCode: '',
      confirmationResult: null,
      recaptchaVerifier: null,
      verificationError: '',
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
    initials() {
      if (!this.profileData) return '';
      const name = this.profileData.firstName || this.profileData.name || 'User';
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    },
    formattedJoinDate() {
      if (this.profileData?.createdAt?.toDate) {
        const date = this.profileData.createdAt.toDate();
        return `Joined in ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
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
        } else {
          this.profileUser = null;
        }
      },
    },
  },
  methods: {
    ...mapActions(['fetchUserProfile', 'updateUserProfile']),
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
      this.isEditModalOpen = false;
      this.isChangePhoneModalOpen = false;
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
    async startPhoneVerification() {
        if (!this.profileData.phoneNumber) {
            alert("Please set a phone number first in your profile settings.");
            this.openEditModal();
            return;
        }
        this.isVerifyingPhone = true;
        this.verificationError = '';
        this.verificationLoading = true;

        setTimeout(async () => {
            try {
                const auth = getAuth();
                this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-profile', {
                    'size': 'invisible',
                });
                
                await this.recaptchaVerifier.render();

                this.confirmationResult = await signInWithPhoneNumber(auth, this.profileData.phoneNumber, this.recaptchaVerifier);
                this.verificationLoading = false;
            } catch (error) {
                this.verificationError = "Failed to send SMS. Please try again later.";
                console.error("Firebase SMS send error:", error);
                this.isVerifyingPhone = false;
                this.verificationLoading = false;
            }
        }, 0);
    },
    async submitVerificationCode() {
        if (!this.otpCode || this.otpCode.length < 6) {
            this.verificationError = "Please enter a valid 6-digit code.";
            return;
        }
        this.verificationLoading = true;
        this.verificationError = '';

        try {
            await this.confirmationResult.confirm(this.otpCode);
            await this.updateUserProfile({ isMobileVerified: true });
            await this.fetchUserProfile();
            this.isVerifyingPhone = false;
            this.otpCode = '';
        } catch (error) {
            this.verificationError = "Invalid code. Please try again.";
            console.error("Firebase OTP verification error:", error);
        } finally {
            this.verificationLoading = false;
        }
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

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
.phone-verification-ui {
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
}
.form-group {
    display: flex;
    gap: 0.5rem;
    input {
        flex-grow: 1;
        padding: 0.5rem;
        border: 1px solid $border-color;
        border-radius: $border-radius-md;
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
.error-message.small {
    font-size: 0.8rem;
    color: $admin-color;
    margin-top: 0.5rem;
    text-align: center;
}
.phone-verification-ui #recaptcha-container-profile {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
</style>

