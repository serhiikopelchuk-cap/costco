import React, { useState } from 'react';
import './AddItemInput.css';

interface AddItemInputProps {
  onAdd: (itemName: string) => void;
}

const AddItemInput: React.FC<AddItemInputProps> = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleAdd = () => {
    if (inputValue.trim()) {
      console.log('Adding item:', inputValue.trim());
      onAdd(inputValue.trim());
      setInputValue('');
      setIsVisible(false);
    }
  };

  return (
    <div className="add-item-input-container">
      {isVisible ? (
        <div className="add-item-form">
          <input
            type="text"
            placeholder="Enter name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="add-item-input"
          />
          <button onClick={handleAdd} className="add-item-submit-button">Add</button>
        </div>
      ) : (
        <button onClick={() => setIsVisible(true)} className="add-item-toggle-button">+</button>
      )}
    </div>
  );
};

export default AddItemInput; 