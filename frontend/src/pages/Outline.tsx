import React, { useState, useEffect } from 'react';
import './Outline.css';
import LineItemsTable from '../components/LineItemsTable';
import SearchInput from '../components/SearchInput';
import AddItemInput from '../components/AddItemInput';
import directCosts from '../data/direct-cost.json';

type LineItem = {
  id: number;
  name: string;
  periods: number[];
};
type Categories = Record<string, LineItem[]>;
type Projects = Record<string, { categories: Categories }>;
type Data = Record<string, { projects: Projects }>;

const defaultTestData: Data = {
  Program1: {
    projects: {
      Project1: {
        categories: {
          ...directCosts.categories.reduce((acc, category) => {
            acc[category.name] = category.lineItems.map(item => ({
              id: Date.now() + Math.random(), // Ensure unique IDs
              name: item.name,
              periods: item.periods
            }));
            return acc;
          }, {} as Categories),
        }
      }
    }
  },
  Program2: {
    projects: {
      Project2: {
        categories: {
          Category2: [
            {
              id: 1,
              name: 'LINE ITEM-1 RELATED INFORMATION',
              periods: Array(13).fill(40),
            },
            {
              id: 2,
              name: 'LINE ITEM-2 RELATED INFORMATION',
              periods: Array(13).fill(50),
            },
          ],
        },
      },
    },
  },
  Program3: {
    projects: {
      Project3: {
        categories: {
          Category3: [
            {
              id: 1,
              name: 'LINE ITEM-1 RELATED INFORMATION',
              periods: Array(13).fill(60),
            },
            {
              id: 2,
              name: 'LINE ITEM-2 RELATED INFORMATION',
              periods: Array(13).fill(70),
            },
          ],
        },
      },
    },
  },
  Program4: {
    projects: {
      Project4: {
        categories: {
          Category4: [
            {
              id: 1,
              name: 'LINE ITEM-1 RELATED INFORMATION',
              periods: Array(13).fill(80),
            },
            {
              id: 2,
              name: 'LINE ITEM-2 RELATED INFORMATION',
              periods: Array(13).fill(90),
            },
          ],
        },
      },
    },
  },
};
interface OutlineProps {
  data?: Data;
}

