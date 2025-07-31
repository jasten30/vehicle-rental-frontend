<!-- vehicle-rental-frontend/src/views/Auth/LoginView.vue -->
<template>
  <div class="login-container">
    <h2 class="login-title">Login to RentCycle</h2>
    <form @submit.prevent="handleLogin" class="login-form">
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
      <button type="submit" :disabled="loading" class="login-button">
        {{ loading ? "Logging in..." : "Login" }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
    <p class="register-link">
      Don't have an account?
      <router-link to="/register">Register here</router-link>
    </p>
  </div>
</template>

<script>
import { mapActions } from "vuex"; // Import mapActions helper

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: null,
    };
  },
  methods: {
    ...mapActions(["login"]), // Map the 'login' action from the store

    async handleLogin() {
      this.loading = true;
      this.error = null; // Clear previous errors

      try {
        await this.login({ email: this.email, password: this.password });
        // Login action handles committing to store and redirection
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        console.error("Login component error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* Scoped styles for LoginView.vue */
@import "../../assets/styles/variables.scss";

.login-container {
  background-color: $card-background;
  padding: 2.5rem;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  width: 100%;
  max-width: 450px;
  margin: 2rem auto; // Center the form and add vertical margin
  text-align: center;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; // Spacing between form groups
}

.form-group {
  text-align: left;
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
  box-sizing: border-box; // Include padding in width
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2); // Focus ring
  }
}

.login-button {
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

.register-link {
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
