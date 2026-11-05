# Taskies

The Wizard of Oz prototype version.

## Interview summary

Across all interviews:

- People know the task but cannot start. One sat for an hour and got nothing done because they could not find a place to begin.
- No long lists. Stick with short or medium length.
- They want to see the immediate next thing to do, not the whole list of todos.
- They like crossing things off lists, even small things.
- They tend to drop apps quickly. Apps are just another place to remember to check.
- Google Calendar has everything, so it is easy, but it is not the best for long-term or undated work. Those tasks often get lost or forgotten.
- They dislike busy screens and walls of text.
- One missed deadline throws the rest of the day off. The tracking app becomes a source of stress. The feeling of failure builds and can end in an emotional shut down.
- Moss might guilt users into starting. They might turn moss reminders off if those feel too stressful.
- Rewards can help users start. The reward should not be the only reason to do a task. One person mentioned streaks. A broken streak could contribute to the failure feeling.
- They like sorting tasks by urgency, effort, and category, and highlighting what is due soon.

## Next steps for the prototype

- Focus on becoming a good place for long-term and easy-to-postpone tasks. In usability studies, ask participants to add those types of tasks.
- Keep the wall short. A handful of creatures. The newest creature waits at the window and answers "where do I start?" Any creature can be let out.
- Naming is instant and short, so the creature is quickly on the wall. First try without date, duration, importance, effort, or category, to see if users like less overwhelming info.
- Make clear in usability studies that dated work and detailed info stay in users' Google Calendars.
- The page is open and quiet: no notifications, badges, or alarms. Moss shows a task has been sitting for a bit, but does not openly announce a day count.
- The reward is letting the creature out: the window opens, the creature turns bright, and it stays outside. Finished creatures remain visible for a bit.
- Heavily test moss in usability studies to see if users feel guilt-tripped or generally stressed.
- Color does not mean anything besides telling creatures apart.

## What the app will do

1. Add three easy-to-postpone tasks by name and see each one appear as a creature.
2. Let one out by dragging it into the window, and see it change color as it goes.
3. Look outside and find it there.
4. See moss on a creature that is still on the wall, then let that one out too.

## Principles

1. **The sill is the next action.** The newest creature stands at the window. The others wander the stones. Adding a task sets the new one on the sill and sends the previous one walking. When someone cannot find a place to start, the sill is that place.
2. **Release is the reward.** Letting a creature out is the crossing-off feeling. The window opens, the creature turns bright, and it stays outside so finished work remains visible for a bit. That reward helps someone start. It is not a streak, a score, or the only reason to do the task.
3. **A miss leaves the creature where it is.** Moss can appear. The creature can still be let out. On the way out, the moss clears and the bright color shows. Sitting with a task for a long time is allowed. The page keeps no record of how long, and it does not treat that wait as failure.
4. **The wall stays short, calm, and open.** Unfinished creatures are soot-dark. They move slowly. The page is silent: no notifications, badges, or alarms. The wall holds a handful of creatures, short or medium length, never a long list. Three creatures is the scene the study uses. The page is meant to be left open.
5. **The name stays readable.** Moss never covers the name. A forgotten task is still that task.
6. **Naming is instant.** A short name puts the creature on the wall quickly. Date, duration, importance, effort, and category stay out of this first version, so the page stays less overwhelming. Dated work and detailed info stay in Google Calendar. Usability studies say that out loud.

## The scene

Two views:

**The wall.** Stone, dim, almost empty. A small window is closed in the center. The plus sits on the sill, directly under the glass, so adding and releasing share one place. Creatures wander. One stands on the sill.

**Outside.** The same window, looked through. Freed creatures are in the landscape for a bit, each in its own bright color. A small latch marked "Wall" returns. This prototype keeps them for the session so participants can look back. Whether they stay forever is not decided yet.

Nothing else is on the page: no menu, counter, calendar, labels, or settings.

### How a creature gets out

1. The person grabs a creature and pulls it toward the window.
2. Near the glass, the window opens.
3. On drop, the creature shifts from soot-dark to its color and steps through.
4. The window closes. The wall is quiet again. The creature is gone from the stones and present outside.

The color is assigned when the creature is created, cycling through three colors, and it is hidden until release. The person does not pick a color. Color only tells creatures apart.

### Moss

Three drawings, laid over the dark body: a few specks, then patches, then a thick coat. The face and the name stay visible. Moss shows a task has been sitting for a bit. It is not an alarm, not a health bar, and it shows no day count.

In this prototype, moss does not grow from the clock. The facilitator sets it. Passage of days is the Wizard of Oz part. Usability studies heavily test whether moss feels like a useful nudge, like guilt, or like stress. If it feels too stressful, soften or remove it rather than add reminders.

## Wizard of Oz split

This table is the build plan for the presentation prototype. The repo is still a skeleton. "In scope" means we will build it for the study, not that it is already coded.

| Piece | Plan |
| --- | --- |
| Empty wall, window, sill, plus | In scope |
| Type a name, creature appears on the sill | In scope |
| Slow wandering | In scope |
| Drag to the window, color change, step outside | In scope |
| Look outside, and come back to the wall | In scope |
| Moss stages on a chosen creature | In scope; facilitator sets the stage during the session |
| Days passing, reminders, accounts, syncing | Out of scope |
| Date, duration, importance, effort, category | Out of scope for this first version |
| Finished creatures staying forever | Out of scope; keep them for the session only |

Store the session in `localStorage` so a refresh keeps the same creatures, including a moss stage the facilitator already set. The saved record is only a name, a color, whether it is on the wall or outside, and a moss stage. No dates, labels, or scores.

Stand-in shapes are fine while the scene is being built. The usability sessions need the real drawings, because the moss question is about how the drawing feels.

### Art

TODO: Mirra upload her drawings to this repo.

Match the data model already in `types.ts`:

- One soot-dark Taskie with a place for a short name
- The same pose in three bright colors (`color` `0`, `1`, `2`)
- Three moss overlays that do not cover the name (`moss` `1`, `2`, `3`; `0` is no moss)
- The wall, the closed window, the open window, and the outdoor landscape

Keep the style simple enough for one person to finish.

Put creature drawings in `art/taskies` and background drawings in `art/backgrounds`. The app reads copies from `src/assets` once a scene is using them.

### Facilitator control

Hover a creature on the wall and press `M`. Each press advances its moss by one stage, then clears it. The control is unlabeled. Do not mention it to participants.

### Usability study notes

- Ask participants to add long-term or easy-to-postpone tasks, not homework or dated work.
- Say that dated work and detailed info stay in their Google Calendar.
- Record whether they understand the release gesture without instruction.
- Record whether the wall feels calm or empty at a handful of creatures.
- Record whether naming without date, duration, importance, effort, or category felt less overwhelming.
- Record whether letting a creature out felt like enough of a reward.
- Heavily test moss: does it feel like a nudge, like guilt, or like stress?

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
