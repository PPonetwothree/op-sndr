import { useEffect } from "react";
import { useSim } from "./simulationStore";

/** Drives the simulation clock with requestAnimationFrame while playing. */
export function usePlaybackLoop() {
  const playing = useSim((s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(250, now - last); // clamp after tab switches
      last = now;
      useSim.getState().advance(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
}
