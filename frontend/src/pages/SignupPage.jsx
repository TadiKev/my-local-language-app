// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, preferredLanguage });
      // Upon successful registration, redirect to "/lessons"
      navigate('/lessons');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
          Sign Up
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="shona">Shona</option>
          <option value="ndebele">Ndebele</option>
          <option value="kalanga">Kalanga</option>
          <option value="venda">Venda</option>
          <option value="sotho-tonga">Sotho/Tonga</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
          } text-white py-2 rounded-lg transition`}
        >
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>

        <p className="text-center text-green-700 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
