import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GenericList from '../common/GenericList';
import { selectCloudProvidersForProject } from '../../store/selectors';
import { setSelectedCloudProviders } from '../../store/slices/selectionSlice';
import { RootState } from '../../store';

const CloudProviderList: React.FC = () => {
  const dispatch = useDispatch();
  const currentProviders = useSelector(selectCloudProvidersForProject);
  const selectedCloudProviders = useSelector((state: RootState) => state.selection.selectedCloudProviders);
  
  const [allProviders, setAllProviders] = useState<string[]>([]);

  useEffect(() => {
    setAllProviders(prev => {
      const newProviders = new Set([...prev, ...currentProviders]);
      return Array.from(newProviders);
    });
  }, [currentProviders]);

  const handleProviderToggle = (providerId: number) => {
    const providerName = allProviders[providerId];
    const isSelected = selectedCloudProviders.includes(providerName);
    const updatedProviders = isSelected
      ? selectedCloudProviders.filter(name => name !== providerName)
      : [...selectedCloudProviders, providerName];

    dispatch(setSelectedCloudProviders(updatedProviders));
  };

  return (
    <GenericList
      title="Providers"
      type="provider"
      items={allProviders.map((provider, index) => ({
        id: index,
        name: provider,
      }))}
      selectedItemIds={allProviders
        .map((provider, index) => index)
        .filter(index => selectedCloudProviders.includes(allProviders[index]))}
      onItemToggle={handleProviderToggle}
      onAddItem={() => {}}
      itemSearch=""
      setItemSearch={() => {}}
      showAddItemInput={false}
      setShowAddItemInput={() => {}}
      renderItem={(provider) => <span>{provider.name}</span>}
      showDetailsButton={false}
      showAddButton={false}
    />
  );
};

export default CloudProviderList; 