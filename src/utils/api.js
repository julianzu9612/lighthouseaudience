/**
 * Static API for demo (no backend required)
 */
import {
  loadMetadata,
  computeStats,
  computeWordCloud,
  computeTimeline,
  computeTimelinePersons,
  computePersonsLooking,
} from './static-data';

const DEMO_VIDEO_ID = 'demo';

export const videoAPI = {
  /**
   * Get list of all analyzed videos
   */
  getVideoList: async () => {
    return {
      success: true,
      count: 1,
      videos: [
        {
          video_id: DEMO_VIDEO_ID,
          video_name: 'Demo Video',
          video_path: '/videos/demo.mp4',
          metadata_path: '/data/metadata.json',
          has_output: true,
        },
      ],
    };
  },

  /**
   * Get metadata for a specific video
   */
  getMetadata: async (videoId) => {
    const metadata = await loadMetadata();
    return {
      success: true,
      metadata,
    };
  },

  /**
   * Get computed statistics for a video
   */
  getStats: async (videoId) => {
    const stats = await computeStats();
    return {
      success: true,
      stats,
    };
  },

  /**
   * Get word cloud data
   */
  getWordCloud: async (videoId, options = {}) => {
    const wordCloud = await computeWordCloud();
    return {
      success: true,
      ...wordCloud,
    };
  },

  /**
   * Get timeline data
   */
  getTimeline: async (videoId) => {
    const timeline = await computeTimeline();
    return {
      success: true,
      ...timeline,
    };
  },

  /**
   * Get timeline persons data
   */
  getTimelinePersons: async (videoId) => {
    const timelinePersons = await computeTimelinePersons();
    return {
      success: true,
      ...timelinePersons,
    };
  },

  /**
   * Get persons looking at camera
   */
  getPersonsLooking: async (videoId) => {
    const personsLooking = await computePersonsLooking();
    return {
      success: true,
      ...personsLooking,
    };
  },

  /**
   * Get video stream URL (static file)
   */
  getVideoStreamUrl: (videoId, preferOutput = true) => {
    return '/videos/demo.mp4';
  },

  /**
   * Get crop image URL (static file)
   */
  getCropUrl: (videoId, trackId, options = {}) => {
    return `/crops/track_${trackId}.jpg`;
  },
};

export default videoAPI;
