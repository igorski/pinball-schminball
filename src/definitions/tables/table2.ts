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

const SPRITE_PATH = "./assets/sprites/table2/";

export default
{
    name : "Rollerball",
    soundtrackId: "1566338341",
    width      : 800,
    height     : 2290,
    background : `${SPRITE_PATH}table2_background.png`,
    body : {
        source : `${SPRITE_PATH}table2_shape.svg`,
        left   : 50,
        top    : -125,
        width  : 800,
        height : 2290,
    },
    poppers: [
        // the ball launcher

        { left: 746, top: 544, width: 40, height: 1 },

        { left: 400, top: 1100, width: 250, height: 1, opts: { direction: ImpulseDirection.LEFT, force: 20 } },
    ],
    flippers: [
        // top flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 214, top: 465 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 429, top: 465 },

        // second set from the top

        { type: ActorTypes.LEFT_FLIPPER,  left: 216, top: 976 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 429, top: 976 },

        // second set from the bottom

        { type: ActorTypes.LEFT_FLIPPER,  left: 240, top: 1476 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 464, top: 1476 },

        // bottom flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 196, top: 2180, angle: -10 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 420, top: 2180, angle: 10 },
    ],
    reflectors: [],
    rects: [
        // outer walls
        { left: 0, top: -30, width: 800, height: 50,  visible: false },
        { left: -44, top: 0, width: 50, height: 2290, visible: false },
        { left: 794, top: 0, width: 50, height: 2290, visible: false },

        // top

        { left: 128, top: 108, width: 25, height: 75, radius: 15 },
        { left: 198, top: 108, width: 25, height: 75, radius: 15 },
        { left: 268, top: 108, width: 25, height: 75, radius: 15 },

        { left: 102, top: 370, width: 10,  height: 45 },
        { left: 102, top: 405, width: 110, height: 10, angle: 30 },
        { left: 657, top: 370, width: 10,  height: 45 },
        { left: 567, top: 405, width: 110, height: 10, angle: -30 },

        { left: 635, top: 165, width: 10, height: 50 },
        { left: 605, top: 210, width: 10, height: 50, angle: 40 },

        // second from top

        { left: 102, top: 900, width: 10,  height: 45 },
        { left: 102, top: 935, width: 110, height: 10, angle: 30 },

        { left: 573, top: 935, width: 110, height: 10, angle: -30 },

        // bottom flipper area

        { left: 85, top: 2104, width: 10,  height: 45 },
        { left: 85, top: 2141, width: 110, height: 10, angle: 30 },

        { left: 658, top: 2104, width: 10,  height: 45 },
        { left: 568, top: 2141, width: 110, height: 10, angle: -30 },
    ],
    bumpers: [
        { left: 450, top: 136, width: 65, height: 65 },
        { left: 148, top: 218, width: 65, height: 65 },

        { left: 148, top: 684, width: 65, height: 65 },
        { left: 486, top: 684, width: 65, height: 65 },

        { left: 412, top: 1200, width: 65, height: 65 },
        { left: 486, top: 684,  width: 65, height: 65 },

        { left: 114, top: 1828, width: 65, height: 65 },
        { left: 298, top: 1802, width: 65, height: 65 },
    ],
    triggerGroups: [
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 78,  top: 123, width: 24, height: 24, sensor: true },
                { left: 153, top: 123, width: 24, height: 24, sensor: true },
                { left: 223, top: 123, width: 24, height: 24, sensor: true },
            ]
        },
    ]
} as TableDef;
