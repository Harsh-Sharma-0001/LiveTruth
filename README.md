# LiveTruth — Real-Time Fact Checker for LIVE Speech

> Turning live speech into verified truth — instantly.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

## 🌟 Overview

LiveTruth is a real-time AI-powered fact-checking system designed to verify spoken information instantly. It listens to live speech, converts it into text, detects factual claims, and verifies them against trusted sources using machine learning and natural language processing. The system provides real-time credibility scores, source verification, and detailed analytics.

## ✨ Key Features

### Core Functionality
- **🎤 Live Speech Recognition** - Real-time microphone input with continuous speech-to-text conversion
- **🔍 Automatic Claim Detection** - NLP-based claim extraction with entity recognition
- **✅ AI-Powered Fact Verification** - Multi-source verification using Gemini AI, Google Search, and Wikipedia
- **📊 Real-Time Dashboard** - Live transcript with highlighted claims, credibility meter, and statistics
- **📈 Session Analytics** - Track credibility scores, claim statistics, and session history
- **💾 Session Management** - Auto-save sessions, export/import functionality, and user-specific data

### User Experience
- **🌓 Dark Mode** - Toggle between light and dark themes
- **👤 User Authentication** - Sign in/register with email, Google, or GitHub
- **📧 Email Services** - OTP for password reset, contact forms, and welcome emails
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🔔 Browser Notifications** - Get notified about important updates

## 🏗️ System Architecture

### **System Type**: Full-Stack Web Application (Client-Server Architecture)
- **Frontend**: React SPA with real-time WebSocket communication
- **Backend**: Node.js/Express server with Socket.IO
- **Database**: MongoDB (optional - works with localStorage fallback)
- **Communication**: REST API + WebSocket (Socket.IO)

### **High-Level Flow**
```
User Speech (Microphone)
    ↓
Web Speech API (Browser)
    ↓
Real-time Transcript
    ↓
WebSocket → Backend Server
    ↓
Claim Detection (NLP)
    ↓
Claim Canonicalization
    ↓
Evidence Retrieval (Wikipedia)
    ↓
NLI Verification (Gemini AI)
    ↓
Verdict + Confidence Score
    ↓
WebSocket → Frontend
    ↓
Live Dashboard Update
```

## 🛠️ Tech Stack

### **Frontend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework with hooks |
| Vite | 5.0 | Build tool and dev server |
| Tailwind CSS | 3.3 | Utility-first CSS framework |
| React Router DOM | 7.12 | Client-side routing |
| Socket.IO Client | 4.6 | Real-time WebSocket communication |
| Recharts | 2.10 | Data visualization |
| Axios | 1.6.2 | HTTP client |
| Web Speech API | Native | Browser speech recognition |

### **Backend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ES Modules | JavaScript runtime |
| Express | 4.18 | Web application framework |
| Socket.IO | 4.6 | Real-time bidirectional communication |
| MongoDB | - | Database |
| Mongoose | 8.0 | MongoDB ODM |
| Nodemailer | 7.0 | Email sending service |
| Passport | 0.7.0 | Authentication middleware |
| JWT | 9.0.3 | Token-based authentication |

### **AI & ML Services**
| Service | Purpose |
|---------|---------|
| Google Gemini API | Primary AI for NLI (Natural Language Inference) |
| Wikipedia API (MediaWiki) | Evidence retrieval |
| Natural (6.10) | NLP library for text processing |
| Compromise (14.12) | Entity extraction and text analysis |


## 🧠 AI/ML Pipeline

### **NLP Processing**

1. **Claim Detection** (Rule-based + NLP)
   - Sentence segmentation
   - "and" splitting for compound statements
   - Question filtering
   - Greeting filtering

2. **Claim Canonicalization** (Pattern matching)
   - Subject-Relation-Object extraction
   - Temporal analysis (past/present/future)
   - Entity recognition

3. **Evidence Retrieval** (Wikipedia API)
   - Entity-based search
   - Full paragraph extraction (10 sentences)
   - Multi-level fallback strategy

4. **Natural Language Inference** (Gemini AI)
   - ENTAILMENT: Evidence proves claim TRUE
   - CONTRADICTION: Evidence proves claim FALSE
   - NEUTRAL: Evidence unrelated or inconclusive

5. **Fallback Mechanisms**
   - Keyword-based fact checking (obvious facts)
   - Evidence text inference (term matching)
   - Default to "mixed" verdict

### **Credibility Score Algorithm**

