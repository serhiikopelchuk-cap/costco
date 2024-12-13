import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import './CloudProviderChips.css';

interface CloudProviderChipsProps {
  availableProviders: string[];
  selectedProviders: { name: string }[];
  onProviderAdd: (providerName: string) => void;
  onProviderRemove: (providerName: string) => void;
  disabled?: boolean;
}

const CloudProviderChips: React.FC<CloudProviderChipsProps> = ({
  availableProviders,
  selectedProviders,
  onProviderAdd,
  onProviderRemove,
  disabled = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Filter out providers that are already selected
  const unselectedProviders = availableProviders.filter(
    provider => !selectedProviders.some(p => p.name === provider)
  );

  return (
    <div className="cloud-provider-chips-container">
      <div className="cloud-provider-chips">
        {selectedProviders.map((provider) => (
          <span key={provider.name} className={`chip ${disabled ? 'disabled' : ''}`}>
            {provider.name}
            {!disabled && (
              <button
                className="remove-provider"
                onClick={() => onProviderRemove(provider.name)}
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
              key={provider}
              className="provider-option"
              onClick={() => {
                onProviderAdd(provider);
                setIsDropdownOpen(false);
              }}
            >
              {provider}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudProviderChips; 