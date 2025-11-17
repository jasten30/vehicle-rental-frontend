<template>
  <div class="trust-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Your Safety is Our Priority</h1>
        <p class="hero-subtitle">
          We've built a community founded on trust. Learn about the features we use to protect every host and renter on our platform.
        </p>
      </div>
    </section>

    <section class="commitment-section">
      <h2 class="section-title">Our Commitment to You</h2>
      <div class="commitment-grid">
        <div class="commitment-card">
          <div class="info-icon"><i class="bi bi-shield-check"></i></div>
          <h3>Verified Community</h3>
          <p>We ensure every member is who they say they are. All renters must be "Approved to Drive" and all hosts are verified before they can list an asset.</p>
        </div>
        <div class="commitment-card">
          <div class="info-icon"><i class="bi bi-shield-lock-fill"></i></div>
          <h3>Secure by Design</h3>
          <p>Our 2-step payment system, secure QR code verification, and in-app chat keep your transactions and communications safe from fraud.</p>
        </div>
        <div class="commitment-card">
          <div class="info-icon"><i class="bi bi-journal-check"></i></div>
          <h3>Clear Agreements</h3>
          <p>No guesswork. Every confirmed booking generates a downloadable rental contract, so both parties are protected by a clear, written agreement.</p>
        </div>
      </div>
    </section>

    <section class="feature-section alternate-bg">
      <div class="feature-row">
        <div class="feature-image-wrapper">
          <img src="https://images.unsplash.com/photo-1625062294765-e469e85d936a?q=80&w=1466&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Renter inspecting a car" class="feature-image"/>
        </div>
        <div class="feature-text-content">
          <div class="feature-icon"><i class="bi bi-person-check-fill"></i></div>
          <h2>Protection for Renters</h2>
          <ul>
            <li><strong>Verified Hosts:</strong> Only hosts who have completed our verification process can list their assets.</li>
            <li><strong>Approved to Drive:</strong> Our one-time "Approved to Drive" check ensures you're ready to book any vehicle, any time.</li>
            <li><strong>Secure Payments:</strong> Pay only a 20% downpayment to secure your booking. You pay the rest in person, so you never pay in full until you've seen the vehicle.</li>
            <li><strong>Private Chat:</strong> All communication is logged in our secure chat, protecting you from "he said, she said" disputes.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="feature-row reverse">
        <div class="feature-image-wrapper">
          <img src="https://images.unsplash.com/photo-1594622385056-7c79aad4be69?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Host handing keys to renter" class="feature-image"/>
        </div>
        <div class="feature-text-content">
          <div class="feature-icon"><i class="bi bi-car-front-fill"></i></div>
          <h2>Security for Hosts</h2>
          <ul>
            <li><strong>You're in Control:</strong> You have the power to approve or decline every single booking request.</li>
            <li><strong>Verified Renters:</strong> Never worry about who's driving your car. Every renter must be "Approved to Drive" *before* they can even send you a request.</li>
            <li><strong>Guaranteed Downpayment:</strong> Our system ensures you receive and verify the 20% downpayment before the booking is finalized, protecting you from no-shows.</li>
            <li><strong>Rental Contracts:</strong> A PDF contract is generated for every trip, giving you a legal document for your records and peace of mind.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="cta-section alternate-bg">
      <h2>Have More Questions?</h2>
      <p>Visit our FAQ page for more details or contact our support team directly.</p>
      <div class="cta-buttons">
        <router-link to="/faq" class="button secondary-button">View FAQs</router-link>
        <router-link to="/contact" class="button primary-button">Contact Support</router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'TrustAndSafetyView',
  // IntersectionObserver logic and data have been removed
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

// Animation for the hero background (Kept this as it is not a scroll effect)
@keyframes kenburns-bg {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-2%, 2%); }
}

.trust-page {
  color: $text-color-dark;
  overflow-x: hidden;
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
    background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600');
    background-size: cover;
    background-position: center;
    animation: kenburns-bg 20s ease-in-out infinite alternate;
    z-index: 1;
    will-change: transform;
  }
  @media (max-width: 768px) { padding: 4rem 1.5rem; }
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
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
  @media (max-width: 768px) { font-size: 1rem; }
}

// Common Section Styling
section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 3rem 1.5rem; }
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
  .feature-row {
    max-width: 1200px;
    margin: 0 auto;
  }
}

// Commitment Section (3-card grid)
.commitment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
.commitment-card {
  background: $card-background;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: 2rem;
  text-align: center;
  box-shadow: $shadow-light;
  
  .info-icon {
    font-size: 2.5rem;
    color: $secondary-color; 
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
}

// Feature Section (Alternating)
.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;

  &.reverse {
    .feature-image-wrapper { order: 2; }
    .feature-text-content { order: 1; }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    &.reverse {
      .feature-image-wrapper, .feature-text-content {
        order: initial;
      }
    }
  }
}
.feature-image-wrapper {
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-large;
}
.feature-image {
  width: 100%;
  height: 100%;
  max-height: 450px;
  object-fit: cover;
  display: block;
}
.feature-text-content {
  padding: 1rem;
  @media (max-width: 768px) {
    text-align: center;
    padding: 0;
  }
}
.feature-icon {
  font-size: 3rem;
  color: $primary-color;
  margin-bottom: 1.5rem;
  display: inline-block;
}
.feature-text-content h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.feature-text-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.feature-text-content li {
  font-size: 1.1rem;
  color: $text-color-medium;
  line-height: 1.7;
  padding-left: 1.75rem;
  position: relative;
  
  strong {
    color: $text-color-dark;
  }

  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    top: 0;
    color: $secondary-color;
    font-weight: 700;
    font-size: 1.2rem;
  }
  
  @media (max-width: 768px) {
    text-align: left;
  }
}

// CTA Section
.cta-section {
  text-align: center;
  padding: 4rem 2rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }
  
  p {
    font-size: 1.1rem;
    color: $text-color-medium;
    margin-bottom: 2rem;
  }
}
.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.button {
  padding: 0.85rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
}
.primary-button {
  background-color: $primary-color;
  color: white;
  border-color: $primary-color;
  &:hover {
    background-color: darken($primary-color, 10%);
    box-shadow: $shadow-hover;
  }
}
.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border-color: $primary-color;
  &:hover {
    background-color: lighten($primary-color, 45%);
  }
}
</style>