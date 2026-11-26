import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  type MotionValue,
} from "motion/react";
import black from "../assets/taskie-black.png";
import green from "../assets/taskie-green.png";
import pink from "../assets/taskie-pink.png";
import type { PlaceOffset } from "../storage";
import type { Task } from "../types";
import Moss from "./Moss";

// Color 2 has no drawing yet: green shifted by hue (see .color-2 in styles.css).
const BRIGHT = [pink, green, green];

type Props = {
  task: Task;
  /** Saved free-move offset for this place; restored when the view remounts. */
  offset?: PlaceOffset;
  onSill?: boolean;
  onHover?: (id: string | null) => void;
  onRelease?: (id: string) => void;
  /** Double-click removes the task entirely. */
  onRemove?: (id: string) => void;
  /** Return a freed creature to the wall (outdoor only). */
  onReturn?: (id: string) => void;
  onMove?: (id: string, offset: PlaceOffset) => void;
  spotlight?: boolean;
  /** Freshly created: start on the sill, then fall to this slot. */
  arriving?: boolean;
  /** Bright ring while dropping and briefly after landing. */
  newborn?: boolean;
  onLanded?: (id: string) => void;
  /** Stage element; drag stays inside the scene. */
  dragConstraintsRef?: RefObject<HTMLElement | null>;
  /** Fires only when near/far state changes for this creature. */
  onNearWindow?: (near: boolean) => void;
};

function nearWindow(node: HTMLElement | null): boolean {
  if (!node) return false;
  const stage = node.closest(".stage");
  const win = stage?.querySelector(".window-hit");
  if (!win) return false;
  const a = node.getBoundingClientRect();
  const b = win.getBoundingClientRect();
  const cx = a.left + a.width / 2;
  const cy = a.top + a.height / 2;
  const pad = 24;
  return (
    cx >= b.left - pad &&
    cx <= b.right + pad &&
    cy >= b.top - pad &&
    cy <= b.bottom + pad
  );
}

function sillOffset(body: HTMLElement): { x: number; y: number } {
  const stage = body.closest(".stage");
  const slot = body.closest(".slot");
  if (!stage || !slot) return { x: 0, y: 0 };
  const stageBox = stage.getBoundingClientRect();
  const slotBox = slot.getBoundingClientRect();
  const sillX = stageBox.left + stageBox.width * 0.475;
  const sillY = stageBox.top + stageBox.height * 0.58;
  const destX = slotBox.left + slotBox.width / 2;
  const destY = slotBox.bottom;
  return { x: sillX - destX, y: sillY - destY };
}

type HitBox = { left: number; right: number; top: number; bottom: number };

function hitBoxForTaskie(body: HTMLElement): HitBox | null {
  const img = body.querySelector(".taskie-img");
  const nameEl = body.querySelector(".taskie-name");
  if (!img && !nameEl) return null;

  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;

  if (img) {
    const ir = img.getBoundingClientRect();
    const cx = ir.left + ir.width / 2;
    const cy = ir.top + ir.height / 2;
    const r = Math.min(ir.width, ir.height) / 2;
    left = Math.min(left, cx - r);
    right = Math.max(right, cx + r);
    top = Math.min(top, cy - r);
    bottom = Math.max(bottom, cy + r);
  }
  if (nameEl) {
    const nr = nameEl.getBoundingClientRect();
    left = Math.min(left, nr.left);
    right = Math.max(right, nr.right);
    top = Math.min(top, nr.top);
    bottom = Math.max(bottom, nr.bottom);
  }
  return { left, right, top, bottom };
}

function overlapsBox(a: HitBox, b: DOMRect): boolean {
  return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
}

function fitsInStage(box: HitBox, stageBox: DOMRect, pad: number): boolean {
  return (
    box.left >= stageBox.left + pad &&
    box.right <= stageBox.right - pad &&
    box.top >= stageBox.top + pad &&
    box.bottom <= stageBox.bottom - pad
  );
}

