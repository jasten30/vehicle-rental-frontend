<template>
  <div class="policy-page">
    <div class="policy-container">
      <header class="policy-header">
        <h1 class="page-title">Privacy Policy</h1>
        <p class="effective-date">Last Updated: {{ currentDate }}</p>
      </header>

      <div class="policy-content">
        <section class="policy-section">
          <p>
            At <strong>RentCycle, Inc.</strong> ("RentCycle," "we," "us," or "our"), we value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (the "Platform") to rent or list vehicles.
          </p>
          <p>
            By accessing or using RentCycle, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, information we collect automatically, and information from third-party sources.</p>

          <h3>A. Information You Provide</h3>
          <ul>
            <li><strong>Account Registration:</strong> Name, email address, phone number, and password.</li>
            <li><strong>Identity Verification (Trust & Safety):</strong> Government-issued ID (driver's license, passport), selfie photos, and date of birth. This is required for our "Approved to Drive" verification process.</li>
            <li><strong>Vehicle Information (Hosts):</strong> Vehicle make, model, year, VIN (Vehicle Identification Number), license plate number, insurance documentation, and photos of the vehicle.</li>
            <li><strong>Payment Information:</strong> Mobile wallet details (GCash, PayMaya) or bank account information. Note: We do not store your full payment credentials; transactions are processed by our secure third-party payment gateways.</li>
            <li><strong>Communications:</strong> The content of messages sent through our in-app secure chat system.</li>
          </ul>

          <h3>B. Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Log files, access times, pages viewed, and your IP address.</li>
            <li><strong>Transaction Data:</strong> Details about trips, dates, times, and amounts charged.</li>
            <li><strong>QR Code Verification:</strong> We log the timestamp and location when you scan a QR code to start or end a trip for security purposes.</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li><strong>To Provide Services:</strong> Facilitating vehicle bookings, processing the 20% downpayment, and generating Rental Contracts.</li>
            <li><strong>Trust & Safety:</strong> Verifying your identity, conducting the "Approved to Drive" background checks, and preventing fraud.</li>
            <li><strong>Communication:</strong> Sending booking confirmations, support messages, and dispute resolution via our logged chat system.</li>
            <li><strong>Legal Compliance:</strong> Generating the PDF Rental Agreement for every trip to ensure both Host and Renter are legally protected.</li>
            <li><strong>Platform Improvement:</strong> Analyzing usage trends to improve the user experience.</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Sharing of Your Information</h2>
          <p>We do not sell your personal data. We share information only in the following circumstances:</p>
          <ul>
            <li><strong>Between Users:</strong> Once a booking is confirmed, we share necessary details (e.g., Renter's name and license status to the Host; Host's name and vehicle location to the Renter).</li>
            <li><strong>Service Providers:</strong> With third-party vendors for payment processing (e.g., GCash, PayMaya), identity verification, and cloud hosting.</li>
            <li><strong>Legal Requirements:</strong> If required by law, court order, or to protect the rights and safety of RentCycle, our users, or others (e.g., in the event of a vehicle theft or accident).</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>4. Data Security</h2>
          <p>
            We implement "Secure by Design" principles. We use administrative, technical, and physical security measures to help protect your personal information. These measures include:
          </p>
          <ul>
            <li>Encryption of sensitive data in transit and at rest.</li>
            <li>Secure in-app messaging logs to prevent "he said, she said" disputes.</li>
            <li>Two-step payment verification to prevent financial fraud.</li>
          </ul>
          <p>While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
        </section>

        <section class="policy-section">
          <h2>5. Your Data Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your data:</p>
          <ul>
            <li>The right to access the personal data we hold about you.</li>
            <li>The right to request correction of inaccurate data.</li>
            <li>The right to request deletion of your account and data (subject to legal retention requirements for transaction records).</li>
          </ul>
          <p>To exercise these rights, please contact us at rentcycleplatform@gmail.com.</p>
        </section>

        <section class="policy-section">
          <h2>6. Third-Party Websites</h2>
          <p>The Platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those third-party sites.</p>
        </section>

        <section class="policy-section">
          <h2>7. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
          <address class="contact-box">
            <strong>RentCycle, Inc.</strong><br>
            Attn: Privacy Officer<br>
            Email: <a href="mailto:rentcycleplatform@gmail.com">rentcycleplatform@gmail.com</a>
          </address>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicyView',
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

.policy-page {
  background-color: $background-light;
  min-height: 100vh;
  padding: 4rem 1rem;
  display: flex;
  justify-content: center;

  // Mobile padding adjustment
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
}

.policy-container {
  width: 100%;
  max-width: 800px;
  background: white;
  padding: 4rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;

  // Tablet/Mobile padding adjustment
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1.25rem;
  }
}

.policy-header {
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

  // Responsive font size
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

.policy-section {
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

  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
      padding-left: 1.2rem; // Save space on small screens
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
  
  // Ensure long emails don't break layout on mobile
  word-break: break-word; 
  overflow-wrap: break-word;

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