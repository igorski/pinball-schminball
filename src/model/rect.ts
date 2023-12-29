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
import type { Point, Rectangle, Canvas as zCanvas } from "zcanvas";
import { ActorTypes } from "@/definitions/game";
import type { IPhysicsEngine } from "@/model/physics/engine";
import Actor from "@/model/actor";
import type { ActorArgs, IRendererClass } from "@/model/actor";
import { setupTableBody } from "@/model/physics/engine";
import RectRenderer from "@/renderers/rect-renderer";
import { rectangleToPolygon, rectangleToRotatedPolygon } from "@/utils/math-util";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class Rect extends Actor {
    /**
     * a Rect is an Actor that can adjust its angle and
     * rotate around a custom pivot point
     */
    constructor( args: ActorArgs, engine: IPhysicsEngine, canvas: zCanvas ) {
        super({ ...args, type: args.type ?? ActorTypes.RECTANGULAR, fixed: args.fixed ?? true }, engine, canvas );

        if ( this.type === ActorTypes.RECTANGULAR ) {
            setupTableBody( this.body );
        }
        this.cacheBounds();
    }

    getPivot(): Point {
        return this._pivot;
    }

    cacheBounds(): Rectangle {
        if ( this._cached ) {
            return this.bounds;
        }
        const { left, top } = super.cacheBounds();

        this._pivot.x = left + this.halfWidth;
        this._pivot.y = top  + this.halfHeight;

        if ( DEBUG ) {
            if ( this.angle === 0 ) {
                this._outline = rectangleToPolygon( this.bounds );
            } else {
                this._outline = rectangleToRotatedPolygon( this.bounds, this.angle, this._pivot.x, this._pivot.y );
            }
        }
        return this.bounds;
    }

    protected override getRendererClass(): IRendererClass | null {
        return this.visible ? RectRenderer : null;
    }
}
