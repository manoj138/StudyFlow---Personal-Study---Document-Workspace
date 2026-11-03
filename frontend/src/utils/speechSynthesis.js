/**
 * Text-to-Speech (TTS) Voice Engine for StudyFlow AI Mock Interviewer
 * Uses Web Speech API (window.speechSynthesis)
 */

class SpeechSynthesisEngine {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.voices = [];
    this.isSupported = !!this.synth;
    this.activeUtterance = null;

    if (this.isSupported) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices() || [];
    return this.voices;
  }

  getAvailableVoices() {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    // Filter to English, Hindi, Marathi if available
    return this.voices.filter((v) =>
      v.lang.startsWith("en") || v.lang.startsWith("hi") || v.lang.startsWith("mr")
    );
  }

  getPreferredVoice() {
    const available = this.getAvailableVoices();
    if (!available || available.length === 0) return null;

    // Prefer high quality English voices (Natural, Google UK/US, India)
    const preferred =
      available.find((v) => v.name.includes("Natural") || v.name.includes("Google UK English Female")) ||
      available.find((v) => v.name.includes("Google US English") || v.name.includes("Samantha")) ||
      available.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")) ||
      available[0];

    return preferred;
  }

  speak(text, { voice = null, rate = 0.95, pitch = 1.0, volume = 1.0, onStart, onEnd, onError } = {}) {
    if (!this.isSupported) {
      if (onError) onError(new Error("Speech synthesis not supported in this browser."));
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    if (!text || text.trim().length === 0) {
      if (onEnd) onEnd();
      return;
    }

    // Clean markdown/symbols from text before speaking
    const cleanText = text
      .replace(/[`*_~#\[\]\(\)>]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const selectedVoice = voice || this.getPreferredVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.activeUtterance = utterance;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      this.activeUtterance = null;
      // 'interrupted' is normal when user clicks stop or next question
      if (event.error !== "interrupted" && onError) {
        onError(event);
      }
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.activeUtterance = null;
    }
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking() {
    return !!(this.synth && this.synth.speaking);
  }
}

export const speechEngine = new SpeechSynthesisEngine();
export default speechEngine;

