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

        { left: 740, top: 544, width: 40, height: 1, opts: { force: 21 } },

        // left push below second flippers from the top (to force player down lowest area)

        { left: 340, top: 1120, width: 250, height: 1, opts: { direction: ImpulseDirection.LEFT, force: 12 } },

        // right push below second flippers from the top (to get back from lower area)

        { left: 50,  top: 1040, width: 100, height: 1, opts: { direction: ImpulseDirection.RIGHT, force: 20 } },

        // top left push between second and last flippers from the bottom (to get into second area from the bottom)
        { left: 660, top: 1650, width: 35, height: 1, opts: { direction: ImpulseDirection.UP, force: 20 } },

        // "lucky" one-time safe mechanism by the left bottom flipper

        { left: 45, top: 2180, width: 40, height: 1, opts: { once: true } },
    ],
    flippers: [
        // top flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 225, top: 455, angle: -10 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 405, top: 455, angle: 10 },

        // second set from the top

        { type: ActorTypes.LEFT_FLIPPER,  left: 210, top: 975, angle: -12 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 430, top: 975, angle: 10 },

        // second set from the bottom

        { type: ActorTypes.LEFT_FLIPPER,  left: 160, top: 1576, angle: -8 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 300, top: 1576, angle: 8 },

        // bottom flippers

        { type: ActorTypes.LEFT_FLIPPER,  left: 186, top: 2180, angle: -14 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 430, top: 2175, angle: 12 },
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

        // { left: 117, top: 370, width: 10,  height: 45 },
        { left: 117, top: 405, width: 110, height: 10, angle: 30 },
        { left: 207, top: 460, width: 10,  height: 105 },
        { left: 207, top: 557, width: 152, height: 10, angle: 37 },

        { left: 550, top: 405, width: 115, height: 10, angle: -30 },
        { left: 550, top: 460, width: 10,  height: 105 },
        { left: 433, top: 557, width: 152, height: 10, angle: -37 },

        { left: 635, top: 165, width: 10, height: 50 },
        { left: 605, top: 210, width: 10, height: 50, angle: 40 },

        // second from top

        { left: 102, top: 900, width: 10,  height: 45 },
        { left: 102, top: 935, width: 110, height: 10, angle: 30 },

        { left: 573, top: 935, width: 110, height: 10, angle: -30 },

        { left: 175, top: 1222, width: 85, height: 20, visible: false },
        { left: 175, top: 1220, width: 30, height: 120, angle: -39, visible: false },
        { left: 240, top: 1220, width: 30, height: 100, angle: -50, visible: false },
        { left: 310, top: 1280, width: 30, height: 55, angle: -32, visible: false },
        { left: 258, top: 1325, width: 115, height: 15, visible: false },

        { left: 450, top: 1520, width: 160, height: 30, angle: -23, visible: false },
        { left: 576, top: 1524, width: 30, height: 70, angle: -29, visible: false },
        { left: 610, top: 1584, width: 30, height: 55, visible: false },
        { left: 372, top: 1684, width: 30, height: 55, visible: false },
        { left: 450, top: 1584, width: 30, height: 65, visible: false },
        { left: 465, top: 1610, width: 195, height: 30, angle: -35, visible: false },
        { left: 405, top: 1718, width: 70, height: 30, visible: false },

        // bottom

        { left: 560, top: 1880, width: 50, height: 10 },
        { left: 605, top: 1880, width: 40, height: 10, angle: 45 },
        { left: 560, top: 1880, width: 10, height: 100 },

        { left: 85, top: 2104, width: 10,  height: 45 },
        { left: 85, top: 2141, width: 110, height: 10, angle: 30 },
        { left: 650, top: 2044, width: 10,  height: 45 },
        { left: 568, top: 2121, width: 155, height: 10, angle: -26 },
    ],
    bumpers: [
        { left: 450, top: 136, width: 65, height: 65 },
        { left: 148, top: 218, width: 65, height: 65 },

        { left: 148, top: 684, width: 65, height: 65 },
        { left: 486, top: 684, width: 65, height: 65 },

        { left: 412, top: 1200, width: 65, height: 65 },
        { left: 486, top: 684,  width: 65, height: 65 },

        { left: 154, top: 1828, width: 50, height: 50 },
        { left: 298, top: 1792, width: 50, height: 50 },
    ],
    triggerGroups: [
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            roundRobin: true,
            triggers: [
                { left: 78,  top: 123, width: 24, height: 24, sensor: true },
                { left: 153, top: 123, width: 24, height: 24, sensor: true },
                { left: 223, top: 123, width: 24, height: 24, sensor: true },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.TRICK_SHOT,
            triggers: [
                { left: 520, top: 300, width: 20, height: 20, sensor: true, visible: false },
                { left: 570, top: 200, width: 20, height: 20, sensor: true, visible: false },
                { left: 510, top: 100, width: 20, height: 20, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.MULTIBALL,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 105, top: 590, width: 24, height: 24, sensor: true },
                { left: 595, top: 590, width: 24, height: 24, sensor: true },
                { left: 50,  top: 658, width: 24, height: 24, sensor: true },
                { left: 650, top: 658, width: 24, height: 24, sensor: true },
                { left: 110, top: 842, width: 24, height: 24, sensor: true },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.LOOP,
            triggers: [
                { left: 45, top: 1040, width: 24, height: 24, sensor: true, visible: false },
                { left: 40, top: 1480, width: 24, height: 24, sensor: true, visible: false },
                { left: 40, top: 1650, width: 24, height: 24, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.TELEPORT,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 70, top: 1020, width: 24, height: 24, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.MULTIPLIER,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 320, top: 1190, width: 24, height: 24 },
                { left: 540, top: 1190, width: 24, height: 24 },
                { left: 615, top: 1190, width: 24, height: 24 },
            ]
        },
        {
            target: TriggerTarget.TELEPORT,
            type: TriggerTypes.BOOL,
            triggers: [
                { left: 250, top: 1260, width: 24, height: 24, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.SERIES,
            message: GameMessages.TRICK_SHOT,
            triggers: [
                { left: 180, top: 1300, width: 20, height: 20, sensor: true, visible: false },
                { left: 140, top: 1180, width: 20, height: 20, sensor: true, visible: false },
                { left: 250, top: 1180, width: 20, height: 20, sensor: true, visible: false },
            ]
        },
        {
            target: TriggerTarget.SEQUENCE_COMPLETION,
            type: TriggerTypes.BOOL,
            message: GameMessages.GROUP_COMPLETE,
            triggers: [
                { left: 575, top: 1825, width: 24, height: 24, sensor: true },
                { left: 515, top: 1905, width: 24, height: 24, sensor: true },
                { left: 45,  top: 2060, width: 24, height: 24, sensor: true },
                { left: 660, top: 2060, width: 24, height: 24, sensor: true },
            ]
        },
    ]
} as TableDef;
