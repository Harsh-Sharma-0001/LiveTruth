import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            About LiveTruth
          </h1>
          <p className="text-gray-400 text-lg">Real-Time Fact Checker for Live Speech</p>
        </div>

        {/* Mission */}
        <section className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            Our Mission
          </h2>
          <p className="text-gray-300 leading-relaxed">
            LiveTruth bridges the gap between speech and truth. In an era where misinformation spreads in real-time, 
            we believe truth should too. Our AI-powered system listens to live speech, detects factual claims, 
            and verifies them against trusted sources instantly.
          </p>
        </section>

        {/* How it Works */}
        <section className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { step: '1', title: 'Speech Capture', desc: 'Live speech is captured via your microphone' },
              { step: '2', title: 'Text Conversion', desc: 'Speech is converted to text in real-time using AI' },
              { step: '3', title: 'Claim Detection', desc: 'AI detects factual claims from the transcript' },
              { step: '4', title: 'Verification', desc: 'Claims are verified against trusted sources' },
              { step: '5', title: 'Results', desc: 'Credibility scores and explanations shown instantly' },
              { step: '6', title: 'Sources', desc: 'References provided for transparency' }
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            Technology Stack
          </h2>
          <div className="flex flex-wrap gap-3">
            {['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Gemini AI', 'Web Speech API', 'Tailwind CSS'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-gray-700 rounded-lg text-sm text-gray-300 border border-gray-600">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Version */}
        <div className="text-center text-gray-500 text-sm">
          <p>LiveTruth v1.0.0</p>
          <p className="mt-1">© 2025 LiveTruth. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}

export default AboutPage;
