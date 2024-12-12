import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Program, Item, Cost, Category, Project } from '../../types/program';
import { fetchPrograms } from '../../services/programService';
import { fetchProgramById } from '../../services/programService';
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

export const fetchProgramByIdAsync = createAsyncThunk(
  'programs/fetchProgramById',
  async (programId: number) => {
    const program = await fetchProgramById(programId);
    return program;
  }
);

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
  async ({ program }: { program: Partial<Program> }) => {
    const response = await createProgram(program);
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
      .addCase(fetchProgramByIdAsync.fulfilled, (state, action) => {
        const programIndex = state.items.findIndex(p => p.id === action.payload.id);
        if (programIndex !== -1) {
          state.items[programIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        const { programId, project } = action.payload;
        const program = state.items.find(p => p.id === programId);
        if (program) {
          program.projects.push(project);
        }
      })
  },
});

export const { initializePrograms, updateCategory, updateProgram, updateProject, setPrograms, deleteProgram, deleteProject } = programsSlice.actions;
export default programsSlice.reducer;
