import React, { useState, useEffect, useRef } from "react";
import { AudioVisualizer, LiveAudioVisualizer } from "react-audio-visualize";

import MicIcon from "./mic.svg";
import MuteIcon from "./mic-mute.svg";

import WaveForm from "./WaveForm";
import "./styles.css";

interface AnalyzerData {
  analyzer: AnalyserNode;
  bufferLength: number;
  dataArray: Uint8Array;
}

const WaveformAudioPlayer: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [analyzerData, setAnalyzerData] = useState<AnalyzerData | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>();

  const audioElmRef = useRef<HTMLAudioElement>(null);

  const audioAnalyzer = () => {
    const audioCtx = new window.AudioContext();
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 2048;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const source = audioCtx.createMediaElementSource(audioElmRef.current!);
    source.connect(analyzer);
    source.connect(audioCtx.destination);
    // Listen to the 'ended' event on the audio element
    audioElmRef.current?.addEventListener("ended", () => {
      source.disconnect();
    });

    setAnalyzerData({ analyzer, bufferLength, dataArray });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioUrl(URL.createObjectURL(file));
    audioAnalyzer();
  };

  /////////////////////////////////////////////////////////////////////////////////
  // Library
  const [blob, setBlob] = useState<Blob>();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const visualizerRef = useRef<HTMLCanvasElement>(null);

  const startRecording = () => {
    // navigator.mediaDevices
    //   .getUserMedia({ audio: true })
    //   .then((stream) => {
    //     const recorder = new MediaRecorder(stream);
    let startTime = Date.now();
    //     recorder.ondataavailable = (e) => {
    //       const audioBlob = new Blob([e.data], { type: "audio/wav" });
    //       setBlob(audioBlob);
    //     };
    //     recorder.start();
    //     setMediaRecorder(recorder);
    // Update recording time every second
    const timerInterval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calculate elapsed time in seconds
      console.log(123123, elapsedTime.toString());
      setRecordingTime(elapsedTime);
    }, 1000);

    //   recorder.onstop = () => {
    //     clearInterval(timerInterval); // Stop the timer when recording stops
    //   };
    // })
    // .catch((err) => console.error("Error accessing user media:", err));
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const toggleRecording = () => {
    if (muted) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAudioBlob = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const audioBlob = new Blob([reader.result as ArrayBuffer], {
          type: file.type,
        });
        setBlob(audioBlob);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSetMediaRecorder = () => {
    // Assume mediaRecorder is created and set elsewhere in the component
    // For simplicity, here we just call startRecording to create a mediaRecorder
    startRecording();
  };

  return (
    <div>
      <div className="container">
        <input type="file" accept="audio/*" onChange={onFileChange} />
        <div className="player-container">
          <WaveForm analyzerData={analyzerData} height={40} width={300} />
          <audio src={audioUrl ?? ""} controls ref={audioElmRef} />
        </div>
      </div>
      <br />
      <br />
      <input type="file" accept="audio/*" onChange={handleAudioBlob} />
      <div>
        {blob && (
          <AudioVisualizer
            ref={visualizerRef}
            blob={blob}
            width={500}
            height={75}
            barWidth={3}
            gap={1}
            barColor={"#f76565"}
            barPlayedColor={""}
          />
        )}
      </div>
      <br />
      <br />
      <button onClick={handleSetMediaRecorder}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <div className="recorder-container">
        <div
          onClick={() => {
            setMuted(!muted);
            toggleRecording();
          }}
        >
          <img src={muted ? MuteIcon : MicIcon} alt="mic" />
        </div>
        {mediaRecorder && (
          <LiveAudioVisualizer
            mediaRecorder={mediaRecorder}
            width={200}
            height={75}
          />
        )}
        {recordingTime && <div>{recordingTime} sec</div>}
      </div>
    </div>
  );
};

export default WaveformAudioPlayer;
