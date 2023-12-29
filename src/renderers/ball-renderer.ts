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
import { Sprite } from "zcanvas";
import type { Viewport, IRenderer } from "zcanvas";
import { BALL_WIDTH, BALL_HEIGHT } from "@/definitions/game";
import type Actor from "@/model/actor";
import SpriteCache from "@/utils/sprite-cache";

const SPIN_SPEED = 30;

export default class BallRenderer extends Sprite {
    constructor( private actor: Actor ) {
        super({ resourceId: SpriteCache.BALL.resourceId, width: BALL_WIDTH, height: BALL_HEIGHT });
    }

    update(): void {
        let { x, y } = this.actor.body.velocity;
        const isMoving = x < 0 || y > 0;
        if ( x === 0 ) {
            x = 0.2; // ball should always spin, even when moving solely on vertical axis
        }
        this.setRotation( isMoving ? this.getRotation() + ( x * SPIN_SPEED ) : this.getRotation() - ( x * SPIN_SPEED ));
    }

    draw( renderer: IRenderer, viewport: Viewport ): void {
        this.update();

        if ( !this.actor.isInsideViewport( viewport )) {
            return;
        }

        const { left, top, width, height } = this.actor.bounds;

        // the ball spins while moving, rotate the canvas prior to rendering as usual

        renderer.drawImageCropped(
            this._resourceId,
            0, 0, width, height,
            left - viewport.left, top - viewport.top, width, height,
            this.getDrawProps(),
        );
    }
};
