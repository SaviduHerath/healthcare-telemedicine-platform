import axios from 'axios';

const APPOINTMENT_API_URL = 'http://localhost:5004/api/appointments';

export const getAvailableSlots = async (doctorId, date) => {
  try {
    const response = await axios.get(`${APPOINTMENT_API_URL}/slots`, {
      params: { doctorId, date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
    const isFormData = typeof FormData !== 'undefined' && appointmentData instanceof FormData;
    const response = await axios.post(`${APPOINTMENT_API_URL}/book`, appointmentData, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const getDoctorAppointments = async (doctorId) => {
  try {
    const response = await axios.get(`${APPOINTMENT_API_URL}/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status, doctorCompletionNote = '') => {
  try {
    const payload = { status };
    if (status === 'Completed') {
      payload.doctorCompletionNote = doctorCompletionNote;
    }
    const response = await axios.put(`${APPOINTMENT_API_URL}/${appointmentId}/status`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const getPatientAppointments = async (patientId) => {
  try {
    const response = await axios.get(`${APPOINTMENT_API_URL}/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    throw error;
  }
};

export const updatePatientAppointment = async (appointmentId, updateData) => {
  try {
    const response = await axios.put(`${APPOINTMENT_API_URL}/${appointmentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(`${APPOINTMENT_API_URL}/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};
