import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Cross-browser Speech Recognition wrapper (Web Speech API)
 */
export const getSpeechRecognitionClass = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export const isSpeechRecognitionSupported = () => {
  return !!getSpeechRecognitionClass();
};

/**
 * Custom React Hook for live Speech-to-Text
 */
export const useSpeechRecognition = ({ onResultChange, lang = "en-US" } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) {
      setError("Speech recognition is not supported in this browser. You can type your answer manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + " ";
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => {
            const updated = (prev + " " + finalChunk).trim().replace(/\s+/g, " ");
            if (onResultChange) onResultChange(updated);
            return updated;
          });
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn("[Speech Recognition Error]:", event.error);
        if (event.error === "no-speech") {
          // Normal when user pauses; do not show error banner
          return;
        }
        if (event.error === "not-allowed") {
          setError("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (event.error === "network") {
          setError("Network connection issue with speech service. You can type your answer.");
        } else {
          setError(`Microphone error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        // If it stopped unintentionally (e.g. silence timeout) and user didn't hit stop, restart
        if (!isManuallyStoppedRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            return;
          } catch (e) {
            // Already started or blocked
          }
        }
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error("[Speech Recognition Init Error]:", err);
      setError("Could not initialize microphone speech engine.");
    }

    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [lang, onResultChange]);

  const startListening = useCallback(() => {
    setError(null);
    isManuallyStoppedRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // If already active, ignore
        console.warn("Speech recognition already active or error:", err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const setManualTranscript = useCallback((text) => {
    setTranscript(text);
    if (onResultChange) onResultChange(text);
  }, [onResultChange]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported: isSpeechRecognitionSupported(),
    startListening,
    stopListening,
    resetTranscript,
    setTranscript: setManualTranscript
  };
};

