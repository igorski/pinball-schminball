/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2023 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { Rectangle } from "zcanvas";

export const BALL_WIDTH  = 40;
export const BALL_HEIGHT = BALL_WIDTH;

// physics configuration

export const GRAVITY       = 0.75;
export const FLIPPER_FORCE = 0.002;
export const LAUNCH_SPEED  = 28;
export const MAX_SPEED     = 45;

// the table will tilt when more than MAX_BUMPS have occurred
// before each bumps BUMP_TIMEOUT has passed

export const MAX_BUMPS    = 5;
export const BUMP_IMPULSE = 4;
export const BUMP_TIMEOUT = 2500;

export const AwardablePoints = {
    BUMPER: 100,
    TRIGGER: 50,
    TRIGGER_GROUP_COMPLETE: 500,
};

/**
 * All the different Actors inside a game
 */
export enum ActorTypes {
    CIRCULAR,
    RECTANGULAR,
    LEFT_FLIPPER,
    RIGHT_FLIPPER,
    TRIGGER,
};

export enum ActorLabels {
    BALL            = "ball",
    POPPER          = "popper",
    BUMPER          = "bumper",
    TRIGGER         = "trigger",
    TRIGGER_GROUP   = "trigger-group"
};

/**
 * Runtime properties of an active game
 * @see pinball-table.vue, model/game.ts
 */
export type GameDef = {
    active: boolean;
    table: number;
    score: number;
    balls: number;
    multiplier: number;
};

export type FlipperType = ActorTypes.LEFT_FLIPPER | ActorTypes.RIGHT_FLIPPER;
export type FlipperDef = {
    type: FlipperType;
    left: number;
    top: number;
};

/**
 * An ObjectDef is the serialized version of an Actor (where the actor
 * type is inferred from the parent property, see TableDef) it basically
 * describes the position and dimensions of an Actor relative to its Table
 */
export type ObjectDef = Rectangle & {
    angle?: number;
    radius?: number;
    sensor?: boolean; // detects collision but does not reflect balls
};

/**
 * Triggers are Actors that belong to a group. Depending on the trigger type, how
 * you hit each of these Actors can result in an action happening in the game, like
 * getting a bonus.
 */
export enum TriggerTarget {
    MULTIPLIER,
    MULTIBALL,
};

/**
 * The types of triggers.
 * Bool -> all Actors in the Trigger group must be hit for the action to happen
 * Series -> all Actors in the Trigger group must be hit in succession (within
 * a TRIGGER_EXPIRY grace period) for the action to happen
 */
export enum TriggerTypes {
    BOOL,
    SERIES,
};

/**
 * The amount of milliseconds that are allowed to pass before the active triggers
 * within a not-fully activated Trigger group expire
 */
export const TRIGGER_EXPIRY = 5000;

export type TriggerDef = {
    target: TriggerTarget;
    type: TriggerTypes;
    triggers: ObjectDef[];
};

/**
 * The data model for a pinball table, it combines all
 * of the definitions above to define the table contents and "game world".
 */
export type TableDef = {
    soundtrackId: string;
    width: number;
    height: number;
    underworld: number; // at which y coordinate the "underworld"-section starts
    background: string,
    body: {
        source: string;
        left: number;
        top: number;
    },
    popper: { left: number, top: number, width: number };
    flippers: FlipperDef[];
    rects: ObjectDef[];
    bumpers: ObjectDef[];
    triggerGroups: TriggerDef[];
};
