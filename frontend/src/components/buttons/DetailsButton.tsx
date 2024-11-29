import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

interface DetailsButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const DetailsButton: React.FC<DetailsButtonProps> = ({ onClick }) => {
  return (
    <button
      className="icon-button"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faEllipsisV} className="edit-icon" />
    </button>
  );
};

export default DetailsButton; 