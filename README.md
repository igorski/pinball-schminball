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

## Adding a new pinball table

Add a new `TableDef` inside `@/definitions/tables.ts`. Define all Actors and TriggerGroup behaviours there.

As for assets, each table requires an SVG shape for its main body (surrounding walls and slopes) and a PNG background (as the SVG shape wil not be visible, but used as a collision map).

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

* text overflow on high scores
