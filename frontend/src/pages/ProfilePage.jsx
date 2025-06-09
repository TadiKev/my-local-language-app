// src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

const BACKEND_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);        
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const fetchAll = async () => {
      try {
        // 1️⃣ Fetch profile
        const profileRes = await fetch(
          `${BACKEND_BASE}/api/users/profile`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        if (!profileRes.ok) throw new Error('Failed to load profile');
        const userData = await profileRes.json();
        setUser(userData);
        setName(userData.name);
        setPreferredLanguage(userData.preferredLanguage || '');

        // 2️⃣ Fetch all lessons
        const lessonsRes = await fetch(`${BACKEND_BASE}/api/lessons`);
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData.lessons || lessonsData);

        // 3️⃣ Fetch progress using the actual user ID
        const progRes = await fetch(
          `${BACKEND_BASE}/api/progress?userId=${userData._id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        if (!progRes.ok) throw new Error('Failed to load progress');
        const progressData = await progRes.json();
        setProgress(Array.isArray(progressData) ? progressData : []);

      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-green-700">Loading profile…</p>
      </div>
    );
  }

  // Compute progress bar values
  const totalLessons = lessons.length;
  const completedCount = progress.filter((p) => p.completed).length;
  const percentComplete = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `${BACKEND_BASE}/api/users/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ name, preferredLanguage }),
        }
      );
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      setUser((u) => ({ ...u, ...updated }));
      setSuccess('Profile updated.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-800">My Profile</h1>

        {error && (
          <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>
        )}

        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-green-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-green-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                value={user.email}
                readOnly
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-green-700 mb-1">
                Preferred Language
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                required
              >
                <option value="">Select a language</option>
                <option value="en">English</option>
                <option value="sn">Shona</option>
                <option value="nd">Ndebele</option>
                {/* add more */}
              </select>
            </div>

            {/* Save button & messages */}
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-5 py-2 rounded-lg text-white ${
                  saving
                    ? 'bg-green-400'
                    : 'bg-green-600 hover:bg-green-700'
                } transition`}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {success && (
                <span className="text-green-700 font-medium">{success}</span>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            Your Progress
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="text-green-800 text-sm">
            {completedCount} of {totalLessons} lessons completed ({percentComplete}
            %)
          </p>
        </Card>
      </div>
    </div>
  );
}
