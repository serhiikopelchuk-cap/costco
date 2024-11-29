import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Item } from '../../types/program';

interface SelectionState {
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
  selectedLineItems: Item[];
  selectedProvider: string;
}

const initialState: SelectionState = {
  selectedProgramId: null,
  selectedProjectId: null,
  selectedCategoryId: null,
  selectedLineItems: [],
  selectedProvider: '',
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setProgramId: (state, action: PayloadAction<number | null>) => {
      state.selectedProgramId = action.payload;
      // Reset child selections when program changes
      state.selectedProjectId = null;
      state.selectedCategoryId = null;
      state.selectedLineItems = [];
    },
    setProjectId: (state, action: PayloadAction<number | null>) => {
      state.selectedProjectId = action.payload;
      // Reset child selections when project changes
      state.selectedCategoryId = null;
      state.selectedLineItems = [];
    },
    setCategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
      state.selectedLineItems = [];
    },
    setLineItems: (state, action: PayloadAction<Item[]>) => {
      state.selectedLineItems = action.payload;
    },
    setProvider: (state, action: PayloadAction<string>) => {
      state.selectedProvider = action.payload;
    },
    resetSelection: (state) => {
      return initialState;
    },
    clearCategoryId: (state) => {
      state.selectedCategoryId = null;
    },
  },
});

export const {
  setProgramId,
  setProjectId,
  setCategoryId,
  setLineItems,
  setProvider,
  resetSelection,
  clearCategoryId,
} = selectionSlice.actions;

export default selectionSlice.reducer;
