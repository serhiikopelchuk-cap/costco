import React from 'react';

const TotalCostsTable: React.FC = () => {
  return (
    <div className="total-costs-table">
      <h3>Total Costs (Year 1)</h3>
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
  );
};

export default TotalCostsTable; 