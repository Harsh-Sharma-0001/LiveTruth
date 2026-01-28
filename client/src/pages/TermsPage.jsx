import { Link, useNavigate } from 'react-router-dom';

function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1f2e] dark:bg-black text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
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
          </div>
          {/* Empty right side */}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-400">Last updated: January 27, 2026</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By creating an account or using LiveTruth, you agree to be bound by these Terms of Service. 
              The platform utilizes advanced AI technologies (Google Gemini) and real-time processing to provide fact-checking services. 
              If you do not agree to these terms, you may not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">2. Service Description & AI Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              LiveTruth is an AI-powered real-time fact-checking assistant. Our system processes live audio, converts it to text, 
              and verifies claims against public sources (Google, Wikipedia) using NLP models.
            </p>
            <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-yellow-500">
              <strong className="text-white block mb-2">Important Disclaimer:</strong>
              <p className="text-gray-400 text-sm">
                AI Fact-Checking is probabilistic, not absolute. While we strive for high accuracy using semantic search and entailment models, 
                the system may occasionally generate incorrect verdicts ("hallucinations") or miss context. 
                LiveTruth should be used as an assistive tool, not the sole arbiter of truth.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">3. Fair Usage & Rate Limits</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              To ensure system stability and fair access for all users, we enforce the following usage limits:
            </p>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside bg-gray-900/50 p-4 rounded-lg">
              <li><strong className="text-white">Active Verification Limit:</strong> Users are limited to approximately <span className="text-cyan-400">5 verifications per minute</span>.</li>
              <li><strong className="text-white">Socket Connections:</strong> Only one active real-time socket connection is allowed per user session.</li>
              <li><strong className="text-white">Abuse:</strong> Automated scripts, bots, or any attempt to bypass rate limits will result in immediate account suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">4. User Accounts & Security</h2>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for maintaining the security of your account. We offer:
            </p>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside mt-2">
              <li><strong>OAuth Sign-in:</strong> Secure login via Google and GitHub.</li>
              <li><strong>Email/Password:</strong> Secured with standard hashing (bcrypt).</li>
              <li><strong>Password Reset:</strong> Available via OTP sent to your registered email.</li>
            </ul>
            <p className="text-gray-300 mt-2">
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">5. Data Processing</h2>
            <p className="text-gray-300 leading-relaxed">
              LiveTruth processes audio in real-time. We utilize <strong>Semantic Caching</strong> (Vector Database) to store 
              anonymized factual claims to improve performance and reduce carbon footprint. 
              Personal speech unrelated to factual claims is discarded after processing. 
              See our Privacy Policy for full details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">6. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              The service is provided "AS IS". LiveTruth and its creators are not liable for any damages 
              arising from reliance on the fact-checking results, system downtime (Redis/Queue failures), 
              or inaccuracies in AI-generated explanations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">7. Modifications</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to update the algorithm, sources, or these terms at any time. 
              Continued use of the 'real-time' feature constitutes acceptance of these changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">8. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions regarding these terms should be directed to our 
              <Link to="/help" className="text-blue-400 hover:text-blue-300 ml-1">Support Team</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;
