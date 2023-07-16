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
    background: string,
    body: {
        source: string;
        left: number;
        top: number;
    },
    width: number;
    height: number;
    ballStartProps: { left: number, top: number };
    chute: { left: number, right: number, top: number };
    flippers: FlipperDef[];
    rects: ObjectDef[];
    bumpers: ObjectDef[];
};

const SPRITE_PATH = "./assets/sprites/";

export default [{
    background : `${SPRITE_PATH}/table1_background.png`,
    body : {
        source: `${SPRITE_PATH}/table1_shape.svg`,
        left: 320,
        top: 345
    },
    width           : 800,
    height          : 1441,
    ballStartProps  : { left: 720, top: 600 },
    chute           : { left: 350, right: 550, top: 1870 },
    flippers : [
        { type: ActorTypes.LEFT_FLIPPER,  left: 115, top: 580 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 570, top: 1000 },
        { type: ActorTypes.LEFT_FLIPPER,  left: 280, top: 1350 },
        { type: ActorTypes.RIGHT_FLIPPER, left: 480, top: 1350 },
    ],
    rects: [
        { left: 700, top: 920, width: 170, height: 10, angle: -50 },
        // bottom left flipper area
        { left: 58,  top: 1167, width: 10, height: 138 },
        { left: 125, top: 1280, width: 165, height: 10, angle: 34 },
        // bottom right flipper area
        { left: 691, top: 1167, width: 10, height: 138 },
        { left: 625, top: 1280, width: 165, height: 10, angle: -34 },
    ],
    bumpers: [
        { left: 500, top: 800, width: 100, height: 100 },
        { left: 380, top: 800, width: 100, height: 100 },
    ]
}] as TableDef[];
