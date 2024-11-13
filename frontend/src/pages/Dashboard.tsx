import React from 'react';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="summary-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p>$120,000</p>
        </div>
        <div className="card">
          <h3>New Users</h3>
          <p>350</p>
        </div>
        <div className="card">
          <h3>Active Users</h3>
          <p>1,200</p>
        </div>
        <div className="card">
          <h3>Conversion Rate</h3>
          <p>4.5%</p>
        </div>
      </div>
      <div className="charts">
        <div className="chart">
          <h3>Revenue Trends</h3>
          {/* Insert Line Chart Component Here */}
        </div>
        <div className="chart">
          <h3>User Growth</h3>
          {/* Insert Bar Chart Component Here */}
        </div>
      </div>
      <div className="tables">
        <h3>Recent Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction ID</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2023-10-01</td>
              <td>TX12345</td>
              <td>$500</td>
            </tr>
            <tr>
              <td>2023-10-02</td>
              <td>TX12346</td>
              <td>$750</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;