import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const NoteContext = createContext(null);

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, []);

  const addNote = async (note) => {
    const { data } = await api.post('/notes', note);
    setNotes(prev => [data, ...prev]);
    toast.success('Note saved!');
    return data;
  };

  const updateNote = async (id, updates) => {
    const { data } = await api.put(`/notes/${id}`, updates);
    setNotes(prev => prev.map(n => n._id === id ? data : n));
    toast.success('Note updated!');
    return data;
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
    toast.success('Note deleted');
  };

  return (
    <NoteContext.Provider value={{ notes, loading, fetchNotes, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  );
}

export const useNotes = () => useContext(NoteContext);
