import { useEffect, useRef } from 'react';
import { highlightAI } from '../utils/countAI';
import './Transcript.css';

/**
 * Transcript component displaying live speech-to-text with AI highlights.
 *
 * @param {Object} props
 * @param {string} props.text - The transcript text to display
 * @param {boolean} props.isListening - Whether currently recording
 */
export function Transcript({ text, isListening }) {
  const containerRef = useRef(null);
  const segments = highlightAI(text);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <span className="transcript-title">Live Transcript</span>
        {isListening && (
          <span className="transcript-status">
            <span className="status-dot" />
            Listening...
          </span>
        )}
      </div>
      <div className="transcript-content" ref={containerRef}>
        {segments.length === 0 ? (
          <p className="transcript-placeholder">
            {isListening
              ? 'Start speaking to see the transcript...'
              : 'Press Record to start listening'}
          </p>
        ) : (
          <p className="transcript-text">
            {segments.map((segment, index) => (
              <span
                key={index}
                className={segment.isAI ? 'ai-highlight' : ''}
              >
                {segment.text}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
