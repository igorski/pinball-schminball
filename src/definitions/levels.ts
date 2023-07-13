/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2022 - https://www.igorski.nl
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
import SpriteCache from "@/utils/sprite-cache";
import { ActorTypes } from "@/model/actor";

export type FlipperType = ActorTypes.LEFT_FLIPPER | ActorTypes.RIGHT_FLIPPER;
export type FlipperDef = {
    type: FlipperType;
    left: number;
    top: number;
};

export type LevelDef = {
    background: typeof Image,
    width: number;
    height: number;
    ballStartProps: { left: number, top: number };
    chute: { left: number, right: number, top: number };
    flippers: FlipperDef[];
};

export default [{
    background      : SpriteCache.BACKGROUND,
    width           : 800,
    height          : 1916,
    ballStartProps  : { left: 720, top: 600 },
    chute           : { left: 350, right: 550, top: 1870 },
    flippers : [
       { type: ActorTypes.LEFT_FLIPPER,  left: 140, top: 600 },
       { type: ActorTypes.LEFT_FLIPPER,  left: 325, top: 1100 },
       { type: ActorTypes.RIGHT_FLIPPER, left: 570, top: 1000 },
       { type: ActorTypes.LEFT_FLIPPER,  left: 300, top: 1750 },
       { type: ActorTypes.RIGHT_FLIPPER, left: 500, top: 1750 },
    ]
}] as LevelDef[];
