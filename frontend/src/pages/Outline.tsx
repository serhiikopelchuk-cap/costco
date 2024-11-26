import React, { useState, useEffect, useCallback } from 'react';
import './Outline.css';
import directCosts from '../data/direct-cost.json';
import { Project, Program as ImportedProgram } from '../services/programService';
import ProgramList from '../components/outline/ProgramList';
import ProjectList from '../components/outline/ProjectList';
import LineItemList from '../components/outline/LineItemList';
import CategoryList from '../components/outline/CategoryList';
import DetailsColumn from '../components/outline/DetailsColumn';

export type Item = {
  id?: number | undefined;
  name: string;
  costs: { value: number }[];
};
type Category = {
  name: string;
  items: Item[];
};
type Projects = Record<string, { categories: Record<string, Category> }>;
type Data = Record<string, { projects: Projects }>;

type Program = ImportedProgram;

type OutlineProps = {
  data: Program[];
};

const Outline: React.FC<OutlineProps> = ({ data = [] }) => {
  // console.log('data', data);
  // Initialize state with first available items, but only if they exist
  const firstProgramId = data.length > 0 ? data[0].id ?? null : null;
  const firstProgram = data.find(p => p.id === firstProgramId);
  const firstProjectId = firstProgram?.projects?.[0]?.id ?? null;
  const firstCategoryId = firstProgram?.projects?.[0]?.categories?.[0]?.id ?? null;
  const firstLineItem = firstProgram?.projects?.[0]?.categories?.[0]?.items?.[0] 
    ? [firstProgram.projects[0].categories[0].items[0]]
    : [];

  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(firstProgramId);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(firstProjectId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(firstCategoryId);
  const [selectedLineItems, setSelectedLineItems] = useState<Item[]>([]);

  const programs = data.map(program => program.name);
  const projects = selectedProgramId ? data.find(program => program.id === selectedProgramId)?.projects.map(project => project.name) || [] : [];
  const categories = selectedProgramId && selectedProjectId 
    ? data.find(program => program.id === selectedProgramId)?.projects.find(project => project.id === selectedProjectId)?.categories.map(category => category.name) || [] 
    : [];
  const lineItems = selectedProgramId && selectedProjectId && selectedCategoryId 
    ? data.find(program => program.id === selectedProgramId)?.projects.find(project => project.id === selectedProjectId)?.categories.find(category => category.id === selectedCategoryId)?.items || []
    : [];

  const [programSearch, setProgramSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [lineItemSearch, setLineItemSearch] = useState('');

  const [showAddProgramInput, setShowAddProgramInput] = useState(false);
  const [showAddProjectInput, setShowAddProjectInput] = useState(false);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [showAddLineItemInput, setShowAddLineItemInput] = useState(false);

  const [details, setDetails] = useState<{ type: 'program' | 'project', name: string, id: number } | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const filteredPrograms = programs.filter(program => program.toLowerCase().includes(programSearch.toLowerCase()));
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
  const filteredLineItems = Array.isArray(lineItems) 
    ? lineItems.filter(lineItem => lineItem.name.toLowerCase().includes(lineItemSearch.toLowerCase()))
    : [];

  const handleProgramToggle = (programId: number) => {
    if (selectedProgramId === programId) {
      setSelectedProgramId(null);
      setSelectedProjectId(null);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else {
      setSelectedProgramId(programId);
      const program = data.find(p => p.id === programId);
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
  };

  const handleProjectToggle = (projectId: number) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else {
      setSelectedProjectId(projectId);
      const program = data.find(p => p.id === selectedProgramId);
      const project = program?.projects?.find(p => p.id === projectId);
      
      if (project?.categories?.[0]?.id) {
        setSelectedCategoryId(project.categories[0].id);
        setSelectedLineItems(project.categories[0].items?.length > 0 
          ? [project.categories[0].items[0]] 
          : []);
      }
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else {
      setSelectedCategoryId(categoryId);
      const program = data.find(p => p.id === selectedProgramId);
      const project = program?.projects?.find(p => p.id === selectedProjectId);
      const category = project?.categories?.find(c => c.id === categoryId);
      
      if (category && category.items && category.items.length > 0) {
        setSelectedLineItems([category.items[0]]);
      } else {
        setSelectedLineItems([]);
      }
    }
  };

  const handleLineItemToggle = (lineItem: Item) => {
    setSelectedLineItems(prevSelected => {
      if (prevSelected.some(item => item.id === lineItem.id)) {
        return prevSelected.filter(item => item.id !== lineItem.id);
      } else {
        return [...prevSelected, lineItem];
      }
    });
  };

  const handleLineItemUpdate = (newLineItems: Item[] | ((prev: Item[]) => Item[])) => {
    if (selectedProgramId && selectedProjectId && selectedCategoryId) {
      const updatedLineItems = typeof newLineItems === 'function' 
        ? newLineItems(lineItems)
        : newLineItems;

      setSelectedLineItems(prevSelected => {
        return prevSelected.map(selectedItem => 
          updatedLineItems.find(item => item.id === selectedItem.id) || selectedItem
        ).filter(item => updatedLineItems.some(updatedItem => updatedItem.id === item.id));
      });
    }
  };

  const handleLineItemAdd = useCallback((newLineItem: Item) => {
    if (selectedProgramId && selectedProjectId && selectedCategoryId) {
      const currentLineItems = lineItems;

      // Check if the new line item already exists
      const itemExists = currentLineItems.some((item: Item) => item.id === newLineItem.id);
      if (itemExists) {
        return; // Do nothing if item already exists
      }

      const updatedLineItems = [
        ...currentLineItems,
        newLineItem
      ];

      setSelectedLineItems(prevSelected => {
        if (prevSelected.length > 0) {
          return [...prevSelected, newLineItem];
        }
        return prevSelected;
      });
    }
  }, [selectedProgramId, selectedProjectId, selectedCategoryId, lineItems]);

  const handleDeselectAll = () => {
    if (selectedProgramId && selectedProjectId && selectedCategoryId) {
      setSelectedLineItems([]);
    }
  };

  const handleAddProgram = (programName: string) => {
    console.log('Adding program:', programName);
    // Logic to add a new program to data
  };

  const handleAddProject = (projectName: string) => {
    if (selectedProgramId) {
      // Logic to add a new project to the selected program in data
    }
  };

  const handleAddCategory = (categoryName: string) => {
    if (selectedProgramId && selectedProjectId) {
      // Logic to add a new category to the selected project in data
    }
  };

  const handleAddLineItem = useCallback((itemName: string) => {
    const newLineItem: Item = {
      id: Date.now() + Math.random(), // Ensure unique ID
      name: itemName,
      costs: Array(13).fill({ value: 0 }) // Initialize costs
    };
    if (selectedProgramId && selectedProjectId && selectedCategoryId) {
      const updatedLineItems = [
        ...lineItems,
        newLineItem
      ];

      setSelectedLineItems(prevSelected => [...prevSelected, newLineItem]);
    }
  }, [selectedProgramId, selectedProjectId, selectedCategoryId, lineItems]);

  const handleDetailsClick = (type: 'program' | 'project', name: string) => {
    if (type === 'program') {
      const program = data.find(p => p.name === name);
      setDetails({ type, name, id: program?.id || 0 });
      setSelectedProgramId(program?.id || 0);
      setSelectedProjectId(null);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    } else if (type === 'project') {
      const project = data
        .find(p => p.id === selectedProgramId)
        ?.projects.find(project => project.name === name);
      setDetails({ type, name, id: project?.id || 0 });
      setSelectedProjectId(project?.id || 0);
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);

    // Find the first category and line item for the selected provider
    const firstAvailableCategory = categories.find(category => {
      const categoryData = data
        .find(program => program.id === selectedProgramId)
        ?.projects.find(project => project.id === selectedProjectId)
        ?.categories.find(cat => cat.name === category);
      return categoryData?.items.some(item => {
        const categoryInfo = directCosts.categories.find(cat => cat.name === category);
        return !provider || categoryInfo?.cloudProvider.includes(provider);
      });
    });

    if (firstAvailableCategory) {
      const categoryObject = data
        .find(program => program.id === selectedProgramId)
        ?.projects.find(project => project.id === selectedProjectId)
        ?.categories.find(category => category.name === firstAvailableCategory);
      
      if (categoryObject?.id) {
        setSelectedCategoryId(categoryObject.id);
        if (categoryObject.items?.[0]) {
          setSelectedLineItems([categoryObject.items[0]]);
        } else {
          setSelectedLineItems([]);
        }
      }
    } else {
      setSelectedCategoryId(null);
      setSelectedLineItems([]);
    }
  };

  const detailsData = details ? 
    Object.fromEntries(
      data
        .find((program: Program) => program.id === selectedProgramId)
        ?.projects.find(project => project.id === selectedProjectId)
        ?.categories.map(category => [
          category.name,
          category.items
        ]) || []
    )
    : {};

  return (
    <div className="outline-view">
      <ProgramList
        programs={data}
        selectedProgramId={selectedProgramId}
        onProgramToggle={handleProgramToggle}
        onAddProgram={handleAddProgram}
        onDetailsClick={handleDetailsClick}
        programSearch={programSearch}
        setProgramSearch={setProgramSearch}
        showAddProgramInput={showAddProgramInput}
        setShowAddProgramInput={setShowAddProgramInput}
      />
      <ProjectList
        projects={filteredProjects}
        selectedProjectId={selectedProjectId}
        onProjectToggle={handleProjectToggle}
        onAddProject={handleAddProject}
        onDetailsClick={handleDetailsClick}
        projectSearch={projectSearch}
        setProjectSearch={setProjectSearch}
        showAddProjectInput={showAddProjectInput}
        setShowAddProjectInput={setShowAddProjectInput}
      />
      <CategoryList
        categories={filteredCategories}
        selectedCategoryId={selectedCategoryId}
        onCategoryToggle={handleCategoryToggle}
        onAddCategory={handleAddCategory}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        showAddCategoryInput={showAddCategoryInput}
        setShowAddCategoryInput={setShowAddCategoryInput}
      />
      <LineItemList
        lineItems={filteredLineItems}
        selectedLineItems={selectedLineItems}
        onLineItemToggle={handleLineItemToggle}
        onAddLineItem={handleAddLineItem}
        lineItemSearch={lineItemSearch}
        setLineItemSearch={setLineItemSearch}
        showAddLineItemInput={showAddLineItemInput}
        setShowAddLineItemInput={setShowAddLineItemInput}
      />
      <DetailsColumn
        selectedCategoryId={selectedCategoryId}
        selectedLineItems={selectedLineItems}
        lineItems={lineItems}
        handleLineItemUpdate={handleLineItemUpdate}
        handleLineItemAdd={handleLineItemAdd}
        handleDeselectAll={handleDeselectAll}
        selectedProvider={selectedProvider}
        handleProviderChange={handleProviderChange}
        details={details}
        tableData={data}
        selectedProgramId={selectedProgramId}
        detailsData={detailsData}
        selectedProjectId={selectedProjectId}
      />
    </div>
  );
};

export default Outline;
