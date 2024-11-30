import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Program, Item, Cost, Category, Project } from '../../types/program';
import { fetchPrograms } from '../../services/programService';
import { updateItemCosts } from '../../services/itemService';
import { createLineItem, deleteLineItem, updateItemName } from '../../services/itemService';
import { fetchProgramById } from '../../services/programService';
import { createCategory } from '../../services/categoryService';
import { RootState } from '../index';
import { createProject } from '../../services/projectService';
import { createProgram } from '../../services/programService';

interface ProgramsState {
  items: Program[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProgramsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProgramsAsync = createAsyncThunk(
  'programs/fetchPrograms',
  async () => {
    const response = await fetchPrograms();
    return response;
  }
);

// export const updateItemCostsAsync = createAsyncThunk(
//   'programs/updateItemCosts',
//   async ({ 
//     itemId,
//     updatedItem,
//     programId,
//     projectId,
//     categoryId 
//   }: {
//     itemId: number;
//     updatedItem: Partial<Item>;
//     programId: number;
//     projectId: number;
//     categoryId: number;
//   }) => {
//     const response = await updateItemCosts(itemId, updatedItem);
//     return {
//       programId,
//       projectId,
//       categoryId,
//       item: response
//     };
//   }
// );

// export const createLineItemAsync = createAsyncThunk(
//   'programs/createLineItem',
//   async ({ 
//     programId,
//     projectId,
//     categoryId,
//     item 
//   }: {
//     programId: number;
//     projectId: number;
//     categoryId: number;
//     item: Partial<Item>;
//   }) => {
//     const response = await createLineItem(categoryId, item);
//     return {
//       programId,
//       projectId,
//       categoryId,
//       item: response
//     };
//   }
// );

// export const deleteLineItemAsync = createAsyncThunk(
//   'programs/deleteLineItem',
//   async ({ 
//     itemId,
//     programId,
//     projectId,
//     categoryId 
//   }: {
//     itemId: number;
//     programId: number;
//     projectId: number;
//     categoryId: number;
//   }) => {
//     await deleteLineItem(itemId);
//     return { itemId, programId, projectId, categoryId };
//   }
// );

// export const updateItemNameAsync = createAsyncThunk(
//   'programs/updateItemName',
//   async ({ 
//     itemId,
//     name,
//     programId,
//     projectId,
//     categoryId 
//   }: {
//     itemId: number;
//     name: string;
//     programId: number;
//     projectId: number;
//     categoryId: number;
//   }) => {
//     const response = await updateItemName(itemId, name);
//     return {
//       programId,
//       projectId,
//       categoryId,
//       item: response
//     };
//   }
// );

export const fetchProgramByIdAsync = createAsyncThunk(
  'programs/fetchProgramById',
  async (programId: number) => {
    const program = await fetchProgramById(programId);
    return program;
  }
);

// export const createCategoryAsync = createAsyncThunk(
//   'programs/createCategory',
//   async ({ category }: { category: Partial<Category> }) => {
//     const response = await createCategory(category);
//     return response;
//   }
// );

export const createProjectAsync = createAsyncThunk(
  'programs/createProject',
  async ({ programId, project }: { programId: number; project: Partial<Project> }) => {
    const response = await createProject(programId, project);
    return {
      programId,
      project: response
    };
  }
);

export const createProgramAsync = createAsyncThunk(
  'programs/createProgram',
  async ({ program, costTypeId }: { program: Partial<Program>; costTypeId: number }) => {
    const response = await createProgram(program, costTypeId);
    return response;
  }
);

export const selectCategoriesFromPrograms = (selectedProgramId: number | null, selectedProjectId: number | null) =>
  createSelector(
    (state: RootState) => state.programs.items,
    (items) => {
      const program = items.find(p => p.id === selectedProgramId);
      const project = program?.projects.find(p => p.id === selectedProjectId);
      return project?.categories || [];
    }
  );

const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    initializePrograms: (state, action: PayloadAction<Program[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    // updateLineItem: (state, action: PayloadAction<{
    //   programId: number;
    //   projectId: number;
    //   categoryId: number;
    //   lineItem: Item;
    // }>) => {
    //   const { programId, projectId, categoryId, lineItem } = action.payload;
      
    //   const program = state.items.find(p => p.id === programId);
    //   if (!program) {
    //     console.warn('Program not found:', programId, 'Current state:', state.items);
    //     return;
    //   }

    //   const project = program.projects.find(p => p.id === projectId);
    //   if (!project) {
    //     console.warn('Project not found:', projectId);
    //     return;
    //   }

    //   const category = project.categories.find(c => c.id === categoryId);
    //   if (!category) {
    //     console.warn('Category not found:', categoryId);
    //     return;
    //   }

    //   const itemIndex = category.items.findIndex(item => item.id === lineItem.id);
      
    //   console.log('Updating item in Redux:', {
    //     itemIndex,
    //     oldItem: itemIndex !== -1 ? category.items[itemIndex] : null,
    //     newItem: lineItem
    //   });

    //   if (itemIndex === -1) {
    //     category.items.push(lineItem);
    //   } else {
    //     category.items[itemIndex] = {
    //       ...lineItem,
    //       costs: lineItem.costs.map((cost: Cost) => ({
    //         id: cost.id || Date.now() + Math.random(),
    //         value: Number(cost.value)
    //       }))
    //     };
    //   }

    //   console.log('Updated Redux state:', state.items);
    // },
    updateCategory(state, action: PayloadAction<{ programId: number; projectId: number; category: Category }>) {
      const { programId, projectId, category } = action.payload;
      const program = state.items.find(p => p.id === programId);
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
      const programIndex = state.items.findIndex(p => p.id === action.payload.id);
      if (programIndex === -1) {
        state.items.push(action.payload);
      } else {
        state.items[programIndex] = action.payload;
      }
    },
    updateProject(state, action: PayloadAction<{ programId: number; project: Project }>) {
      const { programId, project } = action.payload;
      const program = state.items.find(p => p.id === programId);
      if (!program) return;

      const projectIndex = program.projects.findIndex(p => p.id === project.id);
      if (projectIndex === -1) {
        program.projects.push(project);
      } else {
        program.projects[projectIndex] = project;
      }
    },
    setPrograms(state, action: PayloadAction<Program[]>) {
      state.items = action.payload;
    },
    deleteProgram(state, action: PayloadAction<number>) {
      state.items = state.items.filter(program => program.id !== action.payload);
    },
    deleteProject(state, action: PayloadAction<{ programId: number; projectId: number }>) {
      const program = state.items.find(p => p.id === action.payload.programId);
      if (program) {
        program.projects = program.projects.filter(project => project.id !== action.payload.projectId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgramsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProgramsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (!state.items.length) {  // Only update if we don't have items
          state.items = action.payload;
        }
      })
      .addCase(fetchProgramsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      // .addCase(updateItemCostsAsync.fulfilled, (state, action) => {
      //   const { programId, projectId, categoryId, item } = action.payload;
        
      //   const program = state.items.find(p => p.id === programId);
      //   if (!program) return;

      //   const project = program.projects.find(p => p.id === projectId);
      //   if (!project) return;

      //   const category = project.categories.find(c => c.id === categoryId);
      //   if (!category) return;

      //   const itemIndex = category.items.findIndex(i => i.id === item.id);
      //   if (itemIndex !== -1) {
      //     category.items[itemIndex] = item;
      //   }
      // })
      // .addCase(createLineItemAsync.fulfilled, (state, action) => {
      //   const { programId, projectId, categoryId, item } = action.payload;
        
      //   // Find the program
      //   const program = state.items.find(p => p.id === programId);
      //   if (!program) {
      //     console.warn('Program not found:', programId);
      //     return;
      //   }

      //   // Find the project
      //   const project = program.projects.find(p => p.id === projectId);
      //   if (!project) {
      //     console.warn('Project not found:', projectId);
      //     return;
      //   }

      //   // Find the category
      //   const category = project.categories.find(c => c.id === categoryId);
      //   if (!category) {
      //     console.warn('Category not found:', categoryId);
      //     return;
      //   }

      //   // Initialize costs array if it doesn't exist
      //   if (!item.costs) {
      //     item.costs = Array(13).fill({ value: 0 });
      //   }

      //   // Add the new item to the category
      //   if (!category.items) {
      //     category.items = [];
      //   }
        
      //   category.items.push(item);
        
      //   console.log('Updated state after adding item:', {
      //     programId,
      //     projectId,
      //     categoryId,
      //     newItem: item,
      //     categoryItems: category.items
      //   });
      // })
      // .addCase(createLineItemAsync.rejected, (state, action) => {
      //   console.error('Failed to create line item:', action.error);
      // })
      // .addCase(deleteLineItemAsync.fulfilled, (state, action) => {
      //   const { itemId, programId, projectId, categoryId } = action.payload;
        
      //   const program = state.items.find(p => p.id === programId);
      //   if (!program) return;

      //   const project = program.projects.find(p => p.id === projectId);
      //   if (!project) return;

      //   const category = project.categories.find(c => c.id === categoryId);
      //   if (!category) return;

      //   category.items = category.items.filter(item => item.id !== itemId);
      // })
      .addCase(fetchProgramByIdAsync.fulfilled, (state, action) => {
        const programIndex = state.items.findIndex(p => p.id === action.payload.id);
        if (programIndex !== -1) {
          state.items[programIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      // .addCase(createCategoryAsync.fulfilled, (state, action) => {
      //   const { project } = action.payload;
      //   const programIndex = state.items.findIndex(p => p.projects.some(pr => pr.id === project!.id));
      //   if (programIndex !== -1) {
      //     const projectIndex = state.items[programIndex].projects.findIndex(pr => pr.id === project!.id);
      //     if (projectIndex !== -1) {
      //       state.items[programIndex].projects[projectIndex] = {
      //         ...state.items[programIndex].projects[projectIndex],
      //         categories: [...state.items[programIndex].projects[projectIndex].categories, action.payload]
      //       };
      //       console.log('Updated categories:', state.items[programIndex].projects[projectIndex].categories);
      //     }
      //   }
      // })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        const { programId, project } = action.payload;
        const program = state.items.find(p => p.id === programId);
        if (program) {
          program.projects.push(project);
        }
      })
      .addCase(createProgramAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { initializePrograms, updateCategory, updateProgram, updateProject, setPrograms, deleteProgram, deleteProject } = programsSlice.actions;
export default programsSlice.reducer;
