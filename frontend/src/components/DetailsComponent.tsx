import React, { useEffect, useState } from 'react';
import './DetailsComponent.css';

interface DetailsComponentProps {
  type: 'program' | 'project';
  name: string;
  categories: Record<string, LineItem[]>;
}

type LineItem = {
  id: number;
  name: string;
  periods: number[];
};

const DetailsComponent: React.FC<DetailsComponentProps> = ({ type, name, categories }) => {
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfPeriods = 13;

  const [sums, setSums] = useState<Record<string, { periodSums: number[], totalSum: number, averageSum: number }>>({});
  const [overallSums, setOverallSums] = useState<number[]>(Array(numberOfPeriods).fill(0));
  const [overallTotalSum, setOverallTotalSum] = useState<number>(0);
  const [overallAverageSum, setOverallAverageSum] = useState<number>(0);

  useEffect(() => {
    const calculateSums = (items: Record<string, LineItem[]>) => {
      const sums: Record<string, { periodSums: number[], totalSum: number, averageSum: number }> = {};
      const overallSums = Array(numberOfPeriods).fill(0);
      let overallTotalSum = 0;

      Object.entries(items).forEach(([itemName, lineItems]) => {
        const periodSums = Array(numberOfPeriods).fill(0);
        let totalSum = 0;

        lineItems.forEach(item => {
          item.periods.forEach((value, index) => {
            periodSums[index] += value;
            overallSums[index] += value;
          });
          totalSum += item.periods.reduce((sum, val) => sum + val, 0);
        });

        const averageSum = lineItems.length > 0 ? totalSum / (lineItems.length * numberOfPeriods) : 0;
        sums[itemName] = { periodSums, totalSum, averageSum };
        overallTotalSum += totalSum;
      });

      const overallAverageSum = overallTotalSum / (Object.values(items).flat().length * numberOfPeriods);

      return { sums, overallSums, overallTotalSum, overallAverageSum };
    };

    const { sums, overallSums, overallTotalSum, overallAverageSum } = calculateSums(categories);
    setSums(sums);
    setOverallSums(overallSums);
    setOverallTotalSum(overallTotalSum);
    setOverallAverageSum(overallAverageSum);
  }, [categories]);

  return (
    <div className="container">
      <h4>{type === 'program' ? 'Program Details' : 'Project Details'}</h4>
      <p>Details for {type === 'program' ? 'Program' : 'Project'}: {name}</p>
      <table>
        <thead>
          <tr>
            <th>{type === 'program' ? 'Project' : 'Category'}</th>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Overall</strong></td>
            {overallSums.map((sum, index) => (
              <td key={index}><strong>{sum}$</strong></td>
            ))}
            <td><strong>{overallTotalSum}$</strong></td>
            <td><strong>{overallAverageSum.toFixed(2)}$</strong></td>
          </tr>
          {Object.entries(sums).map(([itemName, { periodSums, totalSum, averageSum }]) => (
            <tr key={itemName}>
              <td>{itemName}</td>
              {periodSums.map((sum, index) => (
                <td key={index}>{sum}$</td>
              ))}
              <td>{totalSum}$</td>
              <td>{averageSum.toFixed(2)}$</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailsComponent; 