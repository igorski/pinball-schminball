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
        left   : -101,
        top    : -845,
        width  : 800,
        height : 2441,
    },
    popper : { left: 744, top: 1387, width: 40 },
    flippers : [
        { type: ActorTypes.LEFT_FLIPPER,  left: 54, top: 533, angle: 20 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 582, top: 650, angle: -20 },

        { type: ActorTypes.LEFT_FLIPPER,  left: 220, top: 1320 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 410, top: 1320 },

        // underworld

        { type: ActorTypes.RIGHT_FLIPPER, left: 570, top: 2000 },
        { type: ActorTypes.LEFT_FLIPPER,  left: 280, top: 2270 },
    ],
    reflectors: [
        { source: `${SPRITE_PATH}/table1_reflector_left.svg`,  left: 117, top: 1089, width: 106, height: 171 },
        { source: `${SPRITE_PATH}/table1_reflector_right.svg`, left: 539, top: 1089, width: 106, height: 171 },
    ],
    rects: [
        // top
        { left: 388, top: 138, width: 25, height: 75, radius: 15 },
        { left: 458, top: 148, width: 25, height: 75, radius: 15 },
        { left: 528, top: 138, width: 25, height: 75, radius: 15 },

        // outer walls
        { left: 0, top: -50, width: 800, height: 50 },
        { left: -50, top: 0, width: 50, height: 2000 },
        { left: 800, top: 0, width: 50, height: 2000 },

        { left: 744, top: 930, width: 70, height: 10, angle: 45 },

        // reflectors
        // { left: 191, top: 1175, width: 160, height: 10, angle: 62, bounce: true },
        // { left: 570, top: 1175, width: 160, height: 10, angle: -62, bounce: true },

        // bottom left flipper area
        { left: 62, top: 1097, width: 10, height: 145 },
        { left: 62, top: 1233, width: 170, height: 10, angle: 34 },
        // bottom right flipper area
        { left: 688, top: 1097, width: 10, height: 145 },
        { left: 552, top: 1233, width: 170, height: 10, angle: -34 },
        // bottom flipper area
        { left: 375, top: 1438, width: 5, height: 5 },

        // underworld

        { left: 700, top: 1920, width: 170, height: 10, angle: -50 },
        { left: 58,  top: 2087, width: 10, height: 138 },
        { left: 125, top: 2200, width: 165, height: 10, angle: 34 },
    ],
    bumpers: [
        { left: 343, top: 333, width: 65, height: 65 },
        { left: 448, top: 298, width: 65, height: 65 },
        { left: 426, top: 403, width: 65, height: 65 },

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
                { left: 343, top: 128, width: 24, height: 24, sensor: true },
                { left: 413, top: 128, width: 24, height: 24, sensor: true },
                { left: 478, top: 128, width: 24, height: 24, sensor: true },
                { left: 548, top: 128, width: 24, height: 24, sensor: true },
            ]
        },
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 308, top: 753, width: 24, height: 24 },
                { left: 418, top: 753, width: 24, height: 24 },
                { left: 363, top: 798, width: 24, height: 24 },
            ]
        },
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 13, top: 693, width: 24, height: 24 },
                { left: 23, top: 738, width: 24, height: 24 },
                { left: 48, top: 783, width: 24, height: 24 },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 85, top: 495, width: 20, height: 20, sensor: true },
                { left: 55, top: 295, width: 20, height: 20, sensor: true  },
                { left: 130, top: 115, width: 20, height: 20, sensor: true  },
                { left: 285, top: 40, width: 20, height: 20, sensor: true  },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 185, top: 495, width: 20, height: 20, sensor: true },
                { left: 130, top: 295, width: 20, height: 20, sensor: true  },
                { left: 235, top: 80, width: 20, height: 20, sensor: true  },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.TRICK_SHOT,
            triggers: [
                { left: 345, top: 445, width: 20, height: 20, sensor: true  },
                { left: 285, top: 330, width: 20, height: 20, sensor: true  },
                { left: 270, top: 240, width: 20, height: 20, sensor: true  },
            ]
        }
    ],
}] as TableDef[];
