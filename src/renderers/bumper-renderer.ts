/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2023 - https://www.igorski.nl
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
import { Sprite } from "zcanvas";
import type { Point, Viewport, IRenderer } from "zcanvas";
import type Actor from "@/model/actor";
import type Bumper from "@/model/bumper";

const SPIN_SPEED = 30;

const DEBUG = false;//import.meta.env.MODE !== "production";

export default class BumperRenderer extends Sprite {
    protected collisionAnimation = false;
    protected collisionIterations = 0;
    protected collisionOffset: Point;
    protected collisionRadius: number;
    protected collisionStroke = { color: "#00AEEF", size: 2 };

    constructor( private actor: Actor ) {
        super({ width: actor.bounds.width, height: actor.bounds.width });

        this.collisionRadius = this.actor.radius * 1.1;
        this.collisionOffset = {
            x: this.actor.bounds.left - (( this.collisionRadius - this.actor.radius ) / 2 ),
            y: this.actor.bounds.top - (( this.collisionRadius - this.actor.radius ) / 2 )
        };
    }

    draw( renderer: IRenderer, viewport: Viewport ): void {
        let { left, top } = this.actor.bounds;

        const { collided } = this.actor as Bumper;
        let { radius } = this.actor;

        if ( !collided ) {
            radius = this.collisionRadius;
            left = this.collisionOffset.x;
            top = this.collisionOffset.y;
        }

        // sync bouds with MatterJS body

        this._bounds.left = left;
        this._bounds.top  = top;

        if ( !this.isVisible( viewport )) {
            return; // out of visual bounds
        }

        renderer.drawCircle(
            left - viewport.left, top - viewport.top,
            radius,
            collided ? "#00AEEF" : "transparent",
            !collided ? this.collisionStroke : undefined,
        );

        if ( collided ) {
            if ( !this.collisionAnimation ) {
                this.collisionAnimation = true;
                this.collisionIterations = 15;
            } else if ( --this.collisionIterations === 0 ) {
                this.collisionAnimation = false;
                ( this.actor as Bumper ).collided = false;
            }
        }
    }
};
