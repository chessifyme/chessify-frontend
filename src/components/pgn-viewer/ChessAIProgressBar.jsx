import React, { useState, useEffect } from 'react';

const ChessAIProgressBar = ({
  running,
  progress,
  setProgress,
  chessAISocketResp,
}) => {
  const [duration, setDuration] = useState(20000);
  const [increment, setIncrement] = useState(0);

  useEffect(() => {
    let interval;

    if (running && progress !== 100) {
      interval = setInterval(() => {
        if (
          progress === 60 + increment &&
          (chessAISocketResp ||
            (chessAISocketResp && !chessAISocketResp.length))
        ) {
          setDuration((prevDuration) => prevDuration + 10000);
          setIncrement((increment) => increment + 1);
        } else if (chessAISocketResp && chessAISocketResp.length) {
          setProgress(100);
        } else if (progress < 100) {
          setProgress((prevProgress) => prevProgress + 1);
        }
      }, duration / 100);
    }

    return () => clearInterval(interval);
  }, [progress, duration, running]);

  return (
    <div className="chessai-progress-bar">
      <div
        style={{
          backgroundColor: '#eee',
          borderRadius: '4px',
          margin: '10px 0px 0px 10px',
          height: '8px',
          width: '200px',
          border: '1px solid #358c65',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#358c65',
            borderRadius: '4px',
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};

export default ChessAIProgressBar;
