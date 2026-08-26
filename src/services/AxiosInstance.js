import { resetAndNavigate } from "@utils/NavigationUtils";
import { stopService } from "@utils/RiderTracking";
import { clearStorage, getItem, removeItem } from "@utils/StorageService";
import axios from "axios";
const baseURL = "http://127.0.0.1:5000/api"

const AxiosInstance = axios.create({
  baseURL: "https://go-admin.daakit.com/api",
  // baseURL: baseURL,
  timeout: 30000,
});

// Request Interceptor
AxiosInstance.interceptors.request.use(
  config => {
    const token = getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
AxiosInstance.interceptors.response.use(
  response => response,
  error => {

    // Token Expired
    console.log(error?.response)
    if (error?.response?.status === 401) {

      // Remove Token
      stopService()
      removeItem('token');
      removeItem('rider');
      removeItem('biometric_enabled');
      clearStorage()
      resetAndNavigate('Login');

      console.log("Logout User");
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;