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
// @ts-expect-error no type definitions for matter-attractors
import MatterAttractors from "matter-attractors";
import type { Point } from "zcanvas";
import type { LevelDef } from "@/definitions/levels";
import type Actor from "@/model/actor";
import { ActorTypes } from "@/model/actor";
import { loadVertices } from "@/services/svg-loader";

Matter.use( MatterAttractors );

const GRAVITY     = 0.75;
const PADDLE_PULL = 0.002;

enum FlipperPositions {
    UP,
    DOWN
};

export interface IPhysicsEngine {
    engine: Matter.Engine;
    update: ( ticks: number ) => void;
    applyForce: ( body: Matter.Body, xImpulse: number, yImpulse: number ) => void;
    addBody: ( actor: Actor ) => Matter.Body;
    removeBody: ( body: Matter.Body ) => void;
    triggerFlipper: ( type: ActorTypes, upwards: boolean ) => void;
};

export const createEngine = async ( level: LevelDef ): Promise<IPhysicsEngine> => {
    const engine = Matter.Engine.create();

    const { width, height } = level;

    // @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
    if ( import.meta.env.MODE !== "production" ) {
        renderBodies( engine );
    }
    engine.world.gravity.y = GRAVITY;
    engine.world.bounds = {
        min: { x: 0, y: 0 },
        max: { x: width, y: height }
    };

    let isLeftPaddleUp = false;
    let isRightPaddleUp = false;

    // collision group to be ignored by all circular Actors
    const ignoreGroup = Matter.Body.nextGroup( true );

    const createIgnorable = ( x: number, y: number, radius: number, optPlugin?: any ): Matter.Body => {
        return Matter.Bodies.circle( x, y, radius, {
            isStatic: true,
            render: {
                visible: true,//false,
            },
            collisionFilter: {
                group: ignoreGroup
            },
            plugin: optPlugin,
        });
    };

    const bodyVertices = await loadVertices( level.body );
    Matter.Composite.add( engine.world, Matter.Bodies.fromVertices( 400, 80, bodyVertices, {
        render: {
            fillStyle: "#FF0000",
            strokeStyle: "#00FF00",
            lineWidth: 1
        }
    }, true ));

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
            switch ( actor.type ) {
                default:
                case ActorTypes.RECTANGULAR:
                    body = Matter.Bodies.rectangle( left, top, width, height, {
                        angle: actor.angle,
                        isStatic: actor.fixed,
                        chamfer: { radius: 10 }
                    })
                    break;
                case ActorTypes.CIRCULAR:
                    body = Matter.Bodies.circle( left, top, width / 2, {
                        collisionFilter: {
                            group: ignoreGroup
                        },
                    });
                    break;
                case ActorTypes.LEFT_FLIPPER:
                case ActorTypes.RIGHT_FLIPPER:
                    const isLeftFlipper = actor.type === ActorTypes.LEFT_FLIPPER;
                    body = Matter.Bodies.rectangle(
                        left, top, width, height, {
                            label: actor.id,
                            frictionAir: 0,
                            chamfer: {},
                        }
                    );
                    const pivotX = isLeftFlipper ? left - width / 2 : left + width / 2;
                    const pivotY = top;
                    const pivot  = Matter.Bodies.circle( pivotX, pivotY, 5, { isStatic: true });

                    const constraint = Matter.Constraint.create({
                        pointA: { x: pivotX, y: pivotY },
                        bodyB: body,
                        pointB: { x: isLeftFlipper ? -width / 2 : width / 2, y: 0 },
                        stiffness: 0
                    });

                    const plugin = ( position: FlipperPositions ): any => ({
                        attractors: [
                            ( a: Matter.Body, b: Matter.Body ): Point => {
                                if ( b.label !== actor.id ) {
                                    return;
                                }
                                const isPaddleUp = isLeftFlipper ? isLeftPaddleUp : isRightPaddleUp;
                                if ( position === FlipperPositions.UP && isPaddleUp ||
                                     position === FlipperPositions.DOWN && !isPaddleUp )
                                 {
                                    return {
                                        x: ( a.position.x - b.position.x ) * PADDLE_PULL,
                                        y: ( a.position.y - b.position.y ) * PADDLE_PULL,
                                    };
                                }
                            }
                        ]
                    });

                    // we restrict the area of movement by using non-visible circles that cannot collide with the balls
                    const ignorableX = isLeftFlipper ? pivotX + 30 : pivotX - 20;
                    Matter.World.add( engine.world, createIgnorable( ignorableX, pivotY - width * 1, height, plugin( FlipperPositions.UP )));
                    Matter.World.add( engine.world, createIgnorable( ignorableX, pivotY + width * 0.8, height, plugin( FlipperPositions.DOWN )));

                    Matter.World.add( engine.world, [ body, pivot, constraint ]);
                    return body;
            }
            Matter.World.add( engine.world, body );

            return body;
        },
        removeBody( body: Matter.Body ): void {
            Matter.World.remove( engine.world, body );
        },
        triggerFlipper( type: ActorTypes, isUp: boolean ): void {
            if ( type === ActorTypes.LEFT_FLIPPER ) {
                isLeftPaddleUp = isUp;
            } else {
                isRightPaddleUp = isUp;
            }
        },
    };
};

/* internal methods */

/**
 * Debug method to view the bodies as visualised by the Matter JS renderer
 */
function renderBodies( engine: Matter.Engine, width = 800, height = 1900 ): void {
    const render = Matter.Render.create({
        element: document.body,
        engine,
        options: {
            width,
            height,
            showAngleIndicator: true,
            showCollisions: true,
            showVelocity: true
        }
    });
    const scale = window.innerHeight / height;
    Object.assign(
        render.canvas.style, {
            position: "absolute",
            zIndex: 1,
            top: "50%",
            left: "50%",
            opacity: 0.75,
            transform: `scale(${scale}) translate(-50%, -50%)`,
            [ "transform-origin" ]: "0 0"
        }
    );
    Matter.Render.run( render );
}
