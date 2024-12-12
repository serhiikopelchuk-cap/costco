import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  search: {
    program: string;
    project: string;
    category: string;
    lineItem: string;
  };
  addInputVisibility: {
    program: boolean;
    project: boolean;
    category: boolean;
    lineItem: boolean;
  };
  details: {
    type: string;
    id: number;
    name: string;
    activeTab?: 'settings' | 'summary';
    isPinned?: boolean;
  } | null;
  currentPage: 'direct_costs' | 'indirect_costs' | null;
}

const initialState: UiState = {
  search: {
    program: '',
    project: '',
    category: '',
    lineItem: '',
  },
  addInputVisibility: {
    program: false,
    project: false,
    category: false,
    lineItem: false,
  },
  details: null,
  currentPage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch: (
      state,
      action: PayloadAction<{ type: keyof UiState['search']; value: string }>
    ) => {
      state.search[action.payload.type] = action.payload.value;
    },
    setAddInputVisibility: (
      state,
      action: PayloadAction<{ type: keyof UiState['addInputVisibility']; value: boolean }>
    ) => {
      state.addInputVisibility[action.payload.type] = action.payload.value;
    },
    setDetails: (state, action: PayloadAction<{
      type: string;
      id: number;
      name: string;
      activeTab?: 'settings' | 'summary';
      isPinned?: boolean;
    } | null>) => {
      if (action.payload === null && !state.details?.isPinned) {
        state.details = null;
      } else if (action.payload !== null) {
        state.details = action.payload;
      }
    },
    resetUi: (state) => {
      return initialState;
    },
    setCurrentPage: (state, action: PayloadAction<'direct_costs' | 'indirect_costs'>) => {
      state.currentPage = action.payload;
    },
    unpinDetails: (state) => {
      if (state.details) {
        state.details.isPinned = false;
      }
    }
  },
});

export const {
  setSearch,
  setAddInputVisibility,
  setDetails,
  resetUi,
  setCurrentPage,
  unpinDetails
} = uiSlice.actions;

export default uiSlice.reducer; 