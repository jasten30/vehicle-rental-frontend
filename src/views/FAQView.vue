<template>
  <div class="faq-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content scroll-animate">
        <h1 class="hero-title">Frequently Asked Questions</h1>
        <p class="hero-subtitle">
          Have a question? We've got answers. Find help for common topics below.
        </p>
      </div>
    </section>

    <!-- Renter Questions -->
    <section class="faq-content-section scroll-animate">
      <h2 class="section-title">For Renters</h2>
      <div class="faq-list">
        <div v-for="(item, index) in renterFAQs" :key="`renter-${index}`" class="faq-item">
          <div class="faq-question-bar" @click="toggleAnswer('renter', index)">
            <h3 class="faq-question">{{ item.question }}</h3>
            <span class="faq-icon" :class="{ 'rotated': activeRenterIndex === index }">
              <i class="bi bi-chevron-down"></i>
            </span>
          </div>
          <div class="faq-answer-container" :class="{ 'open': activeRenterIndex === index }">
            <p class="faq-answer">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Host Questions -->
    <section class="faq-content-section alternate-bg scroll-animate">
      <h2 class="section-title">For Hosts</h2>
      <div class="faq-list">
        <div v-for="(item, index) in hostFAQs" :key="`host-${index}`" class="faq-item">
          <div class="faq-question-bar" @click="toggleAnswer('host', index)">
            <h3 class="faq-question">{{ item.question }}</h3>
            <span class="faq-icon" :class="{ 'rotated': activeHostIndex === index }">
              <i class="bi bi-chevron-down"></i>
            </span>
          </div>
          <div class="faq-answer-container" :class="{ 'open': activeHostIndex === index }">
            <p class="faq-answer">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust & Safety Questions -->
    <section class="faq-content-section scroll-animate">
      <h2 class="section-title">Trust, Safety & Payments</h2>
      <div class="faq-list">
        <div v-for="(item, index) in safetyFAQs" :key="`safety-${index}`" class="faq-item">
          <div class="faq-question-bar" @click="toggleAnswer('safety', index)">
            <h3 class="faq-question">{{ item.question }}</h3>
            <span class="faq-icon" :class="{ 'rotated': activeSafetyIndex === index }">
              <i class="bi bi-chevron-down"></i>
            </span>
          </div>
          <div class="faq-answer-container" :class="{ 'open': activeSafetyIndex === index }">
            <p class="faq-answer">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section scroll-animate">
      <h2>Still have questions?</h2>
      <p>Our support team is ready to help you with any issue.</p>
      <router-link to="/contact" class="button primary-button">Contact Support</router-link>
    </section>

  </div>
</template>

