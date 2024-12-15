import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MonthlyReports from './pages/MonthlyReports';
import EnterTeamSpend from './pages/EnterTeamSpend';
import IndirectCost from './pages/IndirectCost';
import DirectCosts from './pages/DirectCosts';
import { AuthProvider } from './context/AuthContext';
import SamlLogin from './components/Auth/SamlLogin';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthCallback from './components/Auth/AuthCallback';
import ProtectedContent from './components/Auth/ProtectedContent';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/direct-costs" element={<DirectCosts />} />
                <Route path="/indirect-costs" element={<IndirectCost />} />
                <Route path="/monthly-reports" element={<MonthlyReports />} />
                <Route path="/enter-team-spend" element={<EnterTeamSpend />} />
                <Route path="/defaultlogin" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth-success" element={<AuthCallback />} />
                <Route
                  path="/protected"
                  element={
                    <ProtectedRoute>
                      <ProtectedContent />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
