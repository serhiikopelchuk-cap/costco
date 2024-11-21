import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons';
import './ActionButtons.css';

interface ActionButtonsProps {
  handleRemoveLastLineItem: () => void;
  handleDeselectAll: () => void;
  handleAddLineItem: () => void;
  selectedLineItemsCount: number;
  cloudProviders: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleRemoveLastLineItem,
  handleDeselectAll,
  handleAddLineItem,
  selectedLineItemsCount,
  cloudProviders,
  selectedProvider,
  onProviderChange
}) => {
  return (
    <div className="action-buttons-container">
      <div className="filter-container">
        <FontAwesomeIcon icon={faFilter} className="filter-icon" />
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="provider-select"
        >
          <option value="">All Providers</option>
          {cloudProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>
      <button 
        className="remove-item-button"
        onClick={handleRemoveLastLineItem}
        aria-label="Remove last line item"
      >
        -
      </button>
      <button 
        className="deselect-all-button"
        onClick={handleDeselectAll}
        aria-label="Deselect all line items"
        disabled={selectedLineItemsCount === 0}
      >
        <FontAwesomeIcon icon={faChevronDown} />
      </button>
      <button 
        className="add-item-button"
        onClick={handleAddLineItem}
        aria-label="Add new line item"
      >
        +
      </button>
    </div>
  );
};

export default ActionButtons; 