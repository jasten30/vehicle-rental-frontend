<template>
  <div class="register-page-wrapper">
    <div class="image-column"></div>

    <div class="form-column">
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

          <div class="form-group full-width">
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

          <div class="form-group full-width">
            <label for="phoneNumber">Phone Number:</label>
            <div class="phone-input-wrapper">
              <span class="phone-prefix">+63</span>
              <input
                type="text"
                id="phoneNumber"
                v-model="localPhoneNumber"
                required
                class="form-input"
                placeholder="9171234567"
                maxlength="10"
              />
            </div>
          </div>

          <div class="form-group full-width">
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
          <div class="form-group full-width">
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
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'RegisterView',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: null,
    };
  },
  computed: {
    localPhoneNumber: {
      get() {
        return this.phoneNumber.replace(/^\+63/, '');
      },
      set(value) {
        this.phoneNumber = `+63${value}`;
      },
    },
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
          phoneNumber: this.phoneNumber,
          password: this.password,
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

.register-page-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  width: 100%;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.image-column {
  /* UPDATED: New, working image URL */
  background-image: url('https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070');
  background-size: cover;
  background-position: center;

  @media (max-width: 992px) {
    display: none;
  }
}

.form-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: $background-color;
}

.register-container {
  background-color: $card-background;
  padding: 2.5rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  width: 100%;
  max-width: 480px;
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
  flex-wrap: wrap;
  gap: 1rem;
}

.name-grid {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.form-group {
  text-align: left;
  flex: 1 1 100%;

  &.full-width {
    flex-basis: 100%;
  }
}

.name-grid .form-group {
  flex: 1 1 48%;
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

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
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

.register-button {
  background-color: $primary-color;
  color: white;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

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
  width: 100%;
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