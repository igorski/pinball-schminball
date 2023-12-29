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
import { Sprite } from "zcanvas";
import type { Viewport, IRenderer } from "zcanvas";
import type Trigger from "@/model/trigger";

const SPIN_SPEED = 30;

export default class TriggerRenderer extends Sprite {
    constructor( private actor: Trigger ) {
        super({ width: actor.bounds.width, height: actor.bounds.width });
    }

    draw( renderer: IRenderer, viewport: Viewport ): void {
        if ( !this.actor.isInsideViewport( viewport )) {
            return;
        }

        const { left, top, width, height } = this.actor.bounds;
        const { radius } = this.actor;

        renderer.drawCircle(
            left - viewport.left, top - viewport.top, radius,
            "transparent",
            { color: this.actor.active ? "#FFF" : "#00AEEF", size: 2 }
        );
    }
};
