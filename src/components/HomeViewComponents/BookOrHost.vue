<!-- vehicle-rental-frontend/src/components/BookOrHost.vue -->
<template>
  <section class="book-or-host-section">
    <div class="content-container">
      <div class="cards-container">
        <!-- Left side: Book a car -->
        <div class="action-card left-card">
          <div class="text-content">
            <h2 class="action-title">Book a car <span class="arrow-icon">></span></h2>
          </div>
          <div class="icon-placeholder">
            <!-- Icon for book a car -->
            <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2" ry="2"></rect>
              <path d="M7 12h.01"></path>
              <path d="M12 12h.01"></path>
              <path d="M17 12h.01"></path>
              <path d="M10 3L7 6"></path>
              <path d="M17 6l-3-3"></path>
            </svg>
          </div>
        </div>
        <!-- Right side: Become a host -->
        <div class="action-card right-card">
          <div class="icon-placeholder">
            <!-- Icon for become a host -->
            <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L12 12M12 12L2 12M12 12L12 22M12 12L22 12"></path>
            </svg>
          </div>
          <div class="text-content">
            <h2 class="action-title">Become a host <span class="arrow-icon">></span></h2>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BookOrHost',
};
</script>

<style lang="scss" scoped>
/*
 The 'scoped' attribute ensures that these styles only apply to this component.
*/

/* Keyframe for a subtle glow/pulse animation on the icons */
@keyframes icon-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.book-or-host-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  overflow: hidden;
  font-family: 'Nunito', sans-serif;
  
  // New background with image and overlay
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://www.peruforless.com/images/rental-keys.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed; // For a nice parallax effect
}

/* Main content container to center the cards */
.content-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 900px;
  width: 100%;
}

/* New flex container for the cards */
.cards-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Individual card styling with enhanced hover effects */
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  flex: 1;
  text-align: center;
  cursor: pointer;
  
  // Glassmorphism effect
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); // For Safari
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-card.left-card {
  border-right: none;
}

.action-card:hover {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transform: translateY(-5px);
}

.action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-card:hover .icon-placeholder {
  opacity: 1;
  transform: scale(1);
}

.action-card:hover .action-title .arrow-icon {
  opacity: 1;
  transform: translateX(5px);
}


/* Updated content and icon styling */
.text-content {
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff; // Changed to white
  margin-bottom: 0;
  white-space: nowrap;
}

.arrow-icon {
  font-weight: 900;
  color: #ffffff; // Changed to white
  opacity: 0;
  transform: translateX(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Icon placeholder and icon itself */
.icon-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s ease, transform 0.3s ease;
  animation: none;
}

.action-card:hover .icon-placeholder {
  animation: icon-pulse 1.5s infinite ease-in-out;
}

.action-icon {
  color: #ffffff; // Changed to white
  transition: transform 0.3s ease;
}

/* Responsive design for mobile screens */
@media (max-width: 768px) {
  .book-or-host-section {
    padding: 2rem 1rem;
  }
  
  .cards-container {
    flex-direction: column;
    gap: 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .action-card {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
    border-right: none !important;
  }

  .action-card.left-card {
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }

  .action-card:hover {
    transform: none;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .action-card:hover .icon-placeholder {
    animation: none;
  }

  .icon-placeholder {
    opacity: 1; /* Always show icon on mobile */
    transform: none;
    margin-bottom: 1rem;
  }
  
  .action-card:hover .action-title .arrow-icon {
    opacity: 1;
    transform: translateX(5px);
  }
}
</style>
