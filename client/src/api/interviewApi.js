import axios from "axios";
import API_BASE_URL from "./config";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/interview`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ATTACH JWT TOKEN TO EVERY REQUEST
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// CREATE INTERVIEW
export const createInterview = (data) => API.post("/", data);

// GET INTERVIEW HISTORY
export const getInterviewHistory = () => API.get("/");

// GET SINGLE INTERVIEW
export const getInterviewById = (id) => API.get(`/${id}`);

// SUBMIT INTERVIEW ANSWER
export const submitInterviewAnswer = (id, data) =>
  API.patch(`/${id}/answer`, data);

// COMPLETE INTERVIEW
export const completeInterview = (id) =>
  API.post(`/${id}/complete`);

// DELETE INTERVIEW
export const deleteInterview = (id) => API.delete(`/${id}`);

export default API;
