import React, { useEffect, useState } from 'react';
import { User } from '../../types/program';
import { userService } from '../../services/userService';
import ChipSelector from '../common/ChipSelector';
import './SecurityTab.css';

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

  const handleAddUser = async (user: { id: number; label: string; value: string }) => {
    const selectedUser = users.find(u => u.id === user.id);
    if (selectedUser && !selectedUsers.some(u => u.id === selectedUser.id)) {
      try {
        await userService.addProgramToUser(selectedUser.id, programId);
        setSelectedUsers([...selectedUsers, selectedUser]);
      } catch (error) {
        console.error('Error adding user to program:', error);
      }
    }
  };

  const handleRemoveUser = async (user: { id: number; label: string; value: string }) => {
    const selectedUser = selectedUsers.find(u => u.id === user.id);
    if (selectedUser) {
      try {
        await userService.removeProgramFromUser(selectedUser.id, programId);
        setSelectedUsers(selectedUsers.filter(u => u.id !== selectedUser.id));
      } catch (error) {
        console.error('Error removing user from program:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const userItems = users.map(user => ({
    id: user.id,
    label: user.name,
    value: user.email
  }));

  const selectedUserItems = selectedUsers.map(user => ({
    id: user.id,
    label: user.name,
    value: user.email
  }));

  return (
    <div className="security-tab">
      <div className="section">
        <h3>Program Access</h3>
        <p>Select users who should have access to this program:</p>
        <ChipSelector
          selectedItems={selectedUserItems}
          availableItems={userItems}
          onAdd={handleAddUser}
          onRemove={handleRemoveUser}
          placeholder="Add user"
        />
      </div>
    </div>
  );
};

export default SecurityTab; 