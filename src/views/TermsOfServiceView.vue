<template>
  <div class="terms-page">
    <div class="terms-container">
      <header class="terms-header">
        <h1 class="page-title">Terms of Service</h1>
        <p class="effective-date">Last Updated: {{ currentDate }}</p>
      </header>

      <div class="terms-content">
        <section class="terms-section">
          <p>
            Welcome to <strong>RentCycle, Inc.</strong> ("RentCycle", "we", "us", or "our"). By accessing or using our website, mobile application, and services (collectively, the "Platform"), you agree to comply with and be bound by these Terms of Service ("Terms").
          </p>
          <p class="alert-text">
            PLEASE READ THESE TERMS CAREFULLY. IF YOU DO NOT AGREE TO THESE TERMS, YOU MAY NOT USE THE PLATFORM.
          </p>
        </section>

        <section class="terms-section">
          <h2>1. The RentCycle Platform</h2>
          <p>
            RentCycle is a peer-to-peer marketplace that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Renters"). RentCycle is not a vehicle rental company; we provide the technology to facilitate these transactions. We do not own or control the vehicles listed on the Platform.
          </p>
        </section>

        <section class="terms-section">
          <h2>2. Eligibility and Verification</h2>
          <ul>
            <li><strong>Age Requirement:</strong> You must be at least 18 years old to use the Platform.</li>
            <li><strong>"Approved to Drive" Status:</strong> To rent a vehicle, Renters must complete our verification process and receive "Approved to Drive" status. This requires submitting a valid government-issued Driver's License and a selfie for identity verification.</li>
            <li><strong>Host Verification:</strong> Hosts must provide valid vehicle registration (OR/CR) and proof of ownership before listing a vehicle.</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>3. Booking and Financial Terms</h2>
          <h3>A. Fees and Payments</h3>
          <p>
            RentCycle utilizes a secured payment system. We currently support <strong>GCash</strong> and <strong>PayMaya</strong> for transactions.
          </p>
          <ul>
            <li><strong>Downpayment:</strong> A <strong>20% downpayment</strong> is required to confirm a booking. This secures your reservation.</li>
            <li><strong>Balance Payment:</strong> The remaining 80% balance is paid directly to the Host upon vehicle pickup/handover.</li>
            <li><strong>Security Deposit:</strong> Hosts may require a refundable security deposit. This is handled directly between the Host and Renter as per the Rental Agreement.</li>
          </ul>

          <h3>B. Cancellations and Refunds</h3>
          <ul>
            <li><strong>Renter Cancellation:</strong> Cancellations made more than 24 hours before the trip start time are eligible for a full refund of the downpayment. Cancellations within 24 hours are non-refundable.</li>
            <li><strong>Host Cancellation:</strong> If a Host cancels a confirmed booking, the Renter will receive a full refund, and the Host may be subject to penalties or account suspension.</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>4. Prohibited Activities</h2>
          <p>You agree NOT to use the Platform or rented vehicles for:</p>
          <ul>
            <li>Any illegal purpose or in violation of any local, state, or national law.</li>
            <li>Sub-leasing the vehicle to third parties.</li>
            <li>Racing, off-roading, or speed testing.</li>
            <li>Transporting passengers for hire (e.g., using the vehicle as a taxi or ride-share) unless explicitly authorized.</li>
            <li>Transporting flammable, poisonous, or otherwise hazardous materials.</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>5. Damage and Insurance</h2>
          <ul>
            <li><strong>Renter Liability:</strong> Renters are responsible for returning the vehicle in the same condition it was received. You are liable for any damage, theft, or loss occurring during the rental period.</li>
            <li><strong>Rental Contract:</strong> Every confirmed booking generates a legal Rental Contract. In the event of a dispute or accident, this contract serves as the binding agreement between Host and Renter.</li>
            <li><strong>Reporting:</strong> Any accident, damage, or theft must be reported to RentCycle and the relevant authorities immediately.</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, RentCycle shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. Our liability is limited to the amount of commission fees we have earned from the specific transaction giving rise to the claim.
          </p>
        </section>

        <section class="terms-section">
          <h2>7. Dispute Resolution</h2>
          <p>
            We encourage users to resolve disputes amicably through our <strong>Secure Chat</strong> system. If a resolution cannot be reached, RentCycle may act as a mediator based on the evidence provided (photos, chat logs, contracts), but we do not act as a judge or arbiter of law.
          </p>
        </section>

        <section class="terms-section">
          <h2>8. Contact Us</h2>
          <p>For any questions regarding these Terms, please contact us at:</p>
          <address class="contact-box">
            <strong>RentCycle, Inc.</strong><br>
            Email: <a href="mailto:rentcycleplatform@gmail.com">rentcycleplatform@gmail.com</a>
          </address>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermsOfServiceView',
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.terms-page {
  background-color: $background-light;
  min-height: 100vh;
  padding: 4rem 1rem;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
}

.terms-container {
  width: 100%;
  max-width: 800px;
  background: white;
  padding: 4rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 1.25rem;
  }
}

.terms-header {
  text-align: left;
  border-bottom: 1px solid $border-color-light;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: $text-color-dark;
  margin-bottom: 0.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.effective-date {
  color: $text-color-medium;
  font-style: italic;
  font-size: 0.95rem;
}

.terms-content {
  font-family: 'Nunito', sans-serif; // Assuming you use Nunito or similar body font
}

.terms-section {
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-color-dark;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid $background-light;

    @media (max-width: 768px) {
      font-size: 1.35rem;
    }
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: $primary-color;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  p {
    line-height: 1.7;
    color: $text-color-medium;
    margin-bottom: 1rem;
    font-size: 1rem;

    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }

  .alert-text {
    color: #dc3545; // Bootstrap danger color or generic red
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-top: 1rem;
  }

  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
      padding-left: 1.2rem;
    }

    li {
      margin-bottom: 0.75rem;
      line-height: 1.6;
      color: $text-color-medium;
      font-size: 1rem;

      @media (max-width: 480px) {
        font-size: 0.95rem;
      }

      strong {
        color: $text-color-dark;
      }
    }
  }
}

.contact-box {
  font-style: normal;
  line-height: 1.6;
  color: $text-color-medium;
  background: $background-light;
  padding: 1.5rem;
  border-radius: $border-radius-md;
  border: 1px solid $border-color-light;
  word-break: break-word;

  a {
    color: $primary-color;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>