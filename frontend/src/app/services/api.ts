import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/matrix"; // Adjust this to match your FastAPI server URL

// const API_URL = "https://numerical-methods-hk3e.onrender.com/api/v1/matrix"; // Adjust this to match your FastAPI server URL

// Upload matrix CSV file
export const uploadMatrix = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Calculate all operations
export const calculateAll = async () => {
  return await axios.get(`${API_URL}/process-all`);
};

// Calculate determinant
export const calculateDeterminant = async () => {
  return await axios.get(`${API_URL}/determinant`);
};

// Calculate condition number
export const calculateConditionNumber = async () => {
  return await axios.get(`${API_URL}/condition-number`);
};

// Find solution for Ax=b
export const findSolution = async (vectorChoice) => {
  return await axios.post(`${API_URL}/solve/${vectorChoice}`);
};

// Compute eigenvalues
export const computeEigenvalues = async () => {
  return await axios.get(`${API_URL}/eigenvalues`);
};

// Get polynomial equation
export const polynomialEquation = async () => {
  return await axios.get(`${API_URL}/polynomial-equation`);
};

// Use power method to compute eigenvalues
export const powerMethod = async () => {
  return await axios.get(`${API_URL}/power-method`);
};