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

```
Live Speech
   ↓
Speech → Text (Web Speech API)
   ↓
Claim Detection (NLP + Rule-based)
   ↓
Fact Verification (Gemini AI → Knowledge Base → Google/Wikipedia)
   ↓
Credibility Score + Sources
   ↓
Live Web Dashboard (React + Socket.IO)
```

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI framework with hooks
- **Vite 5.0** - Fast build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Router DOM 7.12** - Client-side routing
- **Socket.IO Client 4.6** - Real-time WebSocket communication
- **Recharts 2.10** - Data visualization
- **Web Speech API** - Native browser speech recognition

### Backend
- **Node.js** (ES Modules) - JavaScript runtime
- **Express 4.18** - Web application framework
- **Socket.IO 4.6** - Real-time bidirectional communication
- **MongoDB + Mongoose 8.0** - Database and ODM
- **Nodemailer 7.0** - Email sending service

### AI & ML Services
- **Google Gemini API** - Primary AI for fast, accurate fact-checking
- **Google Custom Search API** - Real-time web search results
- **Wikipedia API (MediaWiki)** - Reliable encyclopedic sources
- **Natural 6.10** - NLP library for text processing
- **Compromise 14.12** - Entity extraction and text analysis

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

### Gmail SMTP Setup (Optional - for Email Services)

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification" and enable it

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter name: **LiveTruth**
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

3. **Update `server/.env`**
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

### REST API

- `GET /api/health` - Health check endpoint
- `GET /api/claims` - Get all claims
- `GET /api/claims/:id` - Get specific claim
- `POST /api/claims` - Create new claim
- `GET /api/claims/stats/summary` - Get statistics summary
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/social-login` - Social login (Google/GitHub)
- `POST /api/contact` - Send contact form message

### WebSocket Events

- `transcript` - Send transcript chunk to server
- `claims-verified` - Receive verified claims from server
- `verify-claim` - Manually verify a claim
- `live-update` - Broadcast updates to all connected clients

## 📁 Project Structure

```
LiveTruth/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Header.jsx     # Navigation and controls
│   │   │   ├── LiveTranscript.jsx  # Live transcript display
│   │   │   ├── SessionAnalytics.jsx  # Credibility score and stats
│   │   │   ├── SourceFeed.jsx # Verification sources
│   │   │   ├── ProtectedRoute.jsx  # Auth-based routing
│   │   │   └── ViewAllModal.jsx  # Modal for viewing all sources
│   │   ├── pages/            # Page components
│   │   │   ├── AboutPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── HelpPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SessionsPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ExportPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   └── PrivacyPage.jsx
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js Backend
│   ├── models/               # MongoDB schemas
│   │   └── Claim.js
│   ├── routes/               # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── claims.js        # Claims CRUD routes
│   │   └── contact.js       # Contact form route
│   ├── services/             # Business logic
│   │   ├── mlService.js     # Core ML and fact-checking
│   │   ├── geminiService.js # Gemini API integration
│   │   ├── wikipediaService.js  # Wikipedia API
│   │   ├── semanticSimilarity.js  # Text similarity
│   │   ├── claimNormalizer.js  # Claim normalization
│   │   └── emailService.js  # Email sending service
│   ├── socket/               # WebSocket handlers
│   │   └── socketHandler.js
│   ├── index.js             # Server entry point
│   ├── package.json
│   └── env.example          # Environment variables template
│
├── package.json              # Root package.json
└── README.md                 # This file
```

## 🎨 UI Components

- **Header** - Logo, listening controls, settings, and user profile dropdown
- **LiveTranscript** - Real-time transcript with colored claim highlighting
- **SessionAnalytics** - Semi-circular credibility gauge and statistics
- **SourceFeed** - Scrollable list of verification sources with links
- **ProtectedRoute** - Authentication-based route protection
- **ViewAllModal** - Modal for viewing all sources of a claim

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

## 🚀 Production Build

### Build Frontend
```bash
cd client
npm run build
```

### Start Production Server
```bash
cd server
npm start
```

### Environment Variables
Ensure all production environment variables are set:
- `PORT` - Server port
- `CLIENT_URL` - Frontend URL
- `MONGODB_URI` - Database connection string
- `GEMINI_API_KEY` - Gemini API key (recommended)
- `GOOGLE_API_KEY` - Google Search API key (optional)
- `GOOGLE_SEARCH_ENGINE_ID` - Search Engine ID (optional)
- `GMAIL_USER` - Gmail address (optional)
- `GMAIL_APP_PASSWORD` - Gmail app password (optional)

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
