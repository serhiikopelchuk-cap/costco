import React, { useEffect } from 'react';
import './Outline.css';
import { Program, Item, Category } from '../../types/program';
import ProgramList from './ProgramList';
import ProjectList from './ProjectList';
import LineItemList from './LineItemList';
import CategoryList from './CategoryList';
import DetailsColumn from './DetailsColumn';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setProgramId, setProjectId, setCategoryId, setLineItems, setProvider, clearCategoryId, updateSelections } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails } from '../../store/slices/uiSlice';
import { fetchProgramByIdAsync } from '../../store/slices/programsSlice';
import { selectCategoriesFromPrograms } from '../../store/slices/programsSlice';
import { useLocation } from 'react-router-dom';

type OutlineProps = {
  data: Program[];
};

const Outline: React.FC<OutlineProps> = ({ data = [] }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isDirect = location.pathname === '/direct-costs';
  const costTypeData = useAppSelector(state => isDirect ? state.costTypes.directCosts : state.costTypes.indirectCosts);
  
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
    search: { program: programSearch, project: projectSearch, category: categorySearch, lineItem: lineItemSearch },
    addInputVisibility: { program: showAddProgramInput, project: showAddProjectInput, category: showAddCategoryInput, lineItem: showAddLineItemInput },
    details,
  } = useAppSelector(state => state.ui);

  const selectedProjectCategories = useAppSelector(state => selectCategoriesFromPrograms(selectedProgramId, selectedProjectId)(state));

  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchProgramByIdAsync(selectedProgramId));
    }
  }, [dispatch, selectedProgramId]);

  // Handlers
  const handleProgramToggle = (programId: number) => {
    if (selectedProgramId === programId) {
      dispatch(updateSelections({ programId: null }));
    } else {
      const program = data.find(p => p.id === programId);
      if (program) {
        dispatch(updateSelections({
          programId,
          projectId: program.projects.length > 0 ? program.projects[0].id : null,
          categoryId: null,
          lineItems: []
        }));
      }
    }
  };

  const handleProjectToggle = (projectId: number) => {
    if (selectedProjectId === projectId) {
      dispatch(setProjectId(null));
    } else {
      dispatch(setProjectId(projectId));
    }
  };

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

  const handleDetailsClick = (type: 'program' | 'project', id: number) => {
    dispatch(setDetails({ type, id, name: type === 'program' ? data.find(p => p.id === id)?.name || '' : data.find(p => p.id === selectedProgramId)?.projects.find(p => p.id === id)?.name || '' }));
    dispatch(clearCategoryId()); // Clear selected category when viewing details
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
      <ProgramList
        selectedProgramId={selectedProgramId}
        onProgramToggle={handleProgramToggle}
        onDetailsClick={handleDetailsClick}
        programSearch={programSearch}
        setProgramSearch={(value: string) => dispatch(setSearch({ type: 'program', value }))} 
        showAddProgramInput={showAddProgramInput}
        setShowAddProgramInput={(value: boolean) => dispatch(setAddInputVisibility({ type: 'program', value }))}
      />
      <ProjectList
        selectedProjectId={selectedProjectId}
        onProjectToggle={handleProjectToggle}
        onDetailsClick={handleDetailsClick}
        projectSearch={projectSearch}
        setProjectSearch={(value: string) => dispatch(setSearch({ type: 'project', value }))}
        showAddProjectInput={showAddProjectInput}
        setShowAddProjectInput={(value: boolean) => dispatch(setAddInputVisibility({ type: 'project', value }))}
        onAddProject={(name: string) => console.log('Adding project:', name)}
      />
      <CategoryList
        selectedCategoryId={selectedCategoryId}
        onCategoryToggle={handleCategoryToggle}
        categorySearch={categorySearch}
        showAddCategoryInput={showAddCategoryInput}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
        selectedProvider={selectedProvider}
      />
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
