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
import {
    GRAVITY, FLIPPER_FORCE, LAUNCH_SPEED, MAX_SPEED,
    ActorTypes, ActorLabels
} from "@/definitions/game";
import type { TableDef } from "@/definitions/game";
import type Actor from "@/model/actor";
import { loadVertices } from "@/services/svg-loader";

Matter.use( MatterAttractors );

enum FlipperPositions {
    UP,
    DOWN
};

export interface IPhysicsEngine {
    engine: Matter.Engine;
    update: ( ticks: number ) => void;
    applyForce: ( body: Matter.Body, xImpulse: number, yImpulse: number ) => void;
    addBody: ( actor: Actor, label: string ) => Matter.Body;
    removeBody: ( body: Matter.Body ) => void;
    updateBodyPosition: ( body: Matter.Body, position: Point ) => void;
    launchBall: ( body: Matter.Body ) => void;
    triggerFlipper: ( type: ActorTypes, upwards: boolean ) => void;
    capSpeed: ( body: Matter.Body ) => void;
    destroy: () => void;
};

export interface CollisionEvent {
    pairs: { bodyA: Matter.Body, bodyB: Matter.Body }[]
};

export const createEngine = async (
    table: TableDef, beforeUpdateHandler: () => void, collisionHandler: ( event: CollisionEvent ) => void
): Promise<IPhysicsEngine> => {
    const engine = Matter.Engine.create();

    const { width, height } = table;

    // @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
    if ( import.meta.env.MODE !== "production" ) {
        // renderBodies( engine, width, height );
    }
    engine.world.gravity.y = GRAVITY;
    engine.world.bounds = {
        min: { x: 0, y: 0 },
        max: { x: width, y: height }
    };
    engine.positionIterations = 16;

    Matter.Events.on( engine, "collisionStart", collisionHandler );
    Matter.Events.on( engine, "beforeUpdate", beforeUpdateHandler );

    let isLeftFlipperUp  = false;
    let isRightFlipperUp = false;

    // collision group to be ignored by all circular Actors
    const ignoreGroup = Matter.Body.nextGroup( true );

    const createIgnorable = ( x: number, y: number, radius: number, optPlugin?: any ): Matter.Body => {
        return Matter.Bodies.circle( x, y, radius, {
            isStatic: true,
            collisionFilter: {
                group: ignoreGroup
            },
            plugin: optPlugin,
        });
    };

    const bodyVertices = await loadVertices( table.body.source );
    Matter.Composite.add( engine.world,
        Matter.Bodies.fromVertices( table.body.left + table.body.width / 2, table.body.top + table.body.height / 2, bodyVertices, {
        isStatic: true,
        friction: 0,
    }, true ));

    for ( const reflector of table.reflectors ) {
        const bodyVertices = await loadVertices( reflector.source );
        Matter.Composite.add( engine.world,
            Matter.Bodies.fromVertices( reflector.left + reflector.width / 2, reflector.top + reflector.height / 2, bodyVertices, {
            isStatic: true,
            restitution: 0.5
        }, true ));
    }

    return {
        engine,
        update( ticks: number ): void {
            Matter.Engine.update( engine, ticks );
        },
        applyForce( body: Matter.Body, xImpulse: number, yImpulse: number ): void {
            Matter.Body.setVelocity( body, { x: xImpulse, y: yImpulse });
        },
        addBody( actor: Actor, label: string ): Matter.Body {
            const { left, top, width, height } = actor.bounds;
            let body: Matter.Body;
            switch ( actor.type ) {
                default:
                case ActorTypes.RECTANGULAR:
                    body = Matter.Bodies.rectangle( left, top, width, height, {
                        label,
                        angle: actor.angle,
                        isStatic: actor.fixed,
                        chamfer: { radius: 10 }
                    })
                    break;

                case ActorTypes.CIRCULAR:
                    const isBumper = label !== ActorLabels.BALL;
                    body = Matter.Bodies.circle( left + width / 2, top + height / 2, width / 2, {
                        label,
                        isSensor: actor.sensor,
                        isStatic: actor.fixed,
                        collisionFilter: {
                            group: !isBumper ? ignoreGroup : undefined
                        },
                    });
                    if ( isBumper ) {
                        body.restitution = 1.0;
                    }
                    break;

                case ActorTypes.LEFT_FLIPPER:
                case ActorTypes.RIGHT_FLIPPER:
                    const id = actor.id.toString();
                    const isLeftFlipper = actor.type === ActorTypes.LEFT_FLIPPER;

                    body = Matter.Bodies.rectangle(
                        left, top, width, height, {
                            label: id,
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
                                if ( b.label !== id ) {
                                    return;
                                }
                                const isFlipperUp = isLeftFlipper ? isLeftFlipperUp : isRightFlipperUp;
                                if ( position === FlipperPositions.UP && isFlipperUp ||
                                     position === FlipperPositions.DOWN && !isFlipperUp )
                                 {
                                    return {
                                        x: ( a.position.x - b.position.x ) * FLIPPER_FORCE,
                                        y: ( a.position.y - b.position.y ) * FLIPPER_FORCE,
                                    };
                                }
                            }
                        ]
                    });
                    // we restrict the area of movement by using non-visible circles that cannot collide with the balls
                    const ignorableX = isLeftFlipper ? pivotX + 30 : pivotX - 20;
                    const lowerMult  = isLeftFlipper ? 0.8 : 0.7;

                    const ignore1 = createIgnorable( ignorableX, pivotY - width, height * 1.5, plugin( FlipperPositions.UP ));
                    const ignore2 = createIgnorable( ignorableX, pivotY + width * lowerMult, height, plugin( FlipperPositions.DOWN ));

                    Matter.World.add( engine.world, [ ignore1, ignore2 ]); // otherwise attractors won't work

                    const composite = Matter.Composite.add( Matter.Composite.create(), [ body, pivot, constraint, ignore1, ignore2 ]);
                    Matter.Composite.rotate( composite, actor.angle, { x: pivotX, y: pivotY });

                    Matter.World.add( engine.world, composite );
                    return body;
            }
            Matter.World.add( engine.world, body );
            return body;
        },
        removeBody( body: Matter.Body ): void {
            Matter.World.remove( engine.world, body );
        },
        updateBodyPosition( body: Matter.Body, position: Point ): void {
            Matter.Body.setPosition( body, position );
        },
        launchBall( body: Matter.Body ): void {
            Matter.Body.setVelocity( body, { x: 0, y: -LAUNCH_SPEED });
        },
        triggerFlipper( type: ActorTypes, isUp: boolean ): void {
            if ( type === ActorTypes.LEFT_FLIPPER ) {
                isLeftFlipperUp = isUp;
            } else {
                isRightFlipperUp = isUp;
            }
        },
        capSpeed( body: Matter.Body ): void {
            Matter.Body.setVelocity( body, {
                x: Math.max( Math.min( body.velocity.x, MAX_SPEED ), -MAX_SPEED ),
                y: Math.max( Math.min( body.velocity.y, MAX_SPEED ), -MAX_SPEED ),
            });
        },
        destroy(): void {
            Matter.Engine.clear( engine );
        },
    };
};

/* internal methods */

/**
 * Debug method to view the bodies as visualised by the Matter JS renderer
 */
function renderBodies( engine: Matter.Engine, width = 800, height = 600 ): void {
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
