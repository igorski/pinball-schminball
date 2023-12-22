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

// TODO
const SPRITE_PATH = "./assets/sprites/table1/";

export default
{
    name : "Cyborgirl",
    soundtrackId: "1566338341",
    width      : 800,
    height     : 2290,
    background : `${SPRITE_PATH}background.png`,
    body : {
        source : `${SPRITE_PATH}shape.svg`,
        left   : 48,
        top    : -122,
        width  : 800,
        height : 2290,
    },
    poppers: [
        // the ball launcher

        { left: 600, top: 544, width: 40, height: 1, opts: { force: 21, direction: ImpulseDirection.LEFT } },
    ],
    flippers: [
        { type: ActorTypes.LEFT_FLIPPER,  left: 210, top: 975, angle: -12 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 430, top: 975, angle: 10 },
    ],
    reflectors: [],
    rects: [
        // outer walls

        { left: 0,   top: -25, width: 800, height: 50,   visible: false },
        { left: -15, top: 0,   width: 50,  height: 2290, visible: false },
        { left: 780, top: 0,   width: 50,  height: 2290, visible: false },

        { left: 85, top: 2104, width: 10,  height: 45 },
        { left: 85, top: 2141, width: 110, height: 10, angle: 30 },
        { left: 650, top: 2044, width: 10,  height: 45 },
        { left: 568, top: 2121, width: 155, height: 10, angle: -26 },
    ],
    bumpers: [
    ],
    triggerGroups: [
    ]
} as TableDef;
