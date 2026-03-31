import api from './api';

export const getEntries = async (weekId, section) => {
  const { data } = await api.get('/entries', { params: { weekId, section } });
  return data.data;
};

export const getEntriesBySection = async (weekId, section) => {
  const { data } = await api.get('/entries', { params: { weekId, section } });
  return data.data;
};

export const createEntry = async (entryData) => {
  const { data } = await api.post('/entries', entryData);
  return data.data;
};

export const updateEntry = async (entryId, entryData) => {
  const { data } = await api.put(`/entries/${entryId}`, entryData);
  return data.data;
};

export const deleteEntry = async (entryId) => {
  const { data } = await api.delete(`/entries/${entryId}`);
  return data.data;
};

const entryService = {
  getEntries,
  getEntriesBySection,
  createEntry,
  updateEntry,
  deleteEntry
};

export default entryService;
