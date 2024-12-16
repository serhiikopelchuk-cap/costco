import React, { useEffect } from 'react';
import './Outline.css';
import { Program, Item, Category } from '../../types/program';
import ProgramList from './ProgramList';
import ProjectList from './ProjectList';
import CloudProviderList from './CloudProviderList';
import LineItemList from './LineItemList';
import CategoryList from './CategoryList';
import DetailsColumn from './DetailsColumn';
import MiniProgramList from './MiniProgramList';
import MiniProjectList from './MiniProjectList';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setLineItems, setProvider } from '../../store/slices/selectionSlice';
import { fetchProgramByIdAsync } from '../../store/slices/programsSlice';
import { selectCategoriesFromPrograms } from '../../store/slices/programsSlice';
import { clearDetails } from '../../store/slices/uiSlice';

type OutlineProps = {
  data: Program[];
};

const Outline: React.FC<OutlineProps> = ({ data = [] }) => {
  const dispatch = useAppDispatch();
  // console.log('data:', data);
  // Selection state from Redux
  const {
    selectedProgramId,
    selectedProjectId,
    selectedCategoryId,
    selectedLineItems,
    selectedProvider,
  } = useAppSelector(state => state.selection);

  // UI state from Redux
  const {
    search: { lineItem: lineItemSearch },
    addInputVisibility: { lineItem: showAddLineItemInput },
    details,
    currentPage,
  } = useAppSelector(state => {
    return state.ui;
  });

  // Get categories from the current project
  const categories = useAppSelector(state => {
    if (!selectedProgramId || !selectedProjectId) return [];
    
    const program = state.costTypes.item?.programs.find(p => p.id === selectedProgramId);
    const project = program?.projects.find(p => p.id === selectedProjectId);
    return project?.categories || [];
  });

  const selectedProgram = data.find(program => program.id === selectedProgramId);

  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchProgramByIdAsync(selectedProgramId));
    }
  }, [dispatch, selectedProgramId]);

  const handleLineItemToggle = (lineItem: Item) => {
    const isSelected = selectedLineItems.some(item => item.id === lineItem.id);
    if (isSelected) {
      dispatch(setLineItems(selectedLineItems.filter(item => item.id !== lineItem.id)));
    } else {
      dispatch(setLineItems([...selectedLineItems, lineItem]));
    }
  };

  const handleLineItemUpdate = (updatedItem: Item) => {
    const newSelectedItems = selectedLineItems.map(item => 
      
      item.id === updatedItem.id ? updatedItem : item
    );
    dispatch(setLineItems(newSelectedItems));
  };

  const lineItems = categories
    .find(category => category.id === selectedCategoryId)
    ?.items || [];

  useEffect(() => {
    // Cleanup details when navigating away
    return () => {
      dispatch(clearDetails());
    };
  }, []);

  useEffect(() => {
    // Clear unpinned details when changing pages
    if (!details?.isPinned) {
      dispatch(clearDetails());
    }
  }, [currentPage]);

  return (
    <div className="outline-view">
      {!selectedCategoryId ? (
        <ProgramList />
      ) : (
        <div className="left-column-container">
          <div className="mini-columns-container">
            <MiniProgramList 
              programs={data} 
              selectedProgramId={selectedProgramId} 
            />
            {selectedProgramId && (
              <MiniProjectList 
                projects={selectedProgram?.projects || []} 
                selectedProjectId={selectedProjectId} 
              />
            )}
          </div>
          <CloudProviderList />
        </div>
      )}

      {selectedProgramId && !selectedCategoryId && <ProjectList />}
      {selectedProgramId && !selectedCategoryId && <CloudProviderList />}
      <CategoryList />
      {selectedCategoryId && <LineItemList
        onLineItemToggle={handleLineItemToggle}
        onAddLineItem={(name: string) => console.log('Adding line item:', name)}
        lineItemSearch={lineItemSearch}
        showAddLineItemInput={showAddLineItemInput}
        selectedCategoryId={selectedCategoryId}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
      />}
      {(selectedCategoryId || details) && <DetailsColumn
        selectedCategoryId={selectedCategoryId}
        selectedLineItems={selectedLineItems}
        lineItems={lineItems}
        handleLineItemUpdate={handleLineItemUpdate}
        handleLineItemAdd={(lineItem: Item) => dispatch(setLineItems([...selectedLineItems, lineItem]))}
        handleDeselectAll={() => dispatch(setLineItems([]))}
        selectedProvider={selectedProvider}
        handleProviderChange={(provider: string) => dispatch(setProvider(provider))}
        details={details as { type: 'program' | 'project'; name: string; id: number; } | null}
        tableData={data}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
        detailsData={Object.fromEntries(
          categories.map((category: Category) => [
            category.name,
            category.items
          ])
        )}
        cloudProviders={['azure', 'gcp']}
      />}
    </div>
  );
};

export default Outline;
