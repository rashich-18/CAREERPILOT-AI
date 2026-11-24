import axios from "axios";
import API_BASE_URL from "./config";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/onboarding`,
});

export default API;