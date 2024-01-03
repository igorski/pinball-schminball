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
import type { Point, Viewport, IRenderer } from "zcanvas";
import { ActorTypes } from "@/definitions/game";
import type Flipper from "@/model/flipper";
import { radToDeg } from "@/utils/math-util";
import SpriteCache from "@/utils/sprite-cache";

export default class FlipperRenderer extends Sprite {
    private pivot: Point = { x: 0, y: 0 };

    constructor( private actor: Flipper ) {
        super({
            resourceId : actor.type === ActorTypes.LEFT_FLIPPER ? SpriteCache.FLIPPER_LEFT.resourceId : SpriteCache.FLIPPER_RIGHT.resourceId,
            width  : actor.bounds.width,
            height : actor.bounds.height
        });
    }

    override draw( renderer: IRenderer, viewport: Viewport ): void {
        const { left, top, width, height } = this._bounds;
        const { angle } = this.actor;
        const rotate = angle !== 0;

        if ( rotate ) {
            const actorPivot = this.actor.getPivot();

            this.pivot.x = actorPivot.x - viewport.left;
            this.pivot.y = actorPivot.y - viewport.top;

            this.setRotation( radToDeg( angle ), this.pivot );
        }

        if ( !this.isVisible( viewport )) {
            return; // out of visual bounds
        }

        renderer.drawImageCropped(
            this._resourceId,
            0, 0, width, height,
            left - viewport.left, top - viewport.top, width, height,
            this.getDrawProps(),
        );
    }
};
