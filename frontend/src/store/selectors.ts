import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Program, Project } from '../types/program';

export const selectCategories = createSelector(
  (state: RootState) => state.programs.items,
  (state: RootState) => state.selection.selectedProgramId,
  (state: RootState) => state.selection.selectedProjectId,
  (programs: Program[], selectedProgramId: number | null, selectedProjectId: number | null) => {
    const program = programs.find((p: Program) => p.id === selectedProgramId);
    const project = program?.projects.find((p: Project) => p.id === selectedProjectId);
    return project?.categories || [];
  }
); 