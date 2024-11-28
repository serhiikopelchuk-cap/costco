import React from 'react';
import { Bar } from 'react-chartjs-2';
import './TotalCostsTable.css';

const TotalCostsTable: React.FC = () => {
  const barData = {
    labels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13'],
    datasets: [
      {
        label: 'Total Costs (Year 1)',
        data: [0, 200, 200, 225, 225, 225, 225, 225, 265, 265, 265, 290], // Update with actual data
        backgroundColor: '#cce5ff', // Light blue bar color
        borderColor: '#007bff', // Blue border color
        borderWidth: 1, // Ensure border is visible
      },
    ],
  };

  return (
    <div className="total-costs-section">
      <h3>Total Costs (Year 1)</h3>
      <div className="content">
        <div className="chart">
          <Bar data={barData} />
        </div>
        <div className="total-costs-table">
          <table>
            <thead>
              <tr>
                <th>Cost Type</th>
                <th>P1</th>
                <th>P2</th>
                <th>P3</th>
                <th>P4</th>
                <th>P5</th>
                <th>P7</th>
                <th>P8</th>
                <th>P9</th>
                <th>P10</th>
                <th>P11</th>
                <th>P12</th>
                <th>P13</th>
                <th>Total</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Direct Costs</td>
                <td>#REF!</td>
                <td>$130</td>
                <td>$130</td>
                <td>$145</td>
                <td>$145</td>
                <td>$145</td>
                <td>$145</td>
                <td>$145</td>
                <td>$165</td>
                <td>$165</td>
                <td>$165</td>
                <td>$180</td>
                <td>#REF!</td>
                <td>$152</td>
              </tr>
              <tr>
                <td>Indirect Costs</td>
                <td>#REF!</td>
                <td>$70</td>
                <td>$70</td>
                <td>$80</td>
                <td>$80</td>
                <td>$80</td>
                <td>$80</td>
                <td>$80</td>
                <td>$100</td>
                <td>$100</td>
                <td>$100</td>
                <td>$110</td>
                <td>#REF!</td>
                <td>$88</td>
              </tr>
              <tr>
                <td>Total Costs</td>
                <td>#REF!</td>
                <td>$200</td>
                <td>$200</td>
                <td>$225</td>
                <td>$225</td>
                <td>$225</td>
                <td>$225</td>
                <td>$225</td>
                <td>$265</td>
                <td>$265</td>
                <td>$265</td>
                <td>$290</td>
                <td>#REF!</td>
                <td>$240</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalCostsTable; 