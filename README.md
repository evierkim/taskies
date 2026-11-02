# Taskies

The Wizard of oz prototype version.

## What the app will do in the presentation

1. Add three tasks by name and see each one appear as a creature.
2. Let one out by dragging it into the window, and see it change color as it goes.
3. Look outside and find it there.
4. See moss on a creature that is still on the wall, then let that one out too.


## Principles

1. **The sill is the next action.** The newest creature stands at the window. The others wander the stones. Adding a task sets the new one on the sill and sends the previous one walking.
2. **Release is the reward.** The good feeling people already get from crossing an item off is the whole payoff. The outdoor scene is where those creatures live afterward.
3. **A miss leaves the creature where it is.** Moss can appear. The creature can still be let out. On the way out, the moss clears and the bright color shows. Recovery looks like release.
4. **The wall stays calm.** Unfinished creatures are soot-dark. They move slowly. The page is silent. Three creatures is the scene the study uses; the wall is meant for a handful, the way a desk holds a few notes.
5. **The name stays readable.** Moss never covers the name. A forgotten task is still that task.

## The scene

Two views:

**The wall.** Stone, dim, almost empty. A small window is closed in the center. The plus sits on the sill, directly under the glass, so adding and releasing share one place. Creatures wander. One stands on the sill.

**Outside.** The same window, looked through. Freed creatures are in the landscape, each in its own bright color. A small latch marked "Wall" returns.

Nothing else is on the page (menu, counter, calendar, nor settings)

### How a creature gets out

1. The person grabs a creature and pulls it toward the window.
2. Near the glass, the window opens.
3. On drop, the creature shifts from soot-dark to its color and steps through.
4. The window closes. The wall is quiet again. The creature is gone from the stones and present outside.

The color is assigned when the creature is created, cycling through three colors, and it is hidden until release. The person does not pick a color. The color is not a grade.

### Moss

Three drawings, laid over the dark body: a few specks, then patches, then a thick coat. The face and the name stay visible. Moss is not a health bar and shows no day count.

In this prototype, moss does not grow from the clock. The facilitator sets it. Passage of days is the Wizard of Oz part. A later version can grow moss from real elapsed time if the sessions show that the drawing reads the way the team hopes.

## Wizard of Oz split

| Piece | In the presentation |
| --- | --- |
| Empty wall, window, sill, plus | Built |
| Type a name, creature appears on the sill | Built |
| Slow wandering | Built |
| Drag to the window, color change, step outside | Built |
| Look outside, and come back to the wall | Built |
| Moss stages on a chosen creature | Facilitator sets the stage during the session |
| Days passing, reminders, accounts, syncing | Not in this prototype |

Store the session in `localStorage` so a refresh keeps the same creatures, including a moss stage the facilitator already set. The saved record is only a name, a color, whether it is on the wall or outside, and a moss stage. No dates and no scores.

Stand-in shapes are fine while the scene is being built. The usability sessions need the real drawings, because the moss question is about how the drawing feels.

### Art

Will Mirra draw this part?

- One soot-dark creature, readable at about 96 pixels, with a place for a short name
- The same pose in three bright colors
- Three moss overlays that do not cover the name
- The wall, the closed window, the open window, and the outdoor landscape

Keep the style simple enough for one person to finish.

Put creature drawings in `art/taskies` and background drawings in `art/backgrounds`. The app reads copies from `src/assets` once a scene is using them.

### Facilitator control

Hover a creature on the wall and press `M`. Each press advances its moss by one stage, then clears it. The control is unlabeled. Do not mention it to participants.

## Build

Vite, React, and TypeScript. [Motion](https://motion.dev) (the `motion` package) handles grabbing a creature, opening the window, and the color shift on release. CSS handles the slow walk. Creature and moss art are SVG so the layers stack, and the name stays HTML on top of them. The wall and the landscape can be PNG. The task list is saved with `localStorage`. There is no server.

GitHub Pages hosts the static build from this repo. Vercel can host the same `dist/` folder if a preview link is easier to send to participants. Hosting is not part of the app.

A task stored in the browser has five fields and nothing else:

- `id`
- `name`
- `color`: `0`, `1`, or `2`
- `place`: `wall` or `outside`
- `moss`: `0`, `1`, `2`, or `3`

```
index.html
package.json
tsconfig.json
vite.config.ts          base: "/taskies/" for GitHub project pages
public/
art/
  taskies/              original creature drawings
  backgrounds/          wall, window, landscape
src/
  main.tsx              mounts the page
  App.tsx               wall or outdoor view, owns the task list and the M key
  types.ts              the five fields above
  storage.ts            load and save the list
  styles.css            wall, wander, window, outdoor scene
  components/
    Wall.tsx            stones, closed window, sill, plus, name field
    Taskie.tsx          creature, name, moss layers, drag
    Outdoor.tsx         landscape, freed creatures, latch back to the wall
  assets/               creature, three colors, three moss stages, wall, window, landscape
```

`npm install`, then `npm run dev`. `npm run build` writes the static page into `dist/`.

Turn drag momentum off. A creature should stop where it is dropped, so a release near the glass does not slide past the window.

Build in this order:

1. Wall, closed window, plus, name field, and a creature appearing on the sill.
2. Slow wandering for the creatures that are off the sill.
3. Drag, the window opening, the color shift, and the outdoor view with a way back.
4. Moss overlays, the `M` key, and `localStorage`.
5. Swap stand-in shapes for the finished drawings before usability sessions.
