// One file, two cuts. An episode lists its shots once; each shot is in both cuts unless it is marked `only`.
// The short cut is a complete piece with its own opening (engine/formats.md), so a shot can also be short-only.
//
//   const SHOTS: Shot[] = [[SH1, 60], [SH2, 38, 'long'], [HOOK_B, 30, 'short'], ...];
//   const c = buildCut(SHOTS, cut);           // cut comes from the composition's props ('long' by default)
//   c.shots   -> [{ C, from, d, i }] for <Sequence>
//   c.at(i, s) -> frame s seconds into shot i, or null if shot i is not in this cut (drop the cue)
//   c.edge(i)  -> start of shot i, or of the next shot that is in this cut (for spans like room tone)
//   c.len      -> durationInFrames, used by calculateMetadata in Root.tsx
import React from 'react';

export type Cut = 'long' | 'short';
export type Shot = [React.FC, number] | [React.FC, number, Cut];
export type CutProps = { cut?: Cut };

export function buildCut(shots: Shot[], cut: Cut = 'long', fps = 24) {
  const start: (number | null)[] = [];
  const kept: { C: React.FC; from: number; d: number; i: number }[] = [];
  let t = 0;
  shots.forEach(([C, d, only], i) => {
    if (only && only !== cut) { start.push(null); return; }
    start.push(t); kept.push({ C, from: t, d, i }); t += d;
  });
  const edge = (i: number): number => {
    for (let j = i; j < start.length; j++) if (start[j] !== null) return start[j] as number;
    return t;
  };
  const at = (i: number, s: number): number | null => (start[i] === null ? null : (start[i] as number) + Math.round(s * fps));
  return { shots: kept, len: t, at, edge, has: (i: number) => start[i] !== null };
}
