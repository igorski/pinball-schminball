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
import { sprite } from "zcanvas";
import type { Point, Viewport } from "zcanvas";
import { BALL_WIDTH, BALL_HEIGHT } from "@/definitions/game";
import type Actor from "@/model/actor";
import type Bumper from "@/model/bumper";
import { degToRad } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

const SPIN_SPEED = 30;

const DEBUG = false;//import.meta.env.MODE !== "production";

export default class BumperRenderer extends sprite {
    protected collisionAnimation = false;
    protected collisionIterations = 0;
    protected collisionOffset: Point;
    protected collisionRadius: number;

    constructor( private actor: Actor ) {
        super({ width: actor.bounds.width, height: actor.bounds.width });

        this.collisionRadius = this.actor.radius * 1.1;
        this.collisionOffset = {
            x: this.actor.bounds.left - (( this.collisionRadius - this.actor.radius ) / 2 ),
            y: this.actor.bounds.top - (( this.collisionRadius - this.actor.radius ) / 2 )
        };
    }

    draw( ctx: CanvasRenderingContext2D, viewport: Viewport ): void {
        if ( !this.actor.isInsideViewport( viewport )) {
            return;
        }

        const { width, height } = this.actor.bounds;
        let { left, top } = this.actor.bounds;

        const { collided } = this.actor as Bumper;
        let { radius } = this.actor;

        ctx.save();

        if ( !collided ) {
            ctx.strokeStyle = "#00AEEF";
            ctx.lineWidth = 2;

            radius = this.collisionRadius;
            left = this.collisionOffset.x;
            top = this.collisionOffset.y;
        }

        ctx.beginPath();
        ctx.arc(( left - viewport.left ) + radius, ( top - viewport.top ) + radius, radius, 0, 2 * Math.PI );
        ctx.fillStyle = !collided ? "transparent" : "#00AEEF";
        ctx.stroke();

        if ( collided ) {
            ctx.fill();

            if ( !this.collisionAnimation ) {
                this.collisionAnimation = true;
                this.collisionIterations = 15;
            } else if ( --this.collisionIterations === 0 ) {
                this.collisionAnimation = false;
                ( this.actor as Bumper ).collided = false;
            }
        }

        if ( DEBUG ) {
            ctx.save();
            const bbox = this.actor.getOutline();
            ctx.translate( -viewport.left, -viewport.top );
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo( bbox[ 0 ], bbox[ 1 ] );
            for ( let i = 2; i < bbox.length; i += 2 ) {
                ctx.lineTo( bbox[ i ], bbox[ i + 1 ] );
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
};
