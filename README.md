# Voice-Enabled-Task-Tracker

A task management application inspired by Linear, with voice-based task creation, intelligent parsing, Kanban board, and task CRUD operations.

# 🚀 Overview

This project solves the problem of tedious manual task entry by allowing users to speak naturally, and the system automatically extracts:

The system extracts the following fields:

- **Title**
- **Description**
- **Priority**
- **Status**
- **Due Date** (relative & absolute dates)

The user reviews parsed details before saving the task.

Frontend uses **React**, backend uses **Node.js + Express**,  
and voice parsing uses **OpenAI (optional)** + heuristics for fallback.

# Project Structure
Voice-Enabled-Task-Tracker/
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── controllers/
│   ├── scripts/seed.js
│   ├── server.js
│   └── package.json
│
└── README.md

# 🛠 Tech Stack
Frontend

React

Vite

Tailwind CSS

Axios

@hello-pangea/dnd (Drag & Drop)

Web Speech API

Backend

Node.js

Express

MongoDB + Mongoose

CORS

chrono-node

OpenAI API (optional)

# ⚙️ Setup Instructions
1. Prerequisites

Node.js (v18 or above)

NPM

MongoDB locally OR MongoDB Atlas connection URI

Optional: OpenAI API Key

2. Clone the Repository
git clone <your-repo-url>
cd Voice-Enabled-Task-Tracker

3. Backend Setup
Create .env inside /backend:
PORT=4000
MONGO_URI=your_mongodb_uri_here
OPENAI_API_KEY=
FRONTEND_ORIGIN=http://localhost:5173

Install Dependencies
cd backend
npm install

Seed Example Data
npm run seed

Run Backend Server
npm run dev


Backend runs at:

http://localhost:4000

4. Frontend Setup
Create .env in /frontend:
VITE_API_BASE=http://localhost:4000/api

Install dependencies:
cd frontend
npm install

Start Frontend:
npm run dev


Frontend runs at:

http://localhost:5173


# 🧩 Features
✔️ Manual Task Management

Supports:

Create

Update

Delete

Filter

Search

Kanban View (Drag-and-Drop)

List View

# ✔️ Voice-Based Task Creation
Workflow:

User clicks microphone icon

Speaks naturally

Speech → Text via Web Speech API

Backend parses transcript into structured data:

Title

Description

Priority

Status

Due Date

User reviews parsed output

User saves task

# ✔️ Smart NLP Parsing
Extracted Fields:

Title

Description

Priority (Low, Medium, High, Critical)

Status (To Do, In Progress, Done)

Due Date (natural language: "tomorrow", "next Monday", "in 3 days", etc.)

Parsing Strategy:

OpenAI (preferred): Converts transcript → valid JSON

Heuristic fallback:

chrono-node for date parsing

regex for priority keywords

rule-based title extraction

# 📡 API Documentation
GET /api/tasks

Returns all tasks.

POST /api/tasks

Create a new task.

Example Body:

{
  "title": "Review PR",
  "priority": "High",
  "status": "To Do",
  "dueDate": "2025-12-07T18:00:00.000Z"
}

PUT /api/tasks/:id

Update task by ID.

DELETE /api/tasks/:id

Delete task by ID.

POST /api/voice/parse

Send transcript and receive parsed fields.

Example Input:

{
  "transcript": "Create a high priority task to finish the design by Monday"
}

Example Output:
{
  "parsed": {
    "title": "Finish the design",
    "priority": "High",
    "status": "To Do",
    "dueDate": "2025-12-08T18:00:00.000Z"
  }
}

# ⚖️ Design Decisions & Assumptions
✔ Voice API

Use Web Speech API for transcription (no extra cost + easy setup).

✔ Natural Language Parsing

Hybrid approach ensures reliability even without OpenAI.

✔ No Authentication

Intentional (out of assignment scope).

✔ Fixed Workflow

Three statuses:

To Do

In Progress

Done

# 🎤 Sample Voice Prompts for Demo

Try these during your video demo:

“Create a high priority task to submit the final report by tomorrow morning.”

“Remind me to email the client next Monday at 10 AM, it's critical.”

“Make a low priority task to clean up the codebase before Friday.”