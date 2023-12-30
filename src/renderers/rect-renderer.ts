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
import Bowser from "bowser";
import { Sprite } from "zcanvas";
import type { Viewport, IRenderer } from "zcanvas";
import type Rect from "@/model/rect";
import { radToDeg } from "@/utils/math-util";

export default class RectRenderer extends Sprite {
    constructor( private actor: Rect ) {
        super({
            width  : actor.bounds.width,
            height : actor.bounds.height
        });

        // roundRect() is not available in all browsers
        // when unsupported, remove radius from Actor (should only have a minor effect, radius is cosmetic for Rects)

        const parser = Bowser.getParser( window.navigator.userAgent );
        const majorVersion = parser.getBrowserVersion().split(".").map( parseInt )[ 0 ];
        actor.radius = ( parser.getBrowserName() === "safari" && majorVersion < 16 ) ? 0 : actor.radius;
    }

    draw( renderer: IRenderer, viewport: Viewport ): void {
        const { left, top, width, height } = this._bounds;
        const { angle, radius } = this.actor;

        const rotate = angle !== 0;

        // @todo can we cache these
        if ( rotate ) {
            const pivot = this.actor.getPivot();
            this.setRotation( radToDeg( angle ), { x: pivot.x - viewport.left, y: pivot.y - viewport.top });
        }

        if ( !this.isVisible( viewport )) {
            return; // out of visual bounds
        }

        const color = "gray";

        if ( radius === 0 ) {
            renderer.drawRect( left - viewport.left, top - viewport.top, width, height, color, undefined, this.getDrawProps() );
        } else {
            renderer.drawRoundRect( left - viewport.left, top - viewport.top, width, height, radius, color, undefined, this.getDrawProps() );
        }
    }
};
