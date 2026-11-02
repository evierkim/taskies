export type Color = 0 | 1 | 2;

export type Place = "wall" | "outside";

export type Moss = 0 | 1 | 2 | 3;

export type Task = {
  id: string;
  name: string;
  color: Color;
  place: Place;
  moss: Moss;
};
