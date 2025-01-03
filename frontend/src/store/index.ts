import { configureStore } from '@reduxjs/toolkit';
import programsReducer from './slices/programsSlice';
import selectionReducer from './slices/selectionSlice';
import uiReducer from './slices/uiSlice';
import costTypesReducer from './slices/costTypesSlice';
import cloudProvidersReducer from './slices/cloudProvidersSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    programs: programsReducer,
    selection: selectionReducer,
    ui: uiReducer,
    costTypes: costTypesReducer,
    cloudProviders: cloudProvidersReducer,
    user: userReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 