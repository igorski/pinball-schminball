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
import { degToRad, rectangleToPolygon } from "@/utils/math-util";

export enum ActorTypes {
    CIRCULAR,
    RECTANGULAR,
    LEFT_FLIPPER,
    RIGHT_FLIPPER,
};

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export type ActorOpts = {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    angle?: number; // in degrees
    type?: ActorTypes;
    fixed?: boolean;
};

let INSTANCE_NUM = 0;

export default class Actor {
    public id;
    public bounds: Rectangle;
    public renderer: sprite;
    public type: ActorTypes;
    public fixed: boolean;
    public angle: number;

    public body: Matter.Body | null;
    public halfWidth: number;
    public halfHeight: number;

    protected _outline: number[];

    constructor( protected engine: IPhysicsEngine, {
        left = 0, top = 0, width = 1, height = 1,
        angle = 0, fixed = true, type = ActorTypes.RECTANGULAR
    }: ActorOpts = {} ) {
        this.id = `${++INSTANCE_NUM}`;

        this.fixed = fixed;
        this.angle = degToRad( angle );
        this.type  = type;

        this.bounds = { left, top, width, height };

        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheBounds() on position update will set the values properly
        this._outline = [];

        this.register( engine );
    }

    cacheBounds(): Rectangle {
        this.bounds.left = this.body.position.x - this.halfWidth;
        this.bounds.top  = this.body.position.y - this.halfHeight;

        if ( DEBUG ) {
            this._outline = rectangleToPolygon( this.bounds );
        }
        return this.bounds;
    }

    getOutline(): number[] {
        return this._outline;
    }

    register( engine: IPhysicsEngine ): void {
        this.body = engine.addBody( this, this.getLabel() );
    }

    unregister( engine: IPhysicsEngine ): void {
        engine.removeBody( this.body );
    }

    /**
     * Invoke on each step of the simulation to synchronise
     * the Actors properties with the altered body properties
     */
    update(): void {
        this.angle = this.body.angle;
        this.cacheBounds();
    }

    protected getLabel(): string {
        return `actor_${this.id}`;
    }
}
