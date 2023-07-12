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
import type { Point, Rectangle, sprite } from "zcanvas";
import type { IPhysicsEngine } from "@/model/physics/engine";
import { rectangleToPolygon } from "@/utils/math-util";
import { degToRad, radToDeg } from "@/utils/math-util";

export enum ActorShapes {
    CIRCLE,
    RECT
};

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export type ActorOpts = {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    angle?: number;
    shape?: ActorShapes;
    fixed?: boolean;
};

export default class Actor {
    public bounds: Rectangle;
    public renderer: sprite;
    public shape: ActorShapes;
    public fixed: boolean;
    public angle: number;

    public body: Matter.Body | null;
    public halfWidth: number;
    public halfHeight: number;

    protected _outline: number[];

    constructor( engine: IPhysicsEngine, {
        left = 0, top = 0, width = 1, height = 1, angle = 0, fixed = true, shape = ActorShapes.RECT
    }: ActorOpts = {} )
    {
        this.fixed  = fixed;
        this.angle  = angle;
        this.shape  = shape;

        this.bounds = { left, top, width, height };

        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set the values properly
        this._outline = [];

        this.register( engine );
        this.cacheCoordinates();
    }

    cacheBounds(): Rectangle {
        this.bounds.left = this.body.position.x - this.halfWidth;
        this.bounds.top  = this.body.position.y - this.halfHeight;

        return this.bounds;
    }

    cacheCoordinates(): void {
        this.cacheBounds();

        if ( DEBUG ) {
            this._outline = rectangleToPolygon( this.cacheBounds() );
        }
    }

    getOutline(): number[] {
        return this._outline;
    }

    getAngleRad(): number {
        return this.angle;
    }

    setAngleRad( angle: number ): void {
        this.angle = angle;
    }

    register( engine: IPhysicsEngine ): void {
        this.body = engine.addBody( this );
    }

    unregister( engine: IPhysicsEngine ): void {
        engine.removeBody( this.body );
    }

    update(): void {
        this.cacheCoordinates(); // TODO: how expensive is this
    }
}
