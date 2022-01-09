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
const { floor, cos, sin, max, min } = Math;
const ONE_EIGHTY_OVER_PI = 180 / Math.PI;
const PI_OVER_ONE_EIGHTY = Math.PI / 180;
const HALF = 0.5;

export const radToDeg = radians => {
    const degrees = ( radians * ONE_EIGHTY_OVER_PI ) % 360;
    return degrees < 0 ? degrees + 360 : degrees;
};
export const degToRad = degrees => degrees * PI_OVER_ONE_EIGHTY;
export const clamp    = ( value, minValue, maxValue ) => max( minValue, min( maxValue, value ));

export const rectangleToRotatedPolygon = ( rectangle, angleInRadians = 0, optPivotX = null, optPivotY = null ) => {
    const r = rectangleToPolygon( rectangle );
    const out = [];
    const xp = optPivotX === null ? rectangle.x + rectangle.width  * HALF : optPivotX;
    const yp = optPivotY === null ? rectangle.y + rectangle.height * HALF : optPivotY;
    for( let i = 0; i < 8; i += 2 ) {
        const t = r[ i ] - xp;
        const v = r[ i + 1 ] - yp;
        out.push( xp + floor( t * cos( angleInRadians ) - v * sin( angleInRadians )));
        out.push( yp + floor( v * cos( angleInRadians ) + t * sin( angleInRadians )));
    }
    return out;
};

export const rectangleToPolygon = rectangle => {
    const x = rectangle.x;
    const y = rectangle.y;
    return [
        x, y,
        x + rectangle.width, y,
        x + rectangle.width, y + rectangle.height,
        x, y + rectangle.height,
    //    x, y // is starting point
    ];
};

export const areVectorsIntersecting = ( r1, r2 ) => {
    // TODO: allocate primitives instead of Array
    let pn, px;
    for ( let pi = 0, l = r1.length; pi < l; pi += 2 ) {
        pn = ( pi === ( l - 2 )) ? 0 : pi + 2; // next point
        px = ( pn === ( l - 2 )) ? 0 : pn + 2;
        if ( edgeTest([ r1[ pi ], r1[ pi + 1 ]], [ r1[ pn ], r1[ pn + 1 ]], [ r1[ px ], r1[ px + 1 ]], r2 )) {
            return false;
        }
    }
    for ( let pi = 0, l = r2.length; pi < l; pi += 2 ) {
        pn = ( pi === ( l - 2 )) ? 0 : pi + 2; // next point
        px = ( pn === ( l - 2 )) ? 0 : pn + 2;
        if ( edgeTest([ r2[ pi ], r2 [pi + 1 ]], [ r2[ pn ], r2[ pn + 1 ]], [ r2[ px ], r2[ px + 1 ]], r1 )) {
            return false;
        }
    }
    return true;
}

/* internal methods */

function edgeTest( p1, p2, p3, r2 ) {
    // TODO: allocate primitives instead of Array
    const rot = [ -( p2[ 1 ] - p1[ 1 ]), p2[ 0 ] - p1[ 0 ] ];
    const ref = ( rot[ 0 ] * ( p3[ 0 ] - p1[ 0 ]) + rot[ 1 ] * ( p3[ 1 ] - p1[ 1 ])) >= 0;

    for ( let i = 0, l = r2.length; i < l; i += 2 ) {
        if ((( rot[ 0 ] * ( r2[ i ] - p1[ 0 ]) + rot[ 1 ] * ( r2[ i + 1 ] - p1[ 1 ])) >= 0 ) === ref ) {
            return false;
        }
    }
    return true;
}
