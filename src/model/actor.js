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
import { rectangleToVector, areVectorsIntersecting } from "@/utils/math-util";

const pos = { x: 0, y: 0 };

export default class Actor {
    constructor({ x = 0, y = 0, width = 1, height = 1, angle = 0, speed = 0, dir = 0, init = true } = {}) {
        this.x      = x;
        this.y      = y;
        this.width  = width;
        this.height = height;
        this.angle  = angle;
        this.speed  = speed;
        this.dir    = dir; // direction in radians

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set this proper
        this._center = { x: 0, y: 0 };
        this._vector = [];

        if ( init ) {
            this.cacheCoordinates();
        }
    }

    cacheCoordinates() {
        this._center.x = Math.round( this.x + this.width  * 0.5 );
        this._center.y = Math.round( this.y + this.height * 0.5 );

        this._vector = rectangleToVector( this );
    }

    getVector() {
        return this._vector;
    }

    getCenter() {
        return this._center;
    }

    collidesWith( otherActor,  ) {
        if ( this.angle !== 0 ) {
            return areVectorsIntersecting( this._vector, otherActor.getVector() );
        }
        let { x, y, width, height } = this;

        pos.x = otherActor.x + ( otherActor.width  * 0.5 ); // default from center TODO: cache this in otherActor
        pos.y = otherActor.y + ( otherActor.height * 0.5 );

        return pos.x >= x && pos.x < x + width &&
               pos.y >= y && pos.y < y + height;
    }
};