const Outline: React.FC<OutlineProps> = ({ data = defaultTestData }) => {

  // Initialize state with first available items
  const firstProgram = Object.keys(data)[0];
  const firstProject = firstProgram ? Object.keys(data[firstProgram]?.projects)[0] : null;
  const firstCategory = firstProject ? Object.keys(data[firstProgram]?.projects[firstProject]?.categories)[0] : null;
  const firstLineItem = firstCategory ? data[firstProgram]?.projects[firstProject!]?.categories[firstCategory][0] : null;

  const [selectedProgram, setSelectedProgram] = useState<string | null>(firstProgram);
  const [selectedProject, setSelectedProject] = useState<string | null>(firstProject);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(firstCategory);
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>(firstLineItem ? [firstLineItem] : []);

  const [tableData, setTableData] = useState<Data>(data);

  const programs = Object.keys(tableData);
  const projects = selectedProgram ? Object.keys(tableData[selectedProgram]?.projects || {}) : [];
  const categories = selectedProgram && selectedProject ? Object.keys(tableData[selectedProgram]?.projects[selectedProject]?.categories || {}) : [];
  const lineItems = selectedProgram && selectedProject && selectedCategory 
    ? tableData[selectedProgram]?.projects[selectedProject]?.categories[selectedCategory] || []
    : [];

  const [programSearch, setProgramSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [lineItemSearch, setLineItemSearch] = useState('');

  const [showAddProgramInput, setShowAddProgramInput] = useState(false);
  const [showAddProjectInput, setShowAddProjectInput] = useState(false);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [showAddLineItemInput, setShowAddLineItemInput] = useState(false);

  const filteredPrograms = programs.filter(program => program.toLowerCase().includes(programSearch.toLowerCase()));
  const filteredProjects = projects.filter(project => project.toLowerCase().includes(projectSearch.toLowerCase()));
  const filteredCategories = categories.filter(category => category.toLowerCase().includes(categorySearch.toLowerCase()));
  const filteredLineItems = lineItems.filter(lineItem => lineItem.name.toLowerCase().includes(lineItemSearch.toLowerCase()));

  const handleProgramToggle = (program: string) => {
    if (selectedProgram === program) {
      setSelectedProgram(null);
      setSelectedProject(null);
      setSelectedCategory(null);
      setSelectedLineItems([]); // Clear selected line items
    } else {
      setSelectedProgram(program);
      const newProjects = Object.keys(data[program]?.projects || {});
      const firstProject = newProjects[0] || null;
      setSelectedProject(firstProject);
      setSelectedLineItems([]); // Clear selected line items

      if (firstProject) {
        const newCategories = Object.keys(data[program]?.projects[firstProject]?.categories || {});
        const firstCategory = newCategories[0] || null;
        setSelectedCategory(firstCategory);

        if (firstCategory) {
          const newLineItems = data[program]?.projects[firstProject]?.categories[firstCategory] || [];
          setSelectedLineItems([]); // Clear selected line items
        }
      }
    }
  };

  const handleProjectToggle = (project: string) => {
    if (selectedProject === project) {
      setSelectedProject(null);
      setSelectedCategory(null);
      setSelectedLineItems([]); // Clear selected line items
    } else {
      setSelectedProject(project);
      const newCategories = Object.keys(data[selectedProgram!]?.projects[project]?.categories || {});
      const firstCategory = newCategories[0] || null;
      setSelectedCategory(firstCategory);
      setSelectedLineItems([]); // Clear selected line items

      if (firstCategory) {
        const newLineItems = data[selectedProgram!]?.projects[project]?.categories[firstCategory] || [];
        setSelectedLineItems([]); // Clear selected line items
      }
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedLineItems([]); // Clear selected line items
    } else {
      setSelectedCategory(category);
      const newLineItems = data[selectedProgram!]?.projects[selectedProject!]?.categories[category] || [];
      setSelectedLineItems([]); // Clear selected line items
    }
  };

  const handleLineItemToggle = (lineItem: LineItem) => {
    setSelectedLineItems(prevSelected => {
      if (prevSelected.some(item => item.id === lineItem.id)) {
        return prevSelected.filter(item => item.id !== lineItem.id);
      } else {
        return [...prevSelected, lineItem];
      }
    });
  };

  const handleLineItemUpdate = (newLineItems: LineItem[] | ((prev: LineItem[]) => LineItem[])) => {
    if (selectedProgram && selectedProject && selectedCategory) {
      setTableData(prevData => {
        const updatedLineItems = typeof newLineItems === 'function' 
          ? newLineItems(prevData[selectedProgram].projects[selectedProject].categories[selectedCategory])
          : newLineItems;

        setSelectedLineItems(prevSelected => {
          return prevSelected.map(selectedItem => 
            updatedLineItems.find(item => item.id === selectedItem.id) || selectedItem
          ).filter(item => updatedLineItems.some(updatedItem => updatedItem.id === item.id));
        });

        return {
          ...prevData,
          [selectedProgram]: {
            projects: {
              ...prevData[selectedProgram].projects,
              [selectedProject]: {
                categories: {
                  ...prevData[selectedProgram].projects[selectedProject].categories,
                  [selectedCategory]: updatedLineItems
                }
              }
            }
          }
        };
      });
    }
  };

  // New handler to select the newly added line item
  const handleLineItemAdd = (newLineItem: LineItem) => {
    setSelectedLineItems(prevSelected => {
      if (prevSelected.length > 0) {
        return [...prevSelected, newLineItem];
      }
      return prevSelected;
    });
  };

  const handleDeselectAll = () => {
    if (selectedProgram && selectedProject && selectedCategory) {
      setSelectedLineItems([]);
    }
  };

  const handleAddProgram = (programName: string) => {
    console.log('Adding program:', programName, !tableData[programName]);
    if (!tableData[programName]) {
      setTableData(prevData => ({
        ...prevData,
        [programName]: { projects: {} }
      }));
    }
  };

  const handleAddProject = (projectName: string) => {
    if (selectedProgram && !tableData[selectedProgram].projects[projectName]) {
      setTableData(prevData => ({
        ...prevData,
        [selectedProgram]: {
          projects: {
            ...prevData[selectedProgram].projects,
            [projectName]: { categories: {} }
          }
        }
      }));
    }
  };

  const handleAddCategory = (categoryName: string) => {
    if (selectedProgram && selectedProject && !tableData[selectedProgram].projects[selectedProject].categories[categoryName]) {
      setTableData(prevData => ({
        ...prevData,
        [selectedProgram]: {
          projects: {
            ...prevData[selectedProgram].projects,
            [selectedProject]: {
              categories: {
                ...prevData[selectedProgram].projects[selectedProject].categories,
                [categoryName]: []
              }
            }
          }
        }
      }));
    }
  };

  const handleAddLineItem = (lineItemName: string) => {
    if (selectedProgram && selectedProject && selectedCategory) {
      const newLineItem: LineItem = {
        id: Date.now(), // Use a timestamp as a unique ID
        name: lineItemName,
        periods: Array(13).fill(0)
      };

      setTableData(prevData => {
        const updatedLineItems = [
          ...prevData[selectedProgram].projects[selectedProject].categories[selectedCategory],
          newLineItem
        ];

        return {
          ...prevData,
          [selectedProgram]: {
            projects: {
              ...prevData[selectedProgram].projects,
              [selectedProject]: {
                categories: {
                  ...prevData[selectedProgram].projects[selectedProject].categories,
                  [selectedCategory]: updatedLineItems
                }
              }
            }
          }
        };
      });

      // Optionally, select the new line item
      setSelectedLineItems(prevSelected => [...prevSelected, newLineItem]);
    }
  };

  useEffect(() => {
    console.log('Table data updated:', tableData);
  }, [tableData]);

  return (
    <div className="outline-view">
      <div className="column minified">
        <div className="header-with-button">
          <h3>Programs</h3>
          <button
            className={`add-toggle-button ${showAddProgramInput ? 'active' : ''}`}
            onClick={() => setShowAddProgramInput(!showAddProgramInput)}
          >
            {showAddProgramInput ? '×' : '+'}
          </button>
        </div>
        <SearchInput
          placeholder="Search Programs"
          value={programSearch}
          onChange={setProgramSearch}
        />
        {showAddProgramInput && <AddItemInput onAdd={handleAddProgram} />}
        {filteredPrograms.map(program => (
          <div
            key={program}
            className={selectedProgram === program ? 'selected' : ''}
            onClick={() => handleProgramToggle(program)}
          >
            {program}
          </div>
        ))}
      </div>
      <div className="column minified">
        <div className="header-with-button">
          <h3>Projects</h3>
          <button
            className={`add-toggle-button ${showAddProjectInput ? 'active' : ''}`}
            onClick={() => setShowAddProjectInput(!showAddProjectInput)}
          >
            {showAddProjectInput ? '×' : '+'}
          </button>
        </div>
        <SearchInput
          placeholder="Search Projects"
          value={projectSearch}
          onChange={setProjectSearch}
        />
        {showAddProjectInput && <AddItemInput onAdd={handleAddProject} />}
        {filteredProjects.map(project => (
          <div
            key={project}
            className={selectedProject === project ? 'selected' : ''}
            onClick={() => handleProjectToggle(project)}
          >
            {project}
          </div>
        ))}
      </div>
      <div className="column minified">
        <div className="header-with-button">
          <h3>Categories</h3>
          <button
            className={`add-toggle-button ${showAddCategoryInput ? 'active' : ''}`}
            onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
          >
            {showAddCategoryInput ? '×' : '+'}
          </button>
        </div>
        <SearchInput
          placeholder="Search Categories"
          value={categorySearch}
          onChange={setCategorySearch}
        />
        {showAddCategoryInput && <AddItemInput onAdd={handleAddCategory} />}
        {filteredCategories.map(category => (
          <div
            key={category}
            className={selectedCategory === category ? 'selected' : ''}
            onClick={() => handleCategoryToggle(category)}
          >
            {category}
          </div>
        ))}
      </div>
      <div className="column minified">
        <div className="header-with-button">
          <h3>Line Items</h3>
          <button
            className={`add-toggle-button ${showAddLineItemInput ? 'active' : ''}`}
            onClick={() => setShowAddLineItemInput(!showAddLineItemInput)}
          >
            {showAddLineItemInput ? '×' : '+'}
          </button>
        </div>
        <SearchInput
          placeholder="Search Line Items"
          value={lineItemSearch}
          onChange={setLineItemSearch}
        />
        {showAddLineItemInput && <AddItemInput onAdd={handleAddLineItem} />}
        {filteredLineItems.map(lineItem => (
          <div
            key={lineItem.id}
            className={selectedLineItems.some(item => item.id === lineItem.id) ? 'selected' : ''}
            onClick={() => handleLineItemToggle(lineItem)}
          >
            {lineItem.name}
          </div>
        ))}
      </div>
      {selectedCategory && (
        <div className="column line-item-details-column">
          {/* <h3>{selectedCategory ? selectedCategory : 'Category Details'}</h3> */}
          <div>
            <LineItemsTable 
              lineItems={selectedLineItems.length > 0 ? selectedLineItems : lineItems} // Show all if none selected
              setLineItems={(newLineItems) => {
                handleLineItemUpdate(newLineItems);
              }}
              onLineItemAdd={handleLineItemAdd}
              onDeselectAll={handleDeselectAll}
              selectedLineItems={selectedLineItems}
              categoryName={selectedCategory || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Outline;
