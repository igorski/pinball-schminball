# pinball-schminball

A retro vertically scrolling pinball game that runs right here in your web browser.

## Data model

In `@/definitions/game.ts` there are type definitions for all of the game's
Actors (interactive game elements) as well as how to create your own custom pinball table.

## Project setup

```
npm install
```

### Development

Create a local development server with hot module reload:

```
npm run dev
```

Creating a production build (build output will reside in _./dist/_-folder):

```
npm run build
```

Running unit tests:

```
npm run test
```

Running TypeScript validation:

```
npm run typecheck
```

## TODO

* after tilt, new ball should be launched without falling (ball can tilt and keep in a fixed position)
* when ball is lost, show stats for round
* update Actor constructors to accept on-screen coordinates which are internally transformed (see actor unit test for bounds)
* multiballs should iteratively be added
* add one-time poppers on the areas left and right of the flippers to work only once per game
* animate bumpers on hit
* underworld should be set on game and only unlocked after certain event, add the trigger for it
* add full-screen button
* add invisible loop trigger multipliers (repeated loops give more points)
* Switches to toggle score multiplier ("x when lit")
* on occasion ball goes up the ramp left from the flippers < maybe fixed with higher positionIterations (up from default 6)
* ball can move back up ramp next to flipper, maybe move flipper down a tad
* keep ball within bounds (likely widen the outer walls off-screen so the collision is detected earlier)
