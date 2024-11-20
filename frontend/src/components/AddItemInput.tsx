import React, { useState } from 'react';
import './AddItemInput.css';

interface AddItemInputProps {
  onAdd: (itemName: string) => void;
}

const AddItemInput: React.FC<AddItemInputProps> = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="add-item-input-container">
      
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
      
    </div>
  );
};

export default AddItemInput; 