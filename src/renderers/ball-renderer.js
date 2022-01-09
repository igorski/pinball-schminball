/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2022 - https://www.igorski.nl
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
import { BALL_WIDTH, BALL_HEIGHT } from "@/model/game";
import { degToRad, rectangleToPolygon } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

const DEBUG = process.env.NODE_ENV !== "production";

export default class BallRenderer extends sprite {
    constructor( actor ) {
        super({ bitmap: SpriteCache.BALL, width: BALL_WIDTH, height: BALL_HEIGHT });

        this.actor = actor;

        this.spin = 0;
    }

    update() {
        const { x, y } = this.actor.position;
        const isMovingLeft = x < this._bounds.left;
        this.setX( x );
        this.setY( y );
        this.spin = ( isMovingLeft ? this.spin - this.actor.speed : this.spin + this.actor.speed ) % 360;
    }

    draw( ctx, viewport ) {
        const { x, y, width, height, halfWidth, halfHeight } = this.actor.bounds;

        // the ball spins while moving, rotate the canvas prior to rendering as usual
        ctx.save();
        const dx = ( x - viewport.left ) + halfWidth;
        const dy = ( y - viewport.top )  + halfHeight;
        ctx.translate( dx, dy );
        ctx.rotate( degToRad( this.spin ));
        ctx.translate( -dx, -dy );

        ctx.drawImage(
            this._bitmap, 0, 0, width, height, x - viewport.left, y - viewport.top, width, height
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
