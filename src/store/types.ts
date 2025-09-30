// Core data types based on requirements

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  score: number;
  status: 'pending' | 'in-progress' | 'completed';
  summary: string;
  answers: Answer[];
  createdAt: string;
  completedAt?: string;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds
  timeSpent: number; // seconds
  aiScore: number; // 0-100
  feedback?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // Easy: 20s, Medium: 60s, Hard: 120s
}

export interface InterviewSession {
  candidateId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  startedAt?: string;
  questions: InterviewQuestion[];
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  extractedText: string;
}

// UI State types
export type TabType = 'interviewee' | 'interviewer';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}