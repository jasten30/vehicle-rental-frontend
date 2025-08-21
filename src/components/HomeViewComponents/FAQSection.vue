<!-- frontend/src/components/FAQSection.vue -->
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
      faqItems: [
        {
          question: 'How do I book a car?',
          answer: 'Booking a car on RentCycle is easy! Simply use the search bar on the homepage to enter your location, dates, and times. Browse the available vehicles, select the one you want, and follow the steps to complete your booking. You\'ll receive a confirmation with all the details.',
        },
        {
          question: 'What are the requirements to rent a car?',
          answer: 'You must be at least 21 years old and have a valid driver\'s license. Some hosts may have additional requirements, which will be listed in the vehicle details. You will also need a valid credit card for the security deposit.',
        },
        {
          question: 'Is insurance included?',
          answer: 'RentCycle provides basic liability coverage for all rentals. You also have the option to purchase additional protection plans for extra peace of mind during the booking process.',
        },
        {
          question: 'How do I contact the vehicle host?',
          answer: 'Once your booking is confirmed, you will receive the host\'s contact information via the app\'s messaging system. You can communicate with them directly to arrange pickup and drop-off details.',
        },
        {
          question: 'Can I modify or cancel a reservation?',
          answer: 'Yes, you can modify or cancel your reservation through the "My Bookings" section of your account. Please be aware that cancellation policies may vary depending on the host and the timing of the cancellation. Check the specific vehicle\'s policy before booking.',
        },
        {
          question: 'What if I\'m late for pickup?',
          answer: 'We recommend you contact your host as soon as you know you\'ll be late. Many hosts are flexible, but some may have a strict policy or a late fee. Keeping them informed is key to a smooth process.',
        },
        {
          question: 'Are there any mileage limits?',
          answer: 'Most vehicles on RentCycle have a standard daily mileage limit, which is clearly stated in the vehicle details. If you exceed this limit, an extra fee per mile will apply. Some hosts offer unlimited mileage for an additional charge.',
        },
        {
          question: 'How do I return the car?',
          answer: 'Return instructions are coordinated directly with your host. Generally, you will return the car to the same location you picked it up from, unless other arrangements have been made. Ensure the fuel level and cleanliness are in the same condition as when you received the vehicle.',
        },
        {
          question: 'What forms of payment are accepted?',
          answer: 'We accept all major credit and debit cards, including Visa, Mastercard, and American Express. All payments are securely processed through our platform.',
        },
        {
          question: 'Is there a minimum rental age?',
          answer: 'The minimum age to rent a vehicle through RentCycle is 21. For drivers under the age of 25, a young driver fee may apply, which will be shown at the time of booking.',
        },
      ],
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
      background-color: #f1f5fa;
    }
  }

  .faq-question {
    font-size: 1.1rem; /* Reduced font size */
    font-weight: 700;
    color: #191c2b; 
    margin: 0;
    user-select: none;
  }

  .faq-icon {
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
    color: $secondary-color;
    
    &.rotated {
      transform: rotate(-180deg);
    }
  }

  .faq-answer-container {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-out;
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
