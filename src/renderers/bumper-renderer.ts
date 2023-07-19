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
import { sprite, collision } from "zcanvas";
import type { Viewport } from "zcanvas";
import type Actor from "@/model/actor";
import type Bumper from "@/model/bumper";
import { BALL_WIDTH, BALL_HEIGHT } from "@/model/game";
import { degToRad } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

const SPIN_SPEED = 30;

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class BumperRenderer extends sprite {
    constructor( private actor: Actor ) {
        super({ width: actor.bounds.width, height: actor.bounds.width });
    }

    draw( ctx: CanvasRenderingContext2D, viewport: Viewport ): void {
        if ( !collision.isInsideViewport( this.actor.bounds, viewport )) {
            return;
        }

        const { left, top, width, height } = this.actor.bounds;
        const { radius } = this.actor as Bumper;

        ctx.beginPath();
        ctx.arc(( left - viewport.left ) + radius, ( top - viewport.top ) + radius, radius, 0, 2 * Math.PI );
        ctx.fillStyle = "orange";
        ctx.fill();

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
