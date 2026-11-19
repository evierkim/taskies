import type { Moss as MossStage } from "../types";

// TODO: swap for the three moss drawings (stages 1-3). Must never cover the name.
export default function Moss({ stage }: { stage: MossStage }) {
  if (stage === 0) return null;
  return <div className={`moss moss-${stage}`} aria-hidden />;
}
