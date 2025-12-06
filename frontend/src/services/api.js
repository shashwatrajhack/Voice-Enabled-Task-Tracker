import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export const getTasks = (params) =>
  axios.get(`${API_BASE}/tasks`, { params }).then((r) => r.data);
export const createTask = (task) =>
  axios.post(`${API_BASE}/tasks`, task).then((r) => r.data);
export const updateTask = (id, data) =>
  axios.put(`${API_BASE}/tasks/${id}`, data).then((r) => r.data);
export const deleteTask = (id) =>
  axios.delete(`${API_BASE}/tasks/${id}`).then((r) => r.data);
export const parseTranscript = (transcript) =>
  axios.post(`${API_BASE}/voice/parse`, { transcript }).then((r) => r.data);
