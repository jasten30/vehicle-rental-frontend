<template>
  <div class="success-container">
    <div class="success-card">
      <div class="icon-wrapper">
        <i class="bi bi-patch-check-fill"></i>
      </div>
      <h1 class="title">Application Submitted!</h1>
      <p class="subtitle">
        Thank you for your submission. Our team will review your application
        and get back to you within 3-5 business days.
      </p>
      <router-link to="/dashboard" class="button">
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
.success-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}
.success-card {
  text-align: center;
  padding: 3rem;
  background-color: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  max-width: 500px;
}
.icon-wrapper {
  color: $secondary-color;
  font-size: 4rem;
  margin-bottom: 1.5rem;
}
.title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1rem;
}
.subtitle {
  font-size: 1.1rem;
  color: $text-color-medium;
  margin-bottom: 2rem;
}
.button {
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: $border-radius-pill;
  text-decoration: none;
  font-weight: 600;
}
</style>