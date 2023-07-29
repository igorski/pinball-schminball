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
import { ActorTypes, TriggerTarget, TriggerTypes, GameMessages } from "@/definitions/game";
import type { FlipperType, FlipperDef, ObjectDef, TriggerDef, TableDef } from "@/definitions/game";

const SPRITE_PATH = "./assets/sprites/";

export default [{
    soundtrackId: "1566338341",
    width      : 800,
    height     : 2441,
    underworld : 1441,
    background : `${SPRITE_PATH}/table1_background.png`,
    body : {
        source : `${SPRITE_PATH}/table1_shape.svg`,
        left   : 299,
        top    : 376
    },
    popper : { left: 780, top: 1380, width: 40 },
    flippers : [
        { type: ActorTypes.LEFT_FLIPPER,  left: 120, top: 575, angle: 20 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 650, top: 700, angle: -20 },

        { type: ActorTypes.LEFT_FLIPPER,  left: 270, top: 1335 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 480, top: 1335 },

        // underworld

        { type: ActorTypes.RIGHT_FLIPPER, left: 570, top: 2000 },
        { type: ActorTypes.LEFT_FLIPPER,  left: 280, top: 2270 },
    ],
    reflectors: [
        { source: `${SPRITE_PATH}/table1_reflector_left.svg`, left: 170, top: 1175 },
        { source: `${SPRITE_PATH}/table1_reflector_right.svg`, left: 592, top: 1175 },
    ],
    rects: [
        // top
        { left: 400, top: 175, width: 25, height: 75, radius: 15 },
        { left: 470, top: 185, width: 25, height: 75, radius: 15 },
        { left: 540, top: 175, width: 25, height: 75, radius: 15 },

        // outer walls
        { left: 400, top: -10, width: 800, height: 50 },
        { left: -20, top: 1220, width: 50, height: 2000 },
        { left: 819, top: 1220, width: 50, height: 2000 },

        { left: 775, top: 900, width: 70, height: 10, angle: 45 },

        // reflectors
        // { left: 191, top: 1175, width: 160, height: 10, angle: 62, bounce: true },
        // { left: 570, top: 1175, width: 160, height: 10, angle: -62, bounce: true },

        // bottom left flipper area
        { left: 58,  top: 1168, width: 10, height: 145 },
        { left: 127, top: 1283, width: 170, height: 10, angle: 34 },
        // bottom right flipper area
        { left: 691, top: 1168, width: 10, height: 145 },
        { left: 622, top: 1283, width: 170, height: 10, angle: -34 },
        // bottom flipper area
        { left: 370, top: 1440, width: 5, height: 5 },

        // underworld

        { left: 700, top: 1920, width: 170, height: 10, angle: -50 },
        { left: 58,  top: 2087, width: 10, height: 138 },
        { left: 125, top: 2200, width: 165, height: 10, angle: 34 },
    ],
    bumpers: [
        { left: 375, top: 365, width: 65, height: 65 },
        { left: 480, top: 330, width: 65, height: 65 },
        { left: 458, top: 435, width: 65, height: 65 },

        // underworld

        { left: 250, top: 1900, width: 70, height: 70 },
        { left: 350, top: 1900, width: 70, height: 70 },
        { left: 300, top: 1970, width: 80, height: 80 },
        { left: 530, top: 2290, width: 60, height: 60 },
    ],
    triggerGroups: [
        {
            target: TriggerTarget.MULTIBALL,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 355, top: 140, width: 24, height: 24, sensor: true },
                { left: 425, top: 140, width: 24, height: 24, sensor: true },
                { left: 490, top: 140, width: 24, height: 24, sensor: true },
                { left: 560, top: 140, width: 24, height: 24, sensor: true },
            ]
        },
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 320, top: 765, width: 24, height: 24 },
                { left: 430, top: 765, width: 24, height: 24 },
                { left: 375, top: 810, width: 24, height: 24 },
            ]
        },
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 25, top: 705, width: 24, height: 24 },
                { left: 35, top: 750, width: 24, height: 24 },
                { left: 60, top: 795, width: 24, height: 24 },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 95, top: 505, width: 20, height: 20, sensor: true },
                { left: 65, top: 305, width: 20, height: 20, sensor: true  },
                { left: 150, top: 125, width: 20, height: 20, sensor: true  },
                { left: 295, top: 50, width: 20, height: 20, sensor: true  },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 195, top: 505, width: 20, height: 20, sensor: true },
                { left: 140, top: 305, width: 20, height: 20, sensor: true  },
                { left: 245, top: 90, width: 20, height: 20, sensor: true  },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.TRICK_SHOT,
            triggers: [
                { left: 355, top: 455, width: 20, height: 20, sensor: true  },
                { left: 295, top: 340, width: 20, height: 20, sensor: true  },
                { left: 280, top: 250, width: 20, height: 20, sensor: true  },
            ]
        }
    ],
}] as TableDef[];
