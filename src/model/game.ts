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
import { sprite } from "zcanvas";
import type { canvas as zCanvas } from "zcanvas";
import type { GameDef, TableDef, FlipperType } from "@/definitions/game";
import {
    BALL_WIDTH, BALL_HEIGHT, MAX_BUMPS, BUMP_TIMEOUT, BUMP_IMPULSE,
    GameMessages, TriggerTarget, TriggerTypes, AwardablePoints, ActorLabels, ActorTypes,
} from "@/definitions/game";
import Tables from "@/definitions/tables";
import Actor from "@/model/actor";
import Ball from "@/model/ball";
import Bumper from "@/model/bumper";
import Flipper from "@/model/flipper";
import Popper from "@/model/popper";
import Rect from "@/model/rect";
import TriggerGroup from "@/model/trigger-group";
import { createEngine } from "@/model/physics/engine";
import type { IPhysicsEngine, CollisionEvent } from "@/model/physics/engine";
import { enqueueTrack, setFrequency } from "@/services/audio-service";
import SpriteCache from "@/utils/sprite-cache";

type IRoundEndHandler = ( readyCallback: () => void, timeout: number ) => void;
type IMessageHandler = ( message: GameMessages, optDuration?: number ) => void;

let engine: IPhysicsEngine;
let ball: Ball;
let flipper: Flipper;
let otherBall: Ball;
let table: TableDef;
let inUnderworld = false;
const actorMap: Map<number, Actor> = new Map(); // mapping all Actors to their physics body id
const balls: Ball[] = []; // separate list for quick access to Ball Actors
let triggerGroups: TriggerGroup[] = []; // separate list for quick access to TriggerGroups
let group: TriggerGroup;
let flippers: Flipper[] = []; // separate list for quick access to Flipper Actors

let canvas: zCanvas;
let backgroundRenderer: sprite;
let roundEndHandler: IRoundEndHandler;
let messageHandler: IMessageHandler;
let panOffset = 0;
let viewportWidth = 0;
let viewportHeight = 0; // cached in scaleCanvas()
let underworldOffset = 0;

let bumpAmount = 0;
let tilt = false;
let paused = false;

