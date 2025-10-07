import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoAPI } from './utils/api';
import VideoSelector from './components/VideoSelector';
import MetricsPanel from './components/MetricsPanel';
import VideoPlayer from './components/VideoPlayer';
import WordCloudViz from './components/WordCloudViz';
import DemographicCharts from './components/DemographicCharts';
import VideoTimeline from './components/VideoTimeline';
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
              className="flex items-center gap-4"
            >
              {/* Lighthouse Logo */}
              <img
                src="/assets/lighthouse-logo.png"
                alt="Lighthouse Audience"
                className="h-12 w-auto brightness-110 contrast-125"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.3))' }}
              />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  LIGHTHOUSE AUDIENCE
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-dim-gray">by</span>
                  <div className="bg-white rounded-md px-3 py-1.5">
                    <img
                      src="/assets/orbital-lab-logo.svg"
                      alt="Orbital Lab"
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
              </div>
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
              {/* Metrics Panel */}
              <MetricsPanel stats={stats} />

              {/* Word Cloud (Video Player disabled to improve stability) */}
              <div className="w-full">
                <WordCloudViz
                  videoId={selectedVideo}
                />
              </div>

              {/* Charts Section */}
              <DemographicCharts stats={stats} />

              {/* Video Timeline with Scatter Plot */}
              <VideoTimeline
                videoId={selectedVideo}
                metadata={metadata}
              />

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
      <footer className="border-t border-slate/30 mt-20 py-8 bg-charcoal/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded px-3 py-2">
                <img
                  src="/assets/orbital-lab-logo.svg"
                  alt="Orbital Lab"
                  className="h-12 w-auto"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Orbital Lab</p>
                <p className="text-dim-gray text-xs">Audience Intelligence Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right text-dim-gray text-sm">
              <p className="font-medium">Lighthouse Audience v1.0</p>
              <p className="text-xs mt-1">RF-DETR + ByteTrack + L2CS-Net + Gemini 2.5 Flash</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
