// src/features/lessons/lessonService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Fetch list of lessons
export async function fetchLessons() {
  const response = await axios.get(`${API_URL}/lessons`);
  return response.data; // array of lesson objects
}

// Fetch single lesson by ID
export async function fetchLessonById(id) {
  const response = await axios.get(`${API_URL}/lessons/${id}`);
  return response.data; // lesson object
}

// Submit user progress for a lesson
export async function submitProgress(lessonId, payload) {
  // payload example: { correct: 8, total: 10 }
  const response = await axios.post(`${API_URL}/lessons/${lessonId}/progress`, payload);
  return response.data; // { progress, nextLessonId }
}

export default {
  fetchLessons,
  fetchLessonById,
  submitProgress,
};
