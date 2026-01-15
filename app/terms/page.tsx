import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
          <h1>Terms of Use</h1>
          <p>Last updated: May 3, 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using MoodGPT, you agree to be bound by these Terms of Use. If you do not agree to these
            terms, please do not use our service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            MoodGPT provides a platform for users to interact with AI chatbots with different personalities and moods.
            The service is provided "as is" and may change without notice.
          </p>

          <h2>3. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Collect or store personal data about other users without their consent</li>
            <li>Use the service to generate harmful, abusive, or unethical content</li>
          </ul>

          <h2>4. Content</h2>
          <p>
            You retain ownership of any content you submit to MoodGPT. However, by submitting content, you grant MoodGPT
            a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection
            with providing and improving the service.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            MoodGPT and its original content, features, and functionality are owned by MoodGPT and are protected by
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your access to the service immediately, without prior notice, for conduct that
            we believe violates these Terms of Use or is harmful to other users, us, or third parties.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            The service is provided "as is" without warranties of any kind, either express or implied. We do not warrant
            that the service will be uninterrupted or error-free.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            MoodGPT shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            resulting from your use of or inability to use the service.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of significant changes by
            posting the new Terms of Use on this page.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the jurisdiction in which MoodGPT is established, without
            regard to its conflict of law provisions.
          </p>

          <h2>11. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@moodgpt.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
