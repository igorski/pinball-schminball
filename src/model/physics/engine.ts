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
import Matter from "matter-js";
import type { Point } from "zcanvas";
// @ts-expect-error no typings available for this package
import MatterAttractors from "matter-attractors";
import type Actor from "@/model/actor";
import { ActorShapes } from "@/model/actor";

const GRAVITY = 0.75;
const BUMPER_BOUNCE = 1.5;
const PADDLE_PULL = 0.002;
const MAX_VELOCITY = 50;

Matter.use( MatterAttractors );

export interface IPhysicsEngine {
    engine: Matter.Engine;
    update: ( ticks: number ) => void;
    applyForce: ( body: Matter.Body, xImpulse: number, yImpulse: number ) => void;
    addBody: ( actor: Actor ) => Matter.Body;
    removeBody: ( body: Matter.Body ) => void;
};

export const createEngine = ( width: number, height: number ): IPhysicsEngine => {
    const engine = Matter.Engine.create();

    engine.world.gravity.y = GRAVITY;
    engine.world.bounds = {
        min: { x: 0, y: 0 },
        max: { x: width, y: height }
    };

    return {
        engine,
        update( ticks: number ): void {
            Matter.Engine.update( engine, ticks );
        },
        applyForce( body: Matter.Body, xImpulse: number, yImpulse: number ): void {
            Matter.Body.setVelocity( body, { x: xImpulse, y: yImpulse });
        },
        addBody( actor: Actor ): Matter.Body {
            const { left, top, width, height } = actor.bounds;
            let body: Matter.Body;
            switch ( actor.shape ) {
                default:
                case ActorShapes.RECT:
                    body = Matter.Bodies.rectangle( left, top, width, height, {
                        label: "rect",
                        angle: actor.angle,
                        isStatic: actor.fixed,
                        chamfer: { radius: 10 }
                    })
                    break;
                case ActorShapes.CIRCLE:
                    body = Matter.Bodies.circle( left, top, width / 2, {
                        label: "circle",/*
                        collisionFilter: {
                            group: stopperGroup
                        },*/
                    });
                    break;
            }
            Matter.World.add( engine.world, body );

            return body;
        },
        removeBody( body: Matter.Body ): void {
            Matter.World.remove( engine.world, body );
        },
    };
};
