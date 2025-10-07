import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoAPI } from './utils/api';
import VideoSelector from './components/VideoSelector';
import MetricsPanel from './components/MetricsPanel';
import VideoPlayer from './components/VideoPlayer';
import WordCloudViz from './components/WordCloudViz';
import DemographicCharts from './components/DemographicCharts';
import PersonGallery from './components/PersonGallery';

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
      const [metadataRes, statsRes] = await Promise.all([
        videoAPI.getMetadata(videoId),
        videoAPI.getStats(videoId),
      ]);

      console.log('=== API RESPONSES ===');
      console.log('Metadata response:', metadataRes);
      console.log('Stats response:', statsRes);
      console.log('Stats object:', statsRes.stats);
      console.log('Metadata tracks count:', metadataRes.metadata?.tracks?.length);

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

          {!loading && !error && selectedVideo && metadata && stats && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass-panel p-4 mb-4">
                <p className="text-fire-red font-bold">✓ Step 5: ALL COMPONENTS LOADED</p>
                <p className="text-dim-gray text-sm">Now we need to fix the data structure</p>
              </div>

              {/* Metrics Panel */}
              <MetricsPanel stats={stats} />

              {/* Video Player and Word Cloud */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VideoPlayer
                  videoId={selectedVideo}
                  metadata={metadata}
                />
                <WordCloudViz
                  videoId={selectedVideo}
                />
              </div>

              {/* Charts Section */}
              <DemographicCharts stats={stats} />

              {/* Person Gallery */}
              <PersonGallery
                videoId={selectedVideo}
                metadata={metadata}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate/30 mt-20 py-6 bg-charcoal/30">
        <div className="container mx-auto px-6 text-center text-dim-gray">
          <p>RF-DETR Video Analytics Pipeline • Dashboard v1.0</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
