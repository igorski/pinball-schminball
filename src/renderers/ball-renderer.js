/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021 - https://www.igorski.nl
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
import { degToRad, rectangleToVector } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

const DEBUG = process.env.NODE_ENV !== "production";

export default class BallRenderer extends sprite {
    constructor( actor ) {
        super({ bitmap: SpriteCache.BALL, width: BALL_WIDTH, height: BALL_HEIGHT });

        this.actor = actor;

        this.spin = 0;
    }

    update() {
        const isMovingLeft = this.actor.x < this._bounds.left;
        this.setX( this.actor.x );
        this.setY( this.actor.y );
        this.spin = ( isMovingLeft ? this.spin - this.actor.speed : this.spin + this.actor.speed ) % 360;
    }

    draw( ctx, viewport ) {
        // the ball spins while moving, rotate the canvas prior to rendering as usual
        ctx.save();
        const dx = ( this.actor.x - viewport.left ) + this.actor.width / 2;
        const dy = ( this.actor.y - viewport.top )  + this.actor.height / 2;
        ctx.translate( dx, dy );
        ctx.rotate( degToRad( this.spin ));
        ctx.translate( -dx, -dy );
        super.draw( ctx, viewport );
        ctx.restore();

        if ( DEBUG ) {
            ctx.save();
            const vector = this.actor.getVector();
            ctx.translate( -viewport.left, -viewport.top );
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo( vector[ 0 ], vector[ 1 ] );
            for ( let i = 2; i < vector.length; i += 2 ) {
                ctx.lineTo( vector[ i ], vector[ i + 1 ] );
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }
};
