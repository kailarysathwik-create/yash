/**
 * Trip API Client - Integrates with Y.A.S.H Backend
 * Handles all API calls securely with credentials
 */

import axios from 'axios';

// Get API URL from environment with the Render URL as a fallback
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://trip-bkak.onrender.com/';
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Auth headers are handled via cookies (withCredentials: true)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - user session expired
    if (error.response?.status === 401) {
      console.error('Session expired, please login again');
    }
    return Promise.reject(error);
  }
);

/**
 * Trip API Methods
 */
export const tripAPI = {
  // Create a new trip
  createTrip: async (tripDetails) => {
    try {
      const response = await apiClient.post('/trips/create', tripDetails);
      return response.data;
    } catch (error) {
      console.error('Failed to create trip:', error.message);
      throw error;
    }
  },

  // Get trip details
  getTrip: async (tripId) => {
    try {
      const response = await apiClient.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trip:', error.message);
      throw error;
    }
  },

  // Get all trips for history
  getTrips: async () => {
    try {
      const response = await apiClient.get('/trips');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trip history:', error.message);
      throw error;
    }
  },

  // Generate itinerary for a trip
  generateItinerary: async (tripId, bookingData = {}) => {
    try {
      const response = await apiClient.post(`/trips/${tripId}/generate-itinerary`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Failed to generate itinerary:', error.message);
      throw error;
    }
  },

  // Orchestrate the entire trip securely in parallel
  orchestrateTrip: async (tripId) => {
    try {
      // Execute all three generation schemas in parallel for minimal latency
      const [transportRes, stayRes, itineraryRes] = await Promise.all([
        apiClient.post(`/trips/${tripId}/generate-transport`, {}),
        apiClient.post(`/trips/${tripId}/generate-stays`, {}),
        apiClient.post(`/trips/${tripId}/generate-itinerary`, {})
      ]);

      return {
        transports: transportRes.data.transport_options || [],
        stays: stayRes.data.stay_options || [],
        itinerary: itineraryRes.data.itinerary?.days || itineraryRes.data.itinerary || []
      };
    } catch (error) {
      console.error('Hub Orchestration Failed:', error.message);
      throw error;
    }
  },

  // Update itinerary
  updateItinerary: async (tripId, itinerary) => {
    try {
      const response = await apiClient.put(`/trips/${tripId}/itinerary`, itinerary);
      return response.data;
    } catch (error) {
      console.error('Failed to update itinerary:', error.message);
      throw error;
    }
  },

  // Update tourist details
  updateTouristDetails: async (tripId, touristDetails) => {
    try {
      const response = await apiClient.post(
        `/trips/${tripId}/tourist-details`,
        touristDetails
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update tourist details:', error.message);
      throw error;
    }
  },

  // Save agency charges
  saveAgencyCharges: async (tripId, agencyCharges) => {
    try {
      const response = await apiClient.post(
        `/trips/${tripId}/agency-charges`,
        { agency_charges: agencyCharges }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to save agency charges:', error.message);
      throw error;
    }
  },

  // Get payment info
  getPaymentInfo: async (tripId) => {
    try {
      const response = await apiClient.get(`/trips/${tripId}/payment-info`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment info:', error.message);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (tripId, transactionId) => {
    try {
      const response = await apiClient.post(
        `/trips/${tripId}/confirm-payment`,
        { transaction_id: transactionId }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to confirm payment:', error.message);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: async (email) => {
      try {
        const response = await apiClient.post('/auth/login', { email });
        return response.data;
      } catch (error) {
        console.error('Failed to login:', error.message);
        throw error;
      }
    },

    loginWithGoogle: async () => {
      try {
        const response = await apiClient.post('/auth/google', {});
        if (response.data && response.data.url) {
          window.location.href = response.data.url;
        }
        return response.data;
      } catch (error) {
        console.error('Failed to login with Google:', error.message);
        throw error;
      }
    },

    logout: async () => {
      try {
        const response = await apiClient.post('/auth/logout', {});
        return response.data;
      } catch (error) {
        console.error('Failed to logout:', error.message);
        throw error;
      }
    },

    getMe: async () => {
      try {
        const response = await apiClient.get('/auth/me');
        return response.data;
      } catch (error) {
        console.error('Failed to get user:', error.message);
        throw error;
      }
    },

    session: async (accessToken) => {
      try {
        const response = await apiClient.post('/auth/session', { access_token: accessToken });
        return response.data;
      } catch (error) {
        console.error('Failed to create session:', error.message);
        throw error;
      }
    },

    onboarding: async (formData) => {
      try {
        const response = await apiClient.post('/onboarding', formData);
        return response.data;
      } catch (error) {
        console.error('Failed to complete onboarding:', error.message);
        throw error;
      }
    },
  },

  // Send manifest notification
  sendManifest: async (manifestData) => {
    try {
      const response = await apiClient.post('/trip/send-manifest', manifestData);
      return response.data;
    } catch (error) {
      console.error('Failed to dispatch manifest:', error.message);
      throw error;
    }
  },
};

export default apiClient;
