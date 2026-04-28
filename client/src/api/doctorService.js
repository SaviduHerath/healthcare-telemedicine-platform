import axios from 'axios';

const DOCTOR_API_URL = 'http://localhost:5002/api/doctors';

export const searchDoctors = async (query = '') => {
  try {
    const response = await axios.get(`${DOCTOR_API_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw error;
  }
};

export const getDoctorProfile = async (id) => {
  try {
    const response = await axios.get(`${DOCTOR_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    throw error;
  }
};

export const updateDoctorProfile = async (id, profileData) => {
  try {
    const response = await axios.put(`${DOCTOR_API_URL}/profile/${id}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    throw error;
  }
};

export const updateDoctorAvailability = async (id, availability) => {
  try {
    const response = await axios.put(`${DOCTOR_API_URL}/availability/${id}`, { availability });
    return response.data;
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    throw error;
  }
};
