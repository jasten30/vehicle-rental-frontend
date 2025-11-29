<template>
  <div class="success-container">
    <div class="success-card">
      <div class="icon-wrapper">
        <i class="bi bi-patch-check-fill"></i>
      </div>
      <h1 class="title">Application Submitted!</h1>
      <p class="subtitle">
        Thank you for your submission. Our team will review your application and
        get back to you within 3-5 business days.
      </p>
      <router-link to="/dashboard" class="button">
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.success-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 1rem; /* Prevent card from touching screen edges on mobile */
  box-sizing: border-box;
}

.success-card {
  text-align: center;
  padding: 2rem 1.5rem; /* Reduced padding for mobile */
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 3rem; /* Restore spacious padding on desktop */
  }
}

.icon-wrapper {
  color: $secondary-color;
  font-size: 3rem; /* Smaller icon on mobile */
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }
}

.title {
  font-size: 1.5rem; /* Smaller title on mobile */
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 0.75rem;
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
}

.subtitle {
  font-size: 1rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
}

.button {
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: $border-radius-pill;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background-color: darken($primary-color, 10%);
    transform: translateY(-2px);
  }
}
</style>
