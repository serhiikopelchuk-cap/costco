import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faSave } from '@fortawesome/free-solid-svg-icons';

interface NoteEditorProps {
  initialNote: string;
  onSave: (newNote: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onSave(note);
    setIsEditing(false);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  };

  return (
    <div className="note-editor">
      {isEditing ? (
        <input
          type="text"
          value={note}
          onChange={handleNoteChange}
          onBlur={handleSaveClick}
        />
      ) : (
        <span onClick={handleEditClick}>{note}</span>
      )}
      <FontAwesomeIcon
        icon={isEditing ? faSave : faPencilAlt}
        className="pencil-icon"
        onClick={isEditing ? handleSaveClick : handleEditClick}
      />
    </div>
  );
};

export default NoteEditor;