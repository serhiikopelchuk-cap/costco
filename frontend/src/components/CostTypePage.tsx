import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Outline from './outline/Outline';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';
import { setProgramId, setProjectId, setCategoryId, setLineItems } from '../store/slices/selectionSlice';
import { setCurrentPage } from '../store/slices/uiSlice';
import { CostType } from '../types/program';

type CostTypeAlias = 'direct_costs' | 'indirect_costs';

interface CostTypePageProps {
  costTypeAlias?: CostTypeAlias;
  costTypeSelector: (state: any) => {
    status: string;
    error: string | null;
    [key: string]: any;
  };
}

const formatDisplayName = (alias: string) => {
  return alias.replace('_', '-');
};

const formatUrlToStateKey = (url: string) => {
  // Get the last part of the URL path
  const path = url.split('/').pop() || '';
  // Convert 'direct-costs' to 'directCosts'
  return path.split('-')
    .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const formatUrlToAlias = (url: string): CostTypeAlias => {
  const path = url.split('/').pop() || '';
  const alias = path.replace('-', '_');
  if (alias !== 'direct_costs' && alias !== 'indirect_costs') {
    throw new Error(`Invalid cost type alias: ${alias}`);
  }
  return alias;
};

const CostTypePage: React.FC<CostTypePageProps> = ({ costTypeAlias: propAlias, costTypeSelector }) => {
  const location = useLocation();
  const urlPath = location.pathname;
  const stateKey = formatUrlToStateKey(urlPath);
  const pageAlias = formatUrlToAlias(urlPath);
  
  const dispatch = useAppDispatch();
  const state = useAppSelector(costTypeSelector);
  const { selectedProgramId, selectedProjectId, selectedCategoryId } = useAppSelector(state => state.selection);
  
  console.log('Full state:', state);
  console.log('State key:', stateKey);
  const { status, error, [stateKey]: costType } = state;

  // Fetch cost types on mount
  useEffect(() => {
    dispatch(fetchCostTypeByAliasAsync(pageAlias));
  }, [dispatch, pageAlias]);

  // Set initial selections only if no selections exist
  useEffect(() => {
    if (costType && Array.isArray(costType.programs) && costType.programs.length > 0 && 
        !selectedProgramId && !selectedProjectId && !selectedCategoryId) {
      const firstProgram = costType.programs[0];
      if (firstProgram && Array.isArray(firstProgram.projects) && firstProgram.projects.length > 0) {
        const firstProject = firstProgram.projects[0];
        if (firstProject && Array.isArray(firstProject.categories) && firstProject.categories.length > 0) {
          const firstCategory = firstProject.categories[0];
          const firstItem = firstCategory.items && firstCategory.items.length > 0 ? firstCategory.items[0] : null;

          dispatch(setProgramId(firstProgram.id));
          dispatch(setProjectId(firstProject.id));
          dispatch(setCategoryId(firstCategory.id));
          dispatch(setLineItems(firstItem ? [firstItem] : []));
        }
      }
    }
  }, [costType, selectedProgramId, selectedProjectId, selectedCategoryId, dispatch]);

  useEffect(() => {
    dispatch(setCurrentPage(pageAlias));
  }, [dispatch, pageAlias]);

  console.log('costType:', costType);
  console.log('status:', status);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-red-600">Error: {error || 'Failed to load data'}</div>
      </div>
    );
  }

  if (!costType || !costType.programs || costType.programs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  return <Outline data={costType.programs} />;
};

export default CostTypePage; 