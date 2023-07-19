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
import type { canvas as zCanvas } from "zcanvas";
import { ActorTypes, ActorLabels } from "@/definitions/game";
import Actor from "@/model/actor";
import type { ActorOpts, IRendererClass } from "@/model/actor";
import type { IPhysicsEngine } from "@/model/physics/engine";
import BumperRenderer from "@/renderers/bumper-renderer";

export default class Bumper extends Actor {
    constructor( opts: ActorOpts, engine: IPhysicsEngine, canvas: zCanvas ) {
        super({
            ...opts, type: ActorTypes.CIRCULAR, radius: opts.radius ?? opts.width / 2
        }, engine, canvas );
    }

    protected override getRendererClass(): IRendererClass | null {
        return BumperRenderer;
    }

    protected override getLabel(): string {
        return ActorLabels.BUMPER;
    }
}
