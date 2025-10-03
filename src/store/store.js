import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import jobsReducer from './jobsSlice';
import candidatesReducer from './candidatesSlice';
import uiReducer from './uiSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['jobs', 'candidates'],
};

const rootReducer = combineReducers({
  jobs: jobsReducer,
  candidates: candidatesReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
