import type { Place, Task } from "./types";

const KEY = "taskies.session";
const WELCOME_KEY = "taskies.welcomed";
const POS_KEY = "taskies.positions";

export type PlaceOffset = { x: number; y: number };

/** Drag offsets per task, kept separately for wall and outside. */
export type PositionMap = Record<
  string,
  { wall?: PlaceOffset; outside?: PlaceOffset }
>;

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    // storage unavailable: the session just won't survive a refresh
  }
}

export function loadWelcomed(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveWelcomed(): void {
  try {
    localStorage.setItem(WELCOME_KEY, "1");
  } catch {
    // storage unavailable: welcome may show again next visit
  }
}

export function loadPositions(): PositionMap {
  try {
    const raw = localStorage.getItem(POS_KEY);
    return raw ? (JSON.parse(raw) as PositionMap) : {};
  } catch {
    return {};
  }
}

export function savePositions(positions: PositionMap): void {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(positions));
  } catch {
    // storage unavailable: moved spots may reset on refresh
  }
}

export function offsetFor(
  positions: PositionMap,
  id: string,
  place: Place,
): PlaceOffset {
  return positions[id]?.[place] ?? { x: 0, y: 0 };
}
