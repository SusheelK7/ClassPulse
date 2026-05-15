import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ClassContext = createContext(null);

export function ClassProvider({ children }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/classes');
      setClasses(data);
    } catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  }, []);

  const addClass = async (cls) => {
    const { data } = await api.post('/classes', cls);
    setClasses(prev => [...prev, data]);
    toast.success('Class added!');
    return data;
  };

  const bulkAdd = async (clsList, clearExisting = false) => {
    const { data } = await api.post('/classes/bulk', { classes: clsList, clearExisting });
    if (clearExisting) setClasses(data);
    else setClasses(prev => [...prev, ...data]);
    toast.success(`${data.length} classes imported!`);
    return data;
  };

  const updateClass = async (id, updates) => {
    const { data } = await api.put(`/classes/${id}`, updates);
    setClasses(prev => prev.map(c => c._id === id ? data : c));
    toast.success('Class updated!');
    return data;
  };

  const deleteClass = async (id) => {
    await api.delete(`/classes/${id}`);
    setClasses(prev => prev.filter(c => c._id !== id));
    toast.success('Class deleted');
  };

  const clearAll = async () => {
    await api.delete('/classes');
    setClasses([]);
    toast.success('All classes cleared');
  };

  return (
    <ClassContext.Provider value={{ classes, loading, fetchClasses, addClass, bulkAdd, updateClass, deleteClass, clearAll }}>
      {children}
    </ClassContext.Provider>
  );
}

export const useClasses = () => useContext(ClassContext);
