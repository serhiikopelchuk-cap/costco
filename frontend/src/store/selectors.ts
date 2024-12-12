import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Создаем базовые селекторы для получения данных из state
const selectSelection = (state: RootState) => state.selection;
const selectCostType = (state: RootState) => state.costTypes.item;

// Мемоизированный селектор для категорий
export const selectCategories = createSelector(
  [selectSelection, selectCostType],
  (selection, costType) => {
    const { selectedProgramId, selectedProjectId, selectedCostType, selectedCloudProviders } = selection;

    if (!selectedProgramId || !selectedProjectId || !costType) {
      return [];
    }

    const program = costType.programs.find(p => p.id === selectedProgramId);
    if (!program) return [];

    const project = program.projects.find(p => p.id === selectedProjectId);
    if (!project) return [];

    let categories = project.categories || [];

    // Filter by cost type only if it's set
    if (selectedCostType) {
      categories = categories.filter(category => 
        !category.costType || category.costType?.alias === selectedCostType
      );
    }

    // If no cloud providers selected, return all categories filtered by cost type
    if (selectedCloudProviders.length === 0) {
      return categories;
    }

    // If cloud providers are selected, show only categories with these providers
    return categories.filter(category => {
      return category.cloudProviders?.some(provider => 
        selectedCloudProviders.includes(provider.name)
      );
    });
  }
);

export const selectCloudProvidersForProject = createSelector(
  [selectCategories],
  (categories) => {
    const providersSet = new Set<string>();
    categories.forEach(category => {
      category.cloudProviders?.forEach(provider => providersSet.add(provider.name));
    });
    return Array.from(providersSet);
  }
);

export const selectSelectedProjectId = (state: RootState) => state.selection.selectedProjectId; 