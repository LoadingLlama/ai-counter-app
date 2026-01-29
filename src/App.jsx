import { useMemo } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { countAI } from './utils/countAI';
import { RecordButton } from './components/RecordButton';
import { Counter } from './components/Counter';
import { Transcript } from './components/Transcript';
import './App.css';

/**
 * Main App component for AI Counter.
 * Counts "AI" mentions in real-time during lectures.
 */
function App() {
  const {
    transcript,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const aiCount = useMemo(() => countAI(transcript), [transcript]);

  const handleReset = () => {
    stopListening();
    resetTranscript();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>UGBA 195T AI Counter</h1>
        <span className="author-badge">Caden Chiang</span>
        <p className="app-subtitle">
          Count how many times "AI" is mentioned in lecture
        </p>
      </header>

      <main className="app-main">
        {!isSupported && (
          <div className="browser-warning">
            Speech recognition is not supported in this browser.
            Please use Chrome or Edge for the best experience.
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <Counter count={aiCount} />

        <div className="controls">
          <RecordButton
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
            disabled={!isSupported}
          />

          {transcript && (
            <button className="reset-button" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>

        <Transcript text={transcript} isListening={isListening} />
      </main>

      <footer className="app-footer">
        <p>Works best in Chrome or Edge browsers</p>
      </footer>
    </div>
  );
}

export default App;
