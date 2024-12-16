import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../hooks/reduxHooks';
import { CloudProvider } from '../../types/program';
import './CloudProviderChips.css';

interface CloudProviderChipsProps {
  selectedProviders: CloudProvider[];
  onProviderAdd: (provider: CloudProvider) => void;
  onProviderRemove: (provider: CloudProvider) => void;
  disabled?: boolean;
}

const CloudProviderChips: React.FC<CloudProviderChipsProps> = ({
  selectedProviders,
  onProviderAdd,
  onProviderRemove,
  disabled = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const allProviders = useAppSelector(state => state.cloudProviders.items);

  // Filter out providers that are already selected
  const unselectedProviders = allProviders.filter(
    provider => !selectedProviders.some(p => p.id === provider.id)
  );

  return (
    <div className="cloud-provider-chips-container">
      <div className="cloud-provider-chips">
        {selectedProviders.map((provider) => (
          <span key={provider.id} className={`chip ${disabled ? 'disabled' : ''}`}>
            {provider.name}
            {!disabled && (
              <button
                className="remove-provider"
                onClick={() => onProviderRemove(provider)}
                aria-label={`Remove ${provider.name}`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </span>
        ))}
        {!disabled && unselectedProviders.length > 0 && (
          <button
            className="add-provider-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Add cloud provider"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      {isDropdownOpen && !disabled && (
        <div className="provider-dropdown">
          {unselectedProviders.map((provider) => (
            <div
              key={provider.id}
              className="provider-option"
              onClick={() => {
                onProviderAdd(provider);
                setIsDropdownOpen(false);
              }}
            >
              {provider.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudProviderChips; 