import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { videoAPI } from '../utils/api';

const VideoSelector = ({ onVideoSelect, selectedVideoId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideoList();
      console.log('VideoSelector: API response:', response);

      // Extract videos array from response
      const videoList = response.videos || [];
      setVideos(videoList);

      // Auto-select first video if none selected
      if (videoList.length > 0 && !selectedVideoId) {
        console.log('VideoSelector: Auto-selecting first video:', videoList[0].video_id);
        onVideoSelect(videoList[0].video_id);
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error('VideoSelector: Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (videoId) => {
    onVideoSelect(videoId);
    setIsOpen(false);
  };

  const selectedVideo = videos.find(v => v.video_id === selectedVideoId);

  if (loading) {
    return (
      <div className="glass-panel p-4 animate-pulse">
        <div className="h-10 bg-slate/30 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-4 border-fire-red">
        <p className="text-fire-red">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel p-4 w-full text-left flex items-center justify-between
                   hover:border-fire-red transition-all duration-300 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex-1">
          <p className="text-dim-gray text-sm mb-1">Selected Video</p>
          <p className="text-white font-medium group-hover:text-fire-red transition-colors">
            {selectedVideo ? selectedVideo.video_id : 'Select a video...'}
          </p>
          {selectedVideo && (
            <p className="text-dim-gray text-xs mt-1">
              {selectedVideo.tracks_count} persons detected
            </p>
          )}
        </div>
        <motion.svg
          className="w-5 h-5 text-fire-red"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 glass-panel border-fire-red z-20
                       max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {videos.length === 0 ? (
              <div className="p-4 text-dim-gray text-center">
                No analyzed videos found
              </div>
            ) : (
              <div className="divide-y divide-slate/30">
                {videos.map((video) => (
                  <motion.button
                    key={video.video_id}
                    onClick={() => handleSelect(video.video_id)}
                    className={`w-full p-4 text-left hover:bg-fire-red/10 transition-colors
                               ${video.video_id === selectedVideoId ? 'bg-fire-red/20' : ''}`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${
                          video.video_id === selectedVideoId ? 'text-fire-red' : 'text-white'
                        }`}>
                          {video.video_id}
                        </p>
                        <div className="flex gap-4 mt-1 text-xs text-dim-gray">
                          <span>{video.tracks_count} persons</span>
                          {video.engagement_rate !== undefined && (
                            <span>{video.engagement_rate.toFixed(1)}% engagement</span>
                          )}
                        </div>
                      </div>
                      {video.video_id === selectedVideoId && (
                        <svg className="w-5 h-5 text-fire-red" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default VideoSelector;
