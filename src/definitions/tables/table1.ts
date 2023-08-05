/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2023 - https://www.igorski.nl
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
import {
    LAUNCH_SPEED, ActorTypes, TriggerTarget, TriggerTypes, GameMessages, ImpulseDirection
} from "@/definitions/game";
import type { FlipperType, FlipperDef, ObjectDef, TriggerDef, TableDef } from "@/definitions/game";

const SPRITE_PATH = "./assets/sprites/table1/";

// TODO : create table selection screen
export const START_TABLE_INDEX = 1;

export default {
    name : "Endless August",
    soundtrackId: "1566338341",
    width      : 800,
    height     : 2441,
    underworld : 1441,
    background : `${SPRITE_PATH}background.png`,
    body : {
        source : `${SPRITE_PATH}shape.svg`,
        left   : -101,
        top    : -845,
        width  : 800,
        height : 2441,
    },
    poppers : [
        // the ball launcher

        { left: 750, top: 1380, width: 40, height: 1 },

        // "lucky" one-time safe mechanism on either side of the bottom flippers

        { left: 18,  top: 1282, width: 40, height: 1, opts: { once: true } },
        { left: 703, top: 1282, width: 40, height: 1, opts: { once: true } },

        // horizontal pushes when ball falls in lane leading to bottom flippers (otherwise gets stuck at low speeds)

        { left: 75,  top: 1225, width: 20, height: 1,  opts: { direction: ImpulseDirection.DOWN_RIGHT, force: 4.5 } },
        { left: 190, top: 1300, width: 30, height: 10, opts: { direction: ImpulseDirection.DOWN_RIGHT, force: 3 } },
        { left: 540, top: 1300, width: 10, height: 10, opts: { direction: ImpulseDirection.DOWN_LEFT,  force: 1 } },

        // reflectors
        { left: 150, top: 1090, width: 160, height: 10, angle: 62,  opts: { direction: ImpulseDirection.UP_RIGHT, force: 7 } },
        { left: 528, top: 1090, width: 160, height: 10, angle: -62, opts: { direction: ImpulseDirection.UP_LEFT,  force: 7 } },
    ],
    flippers : [
        // top flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 54, top: 533, angle: 20 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 572, top: 650, angle: -20 },

        // bottom flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 215, top: 1305 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 410, top: 1305 },

        // "underworld" flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 215, top: 2280 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 530, top: 2075 },
    ],
    reflectors: [
        { source: `${SPRITE_PATH}reflector_left.svg`,  left: 117, top: 1079, width: 106, height: 171 },
        { source: `${SPRITE_PATH}reflector_right.svg`, left: 539, top: 1079, width: 106, height: 171 },
    ],
    rects: [
        // top
        { left: 388, top: 138, width: 25, height: 75, radius: 15 },
        { left: 458, top: 148, width: 25, height: 75, radius: 15 },
        { left: 528, top: 138, width: 25, height: 75, radius: 15 },

        // outer walls
        { left: 0, top: -30, width: 800, height: 50,  visible: false },
        { left: -44, top: 0, width: 50, height: 1930, visible: false },
        { left: 794, top: 0, width: 50, height: 1930, visible: false },

        { left: 754, top: 895, width: 50, height: 10, angle: -45, visible: false },
        { left: 754, top: 930, width: 50, height: 10, angle: 45 },

        // bottom left flipper area

        { left: 62, top: 1097, width: 10, height: 130 },
        { left: 62, top: 1218, width: 170, height: 10, angle: 34 },

        // bottom right flipper area

        { left: 688, top: 1097, width: 10, height: 130 },
        { left: 552, top: 1218, width: 170, height: 10, angle: -34 },

        // bottom flipper area

        { left: 375, top: 1438, width: 5, height: 5 },

        // underworld

        { left: 670, top: 1920, width: 200, height: 10, angle: -50 },
        { left: 58,  top: 2087, width: 10, height: 115 },
        { left: 58,  top: 2193, width: 170, height: 10, angle: 34 },
    ],
    bumpers: [
        { left: 343, top: 333, width: 65, height: 65 },
        { left: 448, top: 298, width: 65, height: 65 },
        { left: 426, top: 403, width: 65, height: 65 },

        // underworld

        { left: 190, top: 1810, width: 65, height: 65 },
        { left: 300, top: 1770, width: 65, height: 65 },
        { left: 270, top: 1880, width: 65, height: 65 },

        { left: 530, top: 2280, width: 55, height: 55 },
        { left: 440, top: 2325, width: 65, height: 65 },
    ],
    triggerGroups: [
        {
            target: TriggerTarget.MULTIBALL,
            type: TriggerTypes.BOOL,
            roundRobin: true,
            triggers: [
                { left: 343, top: 128, width: 24, height: 24, sensor: true },
                { left: 413, top: 128, width: 24, height: 24, sensor: true },
                { left: 478, top: 128, width: 24, height: 24, sensor: true },
                { left: 548, top: 128, width: 24, height: 24, sensor: true },
            ]
        },
        {
            target: TriggerTarget.UNDERWORLD,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 370, top: 715, width: 15, height: 15, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            roundRobin: true,
            triggers: [
                { left: 308, top: 753, width: 24, height: 24 },
                { left: 418, top: 753, width: 24, height: 24 },
                { left: 363, top: 798, width: 24, height: 24 },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 85,  top: 495, width: 20, height: 20, sensor: true, visible: false },
                { left: 55,  top: 295, width: 20, height: 20, sensor: true, visible: false },
                { left: 130, top: 115, width: 20, height: 20, sensor: true, visible: false },
                { left: 285, top: 40,  width: 20, height: 20, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 185, top: 495, width: 20, height: 20, sensor: true, visible: false },
                { left: 130, top: 295, width: 20, height: 20, sensor: true, visible: false },
                { left: 235, top: 80,  width: 20, height: 20, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.TRICK_SHOT,
            triggers: [
                { left: 345, top: 445, width: 20, height: 20, sensor: true, visible: false },
                { left: 285, top: 330, width: 20, height: 20, sensor: true, visible: false },
                { left: 270, top: 240, width: 20, height: 20, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.BOOL,
            message: GameMessages.GROUP_COMPLETE,
            triggers: [
                { left: 20,  top: 636, width: 20, height: 20, sensor: true, visible: false },
                { left: 745, top: 705, width: 20, height: 20, sensor: true, visible: false },
            ]
        }
    ],
} as TableDef;
