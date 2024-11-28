import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Item } from '../../types/program';
import { setSearch, setAddInputVisibility } from '../../store/slices/uiSlice';

type LineItemListProps = {
  lineItems: Item[];
  selectedLineItems: Item[];
  onLineItemToggle: (lineItem: Item) => void;
  onAddLineItem: (itemName: string) => void;
  lineItemSearch: string;
  showAddLineItemInput: boolean;
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
};

const LineItemList: React.FC<LineItemListProps> = ({
  lineItems,
  selectedLineItems,
  onLineItemToggle,
  onAddLineItem,
  lineItemSearch,
  showAddLineItemInput,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId
}) => {
  const dispatch = useAppDispatch();
  const programsState = useAppSelector(state => state.programs);

  const handleSearchChange = (value: string) => {
    dispatch(setSearch({ type: 'lineItem', value }));
  };

  const handleAddInputVisibility = (value: boolean) => {
    dispatch(setAddInputVisibility({ type: 'lineItem', value }));
  };

  // Get the current category's items from Redux state
  const currentItems = React.useMemo(() => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      return lineItems;
    }

    const program = programsState.items.find(p => p.id === selectedProgramId);
    if (!program) return lineItems;

    const project = program.projects.find(p => p.id === selectedProjectId);
    if (!project) return lineItems;

    const category = project.categories.find(c => c.id === selectedCategoryId);
    if (!category) return lineItems;

    return category.items;
  }, [programsState.items, selectedProgramId, selectedProjectId, selectedCategoryId, lineItems]);

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    return currentItems.filter(item => 
      item.name.toLowerCase().includes(lineItemSearch.toLowerCase())
    );
  }, [currentItems, lineItemSearch]);

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
      {showAddLineItemInput && <AddItemInput onAdd={onAddLineItem} />}
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