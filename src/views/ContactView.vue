<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content scroll-animate">
        <h1 class="hero-title">Get in Touch</h1>
        <p class="hero-subtitle">
          We're here to help. Whether you have a question about a booking, hosting, or just want to say hello, we'd love to hear from you.
        </p>
      </div>
    </section>

    <!-- Contact Info Grid -->
    <section class="contact-info-section">
      <h2 class="section-title scroll-animate">Contact Information</h2>
      <div class="info-grid">
        <div class="info-card scroll-animate" style="--delay: 0s;">
          <div class="info-icon"><i class="bi bi-envelope-fill"></i></div>
          <h3>Email Us</h3>
          <p>For support, press, and all other inquiries.</p>
          <a href="mailto:rentcycleplatform@gmail.com" class="info-link">rentcycleplatform@gmail.com</a>
        </div>
        <div class="info-card scroll-animate" style="--delay: 0.1s;">
          <div class="info-icon"><i class="bi bi-phone-fill"></i></div>
          <h3>Call Us</h3>
          <p>Our support team is available 24/7.</p>
          <a href="tel:+639123456789" class="info-link">+63 912 345 6789</a>
        </div>
        <div class="info-card scroll-animate" style="--delay: 0.2s;">
          <div class="info-icon"><i class="bi bi-geo-alt-fill"></i></div>
          <h3>Our Location</h3>
          <p>Visit us at our main headquarters.</p>
          <span class="info-link-static">Cebu Business Park, Cebu City, PH</span>
        </div>
      </div>
    </section>

    <!-- Form and Map Section -->
    <section class="form-map-section">
      <div class="form-map-content">
        <!-- Contact Form -->
        <div class="contact-form-wrapper scroll-animate" style="--delay: 0s;">
          <h3>Send us a Message</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" v-model="form.name" required placeholder="Your Name">
            </div>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" v-model="form.email" required placeholder="you@example.com">
            </div>
            <div class="form-group">
              <label for="subject">Subject</label>
              <select id="subject" v-model="form.subject" required>
                <option value="" disabled>Please select a reason...</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Booking Support">Booking Support</option>
                <option value="Host Support">Host Support</option>
                <option value="Technical Issue">Technical Issue</option>
              </select>
            </div>
            <div class="form-group">
              <label for="message">Message</label>
              <textarea id="message" v-model="form.message" rows="6" required placeholder="Your message..."></textarea>
            </div>
            
            <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

            <button type="submit" class="button primary-button" :disabled="isLoading">
              <span v-if="isLoading">Sending...</span>
              <span v-else>Send Message</span>
            </button>
          </form>
        </div>
        <!-- Map -->
        <div class="map-wrapper scroll-animate" style="--delay: 0.1s;" ref="mapWrapper">
          <div id="contact-map" class="map-image"></div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section scroll-animate">
      <FAQSection />
    </section>

  </div>
</template>

<script>
import { mapActions } from 'vuex';
import FAQSection from '@/components/HomeViewComponents/FAQSection.vue';
// We assume Leaflet is loaded globally in public/index.html
// If not, you'd need to import L from 'leaflet';

export default {
  name: 'ContactView',
  components: {
    FAQSection,
  },
  data() {
    return {
      observer: null,
      mapInstance: null, // <-- NEW: To hold the map
      form: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
      isLoading: false,
      errorMessage: '',
      successMessage: '',
    };
  },
  methods: {
    ...mapActions(['sendContactForm']),

    async handleSubmit() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      try {
        await this.sendContactForm(this.form);
        
        this.successMessage = "Thank you! Your message has been sent successfully.";
        // Clear the form
        this.form.name = '';
        this.form.email = '';
        this.form.subject = '';
        this.form.message = '';
      } catch (err) {
        this.errorMessage = err.response?.data?.message || "Failed to send message. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },

    initMap() {
      // Coordinates for Poblacion, Cordova, Cebu
      const lat = 10.2595;
      const lon = 123.9507;

      if (typeof window.L === 'undefined') {
        console.error("Leaflet is not loaded.");
        return;
      }

      this.$nextTick(() => {
        try {
          const mapContainer = document.getElementById('contact-map');
          if (!mapContainer) {
            console.error("Map container #contact-map not found.");
            return;
          }
          
          if (this.mapInstance) {
            this.mapInstance.invalidateSize();
            return;
          }
          
          this.mapInstance = window.L.map("contact-map").setView([lat, lon], 15); // Zoom level 15
          
          window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }).addTo(this.mapInstance);

          window.L.marker([lat, lon])
            .addTo(this.mapInstance)
            .bindPopup("<b>RentCycle Headquarters</b><br>Poblacion, Cordova, Cebu")
            .openPopup();
            
        } catch (e) {
          console.error("Error initializing map:", e);
        }
      });
    }
  },
  mounted() {
    const options = {
      root: null,
      threshold: 0.2,
      rootMargin: "0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          if (entry.target === this.$refs.mapWrapper) {
            this.initMap(); 
          }

          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.$nextTick(() => {
      const sections = this.$el.querySelectorAll('.scroll-animate');
      sections.forEach(section => {
        this.observer.observe(section);
      });
    });
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

// Animation for the hero background
@keyframes kenburns-bg {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.1) translate(2%, -2%);
  }
}

.contact-page {
  color: $text-color-dark;
  /* overflow-x: hidden; */ // Removed to fix scroll animation
}

// Hero Section
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 6rem 2rem;
  text-align: center;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // --- UPDATED BACKGROUND IMAGE to match AboutView ---
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600');
    background-size: cover;
    background-position: center;
    animation: kenburns-bg 20s ease-in-out infinite alternate;
    z-index: 1;
    will-change: transform;
  }

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

// Common Section Styling
section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
  color: $text-color-dark;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

// Contact Info Section
.contact-info-section {
  background-color: $background-light;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.info-card {
  background: $card-background;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: 2rem;
  text-align: center;
  box-shadow: $shadow-light;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-medium;
  }

  .info-icon {
    font-size: 2.5rem;
    color: $primary-color;
    margin-bottom: 1rem;
    display: inline-block;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  p {
    color: $text-color-medium;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .info-link, .info-link-static {
    font-weight: 600;
    color: $primary-color;
    text-decoration: none;
    font-size: 1rem;
  }
  
  .info-link:hover {
    text-decoration: underline;
  }

  .info-link-static {
    color: $text-color-dark;
  }
}

// Form & Map Section
.form-map-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.contact-form-wrapper {
  background: $card-background;
  padding: 2rem;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color-light;
  
  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 2rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-color-dark;
    font-size: 0.9rem;
  }
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-family: $font-family-base;
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background-color: #fff;
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px lighten($primary-color, 40%);
    }
  }
  textarea {
    resize: vertical;
    min-height: 120px;
  }
}

.button.primary-button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  background-color: $primary-color;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.map-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-medium;
  @media (max-width: 992px) {
    grid-row: 1; // Move map to top on mobile
    min-height: 300px;
  }
}
.map-image { // This class is now on the <div>
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background-color: $background-light; // Placeholder bg
  z-index: 1; // Ensure map is clickable
}

.faq-section {
  background-color: $background-light;
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
.error-message {
  color: $admin-color;
  background-color: lighten($admin-color, 40%);
  padding: 0.75rem;
  border-radius: $border-radius-md;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

// Scroll Animation
.scroll-animate {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: var(--delay, 0s);
  will-change: opacity, transform;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>