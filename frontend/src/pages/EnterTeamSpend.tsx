import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import './EnterTeamSpend.css';
import '../components/common/Button.css'; // Import button styles
import {
  getTeamSpends,
  createTeamSpend,
  updateTeamSpend,
  deleteTeamSpend,
} from '../services/teamSpendService';

interface TeamSpend {
  id: number;
  vpName: string;
  teamName: string;
  budget: number;
}

function EnterTeamSpend() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teamSpends, setTeamSpends] = useState<TeamSpend[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<TeamSpend, 'id'>>({ vpName: '', teamName: '', budget: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TeamSpend>('vpName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTeamSpends();
      setTeamSpends(data);
    };
    fetchData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: name === 'budget' ? Number(value) : value });
  };

  const addEntry = async () => {
    const createdEntry = await createTeamSpend(newEntry);
    setTeamSpends([...teamSpends, createdEntry]);
    setNewEntry({ vpName: '', teamName: '', budget: 0 });
  };

  const updateEntry = async (id: number, field: string, value: string | number) => {
    const updatedEntry = await updateTeamSpend(id, { ...teamSpends.find(entry => entry.id === id)!, [field]: value });
    setTeamSpends(teamSpends.map(entry => entry.id === id ? updatedEntry : entry));
  };

  const deleteEntry = async (id: number) => {
    await deleteTeamSpend(id);
    setTeamSpends(teamSpends.filter(entry => entry.id !== id));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: keyof TeamSpend) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const filteredAndSortedSpends = teamSpends
    .filter(entry => 
      entry.vpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="enter-team-spend">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <h2>Enter Team Spend</h2>
        <div className="form">
          <input
            type="text"
            name="vpName"
            placeholder="VP Name"
            value={newEntry.vpName}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="teamName"
            placeholder="Team Name"
            value={newEntry.teamName}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="budget"
            placeholder="Budget"
            value={newEntry.budget}
            onChange={handleInputChange}
          />
          <button className="button-primary" onClick={addEntry}>Add</button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-bar"
        />
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('vpName')}>VP Name</th>
              <th onClick={() => handleSort('teamName')}>Team Name</th>
              <th onClick={() => handleSort('budget')}>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSpends.map(entry => (
              <tr key={entry.id}>
                <td>
                  <input
                    type="text"
                    value={entry.vpName}
                    onChange={(e) => updateEntry(entry.id, 'vpName', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={entry.teamName}
                    onChange={(e) => updateEntry(entry.id, 'teamName', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.budget}
                    onChange={(e) => updateEntry(entry.id, 'budget', Number(e.target.value))}
                  />
                </td>
                <td>
                  <button className="button-secondary" onClick={() => deleteEntry(entry.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EnterTeamSpend; 