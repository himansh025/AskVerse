import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from "axios";

const apiUrl:string = import.meta.env.VITE_API_URL;

// const apiUrl:string = "http://localhost:8080"

const axiosInstance:AxiosInstance = axios.create({
  baseURL: `${apiUrl}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response:AxiosResponse):AxiosResponse => {
    return response;
  },
  (error:AxiosError):Promise<AxiosError> => {
    console.error("Response Error:", error);

    if (error.response && error.response.status === 401) {
      console.log("Unauthorized, redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
