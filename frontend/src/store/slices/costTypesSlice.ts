import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchCostTypeByAlias } from '../../services/costTypeService';
import { fetchPrograms } from '../../services/programService';
import { CostType, Item, Cost, Category, Program, Project } from '../../types/program';
import { updateItemCosts, createLineItem, deleteLineItem, updateItemName } from '../../services/itemService';
import { createCategory, deleteCategory, fetchCategoryById, updateCategory as updateCategoryService } from '../../services/categoryService';
import { updateProgram as updateProgramService } from '../../services/programService';
import { updateProject as updateProjectService } from '../../services/projectService';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { setCategoryId } from './selectionSlice';
import { createProgram } from '../../services/programService';
import { fetchProjectById } from '../../services/projectService';
import { fetchProgramById } from '../../services/programService';
import { createProject } from '../../services/projectService';

interface CostTypesState {
  item: CostType | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  directCosts: CostType | null;
  indirectCosts: CostType | null;
  allPrograms: Program[];
}

const initialState: CostTypesState = {
  item: null,
  status: 'idle',
  error: null,
  directCosts: null,
  indirectCosts: null,
  allPrograms: [],
};

export const fetchProgramsAsync = createAsyncThunk(
  'costTypes/fetchPrograms',
  async () => {
    const response = await fetchPrograms();
    return response;
  }
);

// Helper function to convert programs to CostType structure
const programsToCostType = (programs: Program[], costTypeId: number, alias: string): CostType => {
  return {
    id: costTypeId,
    name: alias,
    alias: alias,
    programs: programs.map(program => ({
      ...program,
      projects: program.projects.map(project => ({
        ...project,
        categories: project.categories.filter(category => 
          !category.costType || category.costType?.id === costTypeId
        )
      }))
    }))
  };
};

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

export const deleteCategoryAsync = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId: number) => {
    await deleteCategory(categoryId);
    return categoryId;
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
  }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const currentCategoryId = state.selection.selectedCategoryId;

    try {
      // Update backend
      const response = await updateItemCosts(itemId, updatedItem);

      // Update local state first
      dispatch(updateLineItemInCostType({
        programId,
        projectId,
        categoryId: currentCategoryId || categoryId,
        lineItem: {
          ...response,
          costs: updatedItem.costs as Cost[]
        }
      }));

      // Return without fetching updated data
      return {
        programId,
        projectId,
        categoryId: currentCategoryId || categoryId,
        item: response
      };
    } catch (error) {
      console.error('Error in updateItemCostsAsync:', error);
      throw error;
    }
  }
);

export const createLineItemAsync = createAsyncThunk(
  'costTypes/createLineItem',
  async ({ 
    categoryId, 
    item,
    programId,
    projectId 
  }: { 
    categoryId: number; 
    item: Partial<Item>;
    programId: number;
    projectId: number;
  }, { dispatch }) => {
    const response = await createLineItem(categoryId, item);
    
    // Ensure the category stays selected
    dispatch(setCategoryId(categoryId));
    
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
    return {
      itemId,
      programId,
      projectId,
      categoryId
    };
  }
);

export const createCategoryAsync = createAsyncThunk(
  'costTypes/createCategory',
  async ({ 
    category,
    programId,
    projectId 
  }: { 
    category: Partial<Category>;
    programId: number;
    projectId: number;
  }) => {
    const response = await createCategory(category);
    return {
      programId,
      projectId,
      category: response
    };
  }
);

export const fetchCategoryAsync = createAsyncThunk(
  'costTypes/fetchCategory',
  async ({ 
    categoryId,
    programId,
    projectId 
  }: { 
    categoryId: number;
    programId: number;
    projectId: number;
  }) => {
    const response = await fetchCategoryById(categoryId);
    return {
      category: response,
      programId,
      projectId
    };
  }
);

export const createProgramAsync = createAsyncThunk(
  'costTypes/createProgram',
  async ({ program }: { program: Partial<Program> }) => {
    const response = await createProgram(program);
    return response;
  }
);

export const fetchProjectAsync = createAsyncThunk(
  'costTypes/fetchProject',
  async ({ projectId, programId }: { projectId: number; programId: number }) => {
    const response = await fetchProjectById(projectId);
    return { project: response, programId };
  }
);

export const fetchProgramAsync = createAsyncThunk(
  'costTypes/fetchProgram',
  async (programId: number) => {
    const response = await fetchProgramById(programId);
    return response;
  }
);

export const updateCategoryNameAsync = createAsyncThunk(
  'costTypes/updateCategoryName',
  async ({ categoryId, name, programId, projectId }: { categoryId: number; name: string; programId: number; projectId: number }) => {
    const response = await updateCategoryService(categoryId, { name });
    return { categoryId, name, programId, projectId };
  }
);

export const updateProgramNameAsync = createAsyncThunk(
  'costTypes/updateProgramName',
  async ({ programId, name }: { programId: number; name: string }) => {
    const response = await updateProgramService(programId, { name });
    return { id: programId, name };
  }
);

