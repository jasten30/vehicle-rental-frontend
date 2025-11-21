<template>
  <div class="login-page-wrapper">
    <div class="image-column"></div>

    <div class="form-column">
      <div class="login-container">
        
        <template v-if="view === 'login'">
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to continue to RentCycle</p>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div class="form-group">
              <div class="label-row">
                <label for="password">Password</label>
                <a href="#" @click.prevent="view = 'forgot'" class="forgot-password-link">Forgot password?</a>
              </div>
              <input
                type="password"
                id="password"
                v-model="password"
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" :disabled="loading" class="login-button">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p class="register-link">
            Don't have an account?
            <router-link to="/register">Sign up</router-link>
          </p>
        </template>

        <template v-else-if="view === 'forgot'">
           <h2 class="login-title">Reset Password</h2>
           <p class="login-subtitle">Enter your email to receive a password reset link.</p>

           <form @submit.prevent="handleForgotPassword" class="login-form">
            <div class="form-group">
              <label for="reset-email">Email</label>
              <input
                type="email"
                id="reset-email"
                v-model="resetEmail"
                required
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" :disabled="loading" class="login-button">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Send Reset Link</span>
            </button>
          </form>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p class="register-link">
            Remembered your password?
            <a href="#" @click.prevent="view = 'login'">Back to login</a>
          </p>
        </template>

      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'LoginView',
  data() {
    return {
      view: 'login',
      email: '',
      password: '',
      resetEmail: '',
      loading: false,
      error: null,
      successMessage: null,
    };
  },
  methods: {
    ...mapActions(['login', 'forgotPassword']), 
    
    async handleLogin() {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        // Pass email/password directly to the store action
        await this.login({ email: this.email, password: this.password }); 
        // The store handles the redirect upon success
      } catch (err) {
        // Handle Errors
        console.error(err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            this.error = 'Invalid email or password.';
        } else {
            this.error = err.response?.data?.message || err.message || 'Failed to log in.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    async handleForgotPassword() {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        await this.forgotPassword(this.resetEmail); 
        this.successMessage = 'Password reset link sent! Please check your email.';
        this.resetEmail = ''; 
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to send reset link.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.login-page-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  width: 100%;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.image-column {
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

.login-container {
  background-color: $card-background;
  padding: 2.5rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  width: 100%;
  max-width: 450px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  text-align: center;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 1rem;
  color: $text-color-medium;
  text-align: center;
  margin-bottom: 2rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.forgot-password-link {
  font-size: 0.85rem;
  color: $primary-color;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
}

.form-group {
  margin-bottom: 1.25rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: $text-color-dark;
  }
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    box-sizing: border-box;
  }
}

.login-button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: $border-radius-md;
  background-color: $primary-color;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.spinner {
  display: inline-block;
  width: 1.25em;
  height: 1.25em;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: $admin-color;
  background-color: lighten($admin-color, 40%);
  padding: 0.75rem;
  border-radius: $border-radius-md;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.success-message {
  color: $secondary-color;
  background-color: lighten($secondary-color, 40%);
  padding: 0.75rem;
  border-radius: $border-radius-md;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
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