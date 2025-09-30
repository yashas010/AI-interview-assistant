
# AI Interview Assistant

A React + Redux application that provides an AI-powered interview assistant for Full Stack Developer positions. Features two synchronized interfaces: one for candidates (Interviewee) and one for interviewers (Dashboard).

## 🎯 Features

### Core Requirements Implemented:
- ✅ **Resume Upload**: PDF/DOCX file processing with field extraction (Name, Email, Phone)
- ✅ **Missing Field Collection**: Chatbot prompts for incomplete information
- ✅ **AI Interview Flow**: 6 questions with progressive difficulty (2 Easy → 2 Medium → 2 Hard)  
- ✅ **Timed Questions**: Easy (20s), Medium (60s), Hard (120s) with auto-submission
- ✅ **Two Synchronized Tabs**: Interviewee chat interface & Interviewer dashboard
- ✅ **Candidate Management**: List, search, sort, and view detailed candidate profiles
- ✅ **Data Persistence**: All progress saved locally with Welcome Back modal for session restoration

### Tech Stack:
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit + Redux Persist  
- **UI Components**: shadcn/ui + Tailwind CSS
- **AI Integration**: Google Gemini API (upcoming)
- **File Processing**: PDF parsing + DOCX extraction (upcoming)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-interview-assist

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server
The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── IntervieweeTab.tsx    # Candidate interview interface  
│   ├── InterviewerTab.tsx    # Interviewer dashboard
│   ├── ResumeUpload.tsx      # File upload component
│   ├── Timer.tsx            # Question timer component
│   └── ...
├── store/               # Redux store
│   ├── slices/         # Redux slices
│   │   ├── appSlice.ts         # UI state management
│   │   ├── interviewSlice.ts   # Interview session state  
│   │   └── candidatesSlice.ts  # Candidate data management
│   ├── selectors.ts    # Memoized selectors
│   ├── types.ts        # TypeScript interfaces
│   └── index.ts        # Store configuration
└── styles/             # Global styles
```

## 🔄 Current Status

### ✅ Phase 1 Complete: Redux Foundation
- Redux store architecture with persistence
- Core data models (Candidate, Answer, InterviewSession)
- State management for interview flow and candidate tracking
- TypeScript integration with proper typing

### 🚧 Upcoming Phases:
- **Phase 2**: AI Integration (Gemini API) + File Processing (PDF/DOCX)
- **Phase 3**: Resume parsing and field extraction
- **Phase 4**: Interview flow with AI question generation and scoring
- **Phase 5**: Enhanced UI and error handling

## 🎯 Interview Flow

1. **Resume Upload** → Extract candidate information
2. **Missing Field Collection** → Ensure Name, Email, Phone are complete
3. **Interview Execution** → 6 AI-generated questions with timers
4. **Real-time Scoring** → AI evaluates answers and provides feedback
5. **Results Dashboard** → Interviewer reviews candidate performance

## 📊 Data Persistence

All interview data is automatically saved to browser localStorage:
- Interview sessions survive page refreshes
- Candidate profiles and scores are permanently stored  
- Welcome Back modal restores incomplete sessions

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Redux DevTools
Install Redux DevTools browser extension for enhanced debugging.

## 📄 License

This project is for educational/assignment purposes.  