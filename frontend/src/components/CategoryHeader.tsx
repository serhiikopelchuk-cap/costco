import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import './CategoryHeader.css';

interface CategoryHeaderProps {
  name: string;
  description: string;
  onSave: (updatedCategory: { name: string; description: string }) => void;
  onDelete: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ name, description, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState({ name, description });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave(editedCategory);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'name' | 'description') => {
    setEditedCategory({ ...editedCategory, [field]: e.target.value });
  };

  return (
    <div className="category-header">
      <div>
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedCategory.name}
              onChange={(e) => handleInputChange(e, 'name')}
            />
            <textarea
              value={editedCategory.description}
              onChange={(e) => handleInputChange(e, 'description')}
              rows={3}
            />
          </>
        ) : (
          <>
            <h2>{name}</h2>
            <p>{description}</p>
          </>
        )}
      </div>
      <div className="category-actions">
        <FontAwesomeIcon
          icon={isEditing ? faSave : faPencilAlt}
          className="pencil-icon"
          onClick={isEditing ? handleSaveClick : handleEditClick}
        />
        <button
          className="remove-category-button"
          onClick={onDelete}
        >
          Remove Category
        </button>
      </div>
    </div>
  );
};

export default CategoryHeader; 