import { Link, useNavigate } from 'react-router-dom';

function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: January 27, 2026</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">1. Information Collection</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Transparency is core to LiveTruth. We collect the following types of data:
            </p>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside bg-gray-900/30 p-4 rounded-lg">
              <li><strong>Identity Data:</strong> Name, Email, and Profile Picture (via Google/GitHub OAuth or direct registration).</li>
              <li><strong>Audio Data:</strong> Live speech is processed ephemerally. We <em>do not</em> persistently store raw audio files.</li>
              <li><strong>Factual Claims:</strong> Extracted factual statements are converted into "Vector Embeddings" and stored in our databases to enable semantic caching and improve load times.</li>
              <li><strong>Usage Analytics:</strong> Number of sessions, average credibility scores, and feature usage stats.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">2. How We Use Your Data</h2>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>Real-Time Verification:</strong> Analyzing speech to provide immediate true/false/mixed verdicts.</li>
              <li><strong>Semantic Caching:</strong> We store checked claims anonymously. If User A matches a claim User B checked, we serve the cached result to save energy and time.</li>
              <li><strong>Account Security:</strong> Managing authentication via JWT (JSON Web Tokens) and OTPs for password resets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">3. Third-Party Processors</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              To deliver our service, we securely share minimal data with trusted infrastructure providers:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Google Gemini AI</h3>
                <p className="text-sm text-gray-400">Processes text segments for Natural Language Inference (NLI).</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Web Speech API</h3>
                <p className="text-sm text-gray-400">Your browser's native engine handles the Speech-to-Text conversion locally or via vendor clouds.</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Google Custom Search</h3>
                <p className="text-sm text-gray-400">Retrieves real-time evidence for claims.</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">MongoDB & Redis</h3>
                <p className="text-sm text-gray-400">Secure storage for user profiles, claim vectors, and processing queues.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We employ industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li><strong>Encryption:</strong> Data in transit is encrypted via SSL/TLS. Passwords are hashed using bcrypt.</li>
              <li><strong>Access Control:</strong> Internal access to data is strictly limited.</li>
              <li><strong>Ephemeral Processing:</strong> Raw audio is discarded immediately after claim extraction.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">5. Cookies & Local Storage</h2>
            <p className="text-gray-300 leading-relaxed">
              We use <strong>Local Storage</strong> and <strong>Session Cookies</strong> primarily for authentication (keeping you logged in) 
              and user preferences (e.g., dark mode, language settings). We do not use third-party tracking cookies for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You have the right to request:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2">
              <li>Deletion of your account and all associated personal data.</li>
              <li>A copy of your verification history.</li>
              <li>Correction of inaccurate personal details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">7. Updates to Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              As we add features (like new AI models or social sharing), this policy may evolve. 
              Significant changes will be communicated via email or platform notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-green-400">8. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              For privacy concerns or data deletion requests, please visit our 
              <Link to="/help" className="text-green-400 hover:text-green-300 ml-1">Help Center </Link> 
              or email trusted - livetruth.buisness@gmail.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPage;
