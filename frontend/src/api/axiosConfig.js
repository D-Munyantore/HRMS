import axios from 'axios';

// This is the base URL of our backend server
const api = axios.create({
    baseURL: 'http://localhost:5000'
});

// Automatically add the token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;