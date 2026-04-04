import axios from 'axios';

// Create an Axios instance pointing to your DOCTOR Service backend (Port 5002)
const doctorAPI = axios.create({
  baseURL: 'http://localhost:5002/api/doctors',
});

// Automatically attach the Doctor's JWT token to requests
doctorAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem('doctorToken'); // Notice we use a different token name!
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default doctorAPI;