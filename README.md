# 🍿 Netflix GPT — AI-Powered Next-Gen Streaming Experience

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-E50914?style=for-the-badge&logo=netflix&logoColor=white)](https://vidhya112.github.io/Netflix_App/)
[![Firebase Hosting](https://img.shields.io/badge/Live_App-Firebase_Hosting-FFA611?style=for-the-badge&logo=firebase&logoColor=black)](https://netflixgpt-7d954.web.app)
[![React 19](https://img.shields.io/badge/React_19-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

A state-of-the-art, full-stack **Netflix Clone** integrated with **Google Gemini AI (`gemini-flash-latest`)**, **OMDb API**, and **TVMaze API** for intelligent film discovery, live daily catalog caching, instant video trailer streaming, and personalized watchlists.

---

## 🌐 Live Deployments

- 🚀 **GitHub Pages**: [https://vidhya112.github.io/Netflix_App/](https://vidhya112.github.io/Netflix_App/)
- 🔥 **Firebase Hosting**: [https://netflixgpt-7d954.web.app](https://netflixgpt-7d954.web.app)

---

## ✨ Key Features

- 🤖 **Gemini AI Movie Assistant**: Natural language movie search and contextual AI recommendations powered by Google's latest Gemini 2.5 Flash model with intelligent structured parsing.
- 🎬 **100% Live Daily Movie Feed**: Live movie data dynamically fetched from **OMDb API** (Amazon IMDb CDN posters, ratings, actors, awards, full synopses) and **TVMaze**.
- ⚡ **Zero-Latency 24-Hour Cache**: Daily catalog engine caches shelf data in browser `localStorage` with a 24-hour expiration cycle — guaranteeing instant 0ms loads on return visits.
- 🎥 **Embedded Trailer Modal**: Auto-resolving YouTube trailer video player with cinematic 16:9 widescreen presentation and full metadata display.
- 👤 **Multi-Profile Avatars**: Interactive Netflix profile avatar switcher with instant Redux state persistence and automatic image sanitization.
- 🌐 **Multi-Language Support**: Complete internationalization across 6 languages (English, Hindi, Spanish, French, German, Japanese).
- 📌 **Watchlist & Personalization**: Real-time Add/Remove to "My List" with Redux Toolkit and interactive toast feedback.
- 🔐 **Firebase Authentication**: Secure user registration, sign-in, session management, and profile synchronization.
- 💎 **Ultra-Modern Aesthetics**: Custom glassmorphism, glowing ambient backdrops, shimmering skeleton loaders, and responsive layouts for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS, Lucide Icons, Framer Motion |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`), React-Redux |
| **AI Intelligence** | Google Gemini API (`@google/genai` / `gemini-flash-latest`) |
| **Movie Metadata** | OMDb API (`plot=full`), TVMaze API |
| **Auth & Backend** | Firebase Authentication |
| **CI/CD & Hosting** | GitHub Actions (`deploy.yml`), GitHub Pages, Firebase Hosting |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/vidhya112/Netflix_App.git
cd Netflix_App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Google Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# OMDb API Key
VITE_OMDB_API_KEY=your_omdb_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📦 Deployment

### Deploy to GitHub Pages (Automated CI/CD)
Pushing to the `main` branch automatically triggers the GitHub Actions workflow in `.github/workflows/deploy.yml` which builds and deploys to GitHub Pages.

To enable GitHub Pages in your repository:
1. Go to **Settings > Pages** on GitHub.
2. Set **Source** to **GitHub Actions**.

### Deploy to Firebase Hosting
```bash
npm run build
npx firebase-tools deploy --only hosting
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).