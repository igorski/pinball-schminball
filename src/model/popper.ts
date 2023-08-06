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
import type { Point, canvas as zCanvas } from "zcanvas";
import { LAUNCH_SPEED, ActorLabels, ImpulseDirection } from "@/definitions/game";
import Rect from "@/model/rect";
import type { ActorArgs, IRendererClass } from "@/model/actor";
import type { IPhysicsEngine } from "@/model/physics/engine";
import RectRenderer from "@/renderers/rect-renderer";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class Popper extends Rect {
    public once: boolean;

    private direction: ImpulseDirection;
    private force: number;

    constructor( args: ActorArgs, engine: IPhysicsEngine, canvas: zCanvas ) {
        super({ ...args, fixed: true }, engine, canvas );

        this.body.isSensor = true;

        const { opts } = args;

        this.once      = opts?.once ?? false;
        this.force     = opts?.force ?? LAUNCH_SPEED;
        this.direction = opts?.direction ?? ImpulseDirection.UP;
    }

    getImpulse(): Point {
        let x = 0;
        let y = 0;

        switch ( this.direction ) {
            default:
            case ImpulseDirection.UP:
                y = -this.force;
                break;
            case ImpulseDirection.DOWN:
                y = this.force;
                break;
            case ImpulseDirection.LEFT:
                x = -this.force;
                break;
            case ImpulseDirection.UP_LEFT:
                x = -this.force;
                y = -this.force / 2;
                break;
            case ImpulseDirection.DOWN_LEFT:
                x = -this.force;
                y = this.force / 2;
                break;
            case ImpulseDirection.RIGHT:
                x = this.force;
                break;
            case ImpulseDirection.UP_RIGHT:
                x = this.force;
                y = -this.force / 2;
                break;
            case ImpulseDirection.DOWN_RIGHT:
                x = this.force;
                y = this.force / 2;
                break;
        }
        return { x, y };
    }

    protected override getLabel(): string {
        return ActorLabels.POPPER;
    }

    /**
     * Poppers are by default invisible, but it might
     * be convenient to debug their position
     */
    protected getRendererClass(): IRendererClass | null {
        return DEBUG ? RectRenderer : null;
    }
}
