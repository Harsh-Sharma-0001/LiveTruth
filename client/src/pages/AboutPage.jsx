import { Link, useNavigate } from 'react-router-dom';

function AboutPage() {
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
              aria-label="Go back">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
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
          </div>
          {/* Empty right side spacer to maintain flex layout if needed, or just remove */}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            About LiveTruth
          </h1>
          <p className="text-gray-400 text-lg">Next-Gen AI Fact Checking for the Real-Time Web</p>
        </div>

        {/* Mission */}
        <section className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700 shadow-lg">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
               <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <div>
                <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
                <p className="text-gray-300 leading-relaxed">
                  In an age of rapid information flow, truth often gets left behind. LiveTruth was built to bridge that gap. 
                  By combining <strong>Cognitive AI</strong> with <strong>Instant Semantic Search</strong>, we empower users to verify 
                  claims the moment they are spoken—democratizing access to accurate information during debates, news, and daily life.
                </p>
             </div>
          </div>
        </section>

        {/* The Pipeline */}
        <section className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3">
            <span className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </span>
            The Intelligence Pipeline
          </h2>
          
          <div className="space-y-6 relative">
             <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-700"></div>
            {[
              { 
                step: '1', 
                title: 'Capture & Transcribe', 
                desc: 'Your browser captures audio and converts it to text instantly using the Web Speech API.' 
              },
              { 
                step: '2', 
                title: 'Claim Extraction', 
                desc: 'Our AI filters out noise and identifies factual statements ("The GDP grew by 5%").' 
              },
              { 
                step: '3', 
                title: 'Semantic Cache Check', 
                desc: 'We check MongoDB Vector Database. If this claim was verified recently (even with different wording), we return the cached result instantly.' 
              },
              { 
                step: '4', 
                title: 'Deep Verification', 
                desc: 'If new, our Queue System (BullMQ) dispatches workers to cross-reference Google Search & Wikipedia.' 
              },
              { 
                step: '5', 
                title: 'Cognitive Synthesis', 
                desc: 'Google Gemini AI evaluates the evidence for Entailment, Contradiction, or Neutrality to form a verdict.' 
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-6 relative z-10">
                <div className="w-14 h-14 bg-gray-900 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-400 font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex-shrink-0">
                  {item.step}
                </div>
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600 flex-1">
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
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
            Built With Modern Tech
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { name: 'Gemini 1.5 Lite', role: 'Cognitive Engine' },
                { name: 'Redis + BullMQ', role: 'Async Queue' },
                { name: 'MongoDB Atlas', role: 'Vector Search' },
                { name: 'Socket.IO', role: 'Real-Time Stream' },
                { name: 'Google OAuth', role: 'Secure Auth' },
                { name: 'Compromise', role: 'NLP Tokenizer' },
                { name: 'React + Vite', role: 'Frontend Core' },
                { name: 'TailwindCSS', role: 'UI System' }
            ].map((tech) => (
              <div key={tech.name} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 text-center hover:border-purple-500 transition-colors">
                <div className="font-bold text-white text-sm">{tech.name}</div>
                <div className="text-xs text-gray-400 mt-1">{tech.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-8">
          <p className="font-mono">Current Build: v2.1.0-stable</p>
          <p className="mt-2">Designed for the Future of Truth.</p>
          <p>© 2026 LiveTruth. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}

export default AboutPage;
