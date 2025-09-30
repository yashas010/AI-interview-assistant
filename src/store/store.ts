// Main store exports
export { store, persistor } from './index';
export type { RootState, AppDispatch } from './index';

// Hooks
export { useAppSelector, useAppDispatch } from './hooks';

// Selectors
export * from './selectors';

// App Actions
export {
  setActiveTab,
  setShowWelcomeModal,
  setLoading,
  clearLoading,
  setError as setAppError,
  clearError as clearAppError,
  setOnlineStatus,
  resetApp,
} from './slices/appSlice';

// Interview Actions  
export {
  setResumeData,
  setProcessingResume,
  startNewSession,
  pauseSession,
  resumeSession,
  nextQuestion,
  updateTimeRemaining,
  completeSession,
  clearSession,
  setError as setInterviewError,
  clearError as clearInterviewError,
} from './slices/interviewSlice';

// Candidates Actions
export {
  addCandidate,
  updateCandidate,
  addAnswer,
  completeCandidate,
  setSelectedCandidate,
  setSearchTerm,
  setSortBy,
  setFilterStatus,
  clearAllCandidates,
} from './slices/candidatesSlice';

// Types
export * from './types';