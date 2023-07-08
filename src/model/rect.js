/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2022 - https://www.igorski.nl
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
import { SHAPE_TYPES } from "@/model/math/physicsshape";
import RectPhys from "@/model/math/rectphys";
import Vector from "@/model/math/vector";
import { rectangleToPolygon, rectangleToRotatedPolygon } from "@/utils/math-util";

const DEBUG = import.meta.env.MODE !== "production";

export default class Rect extends Actor {
    /**
     * a Rect is an Actor that can adjust its angle and
     * rotate around a custom pivot point
     */
    constructor( opts ) {
        super({ ...opts, init: false });

        this.setRestitution( 0.5 );

        this.shape = new RectPhys( new Vector( opts.width / 2, opts.height / 2 ));

        if ( opts.angle !== 0 ) {
            this.shape.type = SHAPE_TYPES.OBB;
        }
        this.pivotX = opts.width / 2;
        this.pivotY = opts.height / 2;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set the values properly
        this._pivot = { x: 0, y: 0 };

        if ( opts.init ) {
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
        const { x, y } = this.cacheBounds();

        this._pivot.x = x + this.pivotX;
        this._pivot.y = y + this.pivotY;

        if ( DEBUG ) {
            if ( this.fAngle === 0 ) {
                this._outline = rectangleToPolygon( this.bounds );
            } else {
                this._outline = rectangleToRotatedPolygon( this.bounds, this.fAngle, this._pivot.x, this._pivot.y );
            }
        }
    }
};
