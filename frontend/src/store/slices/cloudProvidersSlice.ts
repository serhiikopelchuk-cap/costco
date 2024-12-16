import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CloudProvider } from '../../types/program';
import * as cloudProviderService from '../../services/cloudProviderService';

interface CloudProvidersState {
  items: CloudProvider[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CloudProvidersState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchCloudProvidersAsync = createAsyncThunk(
  'cloudProviders/fetchAll',
  async () => {
    return await cloudProviderService.fetchCloudProviders();
  }
);

export const createCloudProviderAsync = createAsyncThunk(
  'cloudProviders/create',
  async (name: string) => {
    return await cloudProviderService.createCloudProvider(name);
  }
);

const cloudProvidersSlice = createSlice({
  name: 'cloudProviders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCloudProvidersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCloudProvidersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCloudProvidersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createCloudProviderAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  }
});

export default cloudProvidersSlice.reducer; 