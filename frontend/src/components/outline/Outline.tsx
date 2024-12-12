import React, { useEffect } from 'react';
import './Outline.css';
import { Program, Item, Category } from '../../types/program';
import ProgramList from './ProgramList';
import ProjectList from './ProjectList';
import CloudProviderList from './CloudProviderList';
import LineItemList from './LineItemList';
import CategoryList from './CategoryList';
import DetailsColumn from './DetailsColumn';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setCategoryId, setLineItems, setProvider } from '../../store/slices/selectionSlice';
import { setDetails } from '../../store/slices/uiSlice';
import { fetchProgramByIdAsync } from '../../store/slices/programsSlice';
import { selectCategoriesFromPrograms } from '../../store/slices/programsSlice';

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
  } = useAppSelector(state => state.ui);

  const selectedProjectCategories = useAppSelector(state => selectCategoriesFromPrograms(selectedProgramId, selectedProjectId)(state));

  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchProgramByIdAsync(selectedProgramId));
    }
  }, [dispatch, selectedProgramId]);

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      dispatch(setCategoryId(null));
    } else {
      dispatch(setCategoryId(categoryId));
      dispatch(setDetails(null)); // Clear details when a category is selected
      dispatch(setLineItems([]));
    }
  };

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

  const lineItems = selectedProjectCategories
    .find(category => category.id === selectedCategoryId)
    ?.items || [];

  return (
    <div className="outline-view">
      <ProgramList />
      <ProjectList />
      <CloudProviderList />
      <CategoryList />
      {selectedCategoryId && !details && (
        <LineItemList
          onLineItemToggle={handleLineItemToggle}
          onAddLineItem={(name: string) => console.log('Adding line item:', name)}
          lineItemSearch={lineItemSearch}
          showAddLineItemInput={showAddLineItemInput}
          selectedCategoryId={selectedCategoryId}
          selectedProgramId={selectedProgramId}
          selectedProjectId={selectedProjectId}
        />
      )}
      <DetailsColumn
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
          selectedProjectCategories.map((category: Category) => [
            category.name,
            category.items
          ])
        )}
        cloudProviders={['azure', 'gcp']}
      />
    </div>
  );
};

export default Outline;
