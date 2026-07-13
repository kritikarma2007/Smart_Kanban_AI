# Smart Kanban AI

Smart Kanban AI is a modern, full-stack task management application that combines a drag-and-drop Kanban board with AI-assisted task planning. Users can register and sign in securely, manage tasks across columns, and use AI-generated descriptions and subtasks to accelerate workflow planning.

## Overview

This project consists of:

- A React + Vite frontend for the interactive dashboard experience
- An Express + Node.js backend for authentication, task management, and AI endpoints
- MongoDB for persistent task and user data
- AI content generation powered by Google Gemini

## Key Features

- User authentication with JWT
- Drag-and-drop task management across Kanban columns
- Task creation, update, and deletion
- AI-powered task assistance for descriptions and subtasks
- Responsive and polished UI built with React and Tailwind-inspired styling
- Production-ready frontend and backend configuration for deployment

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Token (JWT)
- CORS
- Google Generative AI

## Project Structure

```text
smart-kanban-ai/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── src/
│   ├── components/
│   ├── pages/
│   └── config/
├── package.json
├── vite.config.js
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- MongoDB database
- Google Gemini API key (for AI features)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd smart-kanban-ai
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the project root for the frontend:

```env
VITE_API_URL=http://localhost:5000
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Application Locally

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
npm run dev
```

The frontend will typically run at:
- http://localhost:5173

The backend API will run at:
- http://localhost:5000

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
cd backend
npm run dev
npm run start
```

## API Overview

The backend exposes the following endpoints:

- `POST /api/auth/register` — create a new account
- `POST /api/auth/login` — authenticate a user
- `GET /api/tasks` — fetch tasks for the authenticated user
- `POST /api/tasks` — create a new task
- `PUT /api/tasks/:id` — update a task
- `DELETE /api/tasks/:id` — delete a task
- `POST /api/ai/suggest` — generate AI-based task suggestions
- `GET /api/health` — health check endpoint

## Deployment

### Frontend Deployment (Vercel)

Recommended Vercel settings:

- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

### Backend Deployment (Railway)

Set the following environment variables in Railway:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

## Production Notes

- The frontend uses `VITE_API_URL` to communicate with the backend.
- The backend accepts requests from the configured frontend origin via CORS.
- The app is designed to work with both local development and deployed environments.

