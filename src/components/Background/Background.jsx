// src/components/Background/Background.jsx
// Renders dynamic wallpaper (static image or YouTube video) based on context state

// ----- Imports -----
import React, { useContext } from 'react';
import { TilesContext } from '../../context/TilesContext';
import { extractYouTubeId } from '../../utils/youtubeUtils';
import './Background.css';

// ----- Main -----
const Background = React.memo(() => {
  const { backgroundType, backgroundValue, backgroundOpacity, backgroundMuted } = useContext(TilesContext);

  // no background active
  if (backgroundType === 'none' || !backgroundValue) {
    return null;
  }

  // ----- static image (base64 data URL or external URL) -----
  if (backgroundType === 'image') {
    return (
      <div className="background-container">
        <img
          src={backgroundValue}
          alt="dashboard background"
          className="background-media"
          style={{ opacity: backgroundOpacity }}
          onError={(e) => console.error('[Background] Image failed to load:', backgroundValue?.substring(0, 100))}
        />
      </div>
    );
  }

  // ----- YouTube video background -----
  if (backgroundType === 'youtube') {
    const videoId = extractYouTubeId(backgroundValue);
    if (!videoId) {
      console.warn('[Background] Invalid YouTube URL, cannot extract video ID:', backgroundValue);
      return null;
    }

    // build embed URL w/ [autoplay, mute, loop, playlist] for seamless looping
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${backgroundMuted ? 1 : 0}&loop=1&controls=0&playlist=${videoId}`;

    return (
      <div className="background-container">
        <iframe
          src={embedUrl}
          title="YouTube background"
          className="background-iframe"
          style={{ opacity: backgroundOpacity }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  console.warn('[Background] Unhandled background type:', backgroundType);
  return null;
});

Background.displayName = 'Background';

export default Background;