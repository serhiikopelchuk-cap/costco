import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DetailsState {
  type: 'program' | 'project' | null;
  id: number | null;
  name: string | null;
  isPinned: boolean;
  activeTab?: 'settings' | 'summary';
  parentProgramId?: number | null; // For project details
}

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
  details: DetailsState | null;
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
    setDetails: (state, action: PayloadAction<DetailsState | null>) => {
      console.log('Setting details:', {
        current: state.details,
        new: action.payload
      });
      if (state.details?.isPinned && action.payload === null) {
        return;
      }
      state.details = action.payload;
    },
    pinDetails: (state) => {
      if (state.details) {
        state.details.isPinned = true;
      }
    },
    unpinDetails: (state) => {
      if (state.details) {
        state.details.isPinned = false;
      }
    },
    clearDetails: (state) => {
      state.details = null;
    },
    setDetailsTab: (state, action: PayloadAction<'settings' | 'summary'>) => {
      if (state.details) {
        state.details.activeTab = action.payload;
      }
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
  pinDetails,
  unpinDetails,
  clearDetails,
  setDetailsTab,
  resetUi,
  setCurrentPage,
} = uiSlice.actions;

export default uiSlice.reducer; 