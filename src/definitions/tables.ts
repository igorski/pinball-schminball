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
import type { Rectangle } from "zcanvas";
import SpriteCache from "@/utils/sprite-cache";
import { ActorTypes } from "@/model/actor";

export type FlipperType = ActorTypes.LEFT_FLIPPER | ActorTypes.RIGHT_FLIPPER;
export type FlipperDef = {
    type: FlipperType;
    left: number;
    top: number;
};

export type ObjectDef = Rectangle & {
    angle?: number;
};

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
};

const SPRITE_PATH = "./assets/sprites/";

export default [{
    soundtrackId: "1566338341",
    width      : 800,
    height     : 2441,
    underworld : 1441,
    background : `${SPRITE_PATH}/table1_background.png`,
    body : {
        source : `${SPRITE_PATH}/table1_shape.svg`,
        left   : 327,
        top    : 334
    },
    popper : { left: 795, top: 1360, width: 40 },
    flippers : [
        { type: ActorTypes.LEFT_FLIPPER,  left: 115, top: 580 },
        { type: ActorTypes.LEFT_FLIPPER,  left: 270, top: 1335 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 480, top: 1335 },

        // underworld

        { type: ActorTypes.RIGHT_FLIPPER, left: 570, top: 2000 },
        { type: ActorTypes.LEFT_FLIPPER,  left: 280, top: 2270 },
    ],
    rects: [
        // outer walls
        { left: 400, top: 0, width: 800, height: 10 },
        { left: 0, top: 1220, width: 10, height: 2000 },
        { left: 805, top: 1220, width: 10, height: 2000 },

        // bottom left flipper area
        { left: 58,  top: 1167, width: 10, height: 138 },
        { left: 125, top: 1280, width: 165, height: 10, angle: 34 },
        // bottom right flipper area
        { left: 691, top: 1167, width: 10, height: 138 },
        { left: 625, top: 1280, width: 165, height: 10, angle: -34 },

        // underworld

        { left: 700, top: 1920, width: 170, height: 10, angle: -50 },
        { left: 58,  top: 2087, width: 10, height: 138 },
        { left: 125, top: 2200, width: 165, height: 10, angle: 34 },
    ],
    bumpers: [
        { left: 500, top: 800, width: 100, height: 100 },
        { left: 380, top: 800, width: 100, height: 100 },

        // underworld

        { left: 340, top: 1800, width: 100, height: 100 },
        { left: 460, top: 1800, width: 100, height: 100 },
        { left: 400, top: 1900, width: 90, height: 90 },
    ]
}] as TableDef[];
