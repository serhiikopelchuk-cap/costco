import React from 'react';
import './MonthlyReports.css';

function MonthlyReports() {
  return (
    <div className="monthly-reports">
      <h2>Monthly Reports</h2>
      <div className="summary-cards">
        <div className="card">
          <h3>Total Spend</h3>
          <p>$50,000</p>
        </div>
        <div className="card">
          <h3>Budget Utilization</h3>
          <p>75%</p>
        </div>
        <div className="card">
          <h3>Top Spending Teams</h3>
          <p>Team A, Team B</p>
        </div>
      </div>
      <div className="charts">
        <div className="chart">
          <h3>Spend by Team</h3>
          {/* Insert Bar Chart Component Here */}
        </div>
        <div className="chart">
          <h3>Spend Trends</h3>
          {/* Insert Line Chart Component Here */}
        </div>
      </div>
      <div className="tables">
        <h3>Team Spend Details</h3>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Budget</th>
              <th>Spend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Team A</td>
              <td>$20,000</td>
              <td>$15,000</td>
            </tr>
            <tr>
              <td>Team B</td>
              <td>$30,000</td>
              <td>$25,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyReports; 