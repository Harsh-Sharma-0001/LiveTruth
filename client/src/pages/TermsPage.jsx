import { Link } from 'react-router-dom';

function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-400">Last updated: January 8, 2025</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using LiveTruth, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              LiveTruth is a real-time fact-checking service that uses AI to verify claims in live speech. 
              The service provides probability-based insights and should not be considered as absolute truth. 
              Users are responsible for their own fact-checking and should verify information from multiple sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to use the service only for lawful purposes</li>
              <li>You will not attempt to gain unauthorized access to the service</li>
              <li>You understand that fact-checking results are probabilistic and may contain errors</li>
              <li>You will not use the service to spread misinformation or harm others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              LiveTruth provides fact-checking services "as is" without warranties of any kind. 
              We do not guarantee the accuracy, completeness, or reliability of any information provided. 
              LiveTruth shall not be liable for any indirect, incidental, special, or consequential damages 
              arising from the use of this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content, features, and functionality of LiveTruth are owned by LiveTruth and are protected 
              by international copyright, trademark, and other intellectual property laws. 
              You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Your use of LiveTruth is also governed by our Privacy Policy. Please review our Privacy Policy 
              to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Modifications to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              LiveTruth reserves the right to modify these terms at any time. We will notify users of any 
              significant changes. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our 
              <Link to="/help" className="text-blue-400 hover:text-blue-300"> Help & Support</Link> page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;
