import api from './api';

export const getSubjects = async () => {
  const response = await api.get('/subjects');
  return response.data;
};

export const getAllSubjects = async (branch, year, semester) => {
  const response = await api.get(`/subjects/all?branch=${branch}&year=${year}&semester=${semester}`);
  return response.data;
};

export const getNotes = async (subjectCode, unitNumber = null) => {
  const url = unitNumber !== null && unitNumber !== 'all' 
    ? `/notes?subject_code=${subjectCode}&unit_number=${unitNumber}` 
    : `/notes?subject_code=${subjectCode}`;
  const response = await api.get(url);
  return response.data;
};

export const getAdminNotes = async () => {
  const response = await api.get('/notes/admin');
  return response.data;
};

export const uploadNote = async (formData) => {
  const response = await api.post('/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export const viewNote = async (id) => {
  const response = await api.post(`/notes/${id}/view`);
  return response.data;
};

export const downloadNote = async (id) => {
  const response = await api.get(`/notes/${id}/proxy`, {
    responseType: 'blob'
  });
  return response.data;
};
