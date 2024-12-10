import React from 'react';
import './GenericList.css';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import DetailsButton from '../buttons/DetailsButton';

type GenericListProps<T> = {
  title: string;
  type: string;
  items: T[];
  selectedItemIds: number[];
  onItemToggle: (id: number) => void;
  onAddItem: (name: string) => void;
  onDetailsClick?: (type: string, id: number) => void;
  itemSearch: string;
  setItemSearch: (search: string) => void;
  showAddItemInput: boolean;
  setShowAddItemInput: (show: boolean) => void;
  renderItem: (item: T) => React.ReactNode;
  showDetailsButton?: boolean;
  showAddButton?: boolean;
};

const GenericList = <T extends { id: number; name: string }>({
  title,
  type,
  items,
  selectedItemIds,
  onItemToggle,
  onAddItem,
  onDetailsClick,
  itemSearch,
  setItemSearch,
  showAddItemInput,
  setShowAddItemInput,
  renderItem,
  showDetailsButton = true,
  showAddButton = true,
}: GenericListProps<T>) => {
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>{title}</h3>
        {showAddButton && (
          <button
            className={`add-toggle-button ${showAddItemInput ? 'active' : ''}`}
            onClick={() => setShowAddItemInput(!showAddItemInput)}
          >
            {showAddItemInput ? '×' : '+'}
          </button>
        )}
      </div>
      <SearchInput
        placeholder={`Search ${title}`}
        value={itemSearch}
        onChange={setItemSearch}
      />
      {showAddItemInput && <AddItemInput onAdd={onAddItem} />}
      {filteredItems.map(item => (
        <div
          key={item.id}
          className={`item ${selectedItemIds.includes(item.id) ? 'selected' : ''}`}
          onClick={() => onItemToggle(item.id)}
        >
          {renderItem(item)}
          {showDetailsButton && onDetailsClick && (
            <DetailsButton
              onClick={(e) => {
                e.stopPropagation();
                onDetailsClick(type, item.id);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default GenericList; 