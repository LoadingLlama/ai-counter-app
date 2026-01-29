import './RecordButton.css';

/**
 * RecordButton component for starting/stopping speech recognition.
 *
 * @param {Object} props
 * @param {boolean} props.isListening - Whether currently recording
 * @param {Function} props.onStart - Callback to start recording
 * @param {Function} props.onStop - Callback to stop recording
 * @param {boolean} props.disabled - Whether button is disabled
 */
export function RecordButton({ isListening, onStart, onStop, disabled }) {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      className={`record-button ${isListening ? 'recording' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      <span className="record-icon" />
      <span className="record-text">
        {isListening ? 'Stop' : 'Record'}
      </span>
    </button>
  );
}
