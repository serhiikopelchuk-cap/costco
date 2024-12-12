import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import DetailsButton from '../buttons/DetailsButton';
import './GenericList.css';

interface MiniGenericListProps<T> {
  title: string;
  items: T[];
  selectedItemIds: number[];
  renderItem: (item: T) => React.ReactNode;
  onExpand: () => void;
  onDetailsClick?: (item: T) => void;
}

const MiniGenericList = <T extends { id: number; name: string }>({
  title,
  items,
  selectedItemIds,
  renderItem,
  onExpand,
  onDetailsClick
}: MiniGenericListProps<T>) => {
  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>{title}</h3>
        <button 
          className="expand-button"
          onClick={onExpand}
          aria-label="Expand list"
        >
          <FontAwesomeIcon icon={faExpand} />
        </button>
      </div>
      {items.filter(item => selectedItemIds.includes(item.id)).map((item) => (
        <div
          key={item.id}
          className={`item ${selectedItemIds.includes(item.id) ? 'selected' : ''}`}
        >
          {renderItem(item)}
          {onDetailsClick && (
            <DetailsButton onClick={(e) => {
              console.log('MiniGenericList - Details button clicked');
              e.stopPropagation();
              onDetailsClick(item);
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default MiniGenericList; 