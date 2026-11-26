import { useEffect, useRef, useState } from "react";
import closedWall from "../assets/background-closed.png";
import openWall from "../assets/background-open.png";
import type { PlaceOffset } from "../storage";
import type { Task } from "../types";
import Taskie from "./Taskie";

type Props = {
  tasks: Task[]; // wall creatures only; new ones spawn on the sill then drop
  offsets: Record<string, PlaceOffset>;
  onAdd: (name: string) => string;
  onRelease: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, offset: PlaceOffset) => void;
  onHover: (id: string | null) => void;
  onLook: () => void;
};

export default function Wall({
  tasks,
  offsets,
  onAdd,
  onRelease,
  onRemove,
  onMove,
  onHover,
  onLook,
}: Props) {
  const [name, setName] = useState("");
  const [windowHovered, setWindowHovered] = useState(false);
  const [nearWindow, setNearWindow] = useState(false);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [arrivingId, setArrivingId] = useState<string | null>(null);
  const [newbornId, setNewbornId] = useState<string | null>(null);
  const nearIds = useRef(new Set<string>());
  const slotByIdRef = useRef<Record<string, number>>({});
  const stageRef = useRef<HTMLDivElement>(null);
  const nameBoxRef = useRef<HTMLTextAreaElement>(null);
  const canAdd = name.trim().length > 0;
  const windowOpen = windowHovered || nearWindow;

  // Stable unique ground slots: keep old ones when possible, fill the next free spot.
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

  useEffect(() => {
    if (!spotlightId) return;
    const t = window.setTimeout(() => setSpotlightId(null), 5000);
    return () => window.clearTimeout(t);
  }, [spotlightId]);

  // Drop near-state for creatures that left the wall (released).
  useEffect(() => {
    const alive = new Set(tasks.map((t) => t.id));
    let changed = false;
    for (const id of [...nearIds.current]) {
      if (!alive.has(id)) {
        nearIds.current.delete(id);
        changed = true;
      }
    }
    if (changed) setNearWindow(nearIds.current.size > 0);
  }, [tasks]);

  function resizeNameBox(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = onAdd(trimmed);
    setArrivingId(id);
    setNewbornId(id);
    setName("");
    if (nameBoxRef.current) {
      nameBoxRef.current.style.height = "auto";
    }
  }

  function onNameChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setName(e.target.value);
    resizeNameBox(e.target);
  }

  function pickRandom() {
    if (tasks.length === 0) return;
    const pick = tasks[Math.floor(Math.random() * tasks.length)];
    setSpotlightId(pick.id);
  }

  function handleNearWindow(id: string, near: boolean) {
    if (near) nearIds.current.add(id);
    else nearIds.current.delete(id);
    setNearWindow(nearIds.current.size > 0);
  }

  function handleLanded(id: string) {
    setArrivingId((cur) => (cur === id ? null : cur));
    window.setTimeout(() => {
      setNewbornId((cur) => (cur === id ? null : cur));
    }, 2800);
  }

  return (
    <div
      ref={stageRef}
      className="stage"
      style={{ backgroundImage: `url(${windowOpen ? openWall : closedWall})` }}
    >
      <div className="wall-hints">
        <p className="wall-hint">
          Drag a taskie to the window when you have completed its task!
        </p>
        <p className="wall-hint-sub">Double click a taskie to remove it</p>
      </div>

      {/* Opens on hover or when a creature is dragged near; click looks outside. */}
      <button
        className="window-hit"
        onClick={onLook}
        onPointerEnter={() => setWindowHovered(true)}
        onPointerLeave={() => setWindowHovered(false)}
        aria-label="View Outside"
      >
        {windowHovered && <span className="window-label">View Outside</span>}
      </button>

      {tasks.map((task) => (
        <div key={task.id} className={`slot slot-${slotById[task.id] ?? 0}`}>
          <Taskie
            task={task}
            offset={offsets[task.id]}
            onHover={onHover}
            onRelease={onRelease}
            onRemove={onRemove}
            onMove={onMove}
            spotlight={task.id === spotlightId}
            arriving={task.id === arrivingId}
            newborn={task.id === newbornId}
            onLanded={handleLanded}
            dragConstraintsRef={stageRef}
            onNearWindow={(near) => handleNearWindow(task.id, near)}
          />
        </div>
      ))}

      <form className="add" onSubmit={submit}>
        <label className="add-label" htmlFor="task-name">
          Type a task that you need to do
        </label>
        <div className="add-row">
          <textarea
            id="task-name"
            ref={nameBoxRef}
            value={name}
            onChange={onNameChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            maxLength={60}
            rows={1}
            placeholder="e.g. open a roth IRA"
            aria-label="Task that you need to do"
          />
          <div className="add-actions">
            <button type="submit" aria-label="Add task" disabled={!canAdd}>
              +
            </button>
          </div>
        </div>
      </form>

      <button
        type="button"
        className="pick-random"
        onClick={pickRandom}
        disabled={tasks.length === 0}
        aria-label="Random select"
        title="Random select"
      >
        Random select
      </button>
    </div>
  );
}
