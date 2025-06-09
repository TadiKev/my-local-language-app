// frontend/src/components/SubmissionCard.jsx

import { useRef, useState, useEffect } from 'react';

export default function SubmissionCard({
  sub,
  backendBase,
  onDelete,     // ← new prop: parent can pass a delete handler
  canDelete     // ← new prop: boolean (true if current user may delete this submission)
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Log the full URL on mount, so you can confirm it's correct
  useEffect(() => {
    const fullSrc = `${backendBase}${sub.audioUrl}`;
    console.log('[SubmissionCard] audio URL:', fullSrc);
  }, [backendBase, sub.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      console.log('[SubmissionCard] audio ended');
      setPlaying(false);
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  const togglePlay = () => {
    console.log('[SubmissionCard] togglePlay clicked, playing=', playing);
    const audio = audioRef.current;
    if (!audio) {
      console.warn('[SubmissionCard] audioRef is null');
      return;
    }
    if (playing) {
      console.log('[SubmissionCard] pausing audio');
      audio.pause();
      setPlaying(false);
    } else {
      console.log('[SubmissionCard] attempting to play audio');
      audio
        .play()
        .then(() => {
          console.log('[SubmissionCard] audio.play() succeeded');
          setPlaying(true);
        })
        .catch((err) => {
          console.error('[SubmissionCard] audio.play() failed:', err);
          setPlaying(false);
        });
    }
  };

  // Construct the full <audio> src
  const fullSrc = `${backendBase}${sub.audioUrl}`;

  // Handler when “Delete” is clicked
  const handleDeleteClick = () => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    if (onDelete) {
      onDelete(sub._id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
      <div className="flex-shrink-0 flex items-center space-x-2">
        <button
          onClick={togglePlay}
          className="p-3 bg-green-100 rounded-full hover:bg-green-200 transition"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <span>⏸️</span> : <span>▶️</span>}
        </button>
        <audio
          ref={audioRef}
          src={fullSrc}
          className="hidden"
          preload="metadata"
        />
        {canDelete && (
          <button
            onClick={handleDeleteClick}
            className="ml-2 text-red-600 hover:text-red-800 transition text-sm"
            aria-label="Delete Submission"
          >
            🗑️
          </button>
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-green-800">
          {sub.lesson?.title || 'Lesson'}
        </h4>
        <p className="text-gray-500 text-sm mb-1">
          {new Date(sub.submittedAt).toLocaleString()}
        </p>
        <p className="text-gray-700 text-sm mb-0">
          Score: <span className="font-medium">{sub.score}%</span> | Feedback:{' '}
          {sub.feedback || '—'}
        </p>
      </div>
    </div>
  );
}
