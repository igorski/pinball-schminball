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

* underworld should be set on game and only unlocked after certain event
* pinball-table status display should flash messages on certain events
* create menu to configure audio
* implement high score mechanism
* add underworld triggers
* should we update Actor constructors to accept on-screen coordinates which are internally transformed (see actor unit test for bounds)
* add invisible loop trigger multipliers (repeated loops give more points)
* isInsideViewport check should take angle into account for rects and flippers
* Switches to toggle score multiplier ("x when lit")
* Feedback messages when trigger groups are completed
