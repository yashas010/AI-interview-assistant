import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterviewSession, InterviewQuestion, ResumeData } from '../types';

interface InterviewState {
  currentSession: InterviewSession | null;
  resumeData: ResumeData | null;
  isProcessingResume: boolean;
  hasIncompleteSession: boolean;
  error: string | null;
}

const initialState: InterviewState = {
  currentSession: null,
  resumeData: null,
  isProcessingResume: false,
  hasIncompleteSession: false,
  error: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // Resume handling
    setResumeData: (state, action: PayloadAction<ResumeData>) => {
      state.resumeData = action.payload;
      state.error = null;
    },
    
    setProcessingResume: (state, action: PayloadAction<boolean>) => {
      state.isProcessingResume = action.payload;
    },

    // Session management
    startNewSession: (state, action: PayloadAction<{ candidateId: string; questions: InterviewQuestion[] }>) => {
      state.currentSession = {
        candidateId: action.payload.candidateId,
        currentQuestionIndex: 0,
        totalQuestions: action.payload.questions.length,
        isActive: true,
        isPaused: false,
        timeRemaining: action.payload.questions[0]?.timeLimit || 0,
        startedAt: new Date().toISOString(),
        questions: action.payload.questions,
      };
      state.hasIncompleteSession = true;
      state.error = null;
    },

    pauseSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true;
      }
    },

    resumeSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false;
      }
    },

    nextQuestion: (state) => {
      if (state.currentSession && state.currentSession.currentQuestionIndex < state.currentSession.totalQuestions - 1) {
        state.currentSession.currentQuestionIndex += 1;
        const nextQuestion = state.currentSession.questions[state.currentSession.currentQuestionIndex];
        state.currentSession.timeRemaining = nextQuestion?.timeLimit || 0;
      }
    },

    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentSession && !state.currentSession.isPaused) {
        state.currentSession.timeRemaining = Math.max(0, action.payload);
      }
    },

    completeSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isActive = false;
        state.hasIncompleteSession = false;
      }
    },

    clearSession: (state) => {
      state.currentSession = null;
      state.hasIncompleteSession = false;
      state.resumeData = null;
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setResumeData,
  setProcessingResume,
  startNewSession,
  pauseSession,
  resumeSession,
  nextQuestion,
  updateTimeRemaining,
  completeSession,
  clearSession,
  setError,
  clearError,
} = interviewSlice.actions;

export default interviewSlice.reducer;