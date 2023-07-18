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
import type { canvas as zCanvas } from "zcanvas";
import type { ObjectDef, TriggerDef, TriggerTarget, TriggerTypes } from "@/definitions/game";
import Actor from "@/model/actor";
import type { ActorOpts } from "@/model/actor";
import type { IPhysicsEngine } from "@/model/physics/engine";
import Trigger from "@/model/trigger";

export default class TriggerGroup extends Actor {
    public triggerTarget: TriggerTarget;
    public triggerType: TriggerTypes;

    private triggerParts: ObjectDef[];
    private triggers: Trigger[];

    constructor( private opts: TriggerDef, engine: IPhysicsEngine, canvas: zCanvas ) {
        super({ fixed: true, opts }, engine, canvas );

        this.triggerTarget = opts.target;
        this.triggerType   = opts.type;
    }

    dispose( engine: IPhysicsEngine ): void {
        for ( const trigger of this.triggers ) {
            trigger.dispose( engine );
        }
        this.triggers.length = 0;
    }

    protected register( engine: IPhysicsEngine, canvas: zCanvas ): void {
        const triggerObjectDefs = this._opts.triggers as never as ObjectDef[];
        this.triggers = triggerObjectDefs.map( trigger => {
            return new Trigger( trigger, engine, canvas );
        });
    }

    protected override getLabel(): string {
        return "trigger-group";
    }
}
