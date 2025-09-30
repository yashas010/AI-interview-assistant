import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TabType, LoadingState, ErrorState } from '../types';

interface AppState {
  activeTab: TabType;
  showWelcomeModal: boolean;
  loading: LoadingState;
  error: ErrorState;
  isOnline: boolean;
}

const initialState: AppState = {
  activeTab: 'interviewee',
  showWelcomeModal: true,
  loading: {
    isLoading: false,
  },
  error: {
    hasError: false,
  },
  isOnline: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Tab management
    setActiveTab: (state, action: PayloadAction<TabType>) => {
      state.activeTab = action.payload;
    },

    // Modal management
    setShowWelcomeModal: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeModal = action.payload;
    },

    // Loading state
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.loading = action.payload;
    },

    clearLoading: (state) => {
      state.loading = { isLoading: false };
    },

    // Error handling
    setError: (state, action: PayloadAction<{ hasError: boolean; message?: string }>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = { hasError: false };
    },

    // Network status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Reset app state
    resetApp: (state) => {
      state.activeTab = 'interviewee';
      state.showWelcomeModal = true;
      state.loading = { isLoading: false };
      state.error = { hasError: false };
    },
  },
});

export const {
  setActiveTab,
  setShowWelcomeModal,
  setLoading,
  clearLoading,
  setError,
  clearError,
  setOnlineStatus,
  resetApp,
} = appSlice.actions;

export default appSlice.reducer;