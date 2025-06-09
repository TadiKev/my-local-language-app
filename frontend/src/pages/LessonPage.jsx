// src/pages/LessonPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LessonCard from '../components/LessonCard';

const LessonPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get('/lessons');
        // Expect response.data to be something like { lessons: [ { _id, title, description, ... }, ... ], ... }
        setLessons(response.data.lessons || response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-green-700">Loading lessons…</p>
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

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">Explore Lessons</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson._id}
            title={lesson.title}
            description={lesson.description}
            onClick={() => navigate(`/lessons/${lesson._id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonPage;
