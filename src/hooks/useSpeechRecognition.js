import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for browser-native speech recognition.
 * Prevents text from disappearing by locking in interim results.
 */
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const lastInterimRef = useRef('');
  const isListeningRef = useRef(false);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    return recognition;
  }, [isSupported]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Request microphone with optimal settings
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please allow microphone permissions.');
      return;
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognition.onresult = (event) => {
      let currentInterim = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          // Lock in final results
          finalTranscriptRef.current += text + ' ';
          lastInterimRef.current = '';
        } else {
          currentInterim += text;
        }
      }

      // If interim result is shorter than before, keep the longer version
      // This prevents text from disappearing
      if (currentInterim.length < lastInterimRef.current.length) {
        // Check if the old interim contained important content
        const oldLower = lastInterimRef.current.toLowerCase();
        const newLower = currentInterim.toLowerCase();

        // If AI was in the old but not new, lock in the old interim
        if (oldLower.includes('ai') && !newLower.includes('ai')) {
          finalTranscriptRef.current += lastInterimRef.current + ' ';
          currentInterim = '';
        }
      }

      lastInterimRef.current = currentInterim;
      setTranscript(finalTranscriptRef.current + currentInterim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'network') {
        setError('Network error. Speech recognition requires Chrome or Edge browser.');
        setIsListening(false);
        isListeningRef.current = false;
      }
      // Ignore 'aborted' and 'no-speech'
    };

    recognition.onend = () => {
      // Lock in any remaining interim text when recognition ends
      if (lastInterimRef.current) {
        finalTranscriptRef.current += lastInterimRef.current + ' ';
        lastInterimRef.current = '';
        setTranscript(finalTranscriptRef.current);
      }

      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              const newRecognition = createRecognition();
              if (newRecognition) {
                newRecognition.onresult = recognition.onresult;
                newRecognition.onerror = recognition.onerror;
                newRecognition.onend = recognition.onend;
                recognitionRef.current = newRecognition;
                newRecognition.start();
              }
            } catch (err) {
              console.error('Failed to restart recognition:', err);
            }
          }
        }, 50);
      }
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    isListeningRef.current = true;

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start recording. Please try again.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    // Lock in any interim text
    if (lastInterimRef.current) {
      finalTranscriptRef.current += lastInterimRef.current + ' ';
      lastInterimRef.current = '';
      setTranscript(finalTranscriptRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    lastInterimRef.current = '';
  }, []);

  return {
    transcript,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
