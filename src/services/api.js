import axios from 'axios'
import { getToken } from './auth'
import config from '../config.json'

const api = axios.create();

var host = config.api_host
var port = config.api_port

api.defaults.baseURL = 'http://'+host+':'+port+'/api/v1/'

api.interceptors.request.use(async config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
