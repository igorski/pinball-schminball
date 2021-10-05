/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021 - https://www.igorski.nl
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
import Actor from "@/model/actor";
import { degToRad, clamp, rectangleToRotatedVector } from "@/utils/math-util";

const MIN_ANGLE = -30;
const MAX_ANGLE = 30;

export default class Flipper extends Actor {
    /**
     * Flipper is an Actor that can adjust its angle and
     * rotate around a custom pivot point
     */
    constructor( opts ) {
        super({ ...opts, init: false });

        this.type   = opts.type;
        this.width  = 132;
        this.height = 41;
        this.angle  = this.type === "left" ? MIN_ANGLE : MAX_ANGLE;
        this.pivotX = this.type === "left" ? 20 : 112;
        this.pivotY = 20;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set the values properly
        this._pivot  = { x: 0, y: 0 };

        this.cacheCoordinates();
    }

    setAngle( angle ) {
        angle = clamp( angle, MIN_ANGLE, MAX_ANGLE );
        if ( this.angle === angle ) {
            return;
        }
        this.angle = angle;
        if ( angle !== 0 ) {
            this.cacheCoordinates();
        }
    }

    getPivot() {
        return this._pivot;
    }

    /**
     * @override
     */
    cacheCoordinates() {
        this._pivot.x = this.x + this.pivotX;
        this._pivot.y = this.y + this.pivotY;

        this._vector = rectangleToRotatedVector( this, degToRad( this.angle ), this._pivot.x, this._pivot.y );
    }
};
