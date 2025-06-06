import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Cases API
export const casesAPI = {
  getAllCases: (params) => api.get('/cases', { params }),
  getCaseById: (id) => api.get(`/cases/${id}`),
  createCase: (caseData) => api.post('/cases', caseData),
  updateCase: (id, caseData) => api.put(`/cases/${id}`, caseData),
  deleteCase: (id) => api.delete(`/cases/${id}`),
  uploadEvidence: (caseId, formData) => api.post(`/cases/${caseId}/evidence`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Reports API
export const reportsAPI = {
  getAllReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  createReport: (reportData) => api.post('/reports', reportData),
  updateReport: (id, reportData) => api.put(`/reports/${id}`, reportData),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  uploadEvidence: (reportId, formData) => api.post(`/reports/${reportId}/evidence`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Victims API
export const victimsAPI = {
  getAllVictims: (params) => api.get('/victims', { params }),
  getVictimById: (id) => api.get(`/victims/${id}`),
  createVictim: (victimData) => api.post('/victims', victimData),
  updateVictim: (id, victimData) => api.put(`/victims/${id}`, victimData),
  deleteVictim: (id) => api.delete(`/victims/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getViolationStats: (params) => api.get('/analytics/violations', { params }),
  getTimelineData: (params) => api.get('/analytics/timeline', { params }),
  getGeoData: (params) => api.get('/analytics/geo', { params }),
  exportData: (format, params) => api.get(`/analytics/export/${format}`, { 
    params,
    responseType: 'blob'
  })
};

export default api;
