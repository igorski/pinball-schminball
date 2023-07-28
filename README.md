# pinball-schminball

_Pinball Schminball_ is a retro-style vertically scrolling pinball game created to showcase the
possibilities of creating a game using the open source [zCanvas library](https://github.com/igorski/zCanvas)
for graphics rendering, this time enriched by using Matter JS as a physics engine.

You can play the game directly in your browser by [navigating here](https://www.igorski.nl/application/pinball-schminball).

## Data model

In `@/definitions/game.ts` there are type definitions for all of the game's
Actors (interactive game elements) as well as how to create your own custom pinball table. See `GameDef` and `TableDef`.

The application is built using Vue, though this is only leveraged to manage basic screen
switching and application settings, keeping the game logic outside of any centralized state management.

`App.vue` maintains a (reactive) reference to an active `GameDef`, which describes the current game.
`pinball-table.vue` manages the game screen, holds a reference to the rendering zCanvas and ties
the game in with the model.

All game related code is actually managed by the Actors and `@/model/game.ts`. All graphics rendering
is managed by the Actor-specific renderers inside the `@/renderers`-folder.

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

* update Actor constructors to accept on-screen coordinates which are internally transformed (see actor unit test for bounds)
* multiballs should iteratively be added
* add one-time poppers on the areas left and right of the flippers to work only once per game
* animate bumpers on hit
* underworld should be set on game and only unlocked after certain event, add the trigger for it
* add full-screen button
* on occasion ball goes up the ramp left from the flippers < maybe fixed with higher positionIterations (up from default 6)
* ball can move back up ramp next to flipper, maybe move flipper down a tad
* keep ball within bounds (likely widen the outer walls off-screen so the collision is detected earlier)
