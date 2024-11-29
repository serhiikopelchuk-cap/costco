import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './DeleteButton.css';

interface DeleteButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  disabled?: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, title, disabled = false }) => {
  return (
    <button
      className="delete-button"
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
};

export default DeleteButton; 