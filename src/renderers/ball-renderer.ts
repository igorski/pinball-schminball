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
import { sprite, collision } from "zcanvas";
import type { Viewport } from "zcanvas";
import type Actor from "@/model/actor";
import { BALL_WIDTH, BALL_HEIGHT } from "@/model/game";
import { degToRad } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

const SPIN_SPEED = 30;

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class BallRenderer extends sprite {
    private spin: number = 0;

    constructor( private actor: Actor ) {
        super({ bitmap: SpriteCache.BALL, width: BALL_WIDTH, height: BALL_HEIGHT });

        this.spin = 0;
    }

    update(): void {
        let { x, y } = this.actor.body.velocity;
        const isMoving = x < 0 || y > 0;
        if ( x === 0 ) {
            x = 0.2; // ball should always spin, even when moving solely on vertical axis
        }
        this.spin = ( isMoving ? this.spin + ( x * SPIN_SPEED ): this.spin - ( x * SPIN_SPEED )) % 360;
    }

    draw( ctx: CanvasRenderingContext2D, viewport: Viewport ): void {
        this.actor.update();

        if ( !this._bitmapReady || !collision.isInsideViewport( this.actor.bounds, viewport )) {
            return;
        }

        const { left, top, width, height } = this.actor.bounds;

        // the ball spins while moving, rotate the canvas prior to rendering as usual
        ctx.save();
        const dx = ( left - viewport.left ) + this.actor.halfWidth;
        const dy = ( top - viewport.top )  + this.actor.halfHeight;
        ctx.translate( dx, dy );
        ctx.rotate( degToRad( this.spin ));
        ctx.translate( -dx, -dy );

        ctx.drawImage(
            this._bitmap, 0, 0, width, height, left - viewport.left, top - viewport.top, width, height
        );
        ctx.restore();

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
    }
};
