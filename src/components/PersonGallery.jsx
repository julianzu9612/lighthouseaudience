import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoAPI } from '../utils/api';

const PersonCard = ({ person, videoId, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLooking = person.is_looking_at_camera;

  // Use best_looking_frame if person is looking at camera, otherwise use default frame
  const cropParams = { size: '150,225' }; // Smaller size: 150x225 instead of 200x300
  if (isLooking && person.best_looking_frame) {
    cropParams.frameId = person.best_looking_frame;
  }
  const cropUrl = videoAPI.getCropUrl(videoId, person.track_id, cropParams);

  // Demographic info
  const demo = person.demographic_analysis || {};
  const gender = demo.gender || 'unknown';
  const ageRange = demo.age_range || {};
  const ageDisplay = ageRange.min_age && ageRange.max_age
    ? `${ageRange.min_age}-${ageRange.max_age} yrs`
    : 'Age N/A';

  return (
    <motion.div
      className={`glass-panel overflow-hidden hover:scale-105 transition-all duration-300 group
                  ${isLooking ? 'border-fire-red' : 'border-slate'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] bg-charcoal">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-8 h-8 border-2 border-fire-red border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-dim-gray">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        ) : (
          <img
            src={cropUrl}
            alt={`Person ${person.track_id}`}
            className={`w-full h-full object-cover transition-opacity duration-300
                       ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <motion.div
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                       ${isLooking ? 'bg-fire-red text-white' : 'bg-pitch-black/80 text-dim-gray'}`}
            whileHover={{ scale: 1.1 }}
          >
            {isLooking ? 'LOOKED' : 'MISSED'}
          </motion.div>
        </div>

        {/* Gaze Angles Overlay (appears on hover) */}
        {person.gaze_data && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-pitch-black/90 p-2 text-xs"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between text-dim-gray">
              <span>Yaw: {person.gaze_data.yaw?.toFixed(1)}°</span>
              <span>Pitch: {person.gaze_data.pitch?.toFixed(1)}°</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Section - More compact */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-bold text-sm">Track #{person.track_id}</h4>
          <div className="flex items-center gap-1">
            {gender === 'male' && (
              <svg className="w-3 h-3 text-fire-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.35 2 9 3.35 9 5s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm-1.5 20v-6h-3l2.59-7.59C10.34 7.59 11.1 7 12 7c.9 0 1.66.59 1.91 1.41L16.5 16h-3v6h-3z" />
              </svg>
            )}
            {gender === 'female' && (
              <svg className="w-3 h-3 text-crimson" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1.5 20v-6h-3l2.59-7.59C10.34 7.59 11.1 7 12 7c.9 0 1.66.59 1.91 1.41L16.5 16h-3v6h-3z" />
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-dim-gray">Age:</span>
            <span className="text-white">{ageDisplay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim-gray">Gender:</span>
            <span className="text-white capitalize">{gender}</span>
          </div>
          {person.duration && (
            <div className="flex justify-between">
              <span className="text-dim-gray">Duration:</span>
              <span className="text-white">{person.duration.toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* Demographic Profile - Always visible */}
        {demo.demographic_profile && (
          <div className="mt-2 pt-2 border-t border-slate/30">
            <p className="text-dim-gray text-xs line-clamp-2">
              {demo.demographic_profile}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PersonGallery = ({ videoId, metadata }) => {
  const [filter, setFilter] = useState('looking'); // Default to 'looking' only
  const [sortBy, setSortBy] = useState('track_id'); // 'track_id', 'duration', 'age'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const tracks = metadata?.tracks || [];

  // Dynamic items per page: max 2 rows (10 items with 5 columns)
  const itemsPerPage = 10;

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    // Apply filter
    if (filter === 'looking') {
      result = result.filter(t => t.is_looking_at_camera);
    } else if (filter === 'missed') {
      result = result.filter(t => !t.is_looking_at_camera);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(t => {
        const demo = t.demographic_analysis || {};
        const searchLower = searchTerm.toLowerCase();
        return (
          t.track_id.toString().includes(searchLower) ||
          demo.gender?.toLowerCase().includes(searchLower) ||
          demo.demographic_profile?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply sort
    result.sort((a, b) => {
      if (sortBy === 'track_id') {
        return a.track_id - b.track_id;
      } else if (sortBy === 'duration') {
        return (b.duration || 0) - (a.duration || 0);
      } else if (sortBy === 'age') {
        const aAge = a.demographic_analysis?.age_range?.min_age || 0;
        const bAge = b.demographic_analysis?.age_range?.min_age || 0;
        return aAge - bAge;
      }
      return 0;
    });

    return result;
  }, [tracks, filter, sortBy, searchTerm]);

  const lookingCount = tracks.filter(t => t.is_looking_at_camera).length;
  const missedCount = tracks.length - lookingCount;

  // Pagination
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTracks = filteredTracks.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Person Gallery</h2>
            <p className="text-dim-gray text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTracks.length)} of {filteredTracks.length} persons
              {filteredTracks.length !== tracks.length && ` (${tracks.length} total)`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: `All (${tracks.length})` },
                { value: 'looking', label: `Looked (${lookingCount})` },
                { value: 'missed', label: `Missed (${missedCount})` },
              ].map(({ value, label }) => (
                <motion.button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                             ${filter === value
                               ? 'bg-fire-red text-white'
                               : 'bg-charcoal text-dim-gray hover:text-white'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm border border-slate/30
                       hover:border-fire-red transition-all cursor-pointer"
            >
              <option value="track_id">Sort by ID</option>
              <option value="duration">Sort by Duration</option>
              <option value="age">Sort by Age</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by ID, gender, or profile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-charcoal text-white rounded-lg border border-slate/30
                     focus:border-fire-red focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      <AnimatePresence mode="wait">
        {filteredTracks.length === 0 ? (
          <motion.div
            className="glass-panel p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-dim-gray text-lg">No persons match your filters</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {paginatedTracks.map((person, index) => (
                <PersonCard
                  key={person.track_id}
                  person={person}
                  videoId={videoId}
                  index={index}
                />
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="glass-panel p-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm border border-slate/30
                           hover:border-fire-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all
                                ${currentPage === page
                                  ? 'bg-fire-red text-white'
                                  : 'bg-charcoal text-dim-gray hover:text-white border border-slate/30 hover:border-fire-red'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm border border-slate/30
                           hover:border-fire-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonGallery;
