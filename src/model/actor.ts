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
import type { Point, Rectangle, Sprite, Canvas as zCanvas } from "zcanvas";
import { ActorTypes } from "@/definitions/game";
import type { IPhysicsEngine } from "@/model/physics/engine";
import { degToRad, rotateRectangle } from "@/utils/math-util";

export type ActorArgs = {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    radius?: number;
    angle?: number; // provide in degrees
    type?: ActorTypes;
    visible?: boolean;
    fixed?: boolean;
    sensor?: boolean;
    opts?: any;
};

export type IRendererClass = new ( actor: Actor ) => Sprite;

let INSTANCE_NUM = 0;

export default class Actor {
    public id: number;
    public bounds: Rectangle;
    public radius: number;
    public renderer: Sprite;
    public type: ActorTypes;
    public fixed: boolean;
    public sensor: boolean;
    public visible: boolean;
    public angle: number; // internally in radians

    public body: Matter.Body | null;
    public halfWidth: number;
    public halfHeight: number;

    protected _opts: any;
    protected _pivot: Point;
    protected _cached: boolean; // fixed bodies don't need to recalculate their bounds on each update

    constructor({
        left = 0, top = 0, width = 1, height = 1, angle = 0, radius = 0,
        fixed = true, sensor = false, opts = null, visible = true, type = ActorTypes.RECTANGULAR
    }: ActorArgs = {}, protected engine: IPhysicsEngine, canvas: zCanvas )
    {
        this.id = ++INSTANCE_NUM;

        this._opts   = opts;
        this.fixed   = fixed;
        this.sensor  = sensor;
        this.angle   = degToRad( angle );
        this.radius  = radius;
        this.type    = type;
        this.visible = visible;

        this.halfWidth  = width  / 2;
        this.halfHeight = height / 2;

        // in MatterJS bodies are offset by their center of mass, so we translate
        // the top-left coordinate to correspond with top-left screenspace

        this.bounds = {
            left : left + this.halfWidth,
            top  : top  + this.halfHeight,
            width,
            height
        };

        if ( this.angle !== 0 ) {
            const rotatedBounds = rotateRectangle( this.bounds, this.angle );

            this.bounds.left -= ( width  - rotatedBounds.width )  / 2;
            this.bounds.top  -= ( height - rotatedBounds.height ) / 2;
        }

        this._pivot = { x: 0, y: 0 };

        this.register( engine, canvas );
       
        if ( this.body ) {
            this.cacheBounds();
        }
        this._cached = this.fixed;
    }

    /**
     * Sync the Actor with the updated MatterJS Body
     */
    cacheBounds(): Rectangle {
        if ( this._cached ) {
            return this.bounds;
        }
        // the bounds supplied to the Sprites correspond to the top-left
        // coordinate of the Actor as rendered visually on-screen. The MatterJS Body
        // representing this Actor is however offset by its centre of mass
        // as such we correct this by substracting half the width/height

        const { x, y } = this.body!.position;

        this.bounds.left = x - this.halfWidth;
        this.bounds.top  = y - this.halfHeight;

        // update the renderer

        if ( this.renderer ) {
            const rendererBounds = this.renderer.getBounds();
        
            rendererBounds.left = this.bounds.left;
            rendererBounds.top =  this.bounds.top;
        }
        return this.bounds;
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