/**
 * After a drop on UI, move the taskie just outside that control.
 * Picks a direction that stays on-stage so stage clamping cannot pull it back
 * under Random select (which was leaving the name behind the button).
 */
function nudgeClearOfUi(
  body: HTMLElement,
  x: MotionValue<number>,
  y: MotionValue<number>,
) {
  const stage = body.closest(".stage");
  if (!stage) return;

  const stageBox = stage.getBoundingClientRect();
  const blockers = stage.querySelectorAll(
    ".add, .pick-random, .wall-hints, .outdoor-hints",
  );
  const hit = hitBoxForTaskie(body);
  if (!hit) return;

  let dx = 0;
  let dy = 0;
  const stagePad = 8;

  for (const blocker of blockers) {
    const b = blocker.getBoundingClientRect();
    const isRandom = blocker.classList.contains("pick-random");
    const isTopHints =
      blocker.classList.contains("wall-hints") ||
      blocker.classList.contains("outdoor-hints");
    const gap = isRandom || isTopHints ? 12 : 6;
    const cur: HitBox = {
      left: hit.left + dx,
      right: hit.right + dx,
      top: hit.top + dy,
      bottom: hit.bottom + dy,
    };
    if (!overlapsBox(cur, b)) continue;

    const options = [
      { dx: b.left - gap - cur.right, dy: 0 }, // left
      { dx: b.right + gap - cur.left, dy: 0 }, // right
      { dx: 0, dy: b.top - gap - cur.bottom }, // up
      { dx: 0, dy: b.bottom + gap - cur.top }, // down
    ];

    const scored = options.map((opt) => {
      const next: HitBox = {
        left: cur.left + opt.dx,
        right: cur.right + opt.dx,
        top: cur.top + opt.dy,
        bottom: cur.bottom + opt.dy,
      };
      const dist = Math.abs(opt.dx) + Math.abs(opt.dy);
      let weight = dist;
      if (isRandom) {
        // Keep clear of the corner: prefer right, then up.
        if (opt.dx > 0) weight *= 0.7;
        else if (opt.dy < 0) weight *= 0.85;
        else weight *= 1.4;
      } else if (isTopHints) {
        // Prefer just below the instructions.
        if (opt.dy > 0) weight *= 0.65;
        else weight *= 1.35;
      } else if (opt.dy > 0) {
        weight *= 0.85; // prefer below the text box
      }
      if (!fitsInStage(next, stageBox, stagePad)) weight += 10000;
      return { opt, weight };
    });

    scored.sort((a, b) => a.weight - b.weight);
    dx += scored[0].opt.dx;
    dy += scored[0].opt.dy;
  }

  if (dx === 0 && dy === 0) return;

  x.set(x.get() + dx);
  y.set(y.get() + dy);
}

