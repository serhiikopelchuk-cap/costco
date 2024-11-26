import React, { useEffect, useState } from 'react';
import Outline from './Outline';
import { fetchPrograms, Program } from '../services/programService';

// Define the Cost type
type Cost = {
  id: number;
  value: number;
};

// Define the Item type
type Item = {
  id: number;
  name: string;
  costs: Cost[];
};

// Define the Category type
type Category = {
  id: number;
  name: string;
  description?: string;
  note?: string;
  cloudProvider?: string[];
  items: Item[];
};

// Define the Project type
type Project = {
  id: number;
  name: string;
  description?: string;
  categories: Category[];
};

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