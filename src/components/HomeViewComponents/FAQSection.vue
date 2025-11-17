<template>
  <section class="faq-section">
    <h2 class="section-title">FREQUENTLY ASKED QUESTIONS</h2>
    
    <div class="faq-columns-container">
      <!-- Left Column -->
      <div class="faq-column">
        <div v-for="(item, index) in leftColumnItems" :key="index" class="faq-item">
          <!-- The question bar, which is clickable -->
          <div class="faq-question-bar" @click="toggleAnswer(index)">
            <h3 class="faq-question">{{ item.question }}</h3>
            <!-- The icon that rotates based on the dropdown state -->
            <span class="faq-icon" :class="{ 'rotated': activeIndex === index }">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </div>
          <!-- The answer section, which is conditionally rendered -->
          <div class="faq-answer-container" :class="{ 'open': activeIndex === index }">
            <p class="faq-answer">{{ item.answer }}</p>
          </div>
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="faq-column">
        <div v-for="(item, index) in rightColumnItems" :key="index" class="faq-item">
          <!-- The question bar, which is clickable -->
          <div class="faq-question-bar" @click="toggleAnswer(index + leftColumnItems.length)">
            <h3 class="faq-question">{{ item.question }}</h3>
            <!-- The icon that rotates based on the dropdown state -->
            <span class="faq-icon" :class="{ 'rotated': activeIndex === (index + leftColumnItems.length) }">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </div>
          <!-- The answer section, which is conditionally rendered -->
          <div class="faq-answer-container" :class="{ 'open': activeIndex === (index + leftColumnItems.length) }">
            <p class="faq-answer">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FAQSection',
  data() {
    return {
      // Use null to indicate no answer is currently open
      activeIndex: null,
      // --- UPDATED FAQ ITEMS ---
      faqItems: [
        {
          question: 'What is the booking process?',
          answer: "It's simple! 1. Find a vehicle and request to book. 2. The host will approve or decline your request. 3. If approved, you pay the 20% downpayment via QR code and submit the reference number. 4. The host confirms your payment, and your booking is secured!",
        },
        {
          question: 'What verification do I need to rent?',
          answer: "To rent a vehicle, you must have a verified account. This includes verifying your email and phone number, and submitting an 'Approved to Drive' application (with your driver's license) from your profile settings.",
        },
        {
          question: 'How do payments work?',
          answer: 'We use a two-part payment system. You pay a 20% downpayment via QR code (like GCash) to secure your booking. The remaining 80% balance is typically paid in cash directly to the host upon pickup. Always confirm details with your host in the chat.',
        },
        {
          question: 'How do I contact the vehicle host?',
          answer: "Once your booking is fully confirmed (after the host verifies your downpayment), a private chat room will be automatically created for you and the host. You can use this chat to coordinate all pickup and drop-off details.",
        },
        {
          question: 'How do I extend my trip?',
          answer: 'To extend your trip, please contact the host directly through your booking\'s chat. They will coordinate with you on availability and any additional payment required.',
        },
        {
          question: 'What is your cancellation policy?',
          answer: 'You can cancel your booking for a full refund at any time *before* the host has approved your request or *before* you have submitted your downpayment. Once a booking is confirmed, cancellations must be coordinated with the host.',
        },
        {
          question: 'How do I list my own car or motorcycle?',
          answer: "We'd love to have you! First, make sure you are an 'Approved to Drive'. Then, you can 'Become a Host' from your user menu. After your host application is approved, you'll get access to the owner dashboard to list your assets.",
        },
        {
          question: "What if I'm a little late returning the vehicle?",
          answer: "We offer a 3-hour grace period for unexpected delays, but please inform your host. If you're more than 3 hours late without an approved extension, your booking status will be updated and additional fees may apply.",
        },
        {
          question: 'Is insurance included?',
          answer: "Basic liability coverage is provided by the host. We strongly recommend renters have their own comprehensive insurance. You are responsible for any damages during the rental period, as outlined in the rental contract.",
        },
        {
          question: 'What are the requirements to rent?',
          answer: 'Besides being "Approved to Drive," you must have a verified email and phone number. All payments are handled via QR code and reference number verification to ensure a secure transaction for both you and the host.',
        },
      ],
      // --- END UPDATED FAQ ITEMS ---
    };
  },
  computed: {
    // Splits the FAQ items into two equal columns
    leftColumnItems() {
      const mid = Math.ceil(this.faqItems.length / 2);
      return this.faqItems.slice(0, mid);
    },
    rightColumnItems() {
      const mid = Math.ceil(this.faqItems.length / 2);
      return this.faqItems.slice(mid);
    },
  },
  methods: {
    // This method toggles the active index to open or close an FAQ item
    toggleAnswer(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.faq-section {
  padding: 2rem 1rem; /* Reduced padding */
  background-color: #ffffff;
}

.section-title {
  font-size: 2rem; /* Reduced font size */
  font-weight: 700;
  color: $primary-color;
  text-align: center;
  margin-bottom: 2rem; /* Reduced margin */
  position: relative;
  padding-bottom: 0.5rem;
  margin-left: 3rem;
  margin-right: 3rem;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: $secondary-color;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.75rem; /* Reduced font size for mobile */
    margin: 1.5rem;
  }
}

.faq-columns-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem; // Reduced space between the columns
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 992px) {
    // Switch to a single column on tablets and smaller devices
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}

.faq-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  overflow: hidden; // This is important for the dropdown animation
  transition: box-shadow 0.2s ease;
  border: 1px solid $border-color-light; // Softer border

  &:hover {
    box-shadow: $shadow-hover;
  }

  .faq-question-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem; /* Reduced padding */
    cursor: pointer;
    // Add a light hover effect on the bar itself
    &:hover {
      background-color: #f8f9fa; // Lighter hover
    }
  }

  .faq-question {
    font-size: 1.1rem; /* Reduced font size */
    font-weight: 700;
    color: #191c2b; 
    margin: 0;
    user-select: none;
    line-height: 1.4; // Added for readability
  }

  .faq-icon {
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
    color: $primary-color; // Changed to primary color
    flex-shrink: 0; // Prevent icon from shrinking
    margin-left: 1rem;
    
    &.rotated {
      transform: rotate(-180deg);
    }
  }

  .faq-answer-container {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-out, padding 0.4s ease-out; // Added padding to transition
    padding: 0 1rem;
    
    &.open {
      max-height: 500px; /* A large value to allow for any amount of text */
      padding: 0.5rem 1rem 1rem; /* Reduced padding */
    }
  }

  .faq-answer {
    font-size: 1rem;
    color: $text-color-medium;
    line-height: 1.6;
    margin: 0; // Remove default margins
  }
}
</style>