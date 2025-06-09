// frontend/src/pages/UploadLesson.jsx

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function UploadLesson() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [content, setContent] = useState('');
  const [expectedText, setExpectedText] = useState('');
  const [order, setOrder] = useState(0);
  const [audioFile, setAudioFile] = useState(null);

  // Basic check: if not admin, redirect away
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-200">
        <p className="text-red-600">You do not have permission to upload lessons.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !languageCode) {
      alert('Title and language code are required.');
      return;
    }

    // Build FormData
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
      const res = await api.post('/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Lesson created successfully!');
      navigate(`/lessons/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert(`Failed to create lesson: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-green-100 overflow-hidden">
      {/* Bubble animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0.7; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
          100% { transform: translateY(0) translateX(0); opacity: 0.7; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute bg-green-200 opacity-60 rounded-full w-32 h-32 top-10 left-10 animate-float"></div>
        <div className="absolute bg-green-200 opacity-50 rounded-full w-24 h-24 top-32 left-1/4 animate-float"></div>
        <div className="absolute bg-green-200 opacity-40 rounded-full w-40 h-40 top-1/2 left-3/4 animate-float" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bg-green-200 opacity-50 rounded-full w-28 h-28 top-3/4 left-1/2 animate-float" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bg-green-200 opacity-60 rounded-full w-20 h-20 top-20 left-3/5 animate-float" style={{ animationDuration: '5s' }}></div>
      </div>

      {/* Form */}
      <div className="relative z-10 flex justify-center py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg space-y-6"
        >
          <h2 className="text-2xl font-bold text-green-800 mb-4">Upload New Lesson</h2>

          <div>
            <label className="block text-green-700">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-green-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-green-700">Language Code *</label>
            <select
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-green-700">Expected Phrase</label>
            <input
              type="text"
              value={expectedText}
              onChange={(e) => setExpectedText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-green-700">Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-green-700">Audio Example (optional)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Create Lesson
          </button>
        </form>
      </div>
    </div>
  );
}
