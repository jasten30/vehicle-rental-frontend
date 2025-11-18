<template>
  <div class="hosting-guide-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content scroll-animate">
        <h1 class="hero-title">Become a RentCycle Host</h1>
        <p class="hero-subtitle">
          Turn your car or motorcycle into a second income. Join our community of hosts and start earning today.
        </p>
        <router-link to="/become-a-host" class="button primary-button hero-cta">Start Listing</router-link>
      </div>
    </section>

    <!-- Why Host Section -->
    <section class="why-host-section">
      <h2 class="section-title scroll-animate">Why Host on RentCycle?</h2>
      <div class="benefits-grid">
        <div class="benefit-card scroll-animate" style="--delay: 0s;">
          <div class="info-icon"><i class="bi bi-cash-coin"></i></div>
          <h3>Earn Extra Income</h3>
          <p>Offset your vehicle ownership costs. Your car can pay for its own maintenance, insurance, and parking.</p>
        </div>
        <div class="benefit-card scroll-animate" style="--delay: 0.1s;">
          <div class="info-icon"><i class="bi bi-calendar2-check-fill"></i></div>
          <h3>Total Flexibility</h3>
          <p>You're the boss. You decide the price, the availability, and who gets to rent your vehicle.</p>
        </div>
        <div class="benefit-card scroll-animate" style="--delay: 0.2s;">
          <div class="info-icon"><i class="bi bi-people-fill"></i></div>
          <h3>Trusted Community</h3>
          <p>We verify every renter before they can book. Plus, our ratings and review system keeps everyone accountable.</p>
        </div>
      </div>
    </section>

    <!-- Step-by-Step Guide -->
    <section class="guide-section alternate-bg">
      <h2 class="section-title scroll-animate">Your Journey to Hosting</h2>
      <div class="guide-steps">
        
        <!-- Step 1 -->
        <div class="step-row">
          <div class="step-image-wrapper scroll-animate">
            <img src="https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=80&w=1200" alt="Document Preparation" class="step-image"/>
          </div>
          <div class="step-content scroll-animate">
            <span class="step-number">01</span>
            <h3>Prepare Your Documents</h3>
            <p>Before you start, have your vehicle's Official Receipt (OR) and Certificate of Registration (CR) ready. You'll also need clear photos of your vehicle's exterior and interior.</p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-row reverse">
          <div class="step-image-wrapper scroll-animate">
            <img src="https://images.unsplash.com/photo-1758876020010-fe9a9d9f8266?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Create Listing" class="step-image"/>
          </div>
          <div class="step-content scroll-animate">
            <span class="step-number">02</span>
            <h3>Create Your Listing</h3>
            <p>Use our simple form to list your vehicle. Set your daily rate, add a detailed description, and upload your photos. Be honest about your vehicle's condition to build trust.</p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="step-row">
          <div class="step-image-wrapper scroll-animate">
            <img src="https://images.pexels.com/photos/342248/pexels-photo-342248.jpeg?_gl=1*x9om7a*_ga*OTY4NTAxNDc0LjE3NjM0ODE4Mjk.*_ga_8JE65Q40S6*czE3NjM0ODE4MjgkbzEkZzEkdDE3NjM0ODE4NzkkajkkbDAkaDA." alt="Calendar Management" class="step-image"/>
          </div>
          <div class="step-content scroll-animate">
            <span class="step-number">03</span>
            <h3>Manage Availability</h3>
            <p>Go to your dashboard and set your availability calendar. Block out dates when you need the car for yourself. You can update this anytime.</p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="step-row reverse">
          <div class="step-image-wrapper scroll-animate">
            <img src="https://images.unsplash.com/photo-1556740714-a8395b3bf30f?q=80&w=1200" alt="Payment" class="step-image"/>
          </div>
          <div class="step-content scroll-animate">
            <span class="step-number">04</span>
            <h3>Set Up Payments</h3>
            <p>Upload your preferred payment QR code (like GCash or Maya) in your profile settings. This is how renters will pay you their 20% downpayment securely.</p>
          </div>
        </div>

      </div>
    </section>

    <!-- Pro Tips Section -->
    <section class="tips-section scroll-animate">
      <h2 class="section-title">Pro Tips for Success</h2>
      <div class="tips-grid">
        <div class="tip-item">
          <h4><i class="bi bi-camera-fill"></i> Great Photos Matter</h4>
          <p>Listings with high-quality, bright photos get 3x more bookings. Show off your car from all angles!</p>
        </div>
        <div class="tip-item">
          <h4><i class="bi bi-chat-dots-fill"></i> Quick Responses</h4>
          <p>Respond to booking requests and messages quickly. Being responsive boosts your ranking and builds trust.</p>
        </div>
        <div class="tip-item">
          <h4><i class="bi bi-stars"></i> Keep it Clean</h4>
          <p>Always hand over your vehicle clean and with a full tank of gas. It leads to 5-star reviews.</p>
        </div>
        <div class="tip-item">
          <h4><i class="bi bi-calendar-event-fill"></i> Update Often</h4>
          <p>Keep your calendar up-to-date to avoid declining requests, which can hurt your search visibility.</p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="cta-section alternate-bg scroll-animate">
      <h2>Ready to become a host?</h2>
      <p>It only takes a few minutes to get started.</p>
      <router-link to="/become-a-host" class="button primary-button">List Your Car Now</router-link>
    </section>

  </div>
