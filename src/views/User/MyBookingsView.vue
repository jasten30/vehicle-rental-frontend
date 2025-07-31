<template>
  <div class="my-bookings-container">
    <h2>My Bookings</h2>
    <p>Your current and past bookings will be displayed here.</p>
    <div class="debug-indicator">
      <p>DEBUG: MyBookingsView is active!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "MyBookingsView",
};
</script>

<style scoped>
.my-bookings-container {
  background-color: #e0f2f7; /* Light blue background */
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  color: #01579b; /* Dark blue text */
}

.debug-indicator {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffcc80; /* Orange for debug */
  border: 1px solid #ff9800;
  border-radius: 5px;
  font-weight: bold;
  color: #e65100;
}
</style>
