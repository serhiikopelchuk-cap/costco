import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';

interface CloneButtonProps {
  isCloning: boolean;
  cloneSuccess: boolean;
  onClick: () => void;
  title: string;
}

const CloneButton: React.FC<CloneButtonProps> = ({ isCloning, cloneSuccess, onClick, title }) => {
  return (
    <button
      className={`clone-button ${isCloning ? 'cloning' : ''} ${cloneSuccess ? 'success' : ''}`}
      onClick={onClick}
      title={title}
      disabled={isCloning}
    >
      <FontAwesomeIcon
        icon={isCloning ? faSpinner : cloneSuccess ? faCheck : faClone}
        className={isCloning ? 'fa-spin' : ''}
      />
    </button>
  );
};

export default CloneButton; 