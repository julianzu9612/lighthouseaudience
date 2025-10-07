/**
 * Static data processor for demo
 * Loads metadata from public folder and computes stats
 */

let cachedMetadata = null;
let cachedStats = null;
let cachedWordCloud = null;
let cachedTimeline = null;
let cachedTimelinePersons = null;
let cachedPersonsLooking = null;

/**
 * Load metadata from public folder
 */
async function loadMetadata() {
  if (cachedMetadata) return cachedMetadata;

  const response = await fetch('/data/metadata.json');
  cachedMetadata = await response.json();
  return cachedMetadata;
}

/**
 * Compute stats from metadata
 */
async function computeStats() {
  if (cachedStats) return cachedStats;

  const metadata = await loadMetadata();
  const tracks = metadata.tracks || [];

  // Gender distribution
  const genderCounts = { male: 0, female: 0, unknown: 0 };
  tracks.forEach(track => {
    const gender = track.demographic_analysis?.gender || 'unknown';
    genderCounts[gender]++;
  });

  // Age distribution - count by ranges
  const ageRanges = {
    '0-18': 0,
    '19-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-60': 0,
    '60+': 0,
  };

  tracks.forEach(track => {
    const minAge = track.demographic_analysis?.age_range?.min_age || 0;
    const maxAge = track.demographic_analysis?.age_range?.max_age || 0;
    const avgAge = (minAge + maxAge) / 2;

    if (avgAge <= 18) ageRanges['0-18']++;
    else if (avgAge <= 25) ageRanges['19-25']++;
    else if (avgAge <= 35) ageRanges['26-35']++;
    else if (avgAge <= 45) ageRanges['36-45']++;
    else if (avgAge <= 60) ageRanges['46-60']++;
    else ageRanges['60+']++;
  });

  // Convert to array format for charts (like backend does)
  const ageDistributionArray = Object.entries(ageRanges).map(([range, count]) => ({
    range,
    count,
    percentage: tracks.length > 0 ? Math.round((count / tracks.length) * 1000) / 10 : 0,
  }));

  // Gaze stats - use face_data like backend does
  const faceData = metadata.face_data || [];

  // Get faces looking at camera
  const looking = faceData.filter(f =>
    f.gaze_data && f.gaze_data.looking_at_camera
  );
  const trackIdsLooking = new Set(looking.map(f => f.track_id));

  const lookingAtCamera = trackIdsLooking.size;
  const notLooking = tracks.length - lookingAtCamera;

  // Calculate age average
  const ages = tracks.map(t => {
    const minAge = t.demographic_analysis?.age_range?.min_age || 0;
    const maxAge = t.demographic_analysis?.age_range?.max_age || 0;
    return (minAge + maxAge) / 2;
  });
  const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

  // Count total detections from frames
  const frames = metadata.frames || [];
  const totalDetections = frames.reduce((sum, f) => sum + (f.detections?.length || 0), 0);

  // Match backend structure exactly
  cachedStats = {
    totals: {
      tracks: tracks.length,
      faces: faceData.length,
      frames: frames.length,
      detections: totalDetections,
    },
    demographics: {
      gender_distribution: genderCounts,
      age_average: Math.round(avgAge),
      age_distribution: ageDistributionArray,
    },
    engagement: {
      faces_looking: looking.length,
      persons_looking: lookingAtCamera,
      engagement_rate: tracks.length > 0 ? Math.round((lookingAtCamera / tracks.length) * 100) : 0,
    },
    traffic: {
      total_detections: totalDetections,
      average_density: frames.length > 0 ? parseFloat((totalDetections / frames.length).toFixed(2)) : 0,
    },
    video: metadata.video_info || {},
  };

  return cachedStats;
}

/**
 * Compute word cloud from demographic profiles
 */
async function computeWordCloud() {
  if (cachedWordCloud) return cachedWordCloud;

  const metadata = await loadMetadata();
  const tracks = metadata.tracks || [];

  // Extract all words from demographic profiles
  const wordCounts = {};

  tracks.forEach(track => {
    const profile = track.demographic_analysis?.demographic_profile || '';
    // Simple word extraction (split by spaces, remove punctuation)
    const words = profile
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 4); // Min 4 chars

    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });

  // Convert to array and sort by frequency
  const wordArray = Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Top 50 words

  cachedWordCloud = { words: wordArray };
  return cachedWordCloud;
}

/**
 * Compute timeline data
 */
async function computeTimeline() {
  if (cachedTimeline) return cachedTimeline;

  const metadata = await loadMetadata();
  const frames = metadata.frames || [];
  const videoInfo = metadata.video_info || {};
  const fps = videoInfo.fps || 30;

  // Group detections by frame
  const timelineData = frames.map(frame => {
    const timestamp = frame.frame_id / fps;
    const detections = frame.detections?.length || 0;

    return {
      frame_id: frame.frame_id,
      timestamp,
      detection_count: detections,
    };
  });

  cachedTimeline = { timeline: timelineData };
  return cachedTimeline;
}

/**
 * Compute timeline persons (first appearance)
 */
async function computeTimelinePersons() {
  if (cachedTimelinePersons) return cachedTimelinePersons;

  const metadata = await loadMetadata();
  const tracks = metadata.tracks || [];
  const videoInfo = metadata.video_info || {};
  const fps = videoInfo.fps || 30;

  // Get first frame for each track
  const persons = tracks.map(track => {
    const firstFrame = track.frames?.[0]?.frame_id || 0;
    const timestamp = firstFrame / fps;

    return {
      track_id: track.track_id,
      first_appearance: timestamp,
      gender: track.demographic_analysis?.gender || 'unknown',
      age_range: track.demographic_analysis?.age_range || { min_age: 0, max_age: 100 },
    };
  }).sort((a, b) => a.first_appearance - b.first_appearance);

  cachedTimelinePersons = { persons };
  return cachedTimelinePersons;
}

/**
 * Get persons looking at camera
 */
async function computePersonsLooking() {
  if (cachedPersonsLooking) return cachedPersonsLooking;

  const metadata = await loadMetadata();
  const tracks = metadata.tracks || [];
  const faceData = metadata.face_data || [];

  // Get track IDs of persons looking (using face_data like backend)
  const looking = faceData.filter(f =>
    f.gaze_data && f.gaze_data.looking_at_camera
  );
  const trackIdsLooking = new Set(looking.map(f => f.track_id));

  // Get full track data for those persons
  const personsLooking = tracks
    .filter(t => trackIdsLooking.has(t.track_id))
    .map(track => ({
      track_id: track.track_id,
      demographic_analysis: track.demographic_analysis,
    }));

  cachedPersonsLooking = { persons: personsLooking };
  return cachedPersonsLooking;
}

export {
  loadMetadata,
  computeStats,
  computeWordCloud,
  computeTimeline,
  computeTimelinePersons,
  computePersonsLooking,
};
