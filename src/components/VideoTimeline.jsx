import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { videoAPI } from '../utils/api';

const VideoTimeline = ({ videoId, metadata }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      loadTimelineData();
    }
  }, [videoId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoAPI.getTimelinePersons(videoId);
      setTimelineData(response.persons || []);
    } catch (err) {
      setError('Failed to load timeline data');
      console.error('Error loading timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for scatter plot
  const scatterData = timelineData.map((person, index) => ({
    x: person.timestamp,
    y: index + 1, // Sequential Y position
    trackId: person.track_id,
    isLooking: person.is_looking_at_camera,
    demographic: person.demographic_analysis,
    frameId: person.frame_id,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const demo = data.demographic || {};
      const ageRange = demo.age_range || {};
      const ageDisplay = ageRange.min_age && ageRange.max_age
        ? `${ageRange.min_age}-${ageRange.max_age} yrs`
        : 'N/A';

      // Get crop URL for this person
      const cropParams = { size: '80,120' }; // Small crop for tooltip
      if (data.isLooking && data.frameId) {
        cropParams.frameId = data.frameId;
      }
      const cropUrl = videoAPI.getCropUrl(videoId, data.trackId, cropParams);

      return (
        <div className="glass-panel p-3 border-fire-red max-w-xs">
          <div className="flex gap-3">
            {/* Crop Image */}
            <div className="flex-shrink-0">
              <img
                src={cropUrl}
                alt={`Track ${data.trackId}`}
                className="w-20 h-30 object-cover rounded border border-slate/30"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-bold text-sm">Track #{data.trackId}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${data.isLooking ? 'bg-fire-red text-white' : 'bg-dim-gray text-white'}`}>
                  {data.isLooking ? 'LOOKED' : 'MISSED'}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-dim-gray">Time:</span>
                  <span className="text-white">{data.x.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Age:</span>
                  <span className="text-white">{ageDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Gender:</span>
                  <span className="text-white capitalize">{demo.gender || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
          {demo.demographic_profile && (
            <div className="mt-2 pt-2 border-t border-slate/30">
              <p className="text-dim-gray text-xs line-clamp-2">
                {demo.demographic_profile}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = () => (
    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-fire-red rounded-full"></div>
        <span className="text-dim-gray">Looked at camera ({scatterData.filter(d => d.isLooking).length})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-dim-gray rounded-full"></div>
        <span className="text-dim-gray">Missed ({scatterData.filter(d => !d.isLooking).length})</span>
      </div>
    </div>
  );

  const videoStreamUrl = videoAPI.getVideoStreamUrl(videoId, true);

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
          <p className="text-dim-gray mt-4">Loading timeline...</p>
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
          <p className="text-fire-red">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-panel p-6 hover:border-fire-red transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-bold text-white mb-2">Video Timeline</h3>
      <p className="text-dim-gray text-sm mb-6">
        {scatterData.length} persons detected over time • Each dot represents first appearance
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="glass-panel p-4">
          <h4 className="text-white font-bold mb-4">Person Appearances</h4>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                type="number"
                dataKey="x"
                name="Time"
                unit="s"
                stroke="#666"
                label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10, fill: '#999' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Person #"
                stroke="#666"
                label={{ value: 'Person Count', angle: -90, position: 'insideLeft', fill: '#999' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} shape="circle">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isLooking ? '#FF0000' : '#666666'}
                    r={6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <CustomLegend />
        </div>

        {/* Video Player */}
        <div className="glass-panel p-4">
          <h4 className="text-white font-bold mb-4">Annotated Video</h4>
          <div className="bg-pitch-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full"
              controls
              preload="metadata"
              style={{ maxHeight: '480px' }}
            >
              <source src={videoStreamUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-dim-gray text-xs mt-2">
            ⚠️ Video shows tracking boxes and person IDs
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoTimeline;
