import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchCostTypeByAlias } from '../../services/costTypeService';
import { CostType, Item, Cost, Category, Program, Project } from '../../types/program';
import { updateItemCosts, createLineItem, deleteLineItem, updateItemName } from '../../services/itemService';
import { fetchPrograms } from '../../services/programService';

interface CostTypesState {
  item: CostType | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CostTypesState = {
  item: null,
  status: 'idle',
  error: null,
};

export const fetchCostTypeByAliasAsync = createAsyncThunk(
  'costTypes/fetchCostTypeByAlias',
  async (alias: string) => {
    const response = await fetchCostTypeByAlias(alias);
    return response;
  }
);

export const updateItemCostsAsync = createAsyncThunk(
  'costTypes/updateItemCosts',
  async ({ 
    itemId,
    updatedItem,
    programId,
    projectId,
    categoryId 
  }: {
    itemId: number;
    updatedItem: Partial<Item>;
    programId: number;
    projectId: number;
    categoryId: number;
  }) => {
    const response = await updateItemCosts(itemId, updatedItem);
    return {
      programId,
      projectId,
      categoryId,
      item: response
    };
  }
);

export const createLineItemAsync = createAsyncThunk(
  'costTypes/createLineItem',
  async ({ 
    programId,
    projectId,
    categoryId,
    item 
  }: {
    programId: number;
    projectId: number;
    categoryId: number;
    item: Partial<Item>;
  }) => {
    const response = await createLineItem(categoryId, item);
    return {
      programId,
      projectId,
      categoryId,
      item: response
    };
  }
);

export const deleteLineItemAsync = createAsyncThunk(
  'costTypes/deleteLineItem',
  async ({ 
    itemId,
    programId,
    projectId,
    categoryId 
  }: {
    itemId: number;
    programId: number;
    projectId: number;
    categoryId: number;
  }) => {
    await deleteLineItem(itemId);
    return { itemId, programId, projectId, categoryId };
  }
);

export const updateItemNameAsync = createAsyncThunk(
  'costTypes/updateItemName',
  async ({ 
    itemId,
    name,
    programId,
    projectId,
    categoryId 
  }: {
    itemId: number;
    name: string;
    programId: number;
    projectId: number;
    categoryId: number;
  }) => {
    const response = await updateItemName(itemId, name);
    return {
      programId,
      projectId,
      categoryId,
      item: response
    };
  }
);

const costTypesSlice = createSlice({
  name: 'costTypes',
  initialState,
  reducers: {
    updateLineItemInCostType: (state, action: PayloadAction<{
      programId: number;
      projectId: number;
      categoryId: number;
      lineItem: Item;
    }>) => {
      const { programId, projectId, categoryId, lineItem } = action.payload;
      if (!state.item) return;

      const program = state.item.programs.find(p => p.id === programId);
      if (!program) return;

      const project = program.projects.find(p => p.id === projectId);
      if (!project) return;

      const category = project.categories.find(c => c.id === categoryId);
      if (!category) return;

      const itemIndex = category.items.findIndex(item => item.id === lineItem.id);
      if (itemIndex === -1) {
        category.items.push(lineItem);
      } else {
        category.items[itemIndex] = {
          ...lineItem,
          costs: lineItem.costs.map((cost: Cost) => ({
            id: cost.id || Date.now() + Math.random(),
            value: Number(cost.value)
          }))
        };
      }
    },
    updateCategory(state, action: PayloadAction<{ programId: number; projectId: number; category: Category }>) {
      const { programId, projectId, category } = action.payload;
      if (!state.item) return;

      const program = state.item.programs.find(p => p.id === programId);
      if (!program) return;

      const project = program.projects.find(p => p.id === projectId);
      if (!project) return;

      const categoryIndex = project.categories.findIndex(c => c.id === category.id);
      if (categoryIndex === -1) {
        project.categories.push(category);
      } else {
        project.categories[categoryIndex] = category;
      }
    },
    updateProgram(state, action: PayloadAction<Program>) {
      if (!state.item) return;

      const programIndex = state.item.programs.findIndex(p => p.id === action.payload.id);
      if (programIndex === -1) {
        state.item.programs.push(action.payload);
      } else {
        state.item.programs[programIndex] = action.payload;
      }
    },
    updateProject(state, action: PayloadAction<{ programId: number; project: Project }>) {
      const { programId, project } = action.payload;
      if (!state.item) return;

      const program = state.item.programs.find(p => p.id === programId);
      if (!program) return;

      const projectIndex = program.projects.findIndex(p => p.id === project.id);
      if (projectIndex === -1) {
        program.projects.push(project);
      } else {
        program.projects[projectIndex] = project;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCostTypeByAliasAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCostTypeByAliasAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.item = action.payload;
      })
      .addCase(fetchCostTypeByAliasAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateItemCostsAsync.fulfilled, (state, action) => {
        const { programId, projectId, categoryId, item } = action.payload;
        if (!state.item) return;

        const program = state.item.programs.find(p => p.id === programId);
        if (!program) return;

        const project = program.projects.find(p => p.id === projectId);
        if (!project) return;

        const category = project.categories.find(c => c.id === categoryId);
        if (!category) return;

        const itemIndex = category.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          category.items[itemIndex] = item;
        }
      })
      .addCase(createLineItemAsync.fulfilled, (state, action) => {
        const { programId, projectId, categoryId, item } = action.payload;
        if (!state.item) return;

        const program = state.item.programs.find(p => p.id === programId);
        if (!program) return;

        const project = program.projects.find(p => p.id === projectId);
        if (!project) return;

        const category = project.categories.find(c => c.id === categoryId);
        if (!category) return;

        if (!item.costs) {
          item.costs = Array(13).fill({ value: 0 });
        }

        if (!category.items) {
          category.items = [];
        }
        
        category.items.push(item);
      })
      .addCase(deleteLineItemAsync.fulfilled, (state, action) => {
        const { itemId, programId, projectId, categoryId } = action.payload;
        if (!state.item) return;

        const program = state.item.programs.find(p => p.id === programId);
        if (!program) return;

        const project = program.projects.find(p => p.id === projectId);
        if (!project) return;

        const category = project.categories.find(c => c.id === categoryId);
        if (!category) return;

        category.items = category.items.filter(item => item.id !== itemId);
      });
  },
});

export const { updateLineItemInCostType, updateCategory, updateProgram, updateProject } = costTypesSlice.actions;
export default costTypesSlice.reducer; 