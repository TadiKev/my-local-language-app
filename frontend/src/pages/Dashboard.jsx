// frontend/src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SubmissionCard from '../components/SubmissionCard';
import api from '../services/api';

const BACKEND_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1) Get current user’s profile (redirect to /login on 401/403)
        const profileRes = await api.get('/users/profile');
        setUser(profileRes.data);

        // 2) Fetch all lessons
        const lessonsRes = await api.get('/lessons');
        const lessonsData = lessonsRes.data.lessons || lessonsRes.data;
        setLessons(lessonsData);

        // 3) Fetch the 5 most recent audio submissions
        const subsRes = await api.get('/voice/submissions?limit=5');
        setSubmissions(subsRes.data);
      } catch (err) {
        // If any call fails (e.g. 401/403), redirect to login
        navigate('/login');
      }
    };
    loadData();
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-200">
        <p className="text-green-700">Loading dashboard…</p>
      </div>
    );
  }

  // Admin‐only: delete a lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this entire lesson?')) {
      return;
    }
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
    } catch (err) {
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Admin‐only: delete only the audioExample
  const handleDeleteLessonAudio = async (lessonId) => {
    if (!window.confirm('Are you sure you want to remove the audio example for this lesson?')) {
      return;
    }
    try {
      await api.delete(`/lessons/${lessonId}/audio`);
      // Update local lessons state: clear audioExampleUrl for that lesson
      setLessons((prev) =>
        prev.map((l) =>
          l._id === lessonId ? { ...l, audioExampleUrl: '' } : l
        )
      );
    } catch (err) {
      alert(`Delete audio failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete a single audio submission (owner or admin)
  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    try {
      await api.delete(`/voice/submissions/${submissionId}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== submissionId));
    } catch (err) {
      alert(`Delete submission failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Pick “Next Lesson” as the first lesson not yet attempted
  const attemptedIds = new Set(submissions.map((s) => s.lesson?._id));
  const nextLesson = lessons.find((l) => !attemptedIds.has(l._id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-green-800">
          Welcome, {user.name}!
        </h1>

        {/* Next Lesson */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-green-900">
            Next Lesson
          </h2>
          {nextLesson ? (
            <div className="flex items-center space-x-4">
              <p className="text-gray-700">{nextLesson.title}</p>
              <Link to={`/lessons/${nextLesson._id}`}>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  Start
                </button>
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">All lessons completed! 🎉</p>
          )}
        </div>

        {/* Your Lessons */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-900">
            Your Lessons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="p-4 border border-green-200 rounded-lg hover:shadow-md transition flex flex-col justify-between"
              >
                <h3 className="text-lg font-medium mb-2 text-green-800">
                  {lesson.title}
                </h3>

                {/* Show a mini audio preview if one exists */}
                {lesson.audioExampleUrl && (
                  <audio
                    controls
                    className="w-full mb-2"
                    src={`${BACKEND_BASE}${lesson.audioExampleUrl}`}
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}

                <div className="mt-auto flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  {/* Open Lesson */}
                  <Link to={`/lessons/${lesson._id}`}>
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm">
                      Open
                    </button>
                  </Link>

                  {/* Edit & Delete (admin only) */}
                  {user.role === 'admin' && (
                    <>
                      <Link to={`/lessons/edit/${lesson._id}`}>
                        <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete Lesson
                      </button>

                      {/* Delete Audio only if there's an audioExampleUrl */}
                      {lesson.audioExampleUrl && (
                        <button
                          onClick={() => handleDeleteLessonAudio(lesson._id)}
                          className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 transition text-sm"
                        >
                          Delete Audio
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-900">
            Recent Submissions
          </h2>
          {submissions.length === 0 ? (
            <p className="text-gray-500">You have no submissions yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((sub) => {
                // Determine if current user can delete: either owner or admin
                const canCurrentUserDelete =
                  sub.user.toString() === user._id.toString() ||
                  user.role === 'admin';

                return (
                  <SubmissionCard
                    key={sub._id}
                    sub={sub}
                    backendBase={BACKEND_BASE}
                    onDelete={handleDeleteSubmission}
                    canDelete={canCurrentUserDelete}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="flex justify-between items-center text-sm text-gray-600 pt-6 border-t border-green-200">
          <Link to="/lessons" className="hover:underline text-green-700">
            Browse All Lessons
          </Link>
          <Link to="/profile" className="hover:underline text-green-700">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
