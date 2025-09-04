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
                  Approved to drive
                </div>
              </li>
              <li class="verification-item">
                <div class="item-label">
                  <span v-if="isMobileVerified" class="check-icon">✓</span>
                  <span v-else class="cross-icon">×</span>
                  Mobile Number
                </div>
                <span class="item-value">{{ profileData.phoneNumber }}</span>
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
      :is-open="isEditModalOpen"
      :profile-data="profileData"
      @close="isEditModalOpen = false"
      @profile-updated="handleProfileUpdate"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import EditProfileModal from '@/components/modal/EditProfileModal.vue';

export default {
  name: 'ProfileSettingsView',
  components: {
    EditProfileModal,
  },
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
      initialsDataUrl: null,
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
    initials: {
      immediate: true,
      handler(newInitials) {
        if (newInitials) {
          this.generateInitialsImage(newInitials);
        } else {
          this.initialsDataUrl = null;
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
    ...mapActions(['fetchUserProfile']),
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
    handleProfileUpdate() {
      this.fetchUserProfile();
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
  position: relative;
  h4 {
    margin: 0;
    font-size: 1.75rem;
    color: $text-color-dark;
  }
  .edit-button {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
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

.about-text {
  white-space: pre-wrap;
  color: $text-color-medium;
  line-height: 1.6;
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
  color: $text-color-dark;
}

.item-value {
  font-size: 1rem;
  color: $text-color-medium;
  font-weight: 500;
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
</style>