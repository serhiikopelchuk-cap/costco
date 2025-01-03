import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ChipSelector.css';

interface ChipItem {
  id: number;
  label: string;
  value: string;
}

interface ChipSelectorProps {
  selectedItems: ChipItem[];
  availableItems: ChipItem[];
  onAdd: (item: ChipItem) => void;
  onRemove: (item: ChipItem) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedItems,
  availableItems,
  onAdd,
  onRemove,
  disabled = false,
  placeholder = "Add item"
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddItem = (item: ChipItem) => {
    onAdd(item);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const availableItemsFiltered = availableItems
    .filter(item => !selectedItems.some(selected => selected.id === item.id))
    .filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="chip-selector-container">
      <div className="chip-selector">
        {selectedItems.length === 0 && (
          <span className="placeholder-text">{placeholder}</span>
        )}
        {selectedItems.map((item) => (
          <div key={item.id} className={`chip ${disabled ? 'disabled' : ''}`}>
            <span className="chip-label">{item.label}</span>
            {!disabled && (
              <button
                className="remove-item"
                onClick={() => onRemove(item)}
                title={`Remove ${item.label}`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        ))}
        {!disabled && (
          <button
            className="add-item-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Add item"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
      {isDropdownOpen && (
        <div className="dropdown-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="item-dropdown">
            {availableItemsFiltered.length > 0 ? (
              availableItemsFiltered.map((item) => (
                <div
                  key={item.id}
                  className="item-option"
                  onClick={() => handleAddItem(item)}
                >
                  <span className="item-label">{item.label}</span>
                  <span className="item-value">{item.value}</span>
                </div>
              ))
            ) : (
              <div className="no-results">No items found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChipSelector; 