</template>

<script>
export default {
  name: 'HostingGuideView',
  data() {
    return {
      observer: null,
    };
  },
  mounted() {
    const options = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
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
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

// Animation for the hero background
@keyframes kenburns-bg {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-2%, 2%); }
}

.hosting-guide-page {
  color: $text-color-dark;
  overflow-x: hidden;
}

// Hero Section
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 8rem 2rem; // Taller hero for impact
  text-align: center;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1550523267-3d0769418058?q=80&w=1600');
    background-size: cover;
    background-position: center;
    animation: kenburns-bg 20s ease-in-out infinite alternate;
    z-index: 1;
    will-change: transform;
  }
  @media (max-width: 768px) { padding: 5rem 1.5rem; }
}
.hero-content { position: relative; z-index: 2; }
.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  @media (max-width: 768px) { font-size: 2.5rem; }
}
.hero-subtitle {
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
  opacity: 0.9;
  @media (max-width: 768px) { font-size: 1rem; }
}
.hero-cta {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

// Common Section Styling
section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 4rem 1.5rem; }
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
  color: $text-color-dark;
  @media (max-width: 768px) { font-size: 2rem; }
}
.alternate-bg {
  background-color: $background-light;
  max-width: 100%;
  // Inner container for grid
  .guide-steps, .cta-buttons {
    max-width: 1200px;
    margin: 0 auto;
  }
}

// Why Host (Benefits)
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.benefit-card {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color-light;
  box-shadow: $shadow-light;
  transition: transform 0.3s ease;
  
  &:hover { transform: translateY(-5px); }

  .info-icon {
    font-size: 3rem;
    color: $primary-color;
    margin-bottom: 1rem;
    display: inline-block;
  }
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }
  p {
    color: $text-color-medium;
    line-height: 1.6;
  }
}

// Step-by-Step Guide
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 5rem;
}
.step-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  &.reverse {
    .step-image-wrapper { order: 2; }
    .step-content { order: 1; }
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    &.reverse {
      .step-image-wrapper, .step-content { order: initial; }
    }
  }
}
.step-image-wrapper {
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-large;
}
.step-image {
  width: 100%;
  height: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}
.step-content {
  @media (max-width: 992px) { text-align: center; }
}
.step-number {
  display: block;
  font-size: 4rem;
  font-weight: 900;
  color: rgba($primary-color, 0.15);
  line-height: 1;
  margin-bottom: -1rem;
}
.step-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}
.step-content p {
  font-size: 1.1rem;
  color: $text-color-medium;
  line-height: 1.7;
}

// Pro Tips
.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
.tip-item {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: $border-radius-md;
  border-left: 4px solid $secondary-color;
  
  h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: $text-color-dark;
    
    i { color: $secondary-color; }
  }
  p {
    margin: 0;
    font-size: 0.95rem;
    color: $text-color-medium;
    line-height: 1.5;
  }
}

// CTA Section
.cta-section {
  text-align: center;
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.2rem;
    color: $text-color-medium;
    margin-bottom: 2rem;
  }
}
.button.primary-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: darken($primary-color, 10%);
    box-shadow: $shadow-hover;
  }
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