<script>
export default {
  name: 'FAQView',
  data() {
    return {
      observer: null,
      activeRenterIndex: null,
      activeHostIndex: null,
      activeSafetyIndex: null,
      renterFAQs: [
        {
          question: 'What is the booking process?',
          answer: "It's simple! 1. Find a vehicle and request to book. 2. The host will approve or decline your request. 3. If approved, you pay the 20% downpayment via QR code and submit the reference number. 4. The host confirms your payment, and your booking is secured!",
        },
        {
          question: 'What verification do I need to rent?',
          answer: "To rent any vehicle, you must have a verified account. This includes verifying your email and phone number, and submitting an 'Approved to Drive' application (with your driver's license) from your profile settings. You only need to do this once.",
        },
        {
          question: 'How do I contact the vehicle host?',
          answer: "Once your booking is fully confirmed (after the host verifies your downpayment), a private chat room will be automatically created for you and the host in your 'Inbox'. You can use this chat to coordinate all pickup and drop-off details.",
        },
        {
          question: 'How do I extend my trip?',
          answer: 'To extend your trip, please contact the host directly through your booking\'s chat. They will coordinate with you on availability and any additional payment required.',
        },
        {
          question: "What if I'm a little late returning the vehicle?",
          answer: "We offer a 3-hour grace period for unexpected delays, but please inform your host as a courtesy. If you are more than 3 hours late without an approved extension, your booking status will be updated and additional fees may apply as per the rental contract.",
        },
      ],
      hostFAQs: [
        {
          question: 'How do I list my own car or motorcycle?',
          answer: "We'd love to have you! First, make sure you are 'Approved to Drive'. Then, you can 'Become a Host' from your user menu (click your profile icon). After your host application is approved, you'll get access to the owner dashboard to list your assets.",
        },
        {
          question: 'How do I get paid?',
          answer: "You get paid in two parts. First, the renter pays a 20% downpayment directly to you via your uploaded QR code (e.g., GCash). You must verify this payment to confirm the booking. The remaining 80% is paid by the renter directly to you (typically in cash) upon vehicle pickup.",
        },
        {
          question: 'How do I manage my vehicle\'s availability?',
          answer: "From your 'My Listings' dashboard, you can edit your vehicle and go to the 'Availability' section. You can block any date ranges where your vehicle is not available (e.g., for personal use or maintenance). These dates will automatically be made unbookable by renters.",
        },
        {
          question: 'Can I reply to reviews?',
          answer: 'Yes! We encourage you to reply to reviews. On your public profile page, you will see all the reviews left for you. As the owner of the profile, you will see a "Reply" button under each review that does not have a response yet.',
        },
      ],
      safetyFAQs: [
        {
          question: 'How are payments secured?',
          answer: 'Our 2-step payment system protects both parties. The renter pays a 20% downpayment to secure the booking, which you confirm. The final 80% is paid upon meetup. This ensures the renter is serious, and you (the host) are guaranteed your booking deposit.',
        },
        {
          question: 'What is the cancellation policy?',
          answer: 'A renter can cancel for a full refund at any time *before* the host has approved their request or *before* they have submitted their downpayment. Once a booking is confirmed, cancellations must be coordinated directly with the host.',
        },
        {
          question: 'Is insurance included?',
          answer: "Basic liability coverage is typically provided by the host as part of their vehicle's registration. We strongly recommend renters have their own comprehensive insurance. All parties are responsible for any damages as outlined in the downloadable rental contract.",
        },
        {
          question: 'What is the Rental Contract?',
          answer: 'For every confirmed booking, RentCycle automatically generates a downloadable PDF/TXT rental agreement. This legal document outlines the terms, vehicle condition, and responsibilities of both the host and the renter, protecting both parties.',
        },
      ],
    };
  },
  methods: {
    toggleAnswer(category, index) {
      if (category === 'renter') {
        this.activeRenterIndex = this.activeRenterIndex === index ? null : index;
      } else if (category === 'host') {
        this.activeHostIndex = this.activeHostIndex === index ? null : index;
      } else if (category === 'safety') {
        this.activeSafetyIndex = this.activeSafetyIndex === index ? null : index;
      }
    },
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

.faq-page {
  color: $text-color-dark;
  // overflow-x: hidden; // <-- THIS LINE IS REMOVED
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
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600');
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
  padding: 4rem 2rem;
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

.faq-content-section {
  max-width: 900px; // Make content narrower for readability
  
  &.alternate-bg {
    background-color: $background-light;
    max-width: 100%;
    // Inner container for alignment
    .faq-list {
      max-width: 900px;
      margin: 0 auto;
    }
  }
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// Re-using FAQSection's styles
.faq-item {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  overflow: hidden; 
  transition: box-shadow 0.2s ease;
  border: 1px solid $border-color-light; 

  &:hover {
    box-shadow: $shadow-hover;
  }

  .faq-question-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem; // More padding
    cursor: pointer;
    @media (max-width: 768px) {
      padding: 1rem; // Tighter padding on mobile
    }
    &:hover {
      background-color: #f8f9fa;
    }
  }

  .faq-question {
    font-size: 1.1rem;
    font-weight: 700;
    color: #191c2b; 
    margin: 0;
    user-select: none;
    line-height: 1.4;
    @media (max-width: 768px) {
      font-size: 1rem; // Smaller font on mobile
    }
  }

  .faq-icon {
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
    color: $primary-color;
    flex-shrink: 0;
    margin-left: 1rem;
    
    &.rotated {
      transform: rotate(-180deg);
    }
  }

  .faq-answer-container {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-out, padding 0.4s ease-out;
    padding: 0 1.25rem;
    
    &.open {
      max-height: 500px; 
      padding: 0.5rem 1.25rem 1.25rem;
      @media (max-width: 768px) {
        padding: 0.25rem 1rem 1rem; // Tighter padding on mobile
      }
    }
  }

  .faq-answer {
    font-size: 1rem;
    color: $text-color-medium;
    line-height: 1.7;
    margin: 0;
    @media (max-width: 768px) {
      font-size: 0.95rem; // Smaller font on mobile
    }
  }
}

// CTA Section
.cta-section {
  text-align: center;
  background-color: $background-light;
  max-width: 100%;
  padding: 4rem 2rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    @media (max-width: 768px) {
      font-size: 1.5rem; // Smaller font on mobile
    }
  }
  
  p {
    font-size: 1.1rem;
    color: $text-color-medium;
    margin-bottom: 2rem;
    @media (max-width: 768px) {
      font-size: 1rem; // Smaller font on mobile
    }
  }
}
.button.primary-button {
  padding: 0.85rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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