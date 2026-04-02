import type { RouteStop } from "../types";

interface PlayerControlsProps {
  isPlaying: boolean;
  speed: number;
  currentIndex: number;
  totalStops: number;
  currentStop: RouteStop | null;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (index: number) => void;
  onCycleSpeed: () => void;
}

export function PlayerControls({
  isPlaying,
  speed,
  currentIndex,
  totalStops,
  currentStop,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onCycleSpeed,
}: PlayerControlsProps) {
  const progress = totalStops > 1 ? currentIndex / (totalStops - 1) : 0;

  return (
    <div className="player-panel">
      <div className="player-stop-display">
        {currentStop?.nodenm ?? "노선을 선택하세요"}
      </div>
      <div className="player-controls">
        <button
          className="player-btn"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="player-btn" onClick={onReset} title="리셋">
          ⏹
        </button>
        <button className="player-btn speed-btn" onClick={onCycleSpeed} title="속도">
          {speed}x
        </button>

        <div className="player-progress-wrap">
          <input
            type="range"
            className="player-progress"
            min={0}
            max={totalStops - 1}
            value={currentIndex}
            onChange={(e) => onSeek(Number(e.target.value))}
          />
          <div className="player-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <span className="player-stop-count">
          {currentIndex + 1} / {totalStops}
        </span>
      </div>
    </div>
  );
}