export const updateProjectNameAsync = createAsyncThunk(
  'costTypes/updateProjectName',
  async ({ projectId, programId, name }: { projectId: number; programId: number; name: string }) => {
    const response = await updateProjectService(projectId, { name });
    return { projectId, programId, name };
  }
);

export const updateProjectSettingsAsync = createAsyncThunk(
  'costTypes/updateProjectSettings',
  async ({ projectId, programId, settings }: { projectId: number; programId: number; settings: any }) => {
    const response = await updateProjectService(projectId, { settings });
    return { projectId, programId, settings };
  }
);

export const updateProgramSettingsAsync = createAsyncThunk(
  'costTypes/updateProgramSettings',
  async ({ programId, settings }: { programId: number; settings: any }) => {
    const response = await updateProgramService(programId, { settings });
    return { programId, settings };
  }
);

export const selectProjectById = (state: RootState, projectId: number) => {
  const project = state.costTypes.item?.programs.flatMap(program => program.projects).find(project => project.id === projectId);
  return project || null;
};

export const fetchCostTypeByAliasAsync = createAsyncThunk(
  'costTypes/fetchCostTypeByAlias',
  async (alias: string, { dispatch }) => {
    // First fetch all programs
    const response = await fetchPrograms();
    
    // Then update programs in state
    await dispatch(fetchProgramsAsync());
    
    // Return all programs without filtering
    return {
      id: alias === 'direct_costs' ? 1 : 2,
      name: alias,
      alias: alias,
      programs: response
    };
  }
);

