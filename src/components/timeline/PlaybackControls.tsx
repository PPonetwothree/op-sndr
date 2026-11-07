import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSim } from "@/store/simulationStore";
import type { PlaybackSpeed } from "@/types";

const SPEEDS: PlaybackSpeed[] = [1, 2, 5, 10];

export function PlaybackControls() {
  const playing = useSim((s) => s.playing);
  const speed = useSim((s) => s.speed);
  const { togglePlay, restart, stepBackward, stepForward, setSpeed } = useSim.getState();
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Playback controls">
      <Button variant="secondary" size="icon" onClick={restart} title="Restart (Home)">
        <RotateCcw />
      </Button>
      <Button variant="secondary" size="icon" onClick={stepBackward} title="Step backward (←)">
        <SkipBack />
      </Button>
      <Button variant={playing ? "active" : "default"} size="icon" onClick={togglePlay} title={playing ? "Pause (Space)" : "Play / resume (Space)"}>
        {playing ? <Pause /> : <Play />}
      </Button>
      <Button variant="secondary" size="icon" onClick={stepForward} title="Step forward (→)">
        <SkipForward />
      </Button>
      <div className="ml-1 flex overflow-hidden rounded-[3px] border border-ink-700">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`mono h-7 px-2 text-[11px] ${speed === s ? "bg-olive-700 text-olive-300" : "bg-ink-800 text-ink-400 hover:text-ink-100"}`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
