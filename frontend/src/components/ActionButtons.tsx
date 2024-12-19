import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons';
import './ActionButtons.css';
import { Item } from '../types/program';
import ProviderFilter from './common/ProviderFilter';

interface ActionButtonsProps {
  handleDeselectAll: () => void;
  handleAddLineItem: () => void;
  handleRemoveLastLineItem: () => void;
  selectedLineItemsCount: number;
  cloudProviders: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
  lineItems: Item[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleDeselectAll,
  handleAddLineItem,
  handleRemoveLastLineItem,
  selectedLineItemsCount,
  cloudProviders,
  selectedProvider,
  onProviderChange,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
  lineItems
}) => {
  return (
    <div className="action-buttons-container">
      <button 
        className="remove-item-button"
        onClick={handleRemoveLastLineItem}
        aria-label="Remove last line item"
        disabled={lineItems.length === 0}
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