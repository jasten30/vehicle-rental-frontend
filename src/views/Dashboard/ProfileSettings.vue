<template>
  <div class="profile-container">
    <div class="profile-content">
      <div class="profile-left-section">
        <div v-if="!profileData" class="loading-state">
          <p>Loading profile...</p>
        </div>

        <div v-else>
          <div class="profile-photo-container">
            <img
              v-if="profileData.profilePhotoUrl"
              :src="profileData.profilePhotoUrl"
              alt="Profile Photo"
              class="profile-photo"
            />
            <img
              v-else
              :src="initialsImage"
              alt="Profile Initials"
              class="profile-photo initials-photo"
            />
          </div>

          <div class="profile-info-header">
            <h4>{{ profileData.firstName }} {{ profileData.lastName }}</h4>
          </div>

          <div class="profile-info-block">
            <div class="info-block-header">
              <h4>Address</h4>
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
            <p>{{ formattedAddress }}</p>
          </div>

          <div class="profile-info-block">
            <h4>Joined</h4>
            <p>{{ formattedJoinDate }}</p>
          </div>

          <div class="profile-info-block">
            <h4>Verified info</h4>
            <ul class="verification-list">
              <li>
                <span v-if="isApprovedToDrive" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Approved to drive
              </li>
              <li>
                <span v-if="isMobileVerified" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Mobile Number
              </li>
              <li>
                <span v-if="isEmailVerified" class="check-icon">✓</span>
                <span v-else class="cross-icon">×</span>
                Email Address
              </li>
            </ul>
          </div>
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

    <transition name="modal-fade">
      <div v-if="isEditModalOpen" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Edit Your Profile</h2>
            <button @click="closeEditModal" class="close-modal-button">
              &times;
            </button>
          </div>
          <div class="modal-body">
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
          <div class="modal-footer">
            <p v-if="successMessage" class="success-message">
              {{ successMessage }}
            </p>
            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>
            <button
              @click="saveProfile"
              class="save-button"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'ProfileSettingsView',
  props: {
    userId: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      profileUser: null,
      isEditModalOpen: false,
      editableProfile: {
        firstName: '',
        lastName: '',
        address: {
          barangay: '',
          city: '',
        },
      },
      isSaving: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  computed: {
    ...mapGetters(['user']),
    isOwnProfile() {
      if (!this.user) return false;
      return !this.userId || this.userId === this.user.uid;
    },
    profileData() {
      return this.userId ? this.profileUser : this.user;
    },
    isApprovedToDrive() {
      return this.profileData?.isApprovedToDrive === true;
    },
    isMobileVerified() {
      return !!this.profileData?.phoneNumber;
    },
    isEmailVerified() {
      return this.profileData?.emailVerified === true;
    },
    initialsImage() {
      if (!this.profileData) return '';
      const name = this.profileData.firstName || this.profileData.name || 'User';
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

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

      return canvas.toDataURL();
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
      if (!this.profileData || !this.profileData.address) {
        return 'Address not set';
      }
      const address = this.profileData.address;
      if (typeof address === 'object' && address.barangay && address.city) {
        return `${address.barangay}, ${address.city}`;
      }
      if (typeof address === 'string' && address.trim() !== '') {
        return address;
      }
      return 'Address not set';
    },
  },
  watch: {
    profileData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.populateEditForm(newVal);
        }
      },
    },
    userId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchOtherUserProfile(newId);
        } else {
          this.profileUser = null;
        }
      },
    },
  },
  methods: {
    ...mapActions(['updateUserProfile']),
    populateEditForm(data) {
      this.editableProfile.firstName = data.firstName || '';
      this.editableProfile.lastName = data.lastName || '';
      if (typeof data.address === 'object' && data.address !== null) {
        this.editableProfile.address.barangay = data.address.barangay || '';
        this.editableProfile.address.city = data.address.city || '';
      } else {
        this.editableProfile.address.barangay = '';
        this.editableProfile.address.city = '';
      }
    },
    openEditModal() {
      this.populateEditForm(this.profileData);
      this.successMessage = '';
      this.errorMessage = '';
      this.isEditModalOpen = true;
    },
    closeEditModal() {
      this.isEditModalOpen = false;
    },
    async fetchOtherUserProfile(id) {
      if (!id) return;
      const userRef = doc(db, 'users', id);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          this.profileUser = docSnap.data();
        } else {
          this.profileUser = null;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.profileUser = null;
      }
    },
    async saveProfile() {
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const profileUpdate = {
          firstName: this.editableProfile.firstName,
          lastName: this.editableProfile.lastName,
          address: {
            barangay: this.editableProfile.address.barangay,
            city: this.editableProfile.address.city,
          },
        };
        await this.updateUserProfile(profileUpdate);
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.closeEditModal(), 1500);
      } catch (error) {
        this.errorMessage = 'Failed to update profile. Please try again.';
        console.error('Error updating profile:', error);
      } finally {
        this.isSaving = false;
      }
    },
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
  flex-basis: 50%;
}

.profile-photo-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 2rem auto;
  border: 4px solid $primary-color;
  box-shadow: $shadow-light;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info-header {
  width: 100%;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid $border-color;
  text-align: center;
  h4 {
    margin: 0;
    font-size: 1.75rem;
    color: $text-color-dark;
  }
}

.profile-info-block {
  width: 100%;
  padding: 1rem 0;
  border-bottom: 1px solid $border-color;
  &:last-child {
    border-bottom: none;
  }
}

.info-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  h4 {
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $text-color-medium;
    margin: 0;
  }
}

.profile-info-block p {
  font-size: 1.1rem;
  color: $text-color-dark;
  margin: 0;
}

.edit-button {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  padding: 0.5rem;
  cursor: pointer;
  color: $text-color-medium;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: #f3f4f6;
    color: $primary-color;
  }
}

/* Verification List Styles */
.verification-list {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    color: $text-color-dark;
  }
}

.check-icon,
.cross-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.9rem;
}

.check-icon {
  background-color: lighten($secondary-color, 35%);
  color: darken($secondary-color, 15%);
}

.cross-icon {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* Modal Styles */
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

.form-group {
  margin-bottom: 1.25rem;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    font-size: 1rem;
  }
}

.save-button {
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