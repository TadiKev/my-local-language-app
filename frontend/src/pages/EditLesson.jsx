// frontend/src/pages/EditLesson.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// ← Define BACKEND_BASE here:
const BACKEND_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function EditLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    languageCode: 'en',
    content: '',
    expectedText: '',
    order: 0,
    audioExampleUrl: '',
  });
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        const L = res.data;
        setLessonData({
          title: L.title,
          description: L.description || '',
          languageCode: L.languageCode,
          content: L.content || '',
          expectedText: L.expectedText || '',
          order: L.order || 0,
          audioExampleUrl: L.audioExampleUrl || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-200">
        <p className="text-green-700">Loading lesson…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'audioFile') {
      setAudioFile(files[0] || null);
    } else if (name === 'order') {
      setLessonData((prev) => ({
        ...prev,
        order: parseInt(value, 10),
      }));
    } else {
      setLessonData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, languageCode, content, expectedText, order } = lessonData;

    if (!title.trim() || !languageCode) {
      alert('Title and language code are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('languageCode', languageCode);
    formData.append('content', content);
    formData.append('expectedText', expectedText);
    formData.append('order', order);

    if (audioFile) {
      formData.append('audioExample', audioFile);
    }

    try {
      await api.put(`/lessons/${lessonId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Lesson updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="flex justify-center py-12 bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-green-800 mb-4">Edit Lesson</h2>

        <div>
          <label className="block text-green-700">Title *</label>
          <input
            type="text"
            name="title"
            value={lessonData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-green-700">Description</label>
          <textarea
            name="description"
            value={lessonData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-green-700">Language Code *</label>
          <select
            name="languageCode"
            value={lessonData.languageCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="en">English (en)</option>
            <option value="shona">Shona (shona)</option>
            <option value="ndebele">Ndebele (ndebele)</option>
            <option value="kalanga">Kalanga (kalanga)</option>
            <option value="venda">Venda (venda)</option>
            <option value="sotho-tonga">Sotho/Tonga (sotho-tonga)</option>
          </select>
        </div>

        <div>
          <label className="block text-green-700">Content *</label>
          <textarea
            name="content"
            value={lessonData.content}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-green-700">Expected Phrase</label>
          <input
            type="text"
            name="expectedText"
            value={lessonData.expectedText}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-green-700">Order</label>
          <input
            type="number"
            name="order"
            value={lessonData.order}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-green-700">Replace Audio Example</label>
          {lessonData.audioExampleUrl && (
            <audio
              controls
              className="mt-2 w-full"
              src={`${BACKEND_BASE}${lessonData.audioExampleUrl}`}
            />
          )}
          <input
            type="file"
            name="audioFile"
            accept="audio/*"
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
