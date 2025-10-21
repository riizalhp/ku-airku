import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Adjust if your backend runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor untuk menangani error token expired
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Jika token expired atau invalid, hapus token dan redirect ke login
      if (status === 401 && (data.error === 'TOKEN_EXPIRED' || data.error === 'INVALID_TOKEN' || data.error === 'NO_TOKEN')) {
        // Hapus token dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Hapus token dari axios headers
        delete api.defaults.headers.common['Authorization'];
        
        // Redirect ke halaman login
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;