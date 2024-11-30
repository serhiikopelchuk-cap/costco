import React, { useEffect } from 'react';
import './Outline.css';
import { Program, Item, Category } from '../../types/program';
import ProgramList from './ProgramList';
import ProjectList from './ProjectList';
import LineItemList from './LineItemList';
import CategoryList from './CategoryList';
import DetailsColumn from './DetailsColumn';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setProgramId, setProjectId, setCategoryId, setLineItems, setProvider, clearCategoryId } from '../../store/slices/selectionSlice';
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

  // console.log('Selected Project Categories:', selectedProjectCategories);
  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchProgramByIdAsync(selectedProgramId));
    }
  }, [dispatch, selectedProgramId]);

  // Handlers
  const handleProgramToggle = (programId: number) => {
    if (selectedProgramId === programId) {
      dispatch(setProgramId(null));
    } else {
      dispatch(setProgramId(programId));
      const program = data.find(p => p.id === programId);
      if (program?.projects?.[0]?.id) {
        dispatch(setProjectId(program.projects[0].id));
        
        const firstCategory = program.projects[0].categories?.[0];
        if (firstCategory?.id) {
          dispatch(setCategoryId(firstCategory.id));
          dispatch(setLineItems(firstCategory.items?.length > 0 ? [firstCategory.items[0]] : []));
        }
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

  // Derived data
  const filteredPrograms = data.filter(program => 
    program.name.toLowerCase().includes(programSearch.toLowerCase())
  );

  const selectedProgramProjects = data.find(p => p.id === selectedProgramId)?.projects || [];
  const filteredProjects = selectedProgramProjects.filter(project => 
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // const selectedProjectCategories = data
  //   .find(p => p.id === selectedProgramId)
  //   ?.projects?.find(p => p.id === selectedProjectId)
  //   ?.categories || [];

  const filteredCategories = selectedProjectCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const lineItems = selectedProjectCategories
    .find(category => category.id === selectedCategoryId)
    ?.items || [];

  const filteredLineItems = lineItems.filter(lineItem => 
    lineItem.name.toLowerCase().includes(lineItemSearch.toLowerCase())
  );

  return (
    <div className="outline-view">
      <ProgramList
        programs={data}
        selectedProgramId={selectedProgramId}
        onProgramToggle={handleProgramToggle}
        onDetailsClick={handleDetailsClick}
        programSearch={programSearch}
        setProgramSearch={(value: string) => dispatch(setSearch({ type: 'program', value }))}
        showAddProgramInput={showAddProgramInput}
        setShowAddProgramInput={(value: boolean) => dispatch(setAddInputVisibility({ type: 'program', value }))}
        onAddProgram={(name: string) => console.log('Adding program:', name)}
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
        categories={selectedProjectCategories}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
        selectedProvider={selectedProvider}
      />
      {selectedCategoryId && !details && (
        <LineItemList
          selectedLineItems={selectedLineItems}
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
        handleLineItemUpdate={(newLineItems) => {
          if (Array.isArray(newLineItems)) {
            dispatch(setLineItems(newLineItems));
          }
        }}
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
        handleLineItemAdd={(lineItem: Item) => dispatch(setLineItems([...selectedLineItems, lineItem]))}
      />
    </div>
  );
};

export default Outline;
