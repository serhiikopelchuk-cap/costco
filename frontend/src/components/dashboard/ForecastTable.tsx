import React from 'react';

const ForecastTable: React.FC = () => {
  return (
    <div className="forecast-table">
      <h3>Forecast</h3>
      <table>
        <thead>
          <tr>
            <th>Initial Investment</th>
            <th>Year 1</th>
            <th>Year 2</th>
            <th>Year 3</th>
            <th>Year 4</th>
            <th>Year 5</th>
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Direct Costs</td>
            <td>$20</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>$20</td>
          </tr>
          <tr>
            <td>Indirect Costs</td>
            <td>$20</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>$20</td>
          </tr>
          <tr>
            <td>Total Costs</td>
            <td>$40</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>$40</td>
          </tr>
          <tr>
            <td>Cumulative Costs</td>
            <td>$40</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
            <td>#REF!</td>
          </tr>
          <tr>
            <td>Avg Cost Growth Rate</td>
            <td>base year</td>
            <td>+ 6%</td>
            <td>+ 6%</td>
            <td>+ 6%</td>
            <td>+ 10%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ForecastTable; 