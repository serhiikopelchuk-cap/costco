import React from 'react';
import SearchInput from '../SearchInput';
import AddItemInput from '../AddItemInput';
import { Item } from '../../pages/Outline';

type LineItemListProps = {
  lineItems: Item[];
  selectedLineItems: Item[];
  onLineItemToggle: (lineItem: Item) => void;
  onAddLineItem: (itemName: string) => void;
  lineItemSearch: string;
  setLineItemSearch: (search: string) => void;
  showAddLineItemInput: boolean;
  setShowAddLineItemInput: (show: boolean) => void;
};

const LineItemList: React.FC<LineItemListProps> = ({
  lineItems,
  selectedLineItems,
  onLineItemToggle,
  onAddLineItem,
  lineItemSearch,
  setLineItemSearch,
  showAddLineItemInput,
  setShowAddLineItemInput
}) => (
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
    {showAddLineItemInput && <AddItemInput onAdd={onAddLineItem} />}
    {lineItems.map(lineItem => (
      <div
        key={lineItem.id}
        className={selectedLineItems.some(item => item.id === lineItem.id) ? 'selected' : ''}
        onClick={() => onLineItemToggle(lineItem)}
      >
        {lineItem.name}
      </div>
    ))}
  </div>
);

export default LineItemList; 