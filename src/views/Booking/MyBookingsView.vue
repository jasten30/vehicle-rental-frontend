<!-- vehicle-rental-frontend/src/views/Booking/MyBookingsView.vue -->
<template>
  <div class="my-bookings-container">
    <h1>My Bookings</h1>
    <p>This page will display your past and upcoming vehicle bookings.</p>
    <p>Feature coming soon!</p>
    <router-link to="/vehicles" class="back-link">Browse Vehicles</router-link>
  </div>
</template>

<script>
export default {
  name: "MyBookingsView",
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/variables.scss";

.my-bookings-container {
  padding: 2rem;
  text-align: center;
  max-width: 800px;
  margin: 2rem auto;
  background-color: $card-background;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;

  h1 {
    color: $primary-color;
    margin-bottom: 1rem;
  }

  p {
    color: $text-color-medium;
    margin-bottom: 0.75rem;
  }

  .back-link {
    display: inline-block;
    margin-top: 1.5rem;
    background-color: $primary-color;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: $border-radius-sm;
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }
}
</style>
