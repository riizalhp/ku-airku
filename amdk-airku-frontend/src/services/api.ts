import axios from 'axios';

// Deteksi API URL berdasarkan environment atau gunakan IP local
// Untuk development, bisa gunakan VITE_API_URL dari .env
// Atau otomatis gunakan host yang sama dengan frontend
const getApiBaseUrl = () => {
  // Cek environment variable dulu
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Jika diakses dari network (bukan localhost), gunakan host yang sama
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:3001/api`;
  }
  
  // Default ke localhost
  return 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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