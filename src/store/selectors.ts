import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Interview selectors
export const selectCurrentSession = (state: RootState) => state.interview.currentSession;
export const selectResumeData = (state: RootState) => state.interview.resumeData;
export const selectHasIncompleteSession = (state: RootState) => state.interview.hasIncompleteSession;
export const selectIsProcessingResume = (state: RootState) => state.interview.isProcessingResume;
export const selectInterviewError = (state: RootState) => state.interview.error;

// Current question selector
export const selectCurrentQuestion = createSelector(
  [selectCurrentSession],
  (session) => {
    if (!session) return null;
    return session.questions[session.currentQuestionIndex] || null;
  }
);

// Interview progress selector
export const selectInterviewProgress = createSelector(
  [selectCurrentSession],
  (session) => {
    if (!session) return 0;
    return Math.round((session.currentQuestionIndex / session.totalQuestions) * 100);
  }
);

// Candidates selectors
export const selectAllCandidates = (state: RootState) => state.candidates.candidates;
export const selectSelectedCandidateId = (state: RootState) => state.candidates.selectedCandidateId;
export const selectCandidateFilters = (state: RootState) => ({
  searchTerm: state.candidates.searchTerm,
  sortBy: state.candidates.sortBy,
  filterStatus: state.candidates.filterStatus,
});

// Filtered and sorted candidates selector
export const selectFilteredCandidates = createSelector(
  [selectAllCandidates, selectCandidateFilters],
  (candidates, filters) => {
    let filtered = [...candidates];

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filters.filterStatus !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === filters.filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return b.score - a.score; // Highest score first
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
        default:
          return 0;
      }
    });

    return filtered;
  }
);

// Selected candidate selector
export const selectSelectedCandidate = createSelector(
  [selectAllCandidates, selectSelectedCandidateId],
  (candidates, selectedId) => {
    if (!selectedId) return null;
    return candidates.find(candidate => candidate.id === selectedId) || null;
  }
);

// App selectors
export const selectActiveTab = (state: RootState) => state.app.activeTab;
export const selectShowWelcomeModal = (state: RootState) => state.app.showWelcomeModal;
export const selectAppLoading = (state: RootState) => state.app.loading;
export const selectAppError = (state: RootState) => state.app.error;
export const selectIsOnline = (state: RootState) => state.app.isOnline;

// Derived selectors for missing resume fields
export const selectMissingResumeFields = createSelector(
  [selectResumeData],
  (resumeData) => {
    if (!resumeData) return ['name', 'email', 'phone'];
    
    const missing: string[] = [];
    if (!resumeData.name || resumeData.name.trim() === '') missing.push('name');
    if (!resumeData.email || resumeData.email.trim() === '') missing.push('email');
    if (!resumeData.phone || resumeData.phone.trim() === '') missing.push('phone');
    
    return missing;
  }
);

// Check if ready to start interview
export const selectReadyForInterview = createSelector(
  [selectMissingResumeFields],
  (missingFields) => missingFields.length === 0
);