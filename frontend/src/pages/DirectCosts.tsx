import React, { useEffect } from 'react';
import Outline from '../components/outline/Outline';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchProgramsAsync } from '../store/slices/programsSlice';

const DirectCosts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: data, status, error } = useAppSelector(state => state.programs);

  useEffect(() => {
    // Fetch initial data
    if (status === 'idle' || (!data || data.length === 0)) {
      dispatch(fetchProgramsAsync());
    }
  }, [status, dispatch, data]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('Programs state updated:', { data, status });
  }, [data, status]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return <Outline data={data} />;
};

export default DirectCosts;