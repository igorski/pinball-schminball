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

* physics world update needs to account for lost frames instead of advancing by single frame fps time
* trigger-renderer should render a text label or something (should be trigger opt prop)
* fix issue where flipper can rotate over its maximum axis
* isInsideViewport check should take angle into account for rects and flippers
* Implement tilt on repeated bumps
* Switches to toggle score multiplier ("x when lit")
* Multiball mode
