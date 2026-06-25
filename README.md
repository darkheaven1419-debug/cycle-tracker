# 🌸 Anđelin Ciklus

> **Anđelin Ciklus** — Personal cycle tracker & cross-cultural love diary for Anđela & Barry.
>
> *Od Pekinga do Vojvodine — preko planina i mora, samo za tebe.*

[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen)]()
[![Language](https://img.shields.io/badge/lang-sr%20%7C%20zh--CN%20%7C%20en-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 🩸 Cycle Tracking
- Period start/end logging with calendar visualization
- Automatic cycle prediction (4 phases: menstruation, follicular, ovulation, luteal)
- Symptom tracking (cramps, mood, flow, headache, fatigue, cravings)
- Cycle statistics & trend charts (Canvas-based, no external libs)
- Mood tracking with streak counter

### 📅 Bicultural Calendar
- **50+ holidays** — Chinese, Serbian & international
- **24 Solar Terms** (节气) with 3-language stories
- Lunar calendar integration

### 💌 Shared Diary
- Multi-user journal (Anđela + Barry)
- 7-day date strip & full calendar navigation
- GitHub API-based cross-device sync
- Mood tags, character counter, auto-save
- Partner letter — write yours to unlock theirs

### 📖 Chinese Learning
- 30 lessons across vocabulary, grammar, cultural tips
- Spaced repetition review system
- Quiz & listening practice modules
- Achievement badges & streak tracking
- Cultural knowledge cards (30 topics)

### 🌍 Bicultural Love
- Dual city weather (Beijing ↔ Kikinda)
- Time zone difference display
- Love notes pool (60 romantic messages, rotated daily)
- Virtual garden that grows with daily check-ins
- Song sharing, gratitude wall, relation quiz
- Remote hug sending

### 🎨 Design
- Rose petal × warm clay palette
- Light/dark theme with smooth transitions
- PWA — install as standalone app on phone
- Fully responsive (320px → 1920px+)

## 🚀 Quick Start

Zero-dependency static PWA — no build tools, no npm.

### Open directly
```bash
# Windows
start index.html
# macOS
open index.html
```

### Local server (recommended for PWA)
```bash
python -m http.server 8080
# or
npx serve .
```
Then open `http://localhost:8080`.

## 🏗️ Project Structure

```
cycle-tracker/
├── index.html              ← Main entry point (PWA)
├── styles.css              ← Design tokens + all styles
├── app.js                  ← Application logic
├── js/                     ← Modular JavaScript
│   ├── i18n.js             ← 3-language translation (sr/zh-CN/en)
│   ├── cycle-core.js       ← Date utilities + cycle prediction
│   ├── chart-renderer.js   ← Canvas-based charts
│   ├── lunar.js            ← Chinese lunar calendar
│   ├── calendar-culture.js ← Holiday & solar term data
│   ├── chinese-learn.js    ← Learning progression engine
│   ├── chinese-ui.js       ← Learning UI components
│   ├── chinese-quiz.js     ← Quiz system
│   ├── chinese-panels.js   ← Learning panel views
│   └── chinese-listen.js   ← Listening practice
├── data/                   ← Rich content data
│   ├── culture.json        ← Culture knowledge cards (30 topics)
│   ├── lessons.json        ← 30 Chinese lessons
│   ├── quotes.json         ← Chinese proverbs with translations
│   └── achievements.json   ← Learning achievement badges
├── calendar-data.json      ← Holiday & solar term data
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker
├── lite.html               ← ES5 minimal fallback
├── static.html             ← Static browser test page
├── libs/html2canvas.min.js ← Screenshot export
└── tests/test-core.js      ← Unit tests
```

## 👥 User Guide

### Login
- **Anđela** → PIN `1909` (cycle tracking + diary)
- **Barry** → PIN `0827` (shared diary + relationship features)

### First-time Setup
1. Tap a date on the calendar to start recording
2. Go to Settings (⚙) to configure language, theme, GitHub Token
3. Enable PWA install for the best experience

## 🔧 Technical Stack

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5 semantic markup |
| **Styling** | CSS Custom Properties (Design Tokens), CSS Grid |
| **Logic** | Vanilla JS (ES6+) — zero frameworks |
| **Charts** | Canvas 2D — pure JS, no libraries |
| **PWA** | Service Worker + Web App Manifest |
| **I18n** | Custom key-value translation engine |
| **Sync** | GitHub API (REST v3) |
| **Weather** | Open-Meteo API (free, no key required) |
| **Fonts** | Inter (Google Fonts) |

## 📜 License

MIT

---

*Napravljeno sa ljubavlju za Anđelu Nemet ♥*
