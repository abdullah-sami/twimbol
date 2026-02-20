import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    // If no response or not 401 → reject
    if (!err.response || err.response.status !== 401) {
      return Promise.reject(err);
    }

    // Do NOT refresh for login or refresh endpoints
    if (
      originalRequest.url.includes('/user/login/') ||
      originalRequest.url.includes('/api/token/refresh')
    ) {
      return Promise.reject(err);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      return Promise.reject(err);
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/token/refresh`,
        { refresh }
      );

      localStorage.setItem('access_token', data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return Promise.reject(refreshError);
    }
  }
);


export default api