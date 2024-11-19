import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import './CostItemRow.css';

interface CostItemRowProps {
  item: {
    name: string;
    costs: number[];
  };
  onSave: (updatedItem: { name: string; costs: number[] }) => void;
  onDelete: () => void;
}

const CostItemRow: React.FC<CostItemRowProps> = ({ item, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const calculateTotal = (costs: number[]) => costs.reduce((acc, cost) => acc + cost, 0);
  const calculateAverage = (costs: number[]) => (calculateTotal(costs) / costs.length).toFixed(2);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave(editedItem);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedCosts = [...editedItem.costs];
    updatedCosts[index] = parseFloat(e.target.value) || 0;
    setEditedItem({ ...editedItem, costs: updatedCosts });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedItem({ ...editedItem, name: e.target.value });
  };

  return (
    <tr className="cost-item-row">
      <td>
        {isEditing ? (
          <input type="text" value={editedItem.name} onChange={handleNameChange} />
        ) : (
          item.name
        )}
      </td>
      {item.costs.map((cost, i) => (
        <td key={i}>
          {isEditing ? (
            <input
              type="number"
              value={editedItem.costs[i]}
              onChange={(e) => handleInputChange(e, i)}
            />
          ) : (
            `$${cost}`
          )}
        </td>
      ))}
      <td>${calculateTotal(item.costs)}</td>
      <td className="average-cell">
        ${calculateAverage(item.costs)}
        <FontAwesomeIcon
          icon={isEditing ? faSave : faPencilAlt}
          className="pencil-icon"
          onClick={isEditing ? handleSaveClick : handleEditClick}
        />
        <FontAwesomeIcon
          icon={faTrash}
          className="delete-icon"
          onClick={onDelete}
        />
      </td>
    </tr>
  );
};

export default CostItemRow; 