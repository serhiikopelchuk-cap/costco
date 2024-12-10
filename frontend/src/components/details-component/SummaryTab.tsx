import React from 'react';
import { Project, Category } from '../../types/program';

interface SummaryTabProps {
  type: 'program' | 'project';
  editingName: string;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameBlur: () => void;
  data: (Project | Category)[];
  columns: string[];
  overallSums: number[];
  overallTotalSum: number;
  overallAverageSum: number;
  sums: Record<number, { periodSums: number[], totalSum: number, averageSum: number }>;
}

const SummaryTab: React.FC<SummaryTabProps> = ({
  type,
  editingName,
  handleNameChange,
  handleNameBlur,
  data,
  columns,
  overallSums,
  overallTotalSum,
  overallAverageSum,
  sums,
}) => {
  return (
    <>
      <p>Summary for {type === 'program' ? 'Program' : 'Project'}:</p>
      <input
        type="text"
        value={editingName}
        onChange={handleNameChange}
        onBlur={handleNameBlur}
        className="details-name-input"
      />
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
              <td key={index}><strong>{Number(sum).toFixed(0)}$</strong></td>
            ))}
            <td><strong>{Number(overallTotalSum).toFixed(2)}$</strong></td>
            <td><strong>{Number(overallAverageSum).toFixed(2)}$</strong></td>
          </tr>
          {data.map((item) => {
            const itemId = type === 'program' ? (item as Project).id : (item as Category).id;
            const { periodSums, totalSum, averageSum } = sums[itemId] || { periodSums: [], totalSum: 0, averageSum: 0 };
            return (
              <tr key={itemId}>
                <td>{item.name}</td>
                {periodSums.map((sum, index) => (
                  <td key={`${itemId}-${index}`}>{Number(sum).toFixed(0)}$</td>
                ))}
                <td>{Number(totalSum).toFixed(2)}$</td>
                <td>{Number(averageSum).toFixed(2)}$</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default SummaryTab; 