import React, { useEffect, useState } from 'react';
import Outline from '../components/outline/Outline';
import { fetchPrograms } from '../services/programService';
import { Program } from '../types/program';

// Define the Data type as a record of programs
type Data = Record<string, Program>;


const DirectCosts: React.FC = () => {
  const [data, setData] = useState<Program[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const programsArray = await fetchPrograms();
        // console.log(`Programs:`, programsArray);
        setData(programsArray); // Set the data as an array
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchData();
  }, []);

  return data ? <Outline data={data} /> : <div>Loading...</div>;
};

export default DirectCosts; 