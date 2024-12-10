import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GenericList from '../common/GenericList';
import { selectCloudProvidersForProject } from '../../store/selectors';
import { setSelectedCloudProviders } from '../../store/slices/selectionSlice';
import { RootState } from '../../store';

const CloudProviderList: React.FC = () => {
  const dispatch = useDispatch();
  const cloudProviders = useSelector(selectCloudProvidersForProject);
  const selectedCloudProviders = useSelector((state: RootState) => state.selection.selectedCloudProviders);

  useEffect(() => {
  }, [cloudProviders]);

  const handleProviderToggle = (providerId: number) => {
    const providerName = cloudProviders[providerId];
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
      items={cloudProviders.map((provider, index) => ({
        id: index,
        name: provider,
      }))}
      selectedItemIds={cloudProviders
        .map((provider, index) => index)
        .filter(index => selectedCloudProviders.includes(cloudProviders[index]))}
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