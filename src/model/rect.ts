/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2022-2023 - https://www.igorski.nl
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
import type { Point, Rectangle } from "zcanvas";
import type { IPhysicsEngine } from "@/model/physics/engine";
import Actor, { ActorTypes } from "@/model/actor";
import type { ActorOpts } from "@/model/actor";
import { rectangleToPolygon, rectangleToRotatedPolygon } from "@/utils/math-util";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class Rect extends Actor {
    private _centerX: number;
    private _centerY: number;
    private _pivot: Point;

    /**
     * a Rect is an Actor that can adjust its angle and
     * rotate around a custom pivot point
     */
    constructor( engine: IPhysicsEngine, opts: ActorOpts ) {
        super( engine, { ...opts, type: opts.type ?? ActorTypes.RECTANGULAR });

        this.body.restitution = 0.5;

        this._centerX = opts.width  / 2;
        this._centerY = opts.height / 2;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheBounds() on position update will set the values properly
        this._pivot = { x: 0, y: 0 };

        this.cacheBounds();
    }

    getPivot(): Point {
        return this._pivot;
    }

    cacheBounds(): Rectangle {
        const { left, top } = super.cacheBounds();

        this._pivot.x = left + this._centerX;
        this._pivot.y = top  + this._centerY;


        if ( DEBUG ) {
            if ( this.angle === 0 ) {
                this._outline = rectangleToPolygon( this.bounds );
            } else {
                this._outline = rectangleToRotatedPolygon( this.bounds, this.angle, this._pivot.x, this._pivot.y );
            }
        }
        return this.bounds;
    }
}
