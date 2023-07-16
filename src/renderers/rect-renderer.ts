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
import { sprite, collision } from "zcanvas";
import type { Viewport } from "zcanvas";
import type Rect from "@/model/rect";
import SpriteCache from "@/utils/sprite-cache";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class RectRenderer extends sprite {
    constructor( private actor: Rect ) {
        super({
            width  : actor.bounds.width,
            height : actor.bounds.height
        });
    }

    draw( ctx: CanvasRenderingContext2D, viewport: Viewport ): void {
        this.actor.update();

        if ( !collision.isInsideViewport( this.actor.bounds, viewport )) {
            return;
        }

        const { left, top, width, height } = this.actor.bounds;
        const angle = this.actor.angle;
        const rotate = angle !== 0;

        if ( rotate ) {
            const pivot = this.actor.getPivot();
            ctx.save();
            const xD = pivot.x - viewport.left;
            const yD = pivot.y - viewport.top;
            ctx.translate( xD, yD );
            ctx.rotate( angle );
            ctx.translate( -xD, -yD );
        }

        ctx.fillStyle = "gray";
        ctx.fillRect( left - viewport.left, top - viewport.top, width, height );

        if ( rotate ) {
            ctx.restore();
        }

        if ( DEBUG ) {
            const bbox = this.actor.getOutline();
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.translate( -viewport.left, -viewport.top );
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
