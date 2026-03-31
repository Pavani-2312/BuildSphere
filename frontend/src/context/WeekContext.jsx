import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const WeekContext = createContext();

export const WeekProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [activeWeek, setActiveWeek] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Mock active week data - replace with API call when backend is ready
      setActiveWeek({
        _id: '1',
        weekLabel: 'Week 13 - March 2026',
        startDate: '2026-03-23T00:00:00.000Z',
        endDate: '2026-03-28T23:59:59.000Z',
        department: user.department,
        status: 'active'
      });
      setLoading(false);
    }
  }, [user]);

  const refreshWeek = () => {
    // Refresh logic here
  };
  
  const isWeekSubmitted = activeWeek?.status === 'submitted';

  return (
    <WeekContext.Provider value={{ activeWeek, loading, refreshWeek, isWeekSubmitted }}>
      {children}
    </WeekContext.Provider>
  );
};
