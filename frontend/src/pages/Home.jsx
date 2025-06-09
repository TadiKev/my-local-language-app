// src/pages/Home.jsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6 text-center">Welcome to Local Language Learner</h1>
      <p className="text-lg md:text-xl text-green-800 text-center mb-10 px-4 md:px-0">
        Learn your local language through interactive, engaging, and culturally rich lessons.
      </p>
      <div className="flex gap-6">
        <Link to="/signup" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Get Started</Link>
        <Link to="/login" className="px-6 py-3 border border-green-600 text-green-800 rounded-lg hover:bg-green-100 transition">Login</Link>
      </div>
    </div>
  );
};

export default Home;
