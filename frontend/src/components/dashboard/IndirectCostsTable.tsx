import React, { useState } from 'react';
import { CostType } from '../../types/program'; // Import CostType

interface IndirectCostsTableProps {
  indirectCostsData: CostType;
}

const IndirectCostsTable: React.FC<IndirectCostsTableProps> = ({ indirectCostsData }) => {
  const periodsCount = 13; // Number of periods (P1 to P13)
  const [visibleCategories, setVisibleCategories] = useState(10); // State to track visible categories

  const calculateTotal = (costs: number[]) => costs.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);
  const calculateAverage = (costs: number[]) => costs.length > 0 ? (calculateTotal(costs) / costs.length) : 0;

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (typeof num !== 'number' || isNaN(num)) return '0.00$';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '$';
  };

  // Collect all categories from all programs and projects
  const allCategories = indirectCostsData.programs.flatMap((program) =>
    program.projects.flatMap((project) => project.categories)
  );

  const handleLoadMore = () => {
    setVisibleCategories((prev) => prev + 10); // Load 20 more categories
  };

  return (
    <div className="indirect-costs-table">
      <h3>Indirect Costs (Year 1)</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            {Array.from({ length: periodsCount }, (_, i) => (
              <th key={i}>P{i + 1}</th>
            ))}
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {allCategories.slice(0, visibleCategories).map((category) => {
            const periods = Array(periodsCount).fill(0);

            category.items.forEach((item) => {
              item.costs.forEach((cost, index) => {
                if (index < periodsCount) {
                  const value = typeof cost.value === 'string' ? parseFloat(cost.value) : cost.value;
                  if (!isNaN(value)) {
                    periods[index] += value;
                  } else {
                    console.warn(`Invalid cost value detected: ${cost.value}`);
                  }
                }
              });
            });

            const total = calculateTotal(periods);
            const average = calculateAverage(periods);
            return (
              <tr key={category.id}>
                <td>{category.name}</td>
                {periods.map((value, index) => (
                  <td key={index}>{Number(value).toFixed(0)}$</td>
                ))}
                <td>{formatNumber(total)}</td>
                <td>{formatNumber(average)}</td>
              </tr>
            );
          })}
          {allCategories.length > visibleCategories && (
            <tr key="more" onClick={handleLoadMore} style={{ cursor: 'pointer' }}>
              <td colSpan={periodsCount + 3} style={{ textAlign: 'center' }}>Load more...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IndirectCostsTable; 