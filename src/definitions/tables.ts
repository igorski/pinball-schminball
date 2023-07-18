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
import { ActorTypes, TriggerTarget, TriggerTypes } from "@/definitions/game";
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
        left   : 310,
        top    : 334
    },
    popper : { left: 795, top: 1360, width: 40 },
    flippers : [
        { type: ActorTypes.LEFT_FLIPPER,  left: 120, top: 580, angle: 20 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 650, top: 700, angle: -20 },

        { type: ActorTypes.LEFT_FLIPPER,  left: 270, top: 1325 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 480, top: 1325 },

        // underworld

        { type: ActorTypes.RIGHT_FLIPPER, left: 570, top: 2000 },
        { type: ActorTypes.LEFT_FLIPPER,  left: 280, top: 2270 },
    ],
    rects: [
        // outer walls
        { left: 400, top: 0, width: 800, height: 10 },
        { left: 0, top: 1220, width: 10, height: 2000 },
        { left: 805, top: 1220, width: 10, height: 2000 },

        { left: 775, top: 900, width: 70, height: 10, angle: 45 },

        // bottom left flipper area
        { left: 58,  top: 1157, width: 10, height: 138 },
        { left: 125, top: 1270, width: 165, height: 10, angle: 34 },
        // bottom right flipper area
        { left: 691, top: 1157, width: 10, height: 138 },
        { left: 625, top: 1270, width: 165, height: 10, angle: -34 },
        // bottom flipper area
        { left: 370, top: 1440, width: 5, height: 5 },

        // underworld

        { left: 700, top: 1920, width: 170, height: 10, angle: -50 },
        { left: 58,  top: 2087, width: 10, height: 138 },
        { left: 125, top: 2200, width: 165, height: 10, angle: 34 },
    ],
    bumpers: [
        { left: 605, top: 465, width: 65, height: 65 },
        { left: 505, top: 495, width: 65, height: 65 },
        { left: 585, top: 555, width: 65, height: 65 },

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
                { left: 250, top: 900, width: 24, height: 24 },
                { left: 290, top: 910, width: 24, height: 24 },
                { left: 330, top: 920, width: 24, height: 24 },
            ]
        }
    ],
}] as TableDef[];
