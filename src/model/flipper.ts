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
import type { Canvas as zCanvas } from "zcanvas";
import { ActorLabels } from "@/definitions/game";
import type { IPhysicsEngine } from "@/model/physics/engine";
import type { ActorArgs, IRendererClass } from "@/model/actor";
import Rect from "@/model/rect";
import FlipperRenderer from "@/renderers/flipper-renderer";

export default class Flipper extends Rect {
    private isUp: boolean;

    constructor( args: ActorArgs, engine: IPhysicsEngine, canvas: zCanvas ) {
        super({ ...args, width: 132, height: 41, fixed: false }, engine, canvas );

        this.body.friction = 0.05;

        this.isUp = false;
    }

    trigger( up: boolean ): boolean {
        if ( up === this.isUp ) {
            return false;
        }
        this.isUp = up;
        this.engine.triggerFlipper( this.type, this.isUp );

        return up;
    }

    protected override getRendererClass(): IRendererClass | null {
        return FlipperRenderer;
    }

    protected override getLabel(): string {
        return ActorLabels.FLIPPER;
    }
};