```javascript
// Raw score calculation
rawScore = (trueCount * 1.0 + mixedCount * 0.5 - falseCount * 1.0) / totalClaims

// Normalization to 0-100
credibilityScore = ((rawScore + 1) / 2) * 100

// Examples:
// All true: (5*1.0 + 0*0.5 - 0*1.0) / 5 = 1.0 → 100%
// All false: (0*1.0 + 0*0.5 - 5*1.0) / 5 = -1.0 → 0%
// Mixed: (2*1.0 + 2*0.5 - 1*1.0) / 5 = 0.4 → 70%


## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or cloud) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended)
- **Google Gemini API Key** (recommended) - [Get API Key](https://makersuite.google.com/app/apikey)
- **Gmail Account** (optional) - For email services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LiveTruth
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This installs dependencies for root, server, and client.

3. **Set up environment variables**

   Create `server/.env` file:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/livetruth
   
   # Gemini API (RECOMMENDED - Fast and accurate fact-checking)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Google Custom Search APIs (Optional - for additional web search)
   GOOGLE_API_KEY=your_google_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   
   # Gmail SMTP Configuration (Optional - for email services)
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   FROM_NAME=LiveTruth
   DEVELOPER_EMAIL=your_email@gmail.com
   ```

   Create `client/.env` file:
   ```env
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```
   Or use MongoDB Atlas cloud database (recommended).

5. **Run the application**
   ```bash
   npm run dev
   ```
   This starts:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:5173`

6. **Open your browser**
   Navigate to `http://localhost:5173` and start fact-checking!

## 📖 Configuration Guide

### Google Gemini API Setup (Recommended)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to `server/.env`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

**Note:** The app works without Gemini API (uses fallback methods), but Gemini provides the fastest and most accurate fact-checking.

### Google Custom Search API Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Custom Search API"
4. Create credentials (API Key)
5. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
6. Create a new search engine
7. Add your API key and Search Engine ID to `server/.env`:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```

**API Quota:** Free tier includes 100 queries per day. The system automatically falls back to Wikipedia if quota is exceeded.

## 📧 Email Services

### **Nodemailer Configuration**

**Gmail SMTP**
- Service: Gmail
- Port: 587 (TLS)
- Authentication: App Password (16 characters)

### **Email Types**

1. **OTP Email** (Password Reset)
   - 6-digit OTP
   - 10-minute expiration
   - HTML template with gradient header

2. **Contact Form Email** (to Developer)
   - User name, email, message
   - Formatted HTML template

3. **Welcome Email** (Registration)
   - Greeting with user name
   - Getting started guide

4. **Update `server/.env`**
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   FROM_NAME=LiveTruth
   DEVELOPER_EMAIL=your_email@gmail.com
   ```

**Important:** Use the 16-character app password (remove all spaces). Do NOT use your regular Gmail password.

