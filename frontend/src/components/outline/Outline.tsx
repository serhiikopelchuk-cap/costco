import React, { useCallback } from 'react';
import './Outline.css';
import directCosts from '../../data/direct-cost.json';
import { Program, Item } from '../../types/program';
import ProgramList from './ProgramList';
import ProjectList from './ProjectList';
import LineItemList from './LineItemList';
import CategoryList from './CategoryList';
import DetailsColumn from './DetailsColumn';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setProgramId, setProjectId, setCategoryId, setLineItems, setProvider } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails } from '../../store/slices/uiSlice';
import { updateLineItem } from '../../store/slices/programsSlice';

type OutlineProps = {
  data: Program[];
};

const Outline: React.FC<OutlineProps> = ({ data = [] }) => {
  const dispatch = useAppDispatch();
  
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

  // Handlers
  const handleProgramToggle = useCallback((programId: number) => {
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
  }, [dispatch, selectedProgramId, data]);

  const handleProjectToggle = useCallback((projectId: number) => {
    if (selectedProjectId === projectId) {
      dispatch(setProjectId(null));
    } else {
      dispatch(setProjectId(projectId));
    }
  }, [dispatch, selectedProjectId]);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      dispatch(setCategoryId(null));
    } else {
      dispatch(setCategoryId(categoryId));
    }
  }, [dispatch, selectedCategoryId]);

  const handleLineItemToggle = useCallback((lineItem: Item) => {
    const isSelected = selectedLineItems.some(item => item.id === lineItem.id);
    if (isSelected) {
      dispatch(setLineItems(selectedLineItems.filter(item => item.id !== lineItem.id)));
    } else {
      dispatch(setLineItems([...selectedLineItems, lineItem]));
    }
  }, [dispatch, selectedLineItems]);

  const handleLineItemUpdate = useCallback((newLineItems: Item[] | ((prev: Item[]) => Item[])) => {
    if (typeof newLineItems === 'function') {
      dispatch(setLineItems(newLineItems(selectedLineItems)));
    } else {
      dispatch(setLineItems(newLineItems));
      
      // Also update the store with each line item
      newLineItems.forEach(lineItem => {
        if (selectedProgramId && selectedProjectId && selectedCategoryId) {
          dispatch(updateLineItem({
            programId: selectedProgramId,
            projectId: selectedProjectId,
            categoryId: selectedCategoryId,
            lineItem,
          }));
          
          // Log for debugging
          console.log('Updating line item in store:', {
            programId: selectedProgramId,
            projectId: selectedProjectId,
            categoryId: selectedCategoryId,
            lineItem,
          });
        }
      });
    }
  }, [dispatch, selectedLineItems, selectedProgramId, selectedProjectId, selectedCategoryId]);

  const handleDeselectAll = useCallback(() => {
    dispatch(setLineItems([]));
  }, [dispatch]);

  const handleDetailsClick = useCallback((type: 'program' | 'project', id: number) => {
    if (selectedProgramId !== null) {
      const program = data.find(p => p.id === selectedProgramId);
      const project = program?.projects.find(p => p.id === id);
      dispatch(setDetails({ type, id, name: type === 'program' ? program?.name || '' : project?.name || '' }));
    }
  }, [dispatch, selectedProgramId, data]);

  const handleAddProgram = useCallback((name: string) => {
    console.log('Adding program:', name);
    // Implement program addition logic
  }, []);

  const handleAddProject = useCallback((name: string) => {
    console.log('Adding project:', name);
    // Implement project addition logic
  }, []);

  const handleAddCategory = useCallback((name: string) => {
    console.log('Adding category:', name);
    // Implement category addition logic
  }, []);

  const handleAddLineItem = useCallback((name: string) => {
    console.log('Adding line item:', name);
    // Implement line item addition logic
  }, []);

  const handleLineItemAdd = useCallback((lineItem: Item) => {
    dispatch(setLineItems([...selectedLineItems, lineItem]));
  }, [dispatch, selectedLineItems]);

  // Derived data
  const filteredPrograms = data.filter(program => 
    program.name.toLowerCase().includes(programSearch.toLowerCase())
  );

  const selectedProgramProjects = data.find(p => p.id === selectedProgramId)?.projects || [];
  const filteredProjects = selectedProgramProjects.filter(project => 
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const selectedProjectCategories = data
    .find(p => p.id === selectedProgramId)
    ?.projects?.find(p => p.id === selectedProjectId)
    ?.categories || [];

  const filteredCategories = selectedProjectCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const lineItems = selectedProjectCategories
    .find(category => category.id === selectedCategoryId)
    ?.items || [];

  const filteredLineItems = lineItems.filter(lineItem => 
    lineItem.name.toLowerCase().includes(lineItemSearch.toLowerCase())
  );

  const handleProviderChange = (provider: string) => {
    dispatch(setProvider(provider));

    // Find the first category and line item for the selected provider
    const firstAvailableCategory = selectedProjectCategories.find(category => {
      return category.items.some(item => {
        const categoryInfo = directCosts.categories.find(cat => cat.name === category.name);
        return !provider || categoryInfo?.cloudProvider.includes(provider);
      });
    });

    if (firstAvailableCategory) {
      dispatch(setCategoryId(firstAvailableCategory.id));
    } else {
      dispatch(setCategoryId(0)); // or however you want to handle no categories
    }
  };

  const detailsData = details ? 
    Object.fromEntries(
      selectedProjectCategories.map(category => [
        category.name,
        category.items
      ])
    )
    : {};

  return (
    <div className="outline-view">
      <ProgramList
        programs={filteredPrograms}
        selectedProgramId={selectedProgramId}
        onProgramToggle={handleProgramToggle}
        onDetailsClick={handleDetailsClick}
        programSearch={programSearch}
        setProgramSearch={(value: string) => dispatch(setSearch({ type: 'program', value }))}
        showAddProgramInput={showAddProgramInput}
        setShowAddProgramInput={(value: boolean) => dispatch(setAddInputVisibility({ type: 'program', value }))}
        onAddProgram={handleAddProgram}
      />
      <ProjectList
        projects={filteredProjects}
        selectedProjectId={selectedProjectId}
        onProjectToggle={handleProjectToggle}
        onDetailsClick={handleDetailsClick}
        projectSearch={projectSearch}
        setProjectSearch={(value: string) => dispatch(setSearch({ type: 'project', value }))}
        showAddProjectInput={showAddProjectInput}
        setShowAddProjectInput={(value: boolean) => dispatch(setAddInputVisibility({ type: 'project', value }))}
        onAddProject={handleAddProject}
      />
      <CategoryList
        selectedCategoryId={selectedCategoryId}
        onCategoryToggle={handleCategoryToggle}
        categorySearch={categorySearch}
        setCategorySearch={(value) => dispatch(setSearch({ type: 'category', value }))}
        showAddCategoryInput={showAddCategoryInput}
        setShowAddCategoryInput={(value) => dispatch(setAddInputVisibility({ type: 'category', value }))}
        onAddCategory={handleAddCategory}
        categories={selectedProjectCategories}
      />
      <LineItemList
        lineItems={lineItems}
        selectedLineItems={selectedLineItems}
        onLineItemToggle={handleLineItemToggle}
        onAddLineItem={handleAddLineItem}
        lineItemSearch={lineItemSearch}
        // setLineItemSearch={setLineItemSearch}
        showAddLineItemInput={showAddLineItemInput}
        // setShowAddLineItemInput={setShowAddLineItemInput}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
        selectedCategoryId={selectedCategoryId}
      />
      <DetailsColumn
        selectedCategoryId={selectedCategoryId}
        selectedLineItems={selectedLineItems}
        lineItems={lineItems}
        handleLineItemUpdate={handleLineItemUpdate}
        handleDeselectAll={handleDeselectAll}
        selectedProvider={selectedProvider}
        handleProviderChange={handleProviderChange}
        details={details as { type: 'program' | 'project'; name: string; id: number; } | null}
        tableData={data}
        selectedProgramId={selectedProgramId}
        detailsData={detailsData}
        selectedProjectId={selectedProjectId}
        handleLineItemAdd={handleLineItemAdd}
      />
    </div>
  );
};

export default Outline;
