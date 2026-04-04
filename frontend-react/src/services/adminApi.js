import axios from 'axios';

const adminAPI = axios.create({
  baseURL: 'http://localhost:5003/api/admin',
});

adminAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem('adminToken');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default adminAPI;