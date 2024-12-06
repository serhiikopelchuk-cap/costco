import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

interface ProviderFilterProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  cloudProviders: string[];
}

const ProviderFilter: React.FC<ProviderFilterProps> = ({ selectedProvider, onProviderChange, cloudProviders = ['azure', 'gcp'] }) => {
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
          <option key={provider} value={provider}>
            {provider}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProviderFilter;