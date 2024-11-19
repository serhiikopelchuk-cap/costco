import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MonthlyReports from './pages/MonthlyReports';
import EnterTeamSpend from './pages/EnterTeamSpend';
import DirectCost from './pages/DirectCost';
import Outline from './pages/Outline';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="App">
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/direct-cost" element={<DirectCost />} />
            <Route path="/monthly-reports" element={<MonthlyReports />} />
            <Route path="/enter-team-spend" element={<EnterTeamSpend />} />
            <Route path="/login" element={<Login />} />
            <Route path="/outline" element={<Outline />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
