interface PlayerControlsProps {
  isPlaying: boolean;
  busCount: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function PlayerControls({ isPlaying, busCount, onPlay, onPause, onReset }: PlayerControlsProps) {
  return (
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
      <span className="player-status">
        {isPlaying ? "LIVE" : "PAUSED"}
      </span>
      <span className="player-bus-count">
        {busCount}대 운행 중
      </span>
    </div>
  );
}