export const init = async (
    canvasRef: zCanvas, game: GameDef, roundEndHandlerRef: IRoundEndHandler, messageHandlerRef: IMessageHandler
): Promise<void> => {

    canvas = canvasRef;

    roundEndHandler = roundEndHandlerRef;
    messageHandler  = messageHandlerRef;

    table = Tables[ game.table ];
    const { width, height } = table;

    inUnderworld = false;

    // 1. clean up previous instances, when existing

    for ( const actor of actorMap.values() ) {
        actor.dispose( engine );
    }
    actorMap.clear();
    engine?.destroy();

    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }

    // 2. generate physics world and hook events into game logic

    engine = await createEngine( table, () => {
        handleEngineUpdate( engine, game );
    }, ( event: CollisionEvent ) => {
	    event.pairs.forEach( pair => {
    		if ( pair.bodyB.label !== ActorLabels.BALL ) {
                return;
            }
			switch ( pair.bodyA.label ) {
                case ActorLabels.POPPER:
                    engine.launchBall( pair.bodyB );
                    break;
                case ActorLabels.BUMPER:
                    awardPoints( game, AwardablePoints.BUMPER );
                    break;
                case ActorLabels.TRIGGER:
                    const triggerGroup = actorMap.get( pair.bodyA.id ) as TriggerGroup;
                    const groupHit = triggerGroup?.trigger( pair.bodyA.id );

                    if ( triggerGroup.triggerType !== TriggerTypes.SERIES ) {
                        awardPoints( game, AwardablePoints.TRIGGER );
                    }

                    if ( groupHit ) {
                        switch ( triggerGroup.triggerTarget ) {
                            default:
                                break;
                            case TriggerTarget.MULTIPLIER: {
                                triggerGroup.unsetTriggers();
                                game.multiplier = Math.min( 2 * game.multiplier, 32 );
                                messageHandler( GameMessages.MULTIPLIER );
                                break;
                            }
                            case TriggerTarget.MULTIBALL: {
                                awardPoints( game, AwardablePoints.TRIGGER_GROUP_COMPLETE );
                                triggerGroup.unsetTriggers();
                                createMultiball( 5, pair.bodyB.position.x, pair.bodyB.position.y );
                                messageHandler( GameMessages.MULTIBALL );
                                break;
                            }
                            case TriggerTarget.SEQUENCE_COMPLETION: {
                                awardPoints( game, AwardablePoints.TRIGGER_GROUP_SEQUENCE_COMPLETE * triggerGroup.completions );
                                triggerGroup.unsetTriggers();
                                messageHandler( triggerGroup.completeMessage );
                                break;
                            }
                        }
                    }
                    break;
			}
		})
    });

    // 3. generate background assets
    SpriteCache.BACKGROUND.src = table.background;
    backgroundRenderer = new sprite({ width, height, bitmap: SpriteCache.BACKGROUND });
    canvas.addChild( backgroundRenderer );

    // 4. generate Actors
    mapActor( new Popper( table.popper, engine, canvas ));

    flippers = table.flippers.map( flipperOpts => {
        const flipper = new Flipper( flipperOpts, engine, canvas );
        mapActor( flipper );
        return flipper;
    });

    for ( const bumperOpts of table.bumpers ) {
        mapActor( new Bumper( bumperOpts, engine, canvas ));
    }

    triggerGroups = table.triggerGroups.map( triggerDef => {
        group = new TriggerGroup( triggerDef, engine, canvas );
        // individual Trigger bodies' ids are mapped to their parent TriggerGroup
        group.triggers.map( trigger => mapActor( group, trigger.body.id ));
        return group;
    });

    for ( const rectOpts of table.rects ) {
        mapActor( new Rect( rectOpts, engine, canvas ));
    }

    startRound( game );

    // 5. and get the music goin'
    enqueueTrack( table.soundtrackId );
};

export const scaleCanvas = ( clientWidth: number, clientHeight: number ): void => {
    // TODO here we assume all tables are taller than wide
    const ratio  = table.height / table.width;
    const width  = Math.min( table.width, clientWidth );
    const height = Math.min( clientHeight, Math.round( width * ratio ));

    // by setting the dimensions we have set the "world size"
    canvas.setDimensions( table.width, table.height );

    // take into account that certain resolutions are lower than the table width
    const zoom = clientWidth < table.width ? clientWidth / table.width : 1;

    // the viewport however is local to the client window size
    viewportWidth  = width / zoom;
    viewportHeight = height / zoom;
    canvas.setViewport( viewportWidth, viewportHeight );
    // scale canvas to fit in the width
    canvas.scale( zoom );

    // the vertical offset at which the viewport should pan to follow the ball
    panOffset = ( viewportHeight / 2 ) - ( BALL_WIDTH / 2 );

    // the vertical offset we lock viewport panning to when ball is above the underworld
    underworldOffset = table.underworld - viewportHeight;
};

export const setFlipperState = ( type: FlipperType, isPointerDown: boolean ): void => {
    if ( tilt ) {
        return;
    }
    for ( flipper of flippers ) {
        if ( flipper.type === type ) {
            flipper.trigger( isPointerDown );
        }
    }
    if ( isPointerDown ) {
        return;
    }
    for ( group of triggerGroups ) {
        if ( type === ActorTypes.LEFT_FLIPPER ) {
            group.moveTriggersLeft();
        } else {
            group.moveTriggersRight();
        }
    }
};

