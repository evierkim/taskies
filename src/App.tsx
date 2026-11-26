import { useEffect, useRef, useState } from "react";
import Outdoor from "./components/Outdoor";
import Wall from "./components/Wall";
import Welcome from "./components/Welcome";
import {
  loadPositions,
  loadTasks,
  loadWelcomed,
  offsetFor,
  savePositions,
  saveTasks,
  saveWelcomed,
  type PlaceOffset,
  type PositionMap,
} from "./storage";
import type { Color, Moss, Place, Task } from "./types";

type View = "wall" | "outside";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [positions, setPositions] = useState<PositionMap>(loadPositions);
  const [view, setView] = useState<View>("wall");
  const [showWelcome, setShowWelcome] = useState(() => !loadWelcomed());
  // The wall creature the pointer is over; the facilitator's M key acts on it.
  const hoveredId = useRef<string | null>(null);

  useEffect(() => saveTasks(tasks), [tasks]);
  useEffect(() => savePositions(positions), [positions]);

  function begin() {
    saveWelcomed();
    setShowWelcome(false);
  }

  function addTask(name: string): string {
    const id = crypto.randomUUID();
    setTasks((prev) => [
      ...prev,
      {
        id,
        name,
        color: (prev.length % 3) as Color, // cycles 0, 1, 2
        place: "wall",
        moss: 0,
      },
    ]);
    return id;
  }

  function release(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, place: "outside", moss: 0 } : t)),
    );
  }

  function returnToWall(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, place: "wall" } : t)),
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setPositions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function saveOffset(id: string, place: Place, offset: PlaceOffset) {
    setPositions((prev) => ({
      ...prev,
      [id]: { ...prev[id], [place]: offset },
    }));
  }

  function advanceMoss(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && t.place === "wall"
          ? { ...t, moss: ((t.moss + 1) % 4) as Moss }
          : t,
      ),
    );
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "m" || e.target instanceof HTMLInputElement) {
        return;
      }
      if (hoveredId.current) advanceMoss(hoveredId.current);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (showWelcome) {
    return <Welcome onBegin={begin} />;
  }

  if (view === "outside") {
    return (
      <Outdoor
        tasks={tasks.filter((t) => t.place === "outside")}
        offsets={Object.fromEntries(
          tasks
            .filter((t) => t.place === "outside")
            .map((t) => [t.id, offsetFor(positions, t.id, "outside")]),
        )}
        onBack={() => setView("wall")}
        onReturn={returnToWall}
        onRemove={removeTask}
        onMove={(id, offset) => saveOffset(id, "outside", offset)}
      />
    );
  }

  return (
    <Wall
      tasks={tasks.filter((t) => t.place === "wall")}
      offsets={Object.fromEntries(
        tasks
          .filter((t) => t.place === "wall")
          .map((t) => [t.id, offsetFor(positions, t.id, "wall")]),
      )}
      onAdd={addTask}
      onRelease={release}
      onRemove={removeTask}
      onMove={(id, offset) => saveOffset(id, "wall", offset)}
      onHover={(id) => (hoveredId.current = id)}
      onLook={() => setView("outside")}
    />
  );
}
