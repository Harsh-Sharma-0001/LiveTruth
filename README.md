# LiveTruth - Real-Time AI Fact Checker 🎙️✅

**LiveTruth** is a high-performance, real-time fact-checking application that listens to live audio, transcribes it, and instantly verifies claims using a hybrid AI architecture. It combines the speed of traditional search APIs with the reasoning power of modern LLMs (Gemini 2.5 Flash Lite) to provide accurate, source-backed verdicts.

![LiveTruth Dashboard](./screenshots/dashboard-preview.png)

## 🚀 Key Features

### 🌟 Core Functionality
*   **Real-Time Audio Transcription**: Uses the Web Speech API for instant speech-to-text conversion.
*   **Live Fact-Checking**: Automatically detects factual claims and verifies them against authoritative sources (Google & Wikipedia) within seconds.
*   **Hybrid AI Architecture**:
    *   **Evidence Retrieval**: Fetches real-time data from Google Search API and Wikipedia API.
    *   **NLI (Natural Language Inference)**: Uses **Gemini 2.5 Flash Lite** to logically determine if evidence entails or contradicts the claim.
*   **Smart Caching (Semantic Search)**: Uses Vector Embeddings (Transformers.js) + MongoDB to cache verified claims. If a user says something similar to a previously checked fact, it returns the result instantly (0 API cost).
*   **Rate Limit Protection**: 
    *   **Circuit Breaker**: Auto-switches to "Source-Only Mode" (Link Only) if Gemini API limits are hit, ensuring the app never crashes.
    *   **Exact Match Bypass**: Instantly verifies claims if they match authoritative text exactly, skipping expensive AI calls.

### 🎨 User Experience
*   **Interactive Dashboard**: Real-time ticker feed of verified claims, similar to a live chat.
*   **Trust Analytics**: Visual "Credibility Meter" scoring the session's truthfulness.
*   **Dual Theme**: Fully supported Light ☀️ and Dark 🌙 modes, including a custom "Bluish-Gray" dark theme.
*   **Export Reports**: Generate detailed PDF/CSV reports of fact-checking sessions.

### 🔒 Security & User System
*   **OAuth Authentication**: Secure login via Google and GitHub.
*   **Session Management**: History tracking for all past fact-check sessions.

---

## 🛠️ Tech Stack

### **Frontend (Client)**
*   **Framework**: React.js (Vite)
*   **Styling**: TailwindCSS (Custom Design System)
*   **Real-Time Comms**: Socket.io-client
*   **Visualization**: Recharts (Analytics Graphs)
*   **State Management**: React Hooks (useContext, useReducer)
*   **HTTP**: Axios

### **Backend (Server)**
*   **Runtime**: Node.js (Express)
*   **Database**: 
    *   **MongoDB** (Primary Data Store)
    *   **Redis** (Job Queue & Caching - with In-Memory Fallback)
*   **AI & ML**:
    *   **Google Gemini API** (Model: `gemini-2.5-flash-lite`)
    *   **@xenova/transformers** (Local Embedding Generation)
    *   **Compromise / Natural** (NLP for claim detection)
*   **External APIs**:
    *   **Google Custom Search JSON API** (Evidence)
    *   **Wikipedia MediaWiki API** (Evidence)
*   **Queue System**: BullMQ (Async Background Processing)
*   **Auth**: Passport.js (Google/GitHub Strategies)

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   (Optional) Redis (for production-grade queuing)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/livetruth.git
cd livetruth
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in `/server` with the following keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/livetruth
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
SESSION_SECRET=your_secure_random_string

# AI & APIs
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_gcs_key
GOOGLE_SEARCH_ENGINE_ID=your_cse_id

# Email (Optional)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
DEVELOPER_EMAIL=admin_email@example.com
```

### 3. Setup Frontend
```bash
cd client
npm install
```

### 4. Run the Application
Open two terminals:

**Terminal 1 (Backend)**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to start using LiveTruth!

---

## 🧠 System Architecture: "The Fact-Checking Pipeline"

1.  **Ingestion**: Audio is transcribed to text in the browser.
2.  **Detection**: The text is sent via Socket.io to the server, where `mlService.js` uses NLP to split it into specific factual claims.
3.  **Optimization Check**:
    *   Checks **Redis/Memory Cache** for exact recent matches.
    *   Checks **MongoDB Vector Store** for semantic matches (e.g., "Sky is blue" matching "The sky is blue color").
4.  **Evidence Retrieval**:
    *   If no cache hit, it queries **Google Search** and **Wikipedia** in parallel.
5.  **Verification (NLI)**:
    *   The claim + evidence are sent to **Gemini 2.5 Flash Lite**.
    *   Gemini determines if the evidence supports (`Entailment`) or refutes (`Contradiction`) the claim.
6.  **Response**: The system calculates a verdict (TRUE/FALSE/MIXED) and streams it back to the frontend in real-time.

---

## 🛡️ License

This project is licensed under the MIT License - feel free to build upon it!

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

- **Email**: panditharshsharma34@gmail.com

---

**Made with ❤️ by me**

**LiveTruth** — Truth at the speed of speech 🚀