import { Link } from 'react-router-dom';

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v18M8 8v8M16 6v12M4 11v2M20 9v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              LiveTruth
            </span>
          </Link>
          <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: January 8, 2025</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>Account information (name, email address) when you register</li>
              <li>Speech transcripts when you use the fact-checking feature</li>
              <li>Session data and fact-checking results (if auto-save is enabled)</li>
              <li>Contact information when you reach out to us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>Provide, maintain, and improve our fact-checking services</li>
              <li>Process and verify claims in real-time</li>
              <li>Send you important updates and notifications (if enabled)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. 
              By default, speech transcripts are processed in real-time and not permanently stored. 
              If you enable "Auto-save Sessions", your session data will be stored locally in your browser. 
              We do not share your personal information with third parties except as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              LiveTruth uses third-party services including Google Gemini AI, Google Custom Search API, 
              and Wikipedia API for fact-checking. These services may process your queries, but we do not 
              share your personal information with them beyond what is necessary for the service to function.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>Access and update your account information</li>
              <li>Delete your account and associated data</li>
              <li>Export your session data</li>
              <li>Opt-out of notifications</li>
              <li>Request information about how we use your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use local storage to remember your preferences and session data. 
              We do not use tracking cookies or third-party analytics that identify you personally.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              LiveTruth is not intended for users under the age of 13. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information 
              from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our 
              <Link to="/help" className="text-blue-400 hover:text-blue-300"> Help & Support</Link> page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPage;
