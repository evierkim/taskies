import type { Task } from "../types";
import Taskie from "./Taskie";

type Props = {
  tasks: Task[]; // freed creatures only
  onBack: () => void;
};

// TODO: swap the gradient for the outdoor landscape drawing.
export default function Outdoor({ tasks, onBack }: Props) {
  return (
    <div className="stage outdoor">
      {tasks.map((task, i) => (
        <div key={task.id} className={`slot slot-out-${i % 4}`}>
          <Taskie task={task} />
        </div>
      ))}
      <button className="latch" onClick={onBack}>Wall</button>
    </div>
  );
}
