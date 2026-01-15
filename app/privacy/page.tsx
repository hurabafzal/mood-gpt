import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p>Last updated: May 3, 2025</p>

          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how MoodGPT collects, uses, and discloses information about you when you use
            our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          <h3>2.1 Information Collected Automatically</h3>
          <ul>
            <li>Usage information (features used, actions taken)</li>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against fraud and abuse</li>
            <li>Personalize your experience</li>
            <li>Analyze how users interact with our services</li>
          </ul>

          <h2>4. How We Share Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Service providers who perform services on our behalf</li>
            <li>Business partners with your consent</li>
            <li>Legal authorities when required by law</li>
            <li>In connection with a merger, sale, or acquisition</li>
          </ul>

          <h2>5. Your Choices</h2>
          <p>You have several choices regarding your information:</p>
          <ul>
            <li>Opt out of marketing communications</li>
            <li>Object to certain processing of your data</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information. However, no method of transmission
            over the internet is 100% secure.
          </p>

          <h2>7. Children's Privacy</h2>
          <p>Our services are not intended for children under 13, and we do not knowingly collect data from them.</p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own, which may have
            different data protection laws.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            policy on this page.
          </p>

          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at privacy@moodgpt.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
