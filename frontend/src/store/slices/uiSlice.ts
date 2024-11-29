import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
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
    type: 'program' | 'project' | null;
    name: string;
    id: number;
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
    setDetails: (state, action: PayloadAction<UiState['details']>) => {
      state.details = action.payload;
    },
    resetUi: (state) => {
      return initialState;
    },
    setCurrentPage: (state, action: PayloadAction<'direct_costs' | 'indirect_costs'>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setSearch,
  setAddInputVisibility,
  setDetails,
  resetUi,
  setCurrentPage,
} = uiSlice.actions;

export default uiSlice.reducer; 