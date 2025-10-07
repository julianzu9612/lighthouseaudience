import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { videoAPI } from '../utils/api';

const VideoPlayer = ({ videoId, metadata }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredPerson, setHoveredPerson] = useState(null);

  const videoUrl = videoAPI.getVideoStreamUrl(videoId);
  const tracks = metadata?.tracks || [];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    video.currentTime = percentage * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get persons active at current time
  const getActivePersons = (time) => {
    return tracks.filter(track => {
      if (!track.frames || track.frames.length === 0) return false;
      const firstFrame = track.frames[0].frame_id / 30; // Assuming 30 FPS
      const lastFrame = track.frames[track.frames.length - 1].frame_id / 30;
      return time >= firstFrame && time <= lastFrame;
    });
  };

  const activePersons = getActivePersons(currentTime);

  return (
    <motion.div
      className="glass-panel overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Video Container */}
      <div className="relative bg-pitch-black group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain"
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-pitch-black/50
                     opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={togglePlay}
        >
          <motion.button
            className="w-20 h-20 flex items-center justify-center bg-fire-red/80
                     rounded-full text-white hover:bg-fire-red transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
        </motion.div>

        {/* Active Persons Indicator */}
        {activePersons.length > 0 && (
          <motion.div
            className="absolute top-4 right-4 glass-panel px-3 py-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-white text-sm">
              {activePersons.length} person{activePersons.length !== 1 ? 's' : ''} in view
            </p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        {/* Timeline */}
        <div
          className="relative w-full h-2 bg-charcoal rounded-full cursor-pointer group/timeline"
          onClick={handleSeek}
        >
          {/* Progress */}
          <div
            className="absolute h-full bg-gradient-to-r from-fire-red to-crimson rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Hover indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-fire-red rounded-full
                       opacity-0 group-hover/timeline:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-8px' }}
          />

          {/* Person markers on timeline */}
          {tracks.map(track => {
            if (!track.frames || track.frames.length === 0) return null;
            const startTime = track.frames[0].frame_id / 30;
            const position = (startTime / duration) * 100;
            const isLooking = track.is_looking_at_camera;

            return (
              <motion.div
                key={track.track_id}
                className={`absolute top-1/2 -translate-y-1/2 w-1 h-4 rounded-full cursor-pointer
                           ${isLooking ? 'bg-fire-red' : 'bg-dim-gray'}`}
                style={{ left: `${position}%` }}
                whileHover={{ scale: 1.5, height: '24px' }}
                onHoverStart={() => setHoveredPerson(track)}
                onHoverEnd={() => setHoveredPerson(null)}
                title={`Track ${track.track_id} - ${isLooking ? 'Looked' : 'Missed'}`}
              />
            );
          })}
        </div>

        {/* Hovered Person Info */}
        {hoveredPerson && (
          <motion.div
            className="glass-panel p-3 border-fire-red"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <img
                src={videoAPI.getCropUrl(videoId, hoveredPerson.track_id, { size: '50,75' })}
                alt={`Track ${hoveredPerson.track_id}`}
                className="w-12 h-18 object-cover rounded"
              />
              <div className="flex-1 text-sm">
                <p className="text-white font-bold">Track #{hoveredPerson.track_id}</p>
                <p className="text-dim-gray">
                  {hoveredPerson.demographic_analysis?.gender || 'unknown'} • {' '}
                  {hoveredPerson.demographic_analysis?.age_range?.min_age || '?'}-
                  {hoveredPerson.demographic_analysis?.age_range?.max_age || '?'} yrs
                </p>
                <p className={`text-xs font-bold ${
                  hoveredPerson.is_looking_at_camera ? 'text-fire-red' : 'text-dim-gray'
                }`}>
                  {hoveredPerson.is_looking_at_camera ? 'LOOKED' : 'MISSED'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <motion.button
              onClick={togglePlay}
              className="text-white hover:text-fire-red transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.button>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleMute}
              className="text-white hover:text-fire-red transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </motion.button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-fire-red"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
