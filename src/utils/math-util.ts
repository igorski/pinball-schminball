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
import type { Rectangle } from "zcanvas";

const { floor, cos, sin, max, min } = Math;
const ONE_EIGHTY_OVER_PI = 180 / Math.PI;
const PI_OVER_ONE_EIGHTY = Math.PI / 180;
const HALF = 0.5;

export const radToDeg = ( radians: number ): number => {
    const degrees = ( radians * ONE_EIGHTY_OVER_PI ) % 360;
    return degrees < 0 ? degrees + 360 : degrees;
};

export const degToRad = ( degrees: number ): number => {
    return degrees * PI_OVER_ONE_EIGHTY;
};

export const clamp = ( value: number, minValue: number, maxValue: number ): number => {
    return max( minValue, min( maxValue, value ))
};

export const rectangleToRotatedPolygon = ( rectangle: Rectangle, angleInRadians = 0, optPivotX?: number, optPivotY?: number ): number[] => {
    const r = rectangleToPolygon( rectangle );
    const out = [];
    const xp = typeof optPivotX === "number" ? optPivotX : rectangle.left + rectangle.width  * HALF;
    const yp = typeof optPivotY === "number" ? optPivotY : rectangle.top  + rectangle.height * HALF;
    for( let i = 0; i < 8; i += 2 ) {
        const t = r[ i ] - xp;
        const v = r[ i + 1 ] - yp;
        out.push( xp + floor( t * cos( angleInRadians ) - v * sin( angleInRadians )));
        out.push( yp + floor( v * cos( angleInRadians ) + t * sin( angleInRadians )));
    }
    return out;
};

export const rectangleToPolygon = ( rectangle: Rectangle ): number[] => {
    const { left, top } = rectangle;
    return [
        left, top,
        left + rectangle.width, top,
        left + rectangle.width, top + rectangle.height,
        left, top + rectangle.height,
    //    left, top // is starting point
    ];
};
