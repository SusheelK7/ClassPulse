# ClassPulse — Student Schedule App

A full-stack student timetable web app built with React, Node.js, Tailwind CSS, and MongoDB.

## Features
- Live dashboard showing current, upcoming, and ended classes
- Progress bar for the running class
- AI-powered timetable import (upload a photo → Claude reads it)
- Manual class add / edit / delete
- Weekly schedule view with day-by-day navigation
- Search classes by subject, teacher, or room
- Dark mode / Light mode toggle
- JWT authentication (register/login)

## Project Structure
```
student-schedule/
├── backend/           # Node.js + Express + MongoDB
│   ├── models/        # User, Class schemas
│   ├── routes/        # auth, classes, ai
│   ├── middleware/    # JWT auth
│   └── server.js
└── frontend/          # React + Vite + TailwindCSS
    └── src/
        ├── components/ # Layout, ClassCard, Modals
        ├── context/    # Auth, Theme, Class contexts
        ├── pages/      # Dashboard, Schedule, Login, Register
        └── utils/      # api.js, timeUtils.js
```

## Setup Instructions

### 1. Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add:
#   MONGODB_URI=mongodb://localhost:27017/student-schedule
#   JWT_SECRET=any_random_secret_string
#   ANTHROPIC_API_KEY=sk-ant-... (get from console.anthropic.com)

npm run dev   # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:3000
```

### 3. MongoDB
- Local: install MongoDB Community and run `mongod`
- Cloud: use MongoDB Atlas free tier → paste connection string in .env

## Getting Your Anthropic API Key
1. Go to https://console.anthropic.com
2. Create an account and go to API Keys
3. Create a new key and paste it as ANTHROPIC_API_KEY in backend/.env

## Using the AI Import
1. Take a photo or screenshot of your printed/digital timetable
2. Click "AI Import" on the dashboard
3. Upload the image — Claude will extract all classes
4. Review the extracted classes and click "Import"

## Environment Variables
| Variable | Description |
|---|---|
| PORT | Backend port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret for signing JWT tokens |
| ANTHROPIC_API_KEY | Anthropic API key for AI extraction |
