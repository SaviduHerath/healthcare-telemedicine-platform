import axios from 'axios';

// Create an Axios instance pointing to your Patient Service backend
const API = axios.create({
  baseURL: 'http://localhost:5001/api/patients',
});

// Automatically attach the JWT token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;