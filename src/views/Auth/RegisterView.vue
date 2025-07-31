<!-- vehicle-rental-frontend/src/views/Auth/RegisterView.vue -->
<template>
  <div class="register-container">
    <h2 class="register-title">Register for RentCycle</h2>
    <form @submit.prevent="handleRegister" class="register-form">
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
      <div class="form-group">
        <label for="role">Register as:</label>
        <select id="role" v-model="role" class="form-input">
          <option value="renter">Renter</option>
          <option value="owner">Owner (requires admin approval)</option>
        </select>
      </div>

      <button type="submit" :disabled="loading" class="register-button">
        {{ loading ? "Registering..." : "Register" }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
    <p class="login-link">
      Already have an account? <router-link to="/login">Login here</router-link>
    </p>
  </div>
</template>

<script>
import { mapActions } from "vuex"; // Import mapActions helper

export default {
  name: "RegisterView",
  data() {
    return {
      email: "",
      password: "",
      confirmPassword: "",
      role: "renter", // Default role
      loading: false,
      error: null,
    };
  },
  methods: {
    ...mapActions(["register"]), // Map the 'register' action from the store

    async handleRegister() {
      this.loading = true;
      this.error = null; // Clear previous errors

      if (this.password !== this.confirmPassword) {
        this.error = "Passwords do not match.";
        this.loading = false;
        return;
      }

      try {
        await this.register({
          email: this.email,
          password: this.password,
          role: this.role,
          // You can add other fields like displayName, phoneNumber, etc., here if your backend supports them
        });
        // Registration action handles redirection to login page
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          "An unexpected error occurred during registration. Please try again.";
        console.error("Registration component error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* Scoped styles for RegisterView.vue */
@import "../../assets/styles/variables.scss"; // Ensure this path is correct

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
