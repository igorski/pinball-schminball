/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2022 - https://www.igorski.nl
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
import { degToRad, rectangleToRotatedVector } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

const DEBUG = process.env.NODE_ENV !== "production";

export default class RectRenderer extends sprite {
    constructor( actor ) {
        super({
            width  : actor.width,
            height : actor.height
        });
        this.actor = actor;
    }

    update() {
        this.setX( this.actor.getPosition().x );
        this.setY( this.actor.getPosition().y );
    }

    draw( ctx, { left, top }) {
        const { width, height } = this.actor;
        const { x, y } = this.actor.position;
        const angle = this.actor.getAngleRad();
        const rotate = angle !== 0;

        if ( rotate ) {
            const pivot = this.actor.getPivot();
            ctx.save();
            const xD = x - left;
            const yD = y - top;
            ctx.translate( xD, yD );
            ctx.rotate( angle );
            ctx.translate( -xD, -yD );
        }

        ctx.fillStyle = "gray";
        ctx.fillRect( x - left, y - top, width, height );

        if ( rotate ) {
            ctx.restore();
        }

        if ( DEBUG ) {
            ctx.save();
            const vector = this.actor.getBoundingBox();
            ctx.strokeStyle = "red";
            ctx.translate( -left, -top );
            ctx.beginPath();
            ctx.moveTo( vector[ 0 ], vector[ 1 ]);
            for ( let i = 2; i < vector.length; i += 2 ) {
                ctx.lineTo( vector[ i ], vector[ i + 1 ] );
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }
};
