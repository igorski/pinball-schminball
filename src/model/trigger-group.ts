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
import type { ObjectDef, TriggerDef, TriggerTarget } from "@/definitions/game";
import { ActorLabels, TriggerTypes, TRIGGER_EXPIRY } from "@/definitions/game";
import Actor from "@/model/actor";
import type { ActorOpts } from "@/model/actor";
import type { IPhysicsEngine } from "@/model/physics/engine";
import Trigger from "@/model/trigger";

export default class TriggerGroup extends Actor {
    public triggerTarget: TriggerTarget;
    public triggerType: TriggerTypes;
    public triggers: Trigger[];

    private activeTriggers = new Set<number>(); // Body ids of active triggers
    private triggerTimeoutStart = 0;

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

    /**
     * Invoked whenever one of the child Trigger bodies within this TriggerGroup is hit.
     * Returns boolean value indicating whether all triggers have been hit, so the
     * game class can taken appropriate state changing action.
     */
    trigger( triggerBodyId: number ): boolean {
        const trigger = this.triggers.find( trigger => trigger.body.id === triggerBodyId );
        if ( trigger === undefined ) {
            return false;
        }
        this.activeTriggers.add( triggerBodyId );
        trigger.setActive( true );

        return this.activeTriggers.size === this.triggers.length;
    }

    moveTriggersLeft(): void {
        if ( this.activeTriggers.size === 0 ) {
            return;
        }
        const activeValues = this.triggers.map( trigger => trigger.active );
        const first = activeValues.shift();
        activeValues.push( first );

        this.updateTriggers( activeValues );
    }

    moveTriggersRight(): void {
        if ( this.activeTriggers.size === 0 ) {
            return;
        }
        const activeValues = this.triggers.map( trigger => trigger.active );
        const last = activeValues.pop();
        activeValues.unshift( last );

        this.updateTriggers( activeValues );
    }

    /**
     * Unset the active state of all triggers
     */
    unsetTriggers(): void {
        for ( const trigger of this.triggers ) {
            trigger.setActive( false );
        }
        this.activeTriggers.clear();
    }

    override update( timestamp: DOMHighResTimeStamp ): void {
        if ( this.activeTriggers.size === 0 ) {
            return;
        }

        // when trigger type is timed (e.g. all triggers need to be set to active within
        // a certain threshold), we start a timeout that will unset all active triggers if
        // not all of them where activated within this period

        if ( this.triggerType === TriggerTypes.SERIES ) {
            if ( this.triggerTimeoutStart === 0 ) {
                this.triggerTimeoutStart = timestamp;
            } else if ( timestamp - this.triggerTimeoutStart >= TRIGGER_EXPIRY ) {
                this.unsetTriggers();
                this.triggerTimeoutStart = 0;
            }
        }
    }

    protected override register( engine: IPhysicsEngine, canvas: zCanvas ): void {
        const triggerObjectDefs = this._opts.triggers as never as ObjectDef[];
        this.triggers = triggerObjectDefs.map( trigger => {
            return new Trigger( trigger, engine, canvas );
        });
    }

    protected override getLabel(): string {
        return ActorLabels.TRIGGER_GROUP;
    }

    protected updateTriggers( activeValues: boolean[] ): void {
        this.activeTriggers.clear();

        for ( let i = 0, l = this.triggers.length; i < l; ++i ) {
            const trigger = this.triggers[ i ];
            const isActive = activeValues[ i ];

            trigger.setActive( isActive );
            if ( isActive ) {
                this.activeTriggers.add( trigger.body.id );
            }
        }
    }
}