export const createProjectAsync = createAsyncThunk(
  'costTypes/createProject',
  async ({ programId, project }: { programId: number; project: Partial<Project> }) => {
    const response = await createProject(programId, project);
    return { project: response, programId };
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
      
      [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
        if (!costType) return;
        
        const program = costType.programs.find(p => p.id === programId);
        if (!program) return;

        const project = program.projects.find(p => p.id === projectId);
        if (!project) return;

        const category = project.categories.find(c => c.id === categoryId);
        if (!category) return;

        const itemIndex = category.items.findIndex(i => i.id === lineItem.id);
        if (itemIndex !== -1) {
          // Preserve existing item state while updating costs
          category.items[itemIndex] = {
            ...category.items[itemIndex],
            costs: lineItem.costs
          };
        }
      });
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
    updatePrograms: (state, action: PayloadAction<Program[]>) => {
      if (state.item) {
        state.item.programs = action.payload;
      }
    },
    deleteProgramAction: (state, action: PayloadAction<number>) => {
      const programId = action.payload;
      
      // Remove from allPrograms
      state.allPrograms = state.allPrograms.filter(p => p.id !== programId);
      
      // Remove from all cost type structures
      [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
        if (!costType) return;
        
        // Filter out the deleted program
        costType.programs = costType.programs.filter(p => p.id !== programId);
      });
    },
    deleteProjectAction: (state, action: PayloadAction<{ programId: number; projectId: number }>) => {
      const { programId, projectId } = action.payload;
      
      // First update allPrograms
      const programInAll = state.allPrograms.find(p => p.id === programId);
      if (programInAll) {
        programInAll.projects = programInAll.projects.filter(p => p.id !== projectId);
      }

      // Helper function to update program projects
      const updateProgramProjects = (program: Program | undefined) => {
        if (program) {
          program.projects = program.projects.filter(p => p.id !== projectId);
        }
      };

      // Update all structures
      if (state.directCosts) {
        updateProgramProjects(state.directCosts.programs.find(p => p.id === programId));
      }
      if (state.indirectCosts) {
        updateProgramProjects(state.indirectCosts.programs.find(p => p.id === programId));
      }
      if (state.item) {
        updateProgramProjects(state.item.programs.find(p => p.id === programId));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgramsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProgramsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allPrograms = action.payload;
        
        // Create direct costs structure
        state.directCosts = programsToCostType(action.payload, 1, 'direct_costs');
        
        // Create indirect costs structure
        state.indirectCosts = programsToCostType(action.payload, 2, 'indirect_costs');
        
        // Update current item based on what's currently selected
        if (!state.item || state.item.alias === 'direct_costs') {
          state.item = state.directCosts;
        } else if (state.item.alias === 'indirect_costs') {
          state.item = state.indirectCosts;
        }
      })
      .addCase(fetchProgramsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateItemCostsAsync.fulfilled, (state, action) => {
        const { programId, projectId, categoryId, item } = action.payload;
        console.log('In reducer - Category ID:', categoryId);
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          const category = project.categories.find(c => c.id === categoryId);
          if (!category) return;

          const itemIndex = category.items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            // Preserve the existing item state while updating costs
            category.items[itemIndex] = {
              ...category.items[itemIndex],
              costs: item.costs
            };
          }
        });
      })
      .addCase(createLineItemAsync.fulfilled, (state, action) => {
        const { programId, projectId, categoryId, item } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          const category = project.categories.find(c => c.id === categoryId);
          if (!category) return;

          // Preserve category selection when adding item
          category.items.push(item);
        });
      })
      .addCase(deleteLineItemAsync.fulfilled, (state, action) => {
        const { itemId, programId, projectId, categoryId } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          const category = project.categories.find(c => c.id === categoryId);
          if (!category) return;

          category.items = category.items.filter(item => item.id !== itemId);
        });
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        const { programId, projectId, category } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          project.categories.push(category);
        });
      })
      .addCase(fetchCategoryAsync.fulfilled, (state, action) => {
        const { category, programId, projectId } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          const categoryIndex = project.categories.findIndex(c => c.id === category.id);
          if (categoryIndex !== -1) {
            const existingCategory = project.categories[categoryIndex];
            project.categories[categoryIndex] = {
              ...category,
              items: category.items.map(item => {
                const existingItem = existingCategory.items.find(i => i.id === item.id);
                return existingItem || item;
              })
            };
          }
        });
      })
      .addCase(updateItemNameAsync.fulfilled, (state, action) => {
        const { programId, projectId, categoryId, item } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          const category = project.categories.find(c => c.id === categoryId);
          if (!category) return;

          const itemIndex = category.items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            // Preserve existing item state while updating name
            category.items[itemIndex] = {
              ...category.items[itemIndex],
              name: item.name
            };
          }
        });
      })
      .addCase(createProgramAsync.fulfilled, (state, action) => {
        // Add the new program to allPrograms if it's not there already
        if (!state.allPrograms.find(p => p.id === action.payload.id)) {
          state.allPrograms.push(action.payload);
        }
        
        // Add to item.programs if item exists and program isn't there
        if (state.item && !state.item.programs.find(p => p.id === action.payload.id)) {
          state.item.programs.push(action.payload);
        }
      })
      .addCase(fetchProjectAsync.fulfilled, (state, action) => {
        const { project, programId } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const projectIndex = program.projects.findIndex(p => p.id === project.id);
          if (projectIndex !== -1) {
            program.projects[projectIndex] = project;
          } else {
            program.projects.push(project);
          }
        });
      })
      .addCase(fetchProgramAsync.fulfilled, (state, action) => {
        const programIndex = state.item?.programs.findIndex(p => p.id === action.payload.id);
        if (programIndex !== undefined && programIndex !== -1) {
          state.item!.programs[programIndex] = action.payload;
        } else {
          state.item?.programs.push(action.payload);
        }
      })
      .addCase(updateCategoryNameAsync.fulfilled, (state, action) => {
        const { categoryId, name, programId, projectId } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (!project) return;

          const category = project.categories.find(c => c.id === categoryId);
          if (category) {
            category.name = name;
          }
        });
      })
      .addCase(updateProgramNameAsync.fulfilled, (state, action) => {
        console.log('updateProgramNameAsync.fulfilled:', action.payload);
        
        if (state.item) {
          const program = state.item.programs.find(p => p.id === action.payload.id);
          if (program) {
            console.log('Updating program name:', {
              oldName: program.name,
              newName: action.payload.name
            });
            program.name = action.payload.name;
          }
        }
      })
      .addCase(updateProjectNameAsync.fulfilled, (state, action) => {
        console.log('updateProjectNameAsync.fulfilled:', action.payload);
        
        const { projectId, programId, name } = action.payload;
        
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          const project = program.projects.find(p => p.id === projectId);
          if (project) {
            console.log('Updating project name:', {
              oldName: project.name,
              newName: name
            });
            project.name = name;
          }
        });
      })
      .addCase(updateProjectSettingsAsync.fulfilled, (state, action) => {
        // Handle the update in the state if necessary
      })
      .addCase(updateProgramSettingsAsync.fulfilled, (state, action) => {
        const { programId, settings } = action.payload;
        const program = state.item?.programs.find(p => p.id === programId);
        if (program) {
          program.settings = settings;
        }
      })
      .addCase(fetchCostTypeByAliasAsync.fulfilled, (state, action) => {
        console.log('fetchCostTypeByAliasAsync.fulfilled:', {
          payload: action.payload,
          currentState: state
        });
        
        if (action.meta.arg === 'direct_costs') {
          state.directCosts = action.payload;
          state.item = action.payload;
        } else if (action.meta.arg === 'indirect_costs') {
          state.indirectCosts = action.payload;
          state.item = action.payload;
        }
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        const { project, programId } = action.payload;
        
        // Add to all relevant structures
        [state.directCosts, state.indirectCosts, state.item].forEach(costType => {
          if (!costType) return;
          
          const program = costType.programs.find(p => p.id === programId);
          if (!program) return;

          program.projects.push(project);
        });
      });
  },
});

export const { 
  updateLineItemInCostType, 
  updateCategory, 
  updateProgram, 
  updateProject, 
  updatePrograms, 
  deleteProjectAction,
  deleteProgramAction 
} = costTypesSlice.actions;
export default costTypesSlice.reducer;

export const selectCategories = (selectedProgramId: number | null, selectedProjectId: number | null) =>
  createSelector(
    (state: RootState) => state.costTypes.item,
    (costType) => {
      if (!costType || selectedProgramId === null || selectedProjectId === null) return [];
      const program = costType.programs.find(p => p.id === selectedProgramId);
      const project = program?.projects.find(p => p.id === selectedProjectId);
      return project?.categories || [];
    }
  ); 