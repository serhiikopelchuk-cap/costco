import { configureStore } from '@reduxjs/toolkit';
import programsReducer from './slices/programsSlice';
import selectionReducer from './slices/selectionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    programs: programsReducer,
    selection: selectionReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 