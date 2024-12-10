import React from 'react';
import './CloudProviderChips.css';

type CloudProviderChipsProps = {
  providers: { name: string }[];
};

const CloudProviderChips: React.FC<CloudProviderChipsProps> = ({ providers }) => {
  return (
    <div className="cloud-provider-chips">
      {providers.map((provider, index) => (
        <span key={index} className="chip">
          {provider.name}
        </span>
      ))}
    </div>
  );
};

export default CloudProviderChips; 