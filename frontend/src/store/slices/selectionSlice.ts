import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Item } from '../../types/program';
import { RootState } from '../index';
import { fetchCostTypeByAliasAsync } from './costTypesSlice';
import { updateItemCostsAsync } from './costTypesSlice';

interface SelectionState {
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
  selectedLineItems: Item[];
  selectedProvider: string;
  _tempCategoryId: number | null;
}

const initialState: SelectionState = {
  selectedProgramId: null,
  selectedProjectId: null,
  selectedCategoryId: null,
  selectedLineItems: [],
  selectedProvider: '',
  _tempCategoryId: null,
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
      if (action.payload !== null && state.selectedCategoryId !== action.payload) {
        state.selectedCategoryId = action.payload;
      }
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
    updateLineItemCosts: (state, action: PayloadAction<Item>) => {
      // Обновляем costs для выбранного item, сохраняя выбор
      state.selectedLineItems = state.selectedLineItems.map(item => 
        item.id === action.payload.id ? { ...item, costs: action.payload.costs } : item
      );
    },
    updateSelections: (state, action: PayloadAction<{
      programId?: number | null;
      projectId?: number | null;
      categoryId?: number | null;
      lineItems?: Item[];
    }>) => {
      if (action.payload.programId !== undefined) {
        state.selectedProgramId = action.payload.programId;
      }
      if (action.payload.projectId !== undefined) {
        state.selectedProjectId = action.payload.projectId;
      }
      if (action.payload.categoryId !== undefined) {
        state.selectedCategoryId = action.payload.categoryId;
      }
      if (action.payload.lineItems) {
        state.selectedLineItems = action.payload.lineItems;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCostTypeByAliasAsync.fulfilled, (state) => {
        const currentCategory = state.selectedCategoryId;
        if (currentCategory !== null) {
          state.selectedCategoryId = currentCategory;
        }
      })
      .addCase(updateItemCostsAsync.pending, (state) => {
        state._tempCategoryId = state.selectedCategoryId;
      })
      .addCase(updateItemCostsAsync.fulfilled, (state) => {
        if (state._tempCategoryId !== null) {
          state.selectedCategoryId = state._tempCategoryId;
        }
      })
      .addCase(updateItemCostsAsync.rejected, (state) => {
        if (state._tempCategoryId !== null) {
          state.selectedCategoryId = state._tempCategoryId;
        }
      });
  },
});

// Add the async thunk for removing items
export const removeItemFromSelection = createAsyncThunk(
  'selection/removeItem',
  async (itemId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { selectedLineItems } = state.selection;
    
    // Filter out the deleted item from selections
    const updatedItems = selectedLineItems.filter(item => item.id !== itemId);
    dispatch(setLineItems(updatedItems));
    
    return itemId;
  }
);

export const {
  setProgramId,
  setProjectId,
  setCategoryId,
  setLineItems,
  setProvider,
  resetSelection,
  clearCategoryId,
  updateLineItemCosts,
  updateSelections,
} = selectionSlice.actions;

export default selectionSlice.reducer;
