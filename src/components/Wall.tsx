import { useState } from "react";
import closedWall from "../assets/background-closed.png";
import type { Task } from "../types";
import Taskie from "./Taskie";

type Props = {
  tasks: Task[]; // wall creatures only; the last one stands on the sill
  onAdd: (name: string) => void;
  onRelease: (id: string) => void;
  onHover: (id: string | null) => void;
  onLook: () => void;
};

export default function Wall({ tasks, onAdd, onRelease, onHover, onLook }: Props) {
  const [name, setName] = useState("");
  const sillId = tasks.at(-1)?.id;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  }

  return (
    <div className="stage" style={{ backgroundImage: `url(${closedWall})` }}>
      {/* TODO(window): open/close the window while a creature is dragged near */}
      <button className="window-hit" onClick={onLook} aria-label="Look outside" />

      {tasks.map((task, i) => (
        <div key={task.id} className={`slot ${task.id === sillId ? "slot-sill" : `slot-${i % 4}`}`}>
          <Taskie
            task={task}
            onSill={task.id === sillId}
            onHover={onHover}
            onRelease={onRelease}
          />
        </div>
      ))}

      <form className="add" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="name it"
          aria-label="Task name"
        />
        <button type="submit" aria-label="Add">+</button>
      </form>
    </div>
  );
}
