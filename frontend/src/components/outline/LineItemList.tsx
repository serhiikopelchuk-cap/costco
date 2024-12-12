import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Item } from '../../types/program';
import { setSearch, setAddInputVisibility } from '../../store/slices/uiSlice';
import { createLineItemAsync } from '../../store/slices/costTypesSlice';
import { setLineItems } from '../../store/slices/selectionSlice';

type LineItemListProps = {
  onLineItemToggle: (lineItem: Item) => void;
  onAddLineItem: (itemName: string) => void;
  lineItemSearch: string;
  showAddLineItemInput: boolean;
  selectedCategoryId: number | null;
  selectedProgramId: number | null;
  selectedProjectId: number | null;
};

const LineItemList: React.FC<LineItemListProps> = ({
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
  const selectedLineItems = useAppSelector(state => state.selection.selectedLineItems);

  // Derive line items from costTypes state and preserve selection
  const items = React.useMemo(() => {
    if (!selectedCategoryId || !costTypes.item) return [];
    const category = costTypes.item.programs
      .flatMap(program => program.projects)
      .flatMap(project => project.categories)
      .find(category => category.id === selectedCategoryId);
    
    if (!category) return [];

    return category.items.map(item => {
      const isSelected = selectedLineItems.some(selected => selected.id === item.id);
      return {
        ...item,
        isSelected
      };
    });
  }, [costTypes, selectedCategoryId, selectedLineItems]);

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

  const handleToggle = (lineItem: Item) => {
    const isSelected = selectedLineItems.some(item => item.id === lineItem.id);
    if (isSelected) {
      dispatch(setLineItems(selectedLineItems.filter(item => item.id !== lineItem.id)));
    } else {
      dispatch(setLineItems([...selectedLineItems, lineItem]));
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(lineItemSearch.toLowerCase())
  );

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>Sub Category</h3>
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
          onClick={() => handleToggle(lineItem)}
        >
          {lineItem.name}
        </div>
      ))}
    </div>
  );
};

export default LineItemList; 