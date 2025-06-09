// src/features/voice/voiceService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Upload recorded audio blob for speech recognition
export async function recognizeSpeech(audioBlob, languageCode = 'en-US') {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.wav');
  formData.append('lang', languageCode);

  const response = await axios.post(`${API_URL}/voice/recognize`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; // { transcript: string, confidence: number }
}

export default {
  recognizeSpeech,
};
