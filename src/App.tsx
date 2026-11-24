import { useEffect, useRef, useState } from "react";
import Outdoor from "./components/Outdoor";
import Wall from "./components/Wall";
import { loadTasks, saveTasks } from "./storage";
import type { Color, Moss, Task } from "./types";

type View = "wall" | "outside";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [view, setView] = useState<View>("wall");
  // The wall creature the pointer is over; the facilitator's M key acts on it.
  const hoveredId = useRef<string | null>(null);

  useEffect(() => saveTasks(tasks), [tasks]);

  function addTask(name: string) {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        color: (prev.length % 3) as Color, // cycles 0, 1, 2
        place: "wall",
        moss: 0,
      },
    ]);
  }

  function release(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, place: "outside", moss: 0 } : t)),
    );
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

  if (view === "outside") {
    return (
      <Outdoor
        tasks={tasks.filter((t) => t.place === "outside")}
        onBack={() => setView("wall")}
      />
    );
  }

  return (
    <Wall
      tasks={tasks.filter((t) => t.place === "wall")}
      onAdd={addTask}
      onRelease={release}
      onHover={(id) => (hoveredId.current = id)}
      onLook={() => setView("outside")}
    />
  );
}
