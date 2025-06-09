// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import LessonDetail from './pages/LessonDetail';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import UploadLesson from './pages/UploadLesson';
import EditLesson from './pages/EditLesson'; // ← Import here

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons" element={<LessonPage />} />
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />

          {/* New edit route: */}
          <Route path="/lessons/edit/:lessonId" element={<EditLesson />} />

          <Route path="/upload-lesson" element={<UploadLesson />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
