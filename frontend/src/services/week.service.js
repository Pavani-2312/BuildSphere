import api from './api';

export const getActiveWeek = async (department) => {
  const { data } = await api.get(`/weeks/active?department=${department}`);
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

export const getSectionStatuses = async (weekId) => {
  const { data } = await api.get(`/weeks/${weekId}/section-statuses`);
  return data.data;
};

const weekService = {
  getActiveWeek,
  getAllWeeks,
  createWeek,
  submitWeek,
  getSectionStatuses
};

export default weekService;
