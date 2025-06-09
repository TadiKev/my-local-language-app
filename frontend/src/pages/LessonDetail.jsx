// frontend/src/pages/LessonDetail.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; 
import VoiceButton from '../components/VoiceButton';

const TextReader = ({ text, lang = 'en-US', label = 'Listen' }) => {
  const handleRead = () => {
    if (!window.speechSynthesis) {
      alert('Speech Synthesis not supported in this browser.');
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    window.speechSynthesis.speak(utt);
  };

  return (
    <button
      onClick={handleRead}
      className="ml-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
      aria-label={label}
    >
      🔊 {label}
    </button>
  );
};

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState(null);

  // ① Fetch lesson metadata
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get(`/lessons/${lessonId}`);
        setLesson(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // ② Fetch this lesson’s previous submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get(`/voice/submissions?lessonId=${lessonId}`);
        setSubmissions(res.data);
      } catch (err) {
        setSubError(err.response?.data?.message || err.message);
      } finally {
        setSubLoading(false);
      }
    };
    fetchSubmissions();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
  if (!lesson) {
    return (
      <div className="p-6">
        <p className="text-red-600">Lesson not found</p>
      </div>
    );
  }

  // Map our backend’s lesson.languageCode → BCP‑47 TTS code
  const langCodeMap = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    shona: 'sn-ZW',
    ndebele: 'nd-ZW',
    kalanga: 'kg',
    venda: 've-ZA',
    'sotho-tonga': 'st-ZA'
  };
  const ttsLang = langCodeMap[lesson.languageCode] || 'en-US';

  // Handle microphone + transcription result
  const handleVoiceResult = async (transcript, blob) => {
    if (!blob) {
      console.warn('No audio blob recorded');
      return;
    }
    const formData = new FormData();
    formData.append('lessonId', lessonId);
    formData.append('audio', blob, 'submission.webm');
    formData.append('transcript', transcript);

    try {
      const res = await api.post('/voice/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Score: ${res.data.score}\nFeedback: ${res.data.feedback}`);

      // Refresh the “previous attempts” list
      setSubLoading(true);
      const updated = await api.get(`/voice/submissions?lessonId=${lessonId}`);
      setSubmissions(updated.data);
      setSubLoading(false);
    } catch (err) {
      alert(`Submission failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen space-y-8">
      {/* Lesson Title + “Listen” buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h2 className="text-3xl font-bold text-green-900">{lesson.title}</h2>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <TextReader text={lesson.title} lang={ttsLang} label="Listen Title" />
            <TextReader text={lesson.content} lang={ttsLang} label="Listen Content" />
          </div>
        </div>
        {lesson.description && (
          <p className="mt-3 text-green-700">{lesson.description}</p>
        )}
      </div>

      {/* Expected Phrase */}
      {lesson.expectedText && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-green-800 font-semibold inline-block mr-2">
            Speak this phrase:
          </p>
          <span className="text-green-700 italic">{lesson.expectedText}</span>
          <TextReader
            text={lesson.expectedText}
            lang={ttsLang}
            label="Listen Phrase"
          />
        </div>
      )}

      {/* Full Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-green-900 mb-3">Content</h3>
        <div className="prose prose-green max-w-none text-green-700 whitespace-pre-line">
          {lesson.content}
        </div>
      </div>

      {/* Audio Example from the lesson (if provided) */}
      {lesson.audioExampleUrl && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-green-900 mb-3">
            Audio Example
          </h3>
          <audio controls className="w-full">
            <source src={lesson.audioExampleUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Practice Speaking */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-green-900 mb-3">
          Practice Speaking
        </h3>
        <VoiceButton onResult={handleVoiceResult} />
      </div>

      {/* Previous Attempts (so you can play back saved recordings) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-green-900 mb-3">
          Your Previous Attempts
        </h3>
        {subLoading ? (
          <p className="text-green-700">Loading your submissions…</p>
        ) : subError ? (
          <p className="text-red-600">Error: {subError}</p>
        ) : submissions.length === 0 ? (
          <p className="text-green-700">You have not submitted any audio yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6"
              >
                <div className="flex-shrink-0">
                  {/* 
                    The “src” here must exactly match what the server served. 
                    If sub.audioUrl === "/uploads/1748934692996-submission.webm", 
                    then this <audio> will fetch “http://localhost:5000/uploads/1748934692996-submission.webm”.
                  */}
                  <audio
                    controls
                    className="w-60"
                    src={`http://localhost:5000${sub.audioUrl}`}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-800">
                    {sub.lesson?.title || 'Lesson'}
                  </h4>
                  <p className="text-gray-500 text-sm mb-1">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Score: <span className="font-medium">{sub.score}%</span> | Feedback:{' '}
                    {sub.feedback || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
