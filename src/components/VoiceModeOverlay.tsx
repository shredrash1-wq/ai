import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Volume2, Sparkles, AudioWaveform } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/storage";

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceTranscript: (transcript: string) => void;
}

export const VoiceModeOverlay: React.FC<VoiceModeOverlayProps> = ({
  isOpen,
  onClose,
  onSendVoiceTranscript
}) => {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      return;
    }

    startListening();

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Voice recognition is not supported in this browser. You can type directly in the chat.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech error", e);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignored
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleDone = () => {
    if (transcript.trim()) {
      onSendVoiceTranscript(transcript.trim());
      onClose();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-mode-modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-zinc-950/90 backdrop-blur-xl text-white animate-in fade-in"
    >
      {/* Top controls */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm tracking-tight text-zinc-300">Aetheris Live Voice</span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Middle Animated Orb / Waves */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-8">
        <div className="relative flex items-center justify-center">
          {/* Pulsing ambient rings */}
          <div className="absolute w-56 h-56 rounded-full bg-blue-500/20 animate-ping [animation-duration:3s]" />
          <div className="absolute w-44 h-44 rounded-full bg-purple-500/30 animate-pulse [animation-duration:2s]" />

          {/* Core Orb */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-pink-500 shadow-2xl flex items-center justify-center border-4 border-white/20">
            {isListening ? (
              <div className="flex items-center gap-1.5 h-10">
                <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" />
                <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:0.45s]" />
              </div>
            ) : (
              <MicOff className="w-8 h-8 text-white/80" />
            )}
          </div>
        </div>

        <div className="max-w-md px-4">
          <p className="text-lg font-medium text-zinc-200 min-h-[3rem] leading-relaxed">
            {transcript || (isListening ? "Listening... Speak naturally" : "Microphone paused")}
          </p>
        </div>
      </div>

      {/* Bottom Bar Controls */}
      <div className="w-full max-w-sm flex items-center justify-center gap-4">
        <button
          onClick={handleToggleListening}
          className={`p-4 rounded-full transition shadow-lg ${
            isListening
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {transcript.trim() && (
          <button
            onClick={handleDone}
            className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg transition"
          >
            Send to Aetheris
          </button>
        )}
      </div>
    </div>
  );
};
