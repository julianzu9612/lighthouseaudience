import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import WordCloud from 'react-d3-cloud';
import { videoAPI } from '../utils/api';

const WordCloudViz = ({ videoId }) => {
  const [wordData, setWordData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 480 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      loadWordCloud();
    }
  }, [videoId]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width - 32, // Subtract padding
          height: 480
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const loadWordCloud = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await videoAPI.getWordCloud(videoId, {
        min_length: 4,
        top_n: 50,
      });

      // Transform API data to react-wordcloud format
      const words = (data.words || data.keywords || []).map(item => ({
        text: item.text,
        value: item.value,
      }));

      setWordData(words);
    } catch (err) {
      setError('Failed to load word cloud data');
      console.error('Error loading word cloud:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom color function: red (high frequency) -> gray (low frequency)
  const fontSizeMapper = (word) => Math.log2(word.value + 1) * 10;

  const fill = (word) => {
    if (wordData.length === 0) return '#666666';

    const maxFreq = Math.max(...wordData.map(w => w.value));
    const minFreq = Math.min(...wordData.map(w => w.value));
    const range = maxFreq - minFreq;
    const normalized = range > 0 ? (word.value - minFreq) / range : 0.5;

    // Interpolate between fire-red (#FF0000) and dim-gray (#666666)
    const red = Math.round(255 * normalized + 102 * (1 - normalized));
    const green = Math.round(0 * normalized + 102 * (1 - normalized));
    const blue = Math.round(0 * normalized + 102 * (1 - normalized));

    return `rgb(${red}, ${green}, ${blue})`;
  };

  const onWordClick = (word) => {
    setSelectedWord(word);
  };

  if (loading) {
    return (
      <motion.div
        className="glass-panel p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center justify-center h-96">
          <motion.div
            className="w-16 h-16 border-4 border-fire-red border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-dim-gray mt-4">Generating word cloud...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="glass-panel p-8 border-fire-red"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 text-fire-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-fire-red">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (wordData.length === 0) {
    return (
      <motion.div
        className="glass-panel p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center text-dim-gray">
          <p>No demographic keywords available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-panel p-8 hover:border-fire-red transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Demographic Keywords</h3>
          <p className="text-dim-gray text-sm mt-1">
            {wordData.length} unique descriptors from profile analysis
          </p>
        </div>
        {selectedWord && (
          <motion.div
            className="glass-panel p-3 border-fire-red"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-fire-red font-bold text-lg">{selectedWord.text}</p>
            <p className="text-dim-gray text-sm">{selectedWord.value} occurrences</p>
          </motion.div>
        )}
      </div>

      <div ref={containerRef} className="bg-pitch-black/30 rounded-lg p-4 overflow-hidden" style={{ height: '500px' }}>
        <WordCloud
          data={wordData}
          width={dimensions.width}
          height={dimensions.height}
          font="system-ui, -apple-system, sans-serif"
          fontWeight="bold"
          fontSize={fontSizeMapper}
          spiral="archimedean"
          rotate={0}
          padding={4}
          random={Math.random}
          fill={fill}
          onWordClick={onWordClick}
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-fire-red rounded"></div>
          <span className="text-dim-gray">High Frequency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-dim-gray rounded"></div>
          <span className="text-dim-gray">Low Frequency</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WordCloudViz;
