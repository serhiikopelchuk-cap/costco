import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../hooks/reduxHooks';
import { CloudProvider } from '../../types/program';

interface ProviderFilterProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

const ProviderFilter: React.FC<ProviderFilterProps> = ({ 
  selectedProvider, 
  onProviderChange 
}) => {
  const cloudProviders = useAppSelector(state => state.cloudProviders.items);

  return (
    <div className="filter-container">
      <FontAwesomeIcon icon={faFilter} className="filter-icon" />
      <select
        value={selectedProvider}
        onChange={(e) => onProviderChange(e.target.value)}
        className="provider-select"
      >
        <option value="">All Providers</option>
        {cloudProviders.map((provider) => (
          <option key={provider.id} value={provider.name}>
            {provider.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProviderFilter;