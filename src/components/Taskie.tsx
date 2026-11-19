import black from "../assets/taskie-black.png";
import green from "../assets/taskie-green.png";
import pink from "../assets/taskie-pink.png";
import type { Task } from "../types";
import Moss from "./Moss";

// Color 2 has no drawing yet: green shifted by hue (see .color-2 in styles.css).
const BRIGHT = [pink, green, green];

type Props = {
  task: Task;
  onSill?: boolean;
  onHover?: (id: string | null) => void;
  onRelease?: (id: string) => void;
};

// Thin shell. Each concern lives in its own wrapper/child so people can work
// in parallel: wander (CSS on .taskie-wander), drag/release (wrap .taskie-body),
// moss (<Moss />).
export default function Taskie({ task, onSill, onHover, onRelease }: Props) {
  const outside = task.place === "outside";
  return (
    <div
      className={`taskie-wander ${onSill ? "on-sill" : ""}`}
      onPointerEnter={() => onHover?.(task.id)}
      onPointerLeave={() => onHover?.(null)}
    >
      {/* TODO(drag): replace this double-click with the drag-to-window gesture */}
      <div
        className="taskie-body"
        onDoubleClick={() => onRelease?.(task.id)}
      >
        <img
          className={`taskie-img ${outside ? `color-${task.color}` : ""}`}
          src={outside ? BRIGHT[task.color] : black}
          alt=""
          draggable={false}
        />
        <Moss stage={task.moss} />
        <span className="taskie-name">{task.name}</span>
      </div>
    </div>
  );
}
