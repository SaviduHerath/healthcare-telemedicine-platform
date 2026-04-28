import axios from 'axios';

const PAYMENT_API_URL = 'http://localhost:5009/api/payments';

// Create axios instance with interceptor
const paymentAPI = axios.create({
  baseURL: PAYMENT_API_URL
});

// Add token to all requests
paymentAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Payment API Request:', config.method.toUpperCase(), config.url, { token: !!token });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
paymentAPI.interceptors.response.use(
  (response) => {
    console.log('Payment API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Payment API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const createPaymentCheckout = async (paymentData) => {
  try {
    const response = await paymentAPI.post('/stripe-checkout', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating Stripe payment:', error);
    throw error;
  }
};

export const createBankTransferPayment = async (paymentData) => {
  try {
    console.log('Creating bank transfer payment with data:', paymentData);
    const response = await paymentAPI.post('/bank-transfer', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating bank transfer payment:', error);
    throw error;
  }
};

export const getPaymentByAppointment = async (appointmentId) => {
  try {
    const response = await paymentAPI.get(`/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// Admin endpoints
export const getPendingPayments = async () => {
  try {
    const response = await paymentAPI.get('/admin/pending');
    return response.data?.payments || [];
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentId, adminId, notes, status) => {
  try {
    const response = await paymentAPI.put(`/admin/verify/${paymentId}`, {
      adminId,
      adminNotes: notes,
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const rejectPayment = async (paymentId, adminId, notes) => {
  try {
    const response = await paymentAPI.put(`/admin/reject/${paymentId}`, {
      adminId,
      adminNotes: notes
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
};
