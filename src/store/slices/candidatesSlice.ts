import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate, Answer } from '../types';

interface CandidatesState {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  searchTerm: string;
  sortBy: 'score' | 'name' | 'date';
  filterStatus: 'all' | 'pending' | 'in-progress' | 'completed';
}

const initialState: CandidatesState = {
  candidates: [],
  selectedCandidateId: null,
  searchTerm: '',
  sortBy: 'score',
  filterStatus: 'all',
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    // Candidate management
    addCandidate: (state, action: PayloadAction<Omit<Candidate, 'id' | 'createdAt'>>) => {
      const newCandidate: Candidate = {
        ...action.payload,
        id: Date.now().toString(), // Simple ID generation for now
        createdAt: new Date().toISOString(),
      };
      state.candidates.push(newCandidate);
    },

    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const { id, updates } = action.payload;
      const candidateIndex = state.candidates.findIndex(c => c.id === id);
      if (candidateIndex !== -1) {
        state.candidates[candidateIndex] = { ...state.candidates[candidateIndex], ...updates };
      }
    },

    addAnswer: (state, action: PayloadAction<{ candidateId: string; answer: Answer }>) => {
      const { candidateId, answer } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.answers.push(answer);
        // Update status to in-progress if not already
        if (candidate.status === 'pending') {
          candidate.status = 'in-progress';
        }
      }
    },

    completeCandidate: (state, action: PayloadAction<{ candidateId: string; score: number; summary: string }>) => {
      const { candidateId, score, summary } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.status = 'completed';
        candidate.score = score;
        candidate.summary = summary;
        candidate.completedAt = new Date().toISOString();
      }
    },

    // UI state for dashboard
    setSelectedCandidate: (state, action: PayloadAction<string | null>) => {
      state.selectedCandidateId = action.payload;
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    setSortBy: (state, action: PayloadAction<'score' | 'name' | 'date'>) => {
      state.sortBy = action.payload;
    },

    setFilterStatus: (state, action: PayloadAction<'all' | 'pending' | 'in-progress' | 'completed'>) => {
      state.filterStatus = action.payload;
    },

    // Clear all candidates (for development/testing)
    clearAllCandidates: (state) => {
      state.candidates = [];
      state.selectedCandidateId = null;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  addAnswer,
  completeCandidate,
  setSelectedCandidate,
  setSearchTerm,
  setSortBy,
  setFilterStatus,
  clearAllCandidates,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;