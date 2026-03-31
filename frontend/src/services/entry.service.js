import api from './api';

export const getEntries = async (sectionName, weekId) => {
  const { data } = await api.get('/entries', { params: { section: sectionName, weekId } });
  return data.data;
};

export const createEntry = async (sectionName, entryData) => {
  const { data } = await api.post('/entries', { section: sectionName, data: entryData });
  return data.data;
};

export const updateEntry = async (entryId, entryData) => {
  const { data } = await api.put(`/entries/${entryId}`, { data: entryData });
  return data.data;
};

export const deleteEntry = async (entryId) => {
  const { data } = await api.delete(`/entries/${entryId}`);
  return data.data;
};
