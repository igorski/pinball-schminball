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
import { degToRad } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

export default class FlipperRenderer extends sprite {
    constructor( actor, direction = "left" ) {
        super({
            bitmap : direction === "left" ? SpriteCache.FLIPPER_LEFT : SpriteCache.FLIPPER_RIGHT,
            width  : actor.width,
            height : actor.height
        });
        this.actor = actor;
    }

    draw( ctx ) {
        const { x, y, width, height, angle } = this.actor;
        const rotate = angle !== 0;

        if ( rotate ) {
            const pivot = this.actor.getPivot();
            ctx.save();
            const xD = pivot.x - width  / 2;
            const yD = pivot.y - height / 2;
            ctx.translate( xD, yD );
            ctx.rotate( degToRad( angle ));
            ctx.translate( -xD, -yD );
        }

        ctx.drawImage(
            this._bitmap, 0, 0, width, height, x, y, width, height
        );

        if ( rotate ) {
            ctx.restore();
        }
    }
};
