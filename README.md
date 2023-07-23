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
* underworld should be set on game and only unlocked after certain event, add the trigger for it
* add full-screen button
* should we update Actor constructors to accept on-screen coordinates which are internally transformed (see actor unit test for bounds)
* add invisible loop trigger multipliers (repeated loops give more points)
* isInsideViewport check should take angle into account for rects and flippers
* Switches to toggle score multiplier ("x when lit")
* on occasion ball goes up the ramp left from the flippers
