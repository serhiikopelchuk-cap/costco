import React, { useEffect, useState } from 'react';
import { User } from '../../types/program';
import { userService } from '../../services/userService';

interface SecurityTabProps {
  programId: number;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ programId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
        
        // Get program details to see which users have access
        const programUsers = allUsers.filter(user => 
          user.programs.some(program => program.id === programId)
        );
        setSelectedUsers(programUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [programId]);

  const handleAddUser = async (email: string) => {
    const user = users.find(u => u.email === email);
    if (user && !selectedUsers.some(u => u.id === user.id)) {
      try {
        await userService.addProgramToUser(user.id, programId);
        setSelectedUsers([...selectedUsers, user]);
      } catch (error) {
        console.error('Error adding user to program:', error);
      }
    }
  };

  const handleRemoveUser = async (email: string) => {
    const user = selectedUsers.find(u => u.email === email);
    if (user) {
      try {
        await userService.removeProgramFromUser(user.id, programId);
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error removing user from program:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="security-tab">
      <div className="section">
        <h3>Program Access</h3>
        <p>Select users who should have access to this program:</p>
        {/* <CloudProviderChips
          selectedProviders={selectedUsers.map(user => user.email)}
          availableProviders={users.map(user => user.email)}
          onAdd={handleAddUser}
          onRemove={handleRemoveUser}
          placeholder="Add user"
        /> */}
      </div>
    </div>
  );
};

export default SecurityTab; 