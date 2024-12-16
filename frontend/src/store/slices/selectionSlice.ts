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
  selectedCloudProviders: string[];
  _tempCategoryId: number | null;
  selectedCostType: string | null;
}

interface UpdateSelectionsPayload {
  selectedProgramId?: number | null;
  selectedProjectId?: number | null;
  selectedCategoryId?: number | null;
  selectedLineItems?: Item[];
  selectedCostType?: string | null;
}

const initialState: SelectionState = {
  selectedProgramId: null,
  selectedProjectId: null,
  selectedCategoryId: null,
  selectedLineItems: [],
  selectedProvider: '',
  selectedCloudProviders: [],
  _tempCategoryId: null,
  selectedCostType: null,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setProgramId: (state, action: PayloadAction<number | null>) => {
      state.selectedProgramId = action.payload;
      state.selectedProjectId = null;
      state.selectedCategoryId = null;
      state.selectedLineItems = [];
    },
    setProjectId: (state, action: PayloadAction<number | null>) => {
      state.selectedProjectId = action.payload;
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
    updateSelections: (state, action: PayloadAction<UpdateSelectionsPayload>) => {
      console.log('Updating selections:', {
        current: state,
        update: action.payload
      });
      if (action.payload.selectedProgramId !== undefined) {
        state.selectedProgramId = action.payload.selectedProgramId;
      }
      if (action.payload.selectedProjectId !== undefined) {
        state.selectedProjectId = action.payload.selectedProjectId;
      }
      if (action.payload.selectedCategoryId !== undefined) {
        state.selectedCategoryId = action.payload.selectedCategoryId;
      }
      if (action.payload.selectedLineItems) {
        state.selectedLineItems = action.payload.selectedLineItems;
      }
      if (action.payload.selectedCostType !== undefined) {
        state.selectedCostType = action.payload.selectedCostType;
      }
    },
    setSelectedCloudProviders: (state, action: PayloadAction<string[]>) => {
      state.selectedCloudProviders = action.payload;
    },
    setCostType: (state, action: PayloadAction<string | null>) => {
      state.selectedCostType = action.payload;
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

export const selectSelectedProgramId = (state: RootState) => state.selection.selectedProgramId;
export const selectSelectedProjectId = (state: RootState) => state.selection.selectedProjectId;

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
  setSelectedCloudProviders,
  setCostType,
} = selectionSlice.actions;

export default selectionSlice.reducer;
