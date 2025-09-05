<template>
  <div class="register-container">
    <h2 class="register-title">Create your RentCycle Account</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="name-grid">
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            v-model="firstName"
            required
            class="form-input"
            placeholder="Juan"
          />
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            v-model="lastName"
            required
            class="form-input"
            placeholder="dela Cruz"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          class="form-input"
          placeholder="Enter your email"
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          class="form-input"
          placeholder="Enter your password"
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          class="form-input"
          placeholder="Confirm your password"
        />
      </div>

      <button type="submit" :disabled="loading" class="register-button">
        {{ loading ? 'Registering...' : 'Create Account' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
    <p class="login-link">
      Already have an account? <router-link to="/login">Login here</router-link>
    </p>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'RegisterView',
  data() {
    return {
      firstName: '', // Added
      lastName: '',  // Added
      email: '',
      password: '',
      confirmPassword: '',
      // 'role' is no longer needed here
      loading: false,
      error: null,
    };
  },
  methods: {
    ...mapActions(['register']),

    async handleRegister() {
      this.loading = true;
      this.error = null;

      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match.';
        this.loading = false;
        return;
      }

      try {
        await this.register({
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          // The 'role' is no longer sent from the frontend
        });
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          'An unexpected error occurred. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.register-container {
  background-color: $card-background;
  padding: 2.5rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  width: 100%;
  max-width: 450px;
  margin: 2rem auto;
  text-align: center;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 1.5rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// NEW: Style for the name grid
.name-grid {
  display: flex;
  gap: 1rem;
}

.form-group {
  text-align: left;
  flex: 1; // Allows fields in a grid to take equal space
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
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}

.register-button {
  background-color: $primary-color;
  color: white;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    opacity 0.2s ease-in-out;
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

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.login-link {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: $text-color-medium;

  a {
    color: $primary-color;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>