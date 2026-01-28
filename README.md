# LiveTruth - Real-Time AI Fact Checker 🎙️✅

**LiveTruth** is a high-performance, real-time fact-checking application that listens to live audio, transcribes it, and instantly verifies claims using a hybrid AI architecture. It combines the speed of traditional search APIs with the reasoning power of modern LLMs (Gemini 2.5 Flash Lite) to provide accurate, source-backed verdicts.


<img width="954" height="599" alt="1" src="https://github.com/user-attachments/assets/428aa65f-df9d-4b95-967a-fe59b33c5a16" />
<img width="959" height="599" alt="2" src="https://github.com/user-attachments/assets/00c0f2a7-2e83-4d0b-af46-702878713738" />
<img width="959" height="599" alt="3" src="https://github.com/user-attachments/assets/4aa5e068-c87c-4116-86a8-d4f3ed9002e4" />
<img width="959" height="599" alt="4" src="https://github.com/user-attachments/assets/00af9cdc-b72c-482d-80f5-e6f20416b915" />
<img width="959" height="599" alt="5" src="https://github.com/user-attachments/assets/65469127-1979-402c-9f26-ed77597d0e5b" />
<img width="959" height="599" alt="6" src="https://github.com/user-attachments/assets/65592bad-264a-4300-bb5e-5413139c51e6" />
<img width="959" height="599" alt="7" src="https://github.com/user-attachments/assets/e77de10a-d47a-4f95-b472-1adf14713bad" />
<img width="959" height="599" alt="8" src="https://github.com/user-attachments/assets/fbe366ad-8635-4ce8-ac74-91c61e853bc7" />
<img width="959" height="599" alt="9" src="https://github.com/user-attachments/assets/80c2a174-1726-4d6f-a0fb-a4b347cab25d" />
<img width="959" height="599" alt="10" src="https://github.com/user-attachments/assets/40d99cb9-0131-4a0f-8b22-c80ba7db2997" />
<img width="958" height="599" alt="11" src="https://github.com/user-attachments/assets/aedfe9c8-c6d7-4e61-bdcc-1a5c370c21e3" />
<img width="959" height="599" alt="12" src="https://github.com/user-attachments/assets/25a90ba8-2249-43de-88f2-d0325c043660" />
<img width="959" height="599" alt="13" src="https://github.com/user-attachments/assets/90ab42ba-bf90-40ef-8011-c8763595826b" />
<img width="959" height="599" alt="14" src="https://github.com/user-attachments/assets/5f196516-f7c6-4fe9-b372-594c11caea26" />
<img width="959" height="599" alt="15" src="https://github.com/user-attachments/assets/e3086929-4932-42a2-a648-3d0c8ed309ae" />
<img width="959" height="599" alt="16" src="https://github.com/user-attachments/assets/fe2adcfc-92e3-4a56-b4e7-66d689d668c8" />
<img width="955" height="599" alt="17" src="https://github.com/user-attachments/assets/b572fda5-4003-4a2f-ae5a-8c20fd167f8c" />
<img width="959" height="599" alt="18" src="https://github.com/user-attachments/assets/93c75253-cf6b-4222-99d1-3ddc99e7c541" />
<img width="959" height="599" alt="19" src="https://github.com/user-attachments/assets/6bcb7fdd-2027-4e20-a919-e8bcf5b6b986" />
<img width="959" height="599" alt="20" src="https://github.com/user-attachments/assets/03b59fd8-712c-409f-a01b-9adafbc0d3f2" />


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
