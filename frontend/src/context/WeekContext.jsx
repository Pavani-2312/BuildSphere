import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getActiveWeek } from '../services/week.service';

export const WeekContext = createContext();

export const useWeek = () => {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error('useWeek must be used within WeekProvider');
  }
  return context;
};

export const WeekProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [activeWeek, setActiveWeek] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadActiveWeek();
    }
  }, [user]);

  const loadActiveWeek = async () => {
    try {
      setLoading(true);
      const week = await getActiveWeek(user.department);
      setActiveWeek(week);
    } catch (error) {
      console.error('Failed to load active week:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWeek = () => {
    loadActiveWeek();
  };
  
  const isWeekSubmitted = activeWeek?.status === 'submitted';

  return (
    <WeekContext.Provider value={{ activeWeek, loading, refreshWeek, isWeekSubmitted }}>
      {children}
    </WeekContext.Provider>
  );
};
