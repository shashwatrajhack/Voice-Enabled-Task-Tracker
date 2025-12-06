import React, { useEffect, useRef, useState } from "react";

export default function VoiceRecorder({ onTranscript, autoStopMs = 3500 }) {
  const [listening, setListening] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    let runningTranscript = "";

    recognition.onresult = (event) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        try {
          recognition.stop();
        } catch (e) {
          console.log(e);
        }
      }, autoStopMs);
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript.trim();
        if (res.isFinal) {
          runningTranscript =
            (runningTranscript ? runningTranscript + " " : "") + text;

          setDisplayText(runningTranscript);
          onTranscript && onTranscript(runningTranscript, true);
        } else {
          interim += (interim ? interim + " " : "") + text;
          setDisplayText(
            (runningTranscript ? runningTranscript + " " : "") + interim
          );
          onTranscript &&
            onTranscript(
              (runningTranscript ? runningTranscript + " " : "") + interim,
              false
            );
        }
      }
    };

    recognition.onend = () => {
      setListening(false);

      if (runningTranscript) {
        onTranscript && onTranscript(runningTranscript, true);
      }
      runningTranscript = "";
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error", e);
      setListening(false);

      onTranscript && onTranscript(displayText, true);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognition.stop();
      } catch (e) {
        console.log(e);
      }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStopMs]);

  function toggle() {
    if (!recognitionRef.current) {
      alert(
        "Voice recording is not supported in this browser. Please use Chrome, Edge, or a supported browser."
      );
      return;
    }

    if (listening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Stop error", e);
      }
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setDisplayText("");
        setListening(true);
      } catch (e) {
        console.error("Start error", e);
        alert("Unable to start microphone. Check browser permissions.");
      }
    }
  }

  return (
    <div>
      <button
        onClick={toggle}
        className="button"
        aria-pressed={listening}
        title={listening ? "Stop recording" : "Start recording"}
      >
        {listening ? "Stop" : "Record"}
      </button>

      <div className="small" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
        {displayText || "No transcript yet"}
      </div>
    </div>
  );
}
