<!-- frontend/src/views/Dashboard/ProfileSettings.vue -->
<template>
  <div class="profile-settings-container">
    <h2 class="section-title">Profile Settings</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading profile...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="loadProfile" class="button primary-button">Retry Load Profile</button>
    </div>

    <form v-else @submit.prevent="saveProfile" class="profile-form">
      <div class="form-group">
        <label for="email">Email (Cannot be changed)</label>
        <input type="email" id="email" v-model="profileForm.email" disabled class="form-input disabled">
      </div>

      <div class="form-group">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" v-model="profileForm.firstName" class="form-input">
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" v-model="profileForm.lastName" class="form-input">
      </div>

      <div class="form-group">
        <label for="phoneNumber">Phone Number</label>
        <input type="tel" id="phoneNumber" v-model="profileForm.phoneNumber" class="form-input">
      </div>

      <div class="form-group">
        <label for="address">Address</label>
        <textarea id="address" v-model="profileForm.address" class="form-input textarea"></textarea>
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div v-if="updateErrorMessage" class="error-message">
        {{ updateErrorMessage }}
      </div>

      <button type="submit" :disabled="saving" class="button primary-button save-button">
        <span v-if="saving">Saving...</span>
        <span v-else>Save Profile</span>
      </button>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProfileSettings',
  data() {
    return {
      loading: true,
      saving: false,
      errorMessage: null,
      updateErrorMessage: null,
      successMessage: null,
      profileForm: {
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
      },
    };
  },
  computed: {
    ...mapGetters(['user']), // Get user from Vuex store
  },
  created() {
    this.loadProfile();
  },
  methods: {
    ...mapActions(['fetchUserProfile', 'updateUserProfile']),

    async loadProfile() {
      this.loading = true;
      this.errorMessage = null;
      try {
        // Fetch fresh profile data from the backend
        const profile = await this.fetchUserProfile();
        if (profile) {
          this.profileForm = {
            email: profile.email || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phoneNumber: profile.phoneNumber || '',
            address: profile.address || '',
          };
          console.log('[ProfileSettings] Profile loaded:', profile);
        } else {
          this.errorMessage = 'Failed to load profile data.';
        }
      } catch (error) {
        console.error('[ProfileSettings] Error loading profile:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load profile. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async saveProfile() {
      this.saving = true;
      this.successMessage = null;
      this.updateErrorMessage = null;
      try {
        const updatedUser = await this.updateUserProfile(this.profileForm);
        this.successMessage = 'Profile updated successfully!';
        console.log('[ProfileSettings] Profile saved:', updatedUser);
      } catch (error) {
        console.error('[ProfileSettings] Error saving profile:', error);
        this.updateErrorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      } finally {
        this.saving = false;
      }
    },
  },
  watch: {
    // Watch for changes in the Vuex 'user' getter
    user: {
      immediate: true, // Run handler immediately on component creation
      handler(newUser) {
        if (newUser && !this.loading) { // Only update if not currently loading from API
          this.profileForm = {
            email: newUser.email || '',
            firstName: newUser.firstName || '',
            lastName: newUser.lastName || '',
            phoneNumber: newUser.phoneNumber || '',
            address: newUser.address || '',
          };
          console.log('[ProfileSettings] ProfileForm updated from Vuex user:', newUser);
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.profile-settings-container {
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: $text-color-medium;
}

.error-message {
  color: #ef4444;
  font-weight: 600;
  background-color: #fee2e2;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.success-message {
  color: #22c55e;
  font-weight: 600;
  background-color: #dcfce7;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: $text-color-dark;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }

  &.disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
    color: #6c757d;
  }
}

.form-input.textarea {
  min-height: 80px;
  resize: vertical;
}

.save-button {
  background-color: $primary-color;
  color: white;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }

  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
    opacity: 0.7;
  }
}
</style>
