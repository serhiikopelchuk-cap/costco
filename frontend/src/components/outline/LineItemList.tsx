import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Item } from '../../types/program';
import { setSearch, setAddInputVisibility } from '../../store/slices/uiSlice';
import { createLineItemAsync } from '../../store/slices/costTypesSlice';
type LineItemListProps = {
  selectedLineItems: Item[];
  onLineItemToggle: (lineItem: Item) => void;
  onAddLineItem: (itemName: string) => void;
  lineItemSearch: string;
  showAddLineItemInput: boolean;
  selectedCategoryId: number | null;
  selectedProgramId: number | null;
  selectedProjectId: number | null;
};

const LineItemList: React.FC<LineItemListProps> = ({
  selectedLineItems,
  onLineItemToggle,
  onAddLineItem,
  lineItemSearch,
  showAddLineItemInput,
  selectedCategoryId,
  selectedProgramId,
  selectedProjectId
}) => {
  const dispatch = useAppDispatch();
  const costTypes = useAppSelector(state => state.costTypes);

  // Derive line items from costTypes state
  const items = React.useMemo(() => {
    if (!selectedCategoryId || !costTypes.item) return [];
    const category = costTypes.item.programs
      .flatMap(program => program.projects)
      .flatMap(project => project.categories)
      .find(category => category.id === selectedCategoryId);
    return category ? category.items : [];
  }, [costTypes, selectedCategoryId]);

  useEffect(() => {
    
  }, [costTypes, selectedCategoryId, items]);

  const handleSearchChange = (value: string) => {
    dispatch(setSearch({ type: 'lineItem', value }));
  };

  const handleAddInputVisibility = (value: boolean) => {
    dispatch(setAddInputVisibility({ type: 'lineItem', value }));
  };

  const handleAddItem = (itemName: string) => {
    if (selectedCategoryId && selectedProgramId && selectedProjectId) {
      const newItem: Partial<Item> = { 
        name: itemName, 
        costs: Array(13).fill({ value: 0 }) 
      };
      
      dispatch(createLineItemAsync({
        categoryId: selectedCategoryId,
        item: newItem,
        programId: selectedProgramId,
        projectId: selectedProjectId
      }));
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(lineItemSearch.toLowerCase())
  );

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>Line Items</h3>
        <button
          className={`add-toggle-button ${showAddLineItemInput ? 'active' : ''}`}
          onClick={() => handleAddInputVisibility(!showAddLineItemInput)}
        >
          {showAddLineItemInput ? '×' : '+'}
        </button>
      </div>
      <SearchInput
        placeholder="Search Line Items"
        value={lineItemSearch}
        onChange={handleSearchChange}
      />
      {showAddLineItemInput && <AddItemInput onAdd={handleAddItem} />}
      {filteredItems.map(lineItem => (
        <div
          key={lineItem.id}
          className={`line-item ${selectedLineItems.some(item => item.id === lineItem.id) ? 'selected' : ''}`}
          onClick={() => onLineItemToggle(lineItem)}
        >
          {lineItem.name}
        </div>
      ))}
    </div>
  );
};

export default LineItemList; 