import api from './api';

export const getActiveWeek = async () => {
  const { data } = await api.get('/weeks/active');
  return data.data;
};

export const getAllWeeks = async () => {
  const { data } = await api.get('/weeks');
  return data.data;
};

export const createWeek = async (payload) => {
  const { data } = await api.post('/weeks', payload);
  return data.data;
};

export const submitWeek = async (weekId) => {
  const { data } = await api.patch(`/weeks/${weekId}/submit`);
  return data.data;
};
