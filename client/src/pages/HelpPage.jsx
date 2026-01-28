import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function HelpPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // ... (keeping other state/handlers unchanged)

  const faqs = [
    {
      q: 'Why am I getting a "Rate Limit" error?',
      a: 'To maintain high performance for everyone, we limit users to approximately 5 verifications per minute. If you hit this limit, simply wait 60 seconds and try again. Continued abuse may lead to a temporary block.'
    },
    {
      q: 'How accurate are the verdicts?',
      a: 'We use Google Gemini AI to analyze claims against evidence. While highly accurate for public facts (history, science, geography), the AI can occasionally misinterpret nuance or "hallucinate". Always check the provided sources (Wikipedia/Google links) to confirm.'
    },
    {
      q: 'I forgot my password. How do I reset it?',
      a: 'Go to the Login page and click "Forgot Password". Enter your registered email to receive a 6-digit OTP code, which will allow you to set a new password securely.'
    },
    {
      q: 'Why are some results "Instant" but others take seconds?',
      a: 'We use "Semantic Caching". If someone else has already verified a similar claim, we show you the result instantly from our database! If it\'s a new claim, our AI has to perform a deep fresh search, which takes 2-4 seconds.'
    },
    {
      q: 'Does it work with pre-recorded audio files?',
      a: 'Currently, LiveTruth focuses on live microphone input. File upload support is on our roadmap for v3.0.'
    },
    {
      q: 'Which browsers are supported?',
      a: 'We rely on the Web Speech API. Chrome, Edge, and Arc work best. Firefox and Safari have partial support but may experience interruptions.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show success message immediately (optimistic UI)
    setSubmitted(true);
    const formDataSnapshot = { ...contactForm };
    
    // Make API call in the background
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Success - keep the optimistic UI state
        // Clear form after delay
        setTimeout(() => {
          setContactForm({ name: '', email: '', message: '' });
          setSubmitted(false);
        }, 3000);
      } else {
        setSubmitted(false);
        alert(data.error || data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitted(false);
      alert('Failed to send message. Please check your connection and try again.');
    }
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-gray-400 text-lg">Support, FAQs, and Troubleshooting</p>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Common Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-400 border-t border-gray-700 pt-4 bg-gray-900/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            Contact Support
          </h2>

          {submitted ? (
            <div className="text-center py-12 border border-gray-700 rounded-xl bg-gray-900/50">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
              <p className="text-gray-400">Our support team will review your ticket shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issue / Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Send Message
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default HelpPage;
