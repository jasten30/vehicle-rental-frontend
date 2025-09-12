<template>
  <div class="login-page-wrapper">
    <div class="image-column"></div>

    <div class="form-column">
      <div class="login-container">
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-subtitle">Sign in to continue to RentCycle</p>

        <div class="login-tabs">
          <button
            @click="loginMethod = 'email'"
            :class="{ active: loginMethod === 'email' }"
          >
            <i class="bi bi-envelope-fill"></i> Email
          </button>
          <button
            @click="loginMethod = 'phone'"
            :class="{ active: loginMethod === 'phone' }"
          >
            <i class="bi bi-phone-fill"></i> Phone
          </button>
        </div>

        <form
          @submit.prevent="handleLogin"
          class="login-form"
          v-if="loginMethod === 'email'"
        >
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
            <label for="password">Password</label>
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

        <div class="login-form" v-if="loginMethod === 'phone'">
          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <div class="phone-input-wrapper">
              <span class="phone-prefix">+63</span>
              <input
                type="text"
                id="phoneNumber"
                v-model="localPhoneNumber"
                placeholder="9171234567"
                :disabled="otpSent"
              />
            </div>
          </div>
          <div v-if="otpSent" class="form-group">
            <label for="otp-code">Verification Code</label>
            <input
              type="text"
              id="otp-code"
              v-model="otpCode"
              placeholder="123456"
              maxlength="6"
            />
          </div>
          <button
            v-if="!otpSent"
            @click="sendSmsOtp"
            :disabled="loading"
            class="login-button"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Send Code</span>
          </button>
          <button
            v-if="otpSent"
            @click="handlePhoneLogin"
            :disabled="loading"
            class="login-button"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Sign In with Code</span>
          </button>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p class="register-link">
          Don't have an account?
          <router-link to="/register">Sign up</router-link>
        </p>
        <div id="recaptcha-container"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

export default {
  name: 'LoginView',
  data() {
    return {
      loginMethod: 'email',
      email: '',
      password: '',
      phoneNumber: '',
      otpSent: false,
      otpCode: '',
      loading: false,
      error: null,
      confirmationResult: null,
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
    ...mapActions(['login', 'tokenLogin']),
    async handleLogin() {
      this.loading = true;
      this.error = null;
      try {
        await this.login({ email: this.email, password: this.password });
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to log in.';
      } finally {
        this.loading = false;
      }
    },
    async sendSmsOtp() {
      this.loading = true;
      this.error = null;
      try {
        const auth = getAuth();
        const recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
          }
        );
        this.confirmationResult = await signInWithPhoneNumber(
          auth,
          this.phoneNumber,
          recaptchaVerifier
        );
        this.otpSent = true;
      } catch (error) {
        this.error = 'Failed to send SMS. Check the number and try again.';
        console.error('SMS Send Error:', error);
      } finally {
        this.loading = false;
      }
    },
    async handlePhoneLogin() {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await this.confirmationResult.confirm(
          this.otpCode
        );
        const idToken = await userCredential.user.getIdToken();
        this.$store.commit('SET_AUTH_TOKEN', idToken);
        await this.tokenLogin();
      } catch (error) {
        this.error = 'Failed to verify code. Please try again.';
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

.login-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  background-color: lighten($background-color, 2%);
  border-radius: $border-radius-pill;
  padding: 0.25rem;

  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    color: $text-color-medium;
    border-radius: $border-radius-pill;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &.active {
      color: $primary-color;
      background-color: $card-background;
      box-shadow: $shadow-light;
    }
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
}
#phoneNumber {
  padding-left: 3.5rem;
}
#recaptcha-container {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>