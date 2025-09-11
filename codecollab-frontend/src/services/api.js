//src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const problemAPI = {
  // Get all problems
  getAllProblems: () => api.get('/problems'),
  
  // Get problem by ID
  getProblemById: (id) => api.get(`/problems/${id}`),
  
  // Get problems by difficulty
  getProblemsByDifficulty: (difficulty) => api.get(`/problems/difficulty/${difficulty}`),
  
  // Get problems by category
  getProblemsByCategory: (category) => api.get(`/problems/category/${category}`),
  
  // Get test cases for a problem
  getTestCases: (problemId) => api.get(`/problems/${problemId}/testcases`),
  
  // Get sample test cases
  getSampleTestCases: (problemId) => api.get(`/problems/${problemId}/sample-testcases`),
};

export const codeExecutionAPI = {
  testCode: (problemId, code, language) => 
    api.post('/code/test', { problemId, code, language }),
  
  submitCode: (problemId, code, language) => 
    api.post('/code/submit', { problemId, code, language }),
};

// Test API endpoints
export const testAPI = {
  healthCheck: () => api.get('/test/health'),
  getProblemsCount: () => api.get('/test/problems-count'),
};

export default api;