import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import interviewReducer from './slices/interviewSlice';
import candidatesReducer from './slices/candidatesSlice';
import appReducer from './slices/appSlice';

// Persist configuration
const persistConfig = {
  key: 'ai-interview-assistant',
  storage,
  whitelist: ['interview', 'candidates'], // Only persist interview and candidates data
  // Don't persist app UI state (activeTab, modals, etc.)
};

// Root reducer
const rootReducer = combineReducers({
  interview: interviewReducer,
  candidates: candidatesReducer,
  app: appReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['interview.resumeData.resumeFile'], // File objects aren't serializable
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;