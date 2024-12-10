import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Program, Project, CostType } from '../types/program';

export const selectCategories = createSelector(
  (state: RootState) => state.costTypes.item,
  (state: RootState) => state.selection.selectedProgramId,
  (state: RootState) => state.selection.selectedProjectId,
  (costType: CostType | null, selectedProgramId: number | null, selectedProjectId: number | null) => {
    if (!costType) return [];
    const program = costType.programs.find((p: Program) => p.id === selectedProgramId);
    const project = program?.projects.find((p: Project) => p.id === selectedProjectId);
    return project?.categories || [];
  }
);

export const selectCloudProvidersForProject = createSelector(
  selectCategories,
  (categories) => {
    const providersSet = new Set<string>();
    categories.forEach(category => {
      category.cloudProviders?.forEach(provider => providersSet.add(provider.name));
    });
    return Array.from(providersSet);
  }
);

export const selectSelectedProjectId = (state: RootState) => state.selection.selectedProjectId; 