// src/components/VoiceButton.jsx

import { useState, useEffect, useRef } from 'react';

const VoiceButton = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptRef = useRef('');

  useEffect(() => {
    // 1. Set up SpeechRecognition (browser compatibility)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; 

    recognition.onstart = () => {
      setListening(true);
      transcriptRef.current = '';
    };

    recognition.onresult = (event) => {
      // Capture the final transcript
      transcriptRef.current = event.results[0][0].transcript;
    };

    recognition.onend = () => {
      setListening(false);
      // When speech recognition ends, stop the MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };

    recognitionRef.current = recognition;

    // 2. Set up MediaRecorder to capture microphone
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          // Assemble the Blob once recording stops
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          // Pass transcript + blob back to parent
          onResult(transcriptRef.current, blob);
        };
        mediaRecorderRef.current = mediaRecorder;
      })
      .catch((err) => console.error('Microphone access error:', err));
  }, [onResult]);

  const handleClick = () => {
    if (!recognitionRef.current || !mediaRecorderRef.current) return;

    if (listening) {
      // If already listening, stop both
      recognitionRef.current.stop();
      // mediaRecorder will be stopped in recognition.onend
    } else {
      // Start fresh
      chunksRef.current = [];
      transcriptRef.current = '';
      mediaRecorderRef.current.start();
      recognitionRef.current.start();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center px-4 py-2 rounded-full border ${
        listening
          ? 'bg-red-100 border-red-400 text-red-600'
          : 'bg-green-100 border-green-400 text-green-700'
      } hover:opacity-90 transition`}
      aria-pressed={listening}
    >
      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        {listening ? (
          <path d="M10 2a2 2 0 00-2 2v4a2 2 0 104 0V4a2 2 0 00-2-2zM6 8a4 4 0 008 0h2a6 6 0 01-5 5.91V18h-2v-4.09A6 6 0 014 8h2z" />
        ) : (
          <path d="M14 10a4 4 0 01-8 0H4a6 6 0 005 5.91V18h2v-2.09A6 6 0 0016 10h-2zm-6-4a2 2 0 014 0v4a2 2 0 11-4 0V6z" />
        )}
      </svg>
      {listening ? 'Listening...' : 'Speak'}
    </button>
  );
};

export default VoiceButton;
