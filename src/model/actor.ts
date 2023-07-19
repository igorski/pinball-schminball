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
import type { Point, Rectangle, sprite, canvas as zCanvas } from "zcanvas";
import { ActorTypes } from "@/definitions/game";
import type { IPhysicsEngine } from "@/model/physics/engine";
import { degToRad, rectangleToPolygon } from "@/utils/math-util";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export type ActorOpts = {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    radius?: number;
    angle?: number; // provide in degrees
    type?: ActorTypes;
    fixed?: boolean;
    sensor?: boolean;
    opts?: any;
};

export type IRendererClass = new ( actor: Actor ) => sprite;

let INSTANCE_NUM = 0;

export default class Actor {
    public id: number;
    public bounds: Rectangle;
    public radius: number;
    public renderer: sprite;
    public type: ActorTypes;
    public fixed: boolean;
    public sensor: boolean;
    public angle: number; // internally in radians

    public body: Matter.Body | null;
    public halfWidth: number;
    public halfHeight: number;

    protected _opts: any;
    protected _outline: number[]; // debug only

    constructor({
        left = 0, top = 0, width = 1, height = 1, angle = 0, radius = 0,
        fixed = true, sensor = false, opts = null, type = ActorTypes.RECTANGULAR
    }: ActorOpts = {}, protected engine: IPhysicsEngine, canvas: zCanvas )
    {
        this.id = ++INSTANCE_NUM;

        this._opts  = opts;
        this.fixed  = fixed;
        this.sensor = sensor;
        this.angle  = degToRad( angle );
        this.radius = radius;
        this.type   = type;

        this.bounds = { left, top, width, height };

        this.halfWidth  = width  / 2;
        this.halfHeight = height / 2;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheBounds() on position update will set the values properly
        this._outline = [];

        this.register( engine, canvas );
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

    dispose( engine: IPhysicsEngine ): void {
        engine.removeBody( this.body );

        this.renderer?.dispose();
        this.renderer = null;
    }

    /**
     * Invoked on each step of the simulation to synchronise
     * the Actors properties with the altered body properties
     */
    // @ts-expect-error 'timestamp' is declared but its value is never read.
    update( timestamp: DOMHighResTimeStamp ): void {
        this.angle = this.body.angle;
        this.cacheBounds();
    }

    /**
     * Override in your sub classes to provide a renderer in case this Actor
     * should be visually represented on-screen on the canvas.
     */
    protected getRendererClass(): IRendererClass | null {
        return null;
    }

    protected getLabel(): string {
        return `actor-${this.id}`;
    }

    /**
     * Invoked on construction. Registers the body inside the physics engine
     * and when existing, constructs the renderer class and adds it onto the canvas
     */
    protected register( engine: IPhysicsEngine, canvas: zCanvas ): void {
        this.body = engine.addBody( this, this.getLabel() );

        const rendererClass = this.getRendererClass();
        if ( rendererClass ) {
            this.renderer = new rendererClass( this );
            canvas.addChild( this.renderer );
        }
    }
}