export const bumpTable = ( game: GameDef ): void => {
    if ( tilt ) {
        return;
    }
    for ( ball of balls ) {
        if ( Math.abs( ball.body.velocity.y ) > 2 ) {
            continue; // ball is in the air, gets no impulse
        }
        const force = Math.random() > 0.5 ? BUMP_IMPULSE : -BUMP_IMPULSE;
        engine.applyForce( ball.body, Math.random() * force, force );
    }
    if ( ++bumpAmount >= MAX_BUMPS ) {
        tilt = true;
        messageHandler( GameMessages.TILT, 5000 );
        endRound( game, 5000 );
    }
    setTimeout(() => {
        bumpAmount = Math.max( 0, bumpAmount - 1 );
    }, BUMP_TIMEOUT );
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = ( timestamp: DOMHighResTimeStamp, framesSinceLastRender: number ): void => {
    ball = balls[ 0 ];

    if ( !ball || paused ) {
        return; // no ball means no game, keep last screen contents indefinitely
    }

    // update physics engine
    engine.update(( 1000 / canvas.getActualFrameRate()) * Math.round( framesSinceLastRender ));

    // update Actors

    actorMap.forEach( actor => actor.update( timestamp ));

    // align viewport with main (first) ball

    const { top } = ball.bounds;
    const { underworld } = table;
    const y = top - panOffset;

    canvas.panViewport( 0, y > underworldOffset && top < underworld ? underworld - viewportHeight : y );
};

/* DEBUG methods */

export const togglePause = (): void => {
    paused = !paused;
};

export const panViewport = ( yDelta: number ): void => {
    canvas.panViewport( 0, canvas.getViewport().top + yDelta );
};

/* internal methods */

function awardPoints( game: GameDef, points: number ): void {
    game.score += ( points * game.multiplier );
}

function handleEngineUpdate( engine: IPhysicsEngine, game: GameDef ): void {
    const singleBall = balls.length === 1;

    for ( ball of balls ) {
        engine.capSpeed( ball.body );
        const { left, top } = ball.bounds;

        const enteringUnderworld = !inUnderworld && top >= table.underworld;

        if ( singleBall ) {
            if ( enteringUnderworld ) {
                inUnderworld = true;
                setFrequency( 2000 );
            } else if ( inUnderworld && top < table.underworld ) {
                inUnderworld = false;
                setFrequency();
            }
        } else if ( enteringUnderworld ) {
            removeBall( ball );
            continue;
        }

        if ( top > table.height ) {
            removeBall( ball );

            if ( singleBall ) {
                endRound( game );
            }
        }
    }
}

function mapActor( actor: Actor, optId?: number ): void {
    actorMap.set( optId ?? actor.body.id, actor );
}

function removeBall( ball: Ball ): void {
    const index = balls.indexOf( ball );
    if ( index >= 0 ) {
        balls.splice( index, 1 );
    }
    actorMap.delete( ball.body.id );
    ball.dispose( engine );
}

function createBall( left: number, top: number ): Ball {
    const ball = new Ball({ left, top, width: BALL_WIDTH, height: BALL_HEIGHT }, engine, canvas );
    mapActor( ball );
    balls.push( ball );

    return ball;
}

function createMultiball( amount: number, left: number, top: number ): void {
    for ( let i = 0; i < amount; ++i ) {
        const m = ( i + 1 ) * BALL_WIDTH;
        createBall( left, top - m );
    }
}

function endRound( game: GameDef, timeout = 3500 ): void {
    setFrequency( 1000 );
    roundEndHandler( () => {
        for ( ball of balls ) {
            removeBall( ball ); // in case round ended on tilt without ball dropping
        }
        if ( --game.balls === 0 ) {
            game.active = false;
        } else {
            startRound( game );
        }
    }, timeout );
}

function startRound( game: GameDef ): void {
    createBall( table.popper.left, table.popper.top - BALL_HEIGHT );
    setFrequency();

    tilt = false;
    inUnderworld = false;
    game.underworld = false;
    game.multiplier = 1;
}
