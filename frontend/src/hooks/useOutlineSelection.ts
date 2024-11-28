import { useState, useCallback } from 'react';
import { Program, Project, Category, Item, DetailsType } from '../types/program';

export const useOutlineSelection = (initialData: Program[] = []) => {
  // Selection state
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    initialData.length > 0 ? initialData[0].id ?? null : null
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedLineItems, setSelectedLineItems] = useState<Item[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Search state
  const [programSearch, setProgramSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [lineItemSearch, setLineItemSearch] = useState('');

  // Add input visibility state
  const [showAddProgramInput, setShowAddProgramInput] = useState(false);
  const [showAddProjectInput, setShowAddProjectInput] = useState(false);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [showAddLineItemInput, setShowAddLineItemInput] = useState(false);

  // Details panel state
  const [details, setDetails] = useState<DetailsType>(null);

  // Handler functions
  const handleProgramToggle = useCallback((programId: number) => {
    if (selectedProgramId === programId) {
      setSelectedProgramId(null);
      setSelectedProjectId(null);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else {
      setSelectedProgramId(programId);
      const program = initialData.find(p => p.id === programId);
      if (program?.projects?.[0]?.id) {
        setSelectedProjectId(program.projects[0].id);
        
        const firstCategory = program.projects[0].categories?.[0];
        if (firstCategory?.id) {
          setSelectedCategoryId(firstCategory.id);
          setSelectedLineItems(firstCategory.items?.length > 0 
            ? [firstCategory.items[0]] 
            : []);
        }
      }
    }
  }, [selectedProgramId, initialData]);

  const handleProjectToggle = useCallback((projectId: number) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else {
      setSelectedProjectId(projectId);
      const program = initialData.find(p => p.id === selectedProgramId);
      const project = program?.projects?.find(p => p.id === projectId);
      
      if (project?.categories?.[0]?.id) {
        setSelectedCategoryId(project.categories[0].id);
        setSelectedLineItems(project.categories[0].items?.length > 0 
          ? [project.categories[0].items[0]] 
          : []);
      }
    }
  }, [selectedProjectId, selectedProgramId, initialData]);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else {
      setSelectedCategoryId(categoryId);
      const program = initialData.find(p => p.id === selectedProgramId);
      const project = program?.projects?.find(p => p.id === selectedProjectId);
      const category = project?.categories?.find(c => c.id === categoryId);
      
      if (category?.items && category.items.length > 0) {
        setSelectedLineItems([category.items[0]]);
      } else {
        setSelectedLineItems([]);
      }
    }
  }, [selectedCategoryId, selectedProgramId, selectedProjectId, initialData]);

  const handleLineItemToggle = useCallback((lineItem: Item) => {
    setSelectedLineItems(prevSelected => {
      if (prevSelected.some(item => item.id === lineItem.id)) {
        return prevSelected.filter(item => item.id !== lineItem.id);
      }
      return [...prevSelected, lineItem];
    });
  }, []);

  const handleLineItemUpdate = useCallback((newLineItems: Item[] | ((prev: Item[]) => Item[])) => {
    if (selectedProgramId && selectedProjectId && selectedCategoryId) {
      const updatedLineItems = typeof newLineItems === 'function' 
        ? newLineItems([])  // You might want to pass current items here
        : newLineItems;

      setSelectedLineItems(prevSelected => {
        return prevSelected.map(selectedItem => 
          updatedLineItems.find(item => item.id === selectedItem.id) || selectedItem
        ).filter(item => updatedLineItems.some(updatedItem => updatedItem.id === item.id));
      });
    }
  }, [selectedProgramId, selectedProjectId, selectedCategoryId]);

  const handleDetailsClick = useCallback((type: 'program' | 'project', id: number) => {
    if (type === 'program') {
      const program = initialData.find(p => p.id === id);
      setDetails({ type, id, name: program?.name || '' });
      setSelectedProgramId(program?.id || 0);
      setSelectedProjectId(null);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else if (type === 'project') {
      const program = initialData.find(p => p.id === selectedProgramId);
      const project = program?.projects.find(project => project.id === id);
      setDetails({ type, id, name: project?.name || '' });
      setSelectedProjectId(project?.id || 0);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    }
  }, [selectedProgramId, initialData]);

  const handleDeselectAll = useCallback(() => {
    setSelectedLineItems([]);
  }, []);

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
    console.log('Adding line item from details:', lineItem);
    // Implement line item addition logic from details
  }, []);

  return {
    // Selection state
    selectedProgramId,
    selectedProjectId,
    selectedCategoryId,
    selectedLineItems,
    selectedProvider,
    
    // Search state
    programSearch,
    projectSearch,
    categorySearch,
    lineItemSearch,
    
    // Input visibility state
    showAddProgramInput,
    showAddProjectInput,
    showAddCategoryInput,
    showAddLineItemInput,
    
    // Details state
    details,
    
    // Setters
    setProgramSearch,
    setProjectSearch,
    setCategorySearch,
    setLineItemSearch,
    setShowAddProgramInput,
    setShowAddProjectInput,
    setShowAddCategoryInput,
    setShowAddLineItemInput,
    setSelectedProvider,
    
    // Handlers
    handleProgramToggle,
    handleProjectToggle,
    handleCategoryToggle,
    handleLineItemToggle,
    handleLineItemUpdate,
    handleDetailsClick,
    handleDeselectAll,
    handleAddProgram,
    handleAddProject,
    handleAddCategory,
    handleAddLineItem,
    handleLineItemAdd,
  };
}; 