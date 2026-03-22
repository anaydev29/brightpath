<p align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/2921/2921822.png" width="80" alt="BrightPath Logo"/>
</p>

<h1 align="center">🌿 BrightPath — Student Wellness Tracker</h1>

<p align="center">
  <strong>A gamified mental health & wellness companion for students.</strong><br/>
  Track moods, journal thoughts, breathe mindfully, and grow — all in one beautiful app.
</p>

<p align="center">
  <a href="https://brightpathh.vercel.app">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Deployed-Vercel_+_Railway-black?logo=vercel&logoColor=white" alt="Deployment"/>
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white" alt="PWA"/>
</p>

---

## 📸 Screenshots

| Landing Page | Dashboard | Breathing Exercise |
|:---:|:---:|:---:|
| Glassmorphism login with animated gradient background | Mood tracker, streaks, level system & badges | Voice-guided 4-7-8 breathing with animated orb |

---

## ✨ Features

### 🧠 Core Wellness
- **Mood Tracking** — Quick emoji-based mood check-ins with 10 mood options
- **Journal** — Private journaling with timestamps, search & delete
- **Breathing Exercises** — 4-7-8 technique with animated orb & optional voice guidance
- **Guided Meditations** — Built-in meditation library with voice narration

### 📊 Analytics & Insights
- **Mood Charts** — Interactive Chart.js line graphs showing mood trends over time
- **Weekly Wellness Score** — Auto-calculated from your recent mood data
- **Mood Breakdown** — Visual breakdown of mood frequency with hover animations

### 🎮 Gamification
- **Points & Levels** — Earn points for every action (mood logs, journal entries, challenges)
- **12 Achievement Badges** — Unlock Bronze/Silver/Gold streaks, Century Club, Resilient, and more
- **Daily Challenges** — New wellness challenge every day for bonus points
- **Confetti Celebrations** — Animated confetti on level-ups and badge unlocks

### 👥 Community
- **Anonymous Community Posts** — Share wins and positive moments anonymously
- **Daily Motivational Quotes** — Rotating wellness quotes for inspiration
- **Community Feed** — See other users' shared wins

### 🤖 AI-Powered Support
- **Google Gemini Integration** — AI wellness companion provides empathetic, personalized responses based on your mood and journal entries
- **Voice Assistant** — Optional text-to-speech with multiple voice options

### 🛡️ Admin Dashboard
- **Secure Admin Panel** — Passkey-protected command center at `/admin.html`
- **User Statistics** — Live count of registered users and community posts
- **Content Moderation** — Delete inappropriate community posts

### ⚙️ Customization & Tools
- **Light & Dark Themes** — Beautiful gradient themes with smooth transitions
- **Emoji Avatars** — Choose from 8 avatar options
- **Data Export** — JSON backup & PDF wellness reports (via html2pdf.js)
- **Data Import** — Restore from JSON backups
- **Daily Reminders** — Set custom notification times
- **PWA Support** — Install as a native app on mobile & desktop with offline caching

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5 / CSS3 / JavaScript** | Core frontend — no frameworks needed |
| **Chart.js** | Interactive mood trend visualizations |
| **Phosphor Icons** | Beautiful icon library |
| **html2pdf.js** | PDF report generation |
| **Web Speech API** | Voice guidance & text-to-speech |
| **Service Worker** | PWA offline support & installation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | Server runtime |
| **Express 5** | REST API framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | MongoDB ODM |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Google Generative AI** | Gemini-powered AI responses |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting |
| **Railway** | Backend hosting |
| **MongoDB Atlas** | Database hosting |

---

## 📁 Project Structure

```
brightpath/
├── index.html              # Landing page (Login / Register)
├── app.html                # Main app (Dashboard, all pages)
├── admin.html              # Admin moderation panel
├── script.js               # Core app logic (1200+ lines)
├── styles.css              # Global styles with theme support
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching & PWA support
│
└── backend/
    ├── server.js            # Express server entry point
    ├── package.json
    ├── .env                 # Environment variables (not committed)
    ├── models/
    │   ├── User.js          # User schema (email, password, name)
    │   └── UserData.js      # User data schema (moods, journal, etc.)
    ├── routes/
    │   ├── auth.js          # Register & Login endpoints
    │   ├── data.js          # User data sync (GET/POST)
    │   ├── admin.js         # Admin stats & moderation
    │   ├── ai.js            # Gemini AI wellness responses
    │   └── community.js     # Community posts
    └── middleware/
        └── auth.js          # JWT authentication middleware
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB Atlas** account (free tier works)
- **Google Gemini API Key** (optional, for AI features)

### 1. Clone the repository
```bash
git clone https://github.com/anaydev29/brightpath.git
cd brightpath
```

### 2. Set up the backend
```bash
cd backend
npm install
```

### 3. Configure environment variables
Create a `backend/.env` file:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 4. Start the backend server
```bash
cd backend
node server.js
```
You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected
```

### 5. Open the frontend
Simply open `index.html` in your browser, or use a local server:
```bash
# From the project root
npx serve .
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set the root directory to `/` (default)
4. Deploy — the frontend is served as static files

### Backend → Railway
1. Import the repo in [Railway](https://railway.app)
2. Set **Root Directory** to `/backend`
3. Add environment variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`)
4. Railway auto-deploys on every push

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create new account | — |
| `POST` | `/api/auth/login` | Login & get JWT token | — |
| `GET` | `/api/data` | Fetch user data | JWT |
| `POST` | `/api/data` | Sync user data to cloud | JWT |
| `POST` | `/api/ai` | Get AI wellness response | — |
| `GET` | `/api/admin/stats` | Get admin dashboard stats | Admin |
| `DELETE` | `/api/admin/community/:userId/:postId` | Delete a community post | Admin |

---

## 🏅 Badge System

| Badge | Requirement |
|---|---|
| 🥉 Bronze Streak | 3-day check-in streak |
| 🥈 Silver Streak | 7-day check-in streak |
| 🥇 Gold Streak | 14-day check-in streak |
| 🏆 Trophy Streak | 30-day check-in streak |
| ⭐ Positive Mindset | 5 positive moods in a row |
| 🎯 Consistency | 10 total mood logs |
| 🌟 Commitment | 25 total mood logs |
| 🔱 Elite | 50 total mood logs |
| 🏅 Century Club | 100 total mood logs |
| 💪 Resilient | 5 negative moods in last 10 (bounced back) |
| 🧘 Meditation Master | 5 meditation sessions |
| ✨ First Meditation | Complete your first meditation |

---

## 👨‍💻 Author

**Anay Shivhare** — [@anaydev29](https://github.com/anaydev29)

Built with ❤️ for student wellness.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
