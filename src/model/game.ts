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

export const BALL_WIDTH  = 40;
export const BALL_HEIGHT = BALL_WIDTH;
const MIN_BALL_SPEED     = 0.35; // the speed at which gravity pulls the ball down instantly
const MAX_BALL_SPEED     = 10;   // maximum ball speed

let engine: IPhysicsEngine;
let engineStep: number = 1000 / 60;
const balls: Ball[] = [];
let flippers: Flipper[] = [];
let ball: Ball;
let flipper: Flipper;
let otherBall: Ball;
let table: TableDef;
let inUnderworld = false;

let canvas: zCanvas;
let backgroundRenderer: sprite;
let panOffset = 0;
let viewportWidth = 0;
let viewportHeight = 0; // cached in scaleCanvas()
let underworldOffset = 0;

export const init = async ( canvasRef: zCanvas, game: GameDef ): Promise<void> => {
    canvas = canvasRef;
    engineStep = 1000 / canvas.getFrameRate();

    table = Tables[ game.table ];
    const { width, height } = table;

    // 1. generate physics world and hook events into game logic

    inUnderworld = false;

    engine?.destroy();
    engine = await createEngine( table, () => {
        handleEngineUpdate( engine, game );
    }, ( event: CollisionEvent ) => {
	    event.pairs.forEach( pair => {
    		if ( pair.bodyB.label !== "ball" ) {
                return;
            }
			switch ( pair.bodyA.label ) {
                case "popper":
                    engine.launchBall( pair.bodyB );
                    break;
                case "bumper":
                    game.score += 100;
                    break;
                case "trigger":
                    console.warn( "trigger hit! map its label to its group and do stuff! of the unit testable kind please." );
                    break;
			}
		})
    });

    // 2. clear previous canvas contents
    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }

    // 3. generate background assets
    SpriteCache.BACKGROUND.src = table.background;
    backgroundRenderer = new sprite({ width, height, bitmap: SpriteCache.BACKGROUND });
    canvas.addChild( backgroundRenderer );

    // 4. generate Actors
    new Popper( table.popper, engine, canvas );

    flippers = table.flippers.map( flipperOpts => {
        return new Flipper( flipperOpts, engine, canvas );
    });

    for ( const bumperOpts of table.bumpers ) {
        new Bumper( bumperOpts, engine, canvas );
    }

    for ( const triggerDef of table.triggerGroups ) {
        new TriggerGroup( triggerDef, engine, canvas );
    }

    for ( const rectOpts of table.rects ) {
        new Rect( rectOpts, engine, canvas );
    }

    createBall( table.popper.left, table.popper.top );

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

export const setFlipperState = ( type: FlipperType, up: boolean ): void => {
    flippers.forEach( flipper => {
        if ( flipper.type === type ) {
            flipper.trigger( up );
        }
    });
};

export const bumpTable = (): void => {
    for ( ball of balls ) {
        const dir = Math.random() > .5;
        const force = dir ? 4 : -4;
        // TODO: apply to world instead?
        engine.applyForce( ball.body, Math.random() * force, ball.body.velocity.y );// Math.random() * force );
    }
    console.warn( "TODO: not too much bumpin'!" );
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = ( /*timestamp: DOMHighResTimeStamp*/ ): void => {
    ball = balls[ 0 ];

    if ( !ball ) {
        return; // no ball means no game, keep last screen contents indefinitely
    }

    // update physics engine
    engine.update( engineStep );

    // align viewport with main (first) ball

    const { top } = ball.bounds;
    const { underworld } = table;
    const y = top - panOffset;

    canvas.panViewport( 0, y > underworldOffset && top < underworld ? underworld - viewportHeight : y );
};

/* internal methods */

function handleEngineUpdate( engine: IPhysicsEngine, game: GameDef ): void {
    const singleBall = balls.length === 1;

    for ( const ball of balls ) {
        engine.capSpeed( ball.body );
        const { top } = ball.bounds;

        if ( singleBall ) {
            if ( !inUnderworld && top >= table.underworld ) {
                inUnderworld = true;
                setFrequency( 2000 );
            } else if ( inUnderworld && top < table.underworld ) {
                inUnderworld = false;
                setFrequency();
            }
        }

        if ( top > table.height ) {
            disposeActor( ball, balls );
            if ( singleBall ) {
                if ( --game.balls === 0 ) {
                    game.active = false;
                } else {
                    setTimeout(() => {
                        createBall( table.popper.left, table.popper.top );
                        setFrequency();
                        inUnderworld = false;
                    }, 2500 );
                }
            }
        }
    }
}

function disposeActor( actor: Actor, actorList: Actor[] ): void {
    // TODO: maintain linked lists instead for higher performance
    let index = actorList.indexOf( actor );
    if ( index >= 0 ) {
        actorList.splice( index, 1 );
    }
    actor.dispose( engine );
}

function createBall( left: number, top: number ): Ball {
    const ball = new Ball({ left, top, width: BALL_WIDTH, height: BALL_HEIGHT }, engine, canvas );
    balls.push( ball );

    return ball;
}

function createMultiball( amount = 5, left = 0, top = 0 ): void {
    for ( let i = 0; i < amount; ++i ) {
        const m = ( i + 1 ) * BALL_WIDTH;
        createBall( left - m, top - m );
    }
}