// Thin shell. Each concern lives in its own wrapper/child so people can work
// in parallel: wander (CSS on .taskie-wander), drag/release (wrap .taskie-body),
// moss (<Moss />).
export default function Taskie({
  task,
  offset,
  onSill,
  onHover,
  onRelease,
  onRemove,
  onReturn,
  onMove,
  spotlight,
  arriving,
  newborn,
  onLanded,
  dragConstraintsRef,
  onNearWindow,
}: Props) {
  const outside = task.place === "outside";
  const bodyRef = useRef<HTMLDivElement>(null);
  const wasNear = useRef(false);
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const dragControls = useDragControls();
  const x = useMotionValue(offset?.x ?? 0);
  const y = useMotionValue(offset?.y ?? 0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showBright, setShowBright] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [dropping, setDropping] = useState(Boolean(arriving));

  // Free drag on the wall and outside; release-through-window still uses wall drag.
  const canDrag = !exiting && !dropping;

  useLayoutEffect(() => {
    if (!arriving) return;
    const body = bodyRef.current;
    if (!body) return;

    let cancelled = false;
    setDropping(true);

    const offset = sillOffset(body);
    x.set(offset.x);
    y.set(offset.y);

    const ax = animate(x, 0, {
      type: "spring",
      stiffness: 280,
      damping: 14,
      mass: 1.15,
    });
    const ay = animate(y, 0, {
      type: "spring",
      stiffness: 280,
      damping: 14,
      mass: 1.15,
    });

    Promise.all([ax, ay]).then(() => {
      if (cancelled) return;
      setDropping(false);
      onMoveRef.current?.(task.id, { x: 0, y: 0 });
      onLandedRef.current?.(task.id);
    });

    return () => {
      cancelled = true;
      ax.stop();
      ay.stop();
    };
  }, [arriving, task.id, x, y]);

  function reportNear(near: boolean) {
    if (near === wasNear.current) return;
    wasNear.current = near;
    onNearWindow?.(near);
  }

  async function finishThroughWindow() {
    if (exiting || !onRelease) return;
    setExiting(true);
    setShowBright(true);
    reportNear(true);
    const body = bodyRef.current;
    await Promise.all([
      animate(y, y.get() - 36, { duration: 0.45 }),
      body
        ? animate(body, { scale: 0.55, opacity: 0.85 }, { duration: 0.45 })
        : Promise.resolve(),
    ]);
    onRelease(task.id);
    reportNear(false);
  }

  return (
    <div
      className={[
        "taskie-wander",
        onSill ? "on-sill" : "",
        dragging ? "dragging" : "",
        exiting ? "exiting" : "",
        dropping ? "dropping" : "",
        spotlight ? "spotlight" : "",
        newborn ? "newborn" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerEnter={() => {
        setHovered(true);
        onHover?.(task.id);
      }}
      onPointerLeave={() => {
        setHovered(false);
        onHover?.(null);
      }}
    >
      {/* Drag only from the circle (sprite) or the name box, not the empty frame. */}
      <motion.div
        ref={bodyRef}
        className="taskie-body"
        style={{ x, y }}
        drag={canDrag}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={dragConstraintsRef}
        dragMomentum={false}
        dragElastic={0}
        onDoubleClick={() => {
          if (!canDrag || !onRemove) return;
          onRemove(task.id);
        }}
        onDragStart={() => setDragging(true)}
        onDrag={() => {
          if (!outside && onRelease) reportNear(nearWindow(bodyRef.current));
        }}
        onDragEnd={async () => {
          setDragging(false);
          if (!outside && onRelease && nearWindow(bodyRef.current)) {
            await finishThroughWindow();
            return;
          }
          if (!outside) reportNear(false);
          if (bodyRef.current) nudgeClearOfUi(bodyRef.current, x, y);
          onMove?.(task.id, { x: x.get(), y: y.get() });
        }}
      >
        <img
          className={`taskie-img ${outside || showBright ? `color-${task.color}` : ""}`}
          src={outside || showBright ? BRIGHT[task.color] : black}
          alt=""
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            if (!canDrag || e.button !== 0) return;
            // Brave/Chrome otherwise start a native image drag and cancel Motion.
            e.preventDefault();
            dragControls.start(e);
          }}
        />
        <Moss stage={showBright ? 0 : task.moss} />
        <span
          className="taskie-name"
          onPointerDown={(e) => {
            if (!canDrag || e.button !== 0) return;
            e.preventDefault();
            dragControls.start(e);
          }}
        >
          {task.name}
        </span>
        {spotlight && !dragging && (
          <div className="complete-popup" aria-live="polite">
            Complete this task!
          </div>
        )}
        {/* Inside the dragged body so the button follows free moves. */}
        {outside && onReturn && hovered && !dragging && (
          <button
            type="button"
            className="return-hint"
            onPointerDown={(e) => {
              // Keep the click; do not start a drag from the button.
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onReturn(task.id);
            }}
          >
            Move back to Wall
          </button>
        )}
      </motion.div>
    </div>
  );
}
