import axios from 'axios'
import { getToken } from './auth'

const api = axios.create();

//var host = '140.238.237.209'
var host = '127.0.0.1'

api.defaults.baseURL = 'http://'+host+':3333/api/v1/'

api.interceptors.request.use(async config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;