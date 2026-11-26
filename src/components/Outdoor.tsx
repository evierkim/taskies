import { useRef } from "react";
import type { PlaceOffset } from "../storage";
import type { Task } from "../types";
import Taskie from "./Taskie";

type Props = {
  tasks: Task[]; // freed creatures only
  offsets: Record<string, PlaceOffset>;
  onBack: () => void;
  onReturn: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, offset: PlaceOffset) => void;
};

// TODO: swap the gradient for the outdoor landscape drawing.
export default function Outdoor({
  tasks,
  offsets,
  onBack,
  onReturn,
  onRemove,
  onMove,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const slotByIdRef = useRef<Record<string, number>>({});

  // Stable outdoor slots so order/filter changes do not reshuffle free moves.
  const slotById: Record<string, number> = {};
  {
    const used = new Set<number>();
    for (const task of tasks) {
      const kept = slotByIdRef.current[task.id];
      if (kept !== undefined && !used.has(kept)) {
        slotById[task.id] = kept;
        used.add(kept);
      }
    }
    for (const task of tasks) {
      if (slotById[task.id] !== undefined) continue;
      let slot = 0;
      while (used.has(slot)) slot += 1;
      slotById[task.id] = slot;
      used.add(slot);
    }
    slotByIdRef.current = slotById;
  }

  return (
    <div ref={stageRef} className="stage outdoor">
      <div className="outdoor-hints">
        <p className="outdoor-hint">Welcome to the outside!</p>
        <p className="outdoor-hint-sub">Double click a taskie to remove it</p>
      </div>
      {tasks.map((task) => (
        <div key={task.id} className={`slot slot-out-${slotById[task.id] % 4}`}>
          <Taskie
            task={task}
            offset={offsets[task.id]}
            onReturn={onReturn}
            onRemove={onRemove}
            onMove={onMove}
            dragConstraintsRef={stageRef}
          />
        </div>
      ))}
      <button className="latch" onClick={onBack}>View Wall</button>
    </div>
  );
}
