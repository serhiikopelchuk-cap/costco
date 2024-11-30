import React from 'react';
import { useAppDispatch } from '../hooks/reduxHooks';
import { deleteLineItemAsync } from '../store/slices/costTypesSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons';
import './ActionButtons.css';
import { Item } from '../types/program';

interface ActionButtonsProps {
  handleDeselectAll: () => void;
  handleAddLineItem: () => void;
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
  selectedLineItemsCount,
  cloudProviders,
  selectedProvider,
  onProviderChange,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
  lineItems
}) => {
  const dispatch = useAppDispatch();

  const handleRemoveLastLineItem = async () => {
    if (lineItems.length === 0 || !selectedProgramId || !selectedProjectId || !selectedCategoryId) return;

    const lastItem = lineItems[lineItems.length - 1];
    try {
      await dispatch(deleteLineItemAsync({
        itemId: lastItem.id!,
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: selectedCategoryId
      })).unwrap();
    } catch (error) {
      console.error('Failed to delete line item:', error);
    }
  };

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