### MongoDB Setup

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/livetruth
   ```

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Use default connection string in `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/livetruth
   ```

**Note:** The app works without MongoDB (uses localStorage), but MongoDB enables persistent storage across sessions.

## 📱 Usage

### Basic Usage

1. **Open the application** in your browser (Chrome, Edge, or Safari recommended)
2. **Sign in/Register** (or continue as guest)
3. **Click "Start Listening"** to begin speech recognition
4. **Allow microphone access** when prompted
5. **Speak clearly** into your microphone
6. **Watch real-time fact-checking**:
   - Transcript appears in real-time
   - Claims are automatically detected and highlighted
   - Verification results appear instantly
   - Sources are displayed for each claim
   - Credibility score updates in real-time

### Features Overview

- **Live Transcript** - See your speech converted to text in real-time
- **Claim Highlighting** - Claims are underlined with colors:
  - 🟢 **Green** - True claims
  - 🟡 **Yellow** - Mixed/Unverified claims
  - 🔴 **Red** - False claims
- **Session Analytics** - View credibility score, claim statistics, and session duration
- **Source Feed** - See verification sources with clickable links
- **My Sessions** - View and manage your saved sessions
- **Analytics** - Track your fact-checking history and trends
- **Export/Import** - Export sessions as JSON or import previous sessions

## 🔧 API Endpoints

### **REST API**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/claims` | Get all claims |
| GET | `/api/claims/:id` | Get specific claim |
| POST | `/api/claims` | Create new claim |
| GET | `/api/claims/stats/summary` | Get statistics summary |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and reset password |
| GET | `/api/auth/me` | Get current user from JWT |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/github` | Initiate GitHub OAuth |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |
| GET | `/api/oauth/status` | Check OAuth configuration |
| POST | `/api/contact` | Send contact form message |

### **WebSocket Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connect` | Server → Client | - | Connection established |
| `disconnect` | Server → Client | - | Connection closed |
| `transcript` | Client → Server | `{text, isFinal}` | Send transcript chunk |
| `claims-verified` | Server → Client | `{transcript, claims, timestamp}` | Verified claims results |
| `claim-processing` | Server → Client | `{claims}` | Claims being processed |
| `verify-claim` | Client → Server | `{claim}` | Manual claim verification |
| `claim-result` | Server → Client | `{claim, verdict, confidence, sources}` | Manual verification result |
| `live-update` | Server → All Clients | `{transcript, claims}` | Broadcast updates |
| [error](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/components/Header.jsx#148-153) | Server → Client | `{message}` | Error notification |


### WebSocket Events

- `transcript` - Send transcript chunk to server
- `claims-verified` - Receive verified claims from server
- `verify-claim` - Manually verify a claim
- `live-update` - Broadcast updates to all connected clients

## 📁 Project Structure

```
LiveTruth/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Header.jsx           # Navigation, controls, settings
│   │   │   ├── LiveTranscript.jsx   # Real-time transcript display
│   │   │   ├── SessionAnalytics.jsx # Credibility score & stats
│   │   │   ├── SourceFeed.jsx       # Verification sources
│   │   │   ├── ProtectedRoute.jsx   # Auth-based routing
│   │   │   └── ViewAllModal.jsx     # Modal for viewing sources
│   │   ├── pages/                   # Page components
│   │   │   ├── AboutPage.jsx
│   │   │   ├── AuthPage.jsx         # Login/Register
│   │   │   ├── HelpPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SessionsPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ExportPage.jsx
│   │   │   ├── OAuthCallback.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   └── PrivacyPage.jsx
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point with routing
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                          # Node.js Backend
│   ├── models/                      # MongoDB schemas
│   │   └── Claim.js                 # Claim model
│   ├── routes/                      # API routes
│   │   ├── auth.js                  # Authentication (OTP, JWT)
│   │   ├── claims.js                # Claims CRUD
│   │   ├── contact.js               # Contact form
│   │   └── oauth.js                 # OAuth (Google, GitHub)
│   ├── services/                    # Business logic
│   │   ├── mlService.js             # Core ML & fact-checking
│   │   ├── geminiService.js         # Gemini AI integration
│   │   ├── wikipediaService.js      # Wikipedia API
│   │   ├── semanticSimilarity.js    # Text similarity
│   │   ├── claimNormalizer.js       # Claim normalization
│   │   ├── claimCanonicalizer.js    # Claim canonicalization
│   │   └── emailService.js          # Email sending
│   ├── socket/                      # WebSocket handlers
│   │   └── socketHandler.js         # Socket.IO event handlers
│   ├── utils/                       # Utilities
│   │   └── jwt.js                   # JWT token generation
│   ├── scripts/                     # Helper scripts
│   │   └── verify-oauth.js          # OAuth verification
│   ├── index.js                     # Server entry point
│   ├── package.json
│   └── .env                         # Environment variables
│
├── package.json                     # Root package.json
├── README.md                        # Documentation
├── LICENSE
├── .gitignore                       # Git ignore

```


## 🔄 Core Logic Flow

### **1. Speech Recognition Flow**

**Component**: [Header.jsx](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/components/Header.jsx)
```
User clicks "Start Listening"
    ↓
Initialize Web Speech API (SpeechRecognition)
    ↓
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'
    ↓
recognition.onresult → Extract transcript
    ↓
Separate interim vs final results
    ↓
Call onTranscript(text, isFinal)
```

### **2. Transcript Processing Flow**

**Component**: [App.jsx](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/App.jsx) → [handleTranscript()](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/App.jsx#336-368)
```
Receive transcript from Header
    ↓
If FINAL:
    - Append to accumulated transcript
    - Update state with full transcript
    - Emit 'transcript' event via Socket.IO
    ↓
If INTERIM:
    - Show accumulated + current interim
    - Don't send to server yet
```

### **3. Claim Detection & Verification Flow**

**Server**: [socketHandler.js](file:///c:/Users/Dell/Desktop/LiveTruth/server/socket/socketHandler.js) → [mlService.js](file:///c:/Users/Dell/Desktop/LiveTruth/server/services/mlService.js)

#### **Step 1: Claim Detection** ([detectClaims()](file:///c:/Users/Dell/Desktop/LiveTruth/server/services/mlService.js#7-45))
```javascript
Input: Full transcript text
    ↓
Split by punctuation (. ! ?)
    ↓
Further split by "and" (independent statements)
    ↓
Filter out:
    - Questions (ends with ?)
    - Greetings (hi, hello, thanks)
    ↓
Output: Array of claim objects [{text: "..."}]
```

#### **Step 2: Claim Canonicalization** ([canonicalizeClaim()](file:///c:/Users/Dell/Desktop/LiveTruth/server/services/claimCanonicalizer.js#6-151))
```javascript
Input: Claim text
    ↓
Extract structured form:
    - Subject (who/what)
    - Relation (verb/action)
    - Object (target)
    - Time (past/present/future/timeless)
    ↓
Pattern matching:
    - "X is the Y of Z" → {subject: X, relation: Y, object: Z}
    - "X revolves around Y" → {subject: X, relation: "orbits", object: Y}
    - "X is in Y" → {subject: X, relation: "located_in", object: Y}
    ↓
Output: Canonical claim object
```

#### **Step 3: Personal Claim Gate** ([isPersonalClaim()](file:///c:/Users/Dell/Desktop/LiveTruth/server/services/claimCanonicalizer.js#152-193))
```javascript
Check for:
    - First person indicators (I am, I think, my...)
    - Opinion indicators (I believe, I feel...)
    - Personal relationships (my friend, my family...)
    ↓
If personal → Return "mixed" verdict (cannot verify)
```

#### **Step 4: Evidence Retrieval** ([getFullEvidenceForCanonical()](file:///c:/Users/Dell/Desktop/LiveTruth/server/services/wikipediaService.js#168-234))
```javascript
Input: Canonical claim
    ↓
Search Wikipedia for:
    1. Subject entity
    2. Object entity
    3. Relation + object (e.g., "capital of China")
    ↓
Retrieve FULL paragraphs (10 sentences, not just 3)
    ↓
Fallback strategy:
    - Try subject first
    - Try object if no results
    - Extract capitalized words (proper nouns)
    - Search full claim text
    ↓
Output: Array of evidence objects with:
    - entity: search term
    - text: Wikipedia paragraph
    - source: {title, url, snippet}
```

#### **Step 5: NLI (Natural Language Inference)** ([performNLI()](file:///c:/Users/Dell/Desktop/LiveTruth/server/services/geminiService.js#17-122))
```javascript
Input: Claim text + Evidence text
    ↓
Send to Gemini AI with prompt:
    "Determine if evidence ENTAILS, CONTRADICTS, or is NEUTRAL to claim"
    ↓
Gemini returns:
    {
        relationship: "ENTAILMENT" | "CONTRADICTION" | "NEUTRAL",
        confidence: 0.0-1.0
    }
    ↓
Count results:
    - entailments++
    - contradictions++
    - neutrals++
```

#### **Step 6: Verdict Determination**
```javascript
If contradictions > 0:
    verdict = "false"
    confidence = min(90, 60 + contradictions * 10)
    ↓
Else if entailments > 0:
    verdict = "true"
    confidence = min(90, 60 + entailments * 10)
    ↓
Else:
    Try keyword-based fallback (checkObviousFacts)
    Try evidence text inference (inferFromEvidenceText)
    Default: verdict = "mixed", confidence = 50
    ↓
Return:
    {
        verdict: "true" | "false" | "mixed",
        confidence: 0-100,
        sources: [...],
        explanation: "..."
    }
```

### **4. Real-time Update Flow**

**Server → Client**
```
Server emits 'claims-verified' event
    ↓
Client receives in App.jsx
    ↓
Update claims state (avoid duplicates)
    ↓
Calculate stats:
    - Total claims
    - True count
    - False count
    - Mixed count
    ↓
Calculate credibility score:
    rawScore = (true * 1.0 + mixed * 0.5 - false * 1.0) / total
    credibility = ((rawScore + 1) / 2) * 100
    ↓
Update UI components:
    - LiveTranscript (highlight claims)
    - SessionAnalytics (credibility gauge)
    - SourceFeed (verification sources)
```


## 🎨 UI Components

### **Components**

1. **Header** ([Header.jsx](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/components/Header.jsx))
   - Logo with animated glow effect
   - Start/Stop listening button with pulsing indicator
   - Settings dropdown (auto-save, notifications, dark mode)
   - User profile dropdown (sessions, analytics, export)

2. **LiveTranscript** ([LiveTranscript.jsx](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/components/LiveTranscript.jsx))
   - Real-time transcript display
   - Color-coded claim highlighting:
     - 🟢 Green: True claims
     - 🟡 Yellow: Mixed/Unverified claims
     - 🔴 Red: False claims
   - Processing indicator

3. **SessionAnalytics** ([SessionAnalytics.jsx](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/components/SessionAnalytics.jsx))
   - Semi-circular credibility gauge (0-100)
   - Claim statistics (total, true, false, mixed)
   - Session duration timer

4. **SourceFeed** ([SourceFeed.jsx](file:///c:/Users/Dell/Desktop/LiveTruth/client/src/components/SourceFeed.jsx))
   - Scrollable list of verification sources
   - Clickable Wikipedia links
   - Verdict badges (TRUE/FALSE/MIXED)
   - "View All" modal

### **Pages**

- **AuthPage**: Login/Register with OAuth options
- **ProfilePage**: User profile management
- **SessionsPage**: View saved sessions
- **AnalyticsPage**: Charts and trends
- **ExportPage**: Export sessions as JSON
- **AboutPage**: Project information
- **HelpPage**: User guide
- **TermsPage**: Terms of service
- **PrivacyPage**: Privacy policy

### **Theming**

- **Dark Mode**: Pure black (#000000) background
- **Light Mode**: Blueish gray (#111827) background
- **Gradient Accents**: Cyan → Blue → Purple
- **Tailwind CSS**: Utility-first styling

## ⚠️ Troubleshooting

### Speech Recognition Not Working
- Use Chrome, Edge, or Safari (Firefox has limited support)
- Ensure microphone permissions are granted
- Check browser console for errors
- Try refreshing the page

### MongoDB Connection Error
- Verify MongoDB is running (if local): `mongod`
- Check connection string in `server/.env`
- Ensure network access (if using Atlas)
- The app works without MongoDB (uses localStorage)

### Port Already in Use
- Change `PORT` in `server/.env` (e.g., `PORT=5001`)
- Update `VITE_SOCKET_URL` in `client/.env` accordingly
- Restart the server

### Module Not Found Errors
- Run `npm run install-all` to install all dependencies
- Delete `node_modules` folders and reinstall if issues persist
- Ensure Node.js version is 18 or higher

### Email Not Sending
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check that 2-Step Verification is enabled
- Ensure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in `server/.env`
- Check server console for error messages
- Verify recipient email address is correct

### API Errors
- **Gemini API**: Verify API key is correct and has quota remaining
- **Google Search API**: Check quota (100 free queries/day)
- The system automatically falls back to alternative methods if APIs fail

### Dark Mode Not Working
- Clear browser cache and refresh
- Check browser console for errors
- Ensure JavaScript is enabled

## 🔒 Security & Privacy

- **No Permanent Speech Storage** - Only verified claims are stored
- **Client-Side Speech Processing** - Speech recognition happens in the browser
- **Secure WebSocket Connections** - All real-time communication is encrypted
- **Environment Variables** - Never commit `.env` files to Git
- **User Authentication** - Protected routes require authentication
- **Source Transparency** - All verification sources are provided with links


## 🚀 Deployment & Scaling

### **Development**
```bash
npm run dev  # Runs both client and server concurrently
```

### **Production**
```bash
# Build frontend
cd client && npm run build

# Start server
cd server && npm start
```

### **Scaling Considerations**

1. **WebSocket Scaling**
   - Use Redis adapter for Socket.IO
   - Horizontal scaling with load balancer

2. **Database**
   - MongoDB Atlas for cloud hosting
   - Indexing on claim text and timestamp

3. **API Rate Limits**
   - Gemini API: Monitor quota
   - Wikipedia API: Implement caching

4. **Caching**
   - Redis for claim verification results
   - Cache Wikipedia responses

---

## 🔧 Configuration

### **Environment Variables**

**Server** ([.env](file:///c:/Users/Dell/Desktop/LiveTruth/server/.env))
```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/livetruth

# Gemini AI (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Custom Search (Optional)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Gmail SMTP (Optional)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
FROM_NAME=LiveTruth
DEVELOPER_EMAIL=your_email@gmail.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_session_secret
```

**Client** ([.env](file:///c:/Users/Dell/Desktop/LiveTruth/server/.env))
```env
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔒 Security Features

1. **No Permanent Speech Storage**
   - Only verified claims are stored
   - Transcripts stored in localStorage (client-side)

2. **Client-Side Speech Processing**
   - Web Speech API runs in browser
   - No audio sent to server

3. **Secure WebSocket Connections**
   - Socket.IO with CORS configuration
   - Origin validation

4. **Environment Variables**
   - Never commit [.env](file:///c:/Users/Dell/Desktop/LiveTruth/server/.env) files
   - Use `.env.example` templates

5. **User Authentication**
   - JWT tokens for API access
   - Protected routes require authentication
   - OAuth with Passport.js

6. **Source Transparency**
   - All verification sources provided with links
   - Wikipedia citations

---

## 🐛 Error Handling

### **Frontend**

1. **Speech Recognition Errors**
   - Browser compatibility check
   - Microphone permission handling
   - Auto-restart on disconnect

2. **WebSocket Errors**
   - Auto-reconnection with exponential backoff
   - Connection status indicator
   - Graceful degradation

3. **Extension Errors**
   - Suppress browser extension errors
   - Filter out harmless console noise

### **Backend**

1. **MongoDB Connection**
   - Fallback to localStorage if DB unavailable
   - Warning messages (non-blocking)

2. **API Errors**
   - Gemini API: Fallback to keyword-based verification
   - Wikipedia API: Multi-level fallback strategy
   - Email Service: Log errors, don't block requests

3. **OAuth Errors**
   - Strategy availability checks
   - Graceful error messages
   - Redirect to auth page with error params

---

## 📈 Performance Optimizations

1. **Real-time Processing**
   - Interim results for immediate feedback
   - Final results trigger verification
   - Debouncing for transcript updates

2. **Duplicate Prevention**
   - Claim deduplication by normalized text
   - Avoid re-verifying same claims

3. **Lazy Loading**
   - Code splitting with React Router
   - Dynamic imports for heavy components

4. **Caching**
   - localStorage for sessions
   - Browser caching for static assets

---

## 🧪 Testing Strategy

### **Recommended Tests**

1. **Unit Tests**
   - Claim detection logic
   - Canonicalization patterns
   - Credibility score calculation

2. **Integration Tests**
   - WebSocket communication
   - API endpoints
   - OAuth flows

3. **E2E Tests**
   - Speech recognition flow
   - Claim verification flow
   - Session management

4. **Manual Testing**
   - Browser compatibility (Chrome, Edge, Safari)
   - Microphone permissions
   - Dark mode toggle

---

## 📝 Key Insights & Design Decisions

### **Why This Architecture?**

1. **Client-Server Separation**
   - Frontend handles UI and speech recognition
   - Backend handles heavy ML processing
   - Clear separation of concerns

2. **WebSocket for Real-time**
   - Instant claim verification feedback
   - Live updates to all connected clients
   - Better UX than polling

3. **MongoDB Optional**
   - Works without database (localStorage)
   - Easy setup for development
   - Scalable for production

4. **Gemini AI Primary**
   - Fast and accurate NLI
   - Fallback to keyword-based verification
   - Graceful degradation

5. **Wikipedia as Evidence Source**
   - Reliable and authoritative
   - Free API access
   - Full paragraph context (not just snippets)

## Strengths

- ✅ Real-time claim verification with instant feedback
- ✅ Multi-stage NLP pipeline with graceful fallbacks
- ✅ Modern UI with dark mode support
- ✅ Secure authentication (Email, Google, GitHub)
- ✅ Robust session handling and usage analytics
- ✅ Offline-first capability using localStorage
- ✅ Fully responsive, mobile-first design
- ✅ Transparent evidence sourcing via Wikipedia
  

## **Areas for Improvement**

- ⚠️ **Scalability:** WebSocket scaling needs Redis adapter
- ⚠️ **Testing:** No automated tests currently
- ⚠️ **Caching:** No Redis caching for API responses
- ⚠️ **Multi-language:** Only supports English (US)
- ⚠️ **Evidence Sources:** Limited to Wikipedia
- ⚠️ **Claim Complexity:** Simple pattern matching

---
  
## 🌐 Browser Compatibility

- ✅ **Chrome/Edge** (recommended) - Full Web Speech API support
- ✅ **Safari** - Full Web Speech API support
- ⚠️ **Firefox** - Limited Web Speech API support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- React & Vite
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO
- Google Gemini AI
- Natural Language Processing libraries
- Tailwind CSS

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

- **Email**: panditharshsharma34@gmail.com

---

**Made with ❤️ by me**

**LiveTruth** — Truth at the speed of speech 🚀
