import axios from 'axios'
import { getToken } from './auth'
import config from '../config.json'

const api = axios.create();

console.log(process.env.DB_HOST)

var host = config.api_host

api.defaults.baseURL = 'http://'+host+':3000/api/v1/'

api.interceptors.request.use(async config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
