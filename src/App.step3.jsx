import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoAPI } from './utils/api';
import VideoSelector from './components/VideoSelector';
import MetricsPanel from './components/MetricsPanel';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedVideo) {
      loadVideoData(selectedVideo);
    }
  }, [selectedVideo]);

  const loadVideoData = async (videoId) => {
    console.log('Loading data for video:', videoId);
    setLoading(true);
    setError(null);

    try {
      // Load metadata and stats in parallel
      const [metadataRes, statsRes] = await Promise.all([
        videoAPI.getMetadata(videoId),
        videoAPI.getStats(videoId),
      ]);

      console.log('Metadata response:', metadataRes);
      console.log('Stats response:', statsRes);

      setMetadata(metadataRes.metadata);
      setStats(statsRes.stats);
    } catch (err) {
      setError(err.message || 'Failed to load video data');
      console.error('Error loading video data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-black text-white">
      {/* Header */}
      <header className="border-b border-slate/30 bg-gradient-to-r from-charcoal to-pitch-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <svg className="w-8 h-8 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-fire-red to-crimson bg-clip-text text-transparent">
                Video Analytics Dashboard
              </h1>
            </motion.div>

            <div className="w-96">
              <VideoSelector
                onVideoSelect={setSelectedVideo}
                selectedVideoId={selectedVideo}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-fire-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-dim-gray text-lg">Loading video data...</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 border-fire-red"
            >
              <p className="text-fire-red">Error: {error}</p>
            </motion.div>
          )}

          {!loading && !error && !selectedVideo && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="glass-panel p-8 inline-block">
                <h2 className="text-2xl font-bold text-fire-red mb-2">
                  Step 3: Testing MetricsPanel
                </h2>
                <p className="text-dim-gray">
                  Select a video to see the metrics panel
                </p>
              </div>
            </motion.div>
          )}

          {!loading && !error && selectedVideo && stats && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass-panel p-4 mb-4">
                <p className="text-fire-red font-bold">✓ Step 3: MetricsPanel Component</p>
                <p className="text-dim-gray text-sm">Stats loaded successfully</p>
              </div>

              {/* Metrics Panel */}
              <MetricsPanel stats={stats} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
