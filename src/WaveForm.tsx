import React, { useRef, useEffect } from "react";

interface WaveFormProps {
  analyzerData: {
    dataArray: Uint8Array | null;
    analyzer: AnalyserNode | null;
    bufferLength: number;
  } | null;
  width: number;
  height: number;
}

function animateBars(
  analyser: AnalyserNode,
  canvas: HTMLCanvasElement,
  canvasCtx: CanvasRenderingContext2D,
  dataArray: Uint8Array,
  bufferLength: number
) {
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  const maxHeight = canvas.height;
  const centerY = canvas.height / 2;

  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * maxHeight;
    const blueShade = Math.floor((dataArray[i] / 255) * 1);
    const blueHex = ["#61dafb", "#5ac8fa", "#50b6f5", "#419de6", "#20232a"][
      blueShade
    ];
    canvasCtx.fillStyle = blueHex;
    canvasCtx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);

    x += barWidth + 3;
  }
}

const WaveForm: React.FC<WaveFormProps> = ({ analyzerData, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { dataArray, analyzer, bufferLength } = analyzerData || {
    dataArray: null,
    analyzer: null,
    bufferLength: 0,
  };

  const draw = (
    dataArray: Uint8Array | null,
    analyzer: AnalyserNode | null,
    bufferLength: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas || !analyzer) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const animate = () => {
      requestAnimationFrame(animate);
      canvas.width = width;
      canvas.height = height;
      animateBars(analyzer, canvas, canvasCtx, dataArray!, bufferLength);
    };

    animate();
  };

  useEffect(() => {
    draw(dataArray, analyzer, bufferLength);
  }, [dataArray, analyzer, bufferLength, width, height]);

  return <canvas style={{}} ref={canvasRef} width={width} height={height} />;
};

export default WaveForm;
