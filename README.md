# ClassPulse — Student Schedule Web App

A full-stack web application that helps university students manage their class timetable with live tracking, AI-powered import, and smart notifications.

![ClassPulse](https://img.shields.io/badge/ClassPulse-Student%20Schedule-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss)

## 🔗 Live Demo
**[classpulse-red.vercel.app](https://classpulse-red.vercel.app)**

---

## 📖 About

ClassPulse is a smart student timetable manager that shows you exactly what class is happening **right now**, what's **coming up next**, and what has already **ended** — all updated in real time based on your schedule.

---

## ✨ Features

- **Live Dashboard** — See your current running class with a live progress bar, upcoming classes with countdowns, and ended classes
- **AI Timetable Import** — Upload a photo of your printed or digital timetable and AI will automatically extract all classes
- **Manual Class Management** — Add, edit, and delete classes with a clean form interface
- **Weekly Schedule View** — Browse your full week with day-by-day navigation and search
- **Smart Notifications** — Browser notifications 10 minutes before each class starts
- **Dark / Light Mode** — Toggle between themes, preference saved automatically
- **Secure Authentication** — Register and login with JWT-based auth
- **Color Coded Classes** — Assign colors to subjects for easy identification
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI | OpenRouter (free vision models) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- OpenRouter API key (free) — [openrouter.ai](https://openrouter.ai)

### 1. Clone the repository
```bash
git clone https://github.com/SusheelK7/ClassPulse.git
cd ClassPulse
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🤖 AI Timetable Import

ClassPulse uses AI vision to read your timetable image and extract all classes automatically:

1. Click **"AI Import"** on the dashboard
2. Upload a clear photo or screenshot of your timetable
3. AI reads and extracts all classes (subject, day, time, room, teacher)
4. Review the extracted classes
5. Click **"Import"** — all classes are saved instantly

Supported formats: JPG, PNG

---

## 📁 Project Structure

```
ClassPulse/
├── backend/                 # Node.js + Express API
│   ├── models/              # MongoDB schemas (User, Class)
│   ├── routes/              # API routes (auth, classes, ai)
│   ├── middleware/          # JWT authentication
│   └── server.js            # Entry point
└── frontend/                # React + Vite app
    └── src/
        ├── components/      # UI components
        ├── context/         # React context (Auth, Theme, Class)
        ├── hooks/           # Custom hooks (notifications)
        ├── pages/           # Dashboard, Schedule, Login, Register
        └── utils/           # API client, time utilities
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | classpulse-red.vercel.app |
| Backend | Railway | classpulse-production.up.railway.app |
| Database | MongoDB Atlas | Cloud hosted |

---

## 📸 Screenshots

LOGIN
<img width="1920" height="891" alt="image" src="https://github.com/user-attachments/assets/2aeacf02-8087-4548-baf9-6d3acc16c21a" />


REGISTRATION
<img width="1920" height="914" alt="image" src="https://github.com/user-attachments/assets/769a789d-e27d-4f2a-b43e-7c034d6af0e5" />


DASHBOARD
> <img width="1920" height="921" alt="image" src="https://github.com/user-attachments/assets/c7f0e3d7-e623-4f3d-aa9a-7e677ae1a763" />


NOTIFICATION OF UPCOMING CLASS

<img width="579" height="378" alt="image" src="https://github.com/user-attachments/assets/e8536eb9-22a1-425c-9885-7bfbf5de04f5" />

ADD CLASS FORM
<img width="1920" height="919" alt="image" src="https://github.com/user-attachments/assets/e86d61e8-4291-43e8-bfbf-82d5c8fb6d47" />

UPCOMING CLASS

<img width="541" height="260" alt="image" src="https://github.com/user-attachments/assets/249ba464-47e7-4ea7-82da-9d3fdeef79fc" />

LIVE CLASS GOINGON
<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/85fd9f68-4836-4ad1-a345-ca10b5da825d" />

LIVE CLASS PROGRESS
<img width="997" height="260" alt="image" src="https://github.com/user-attachments/assets/a1f2e32e-698a-4b27-acbc-8211dc0c45aa" />

EDIT CLASS
<img width="1920" height="932" alt="image" src="https://github.com/user-attachments/assets/bd863f69-9b09-458a-9750-c027625747a3" />


WEEKLY SCHEDULE CLASSES
<img width="1920" height="926" alt="image" src="https://github.com/user-attachments/assets/c181f8d7-5007-4339-894e-6982fa17113e" />




> AI timetable import — upload image, review, import in seconds

---

## 👨‍💻 Developer

**Susheel Kumar**
- GitHub: [@SusheelK7](https://github.com/SusheelK7)

---

## 📄 License

This project is for educational purposes.
