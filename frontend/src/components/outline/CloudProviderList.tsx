import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import GenericList from '../common/GenericList';
import { setSelectedCloudProviders } from '../../store/slices/selectionSlice';
import { fetchCloudProvidersAsync } from '../../store/slices/cloudProvidersSlice';
import { CloudProvider } from '../../types/program';

interface ListItem {
  id: number;
  name: string;
}

const CloudProviderList: React.FC = () => {
  const dispatch = useAppDispatch();
  const cloudProviders = useAppSelector(state => state.cloudProviders.items);
  const selectedCloudProviders = useAppSelector(state => state.selection.selectedCloudProviders);
  const status = useAppSelector(state => state.cloudProviders.status);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCloudProvidersAsync());
    }
  }, [status, dispatch]);

  const handleProviderToggle = (providerId: number) => {
    const provider = cloudProviders.find(p => p.id === providerId);
    if (!provider) return;

    const isSelected = selectedCloudProviders.includes(provider.name);
    const updatedProviders = isSelected
      ? selectedCloudProviders.filter(name => name !== provider.name)
      : [...selectedCloudProviders, provider.name];

    dispatch(setSelectedCloudProviders(updatedProviders));
  };

  // First filter out invalid providers, then map to ListItem type
  const mappedProviders = cloudProviders
    .filter((provider): provider is Required<CloudProvider> => 
      typeof provider.id === 'number' && typeof provider.name === 'string'
    )
    .map((provider): ListItem => ({
      id: provider.id,
      name: provider.name
    }));

  const selectedIds = mappedProviders
    .filter(provider => selectedCloudProviders.includes(provider.name))
    .map(provider => provider.id);

  return (
    <GenericList
      title="Providers"
      type="provider"
      items={mappedProviders}
      selectedItemIds={selectedIds}
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