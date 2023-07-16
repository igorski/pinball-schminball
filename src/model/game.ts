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
import type { GameDef } from "@/definitions/game";
import Tables from "@/definitions/tables";
import type { TableDef, FlipperType } from "@/definitions/tables";
import Actor from "@/model/actor";
import Ball from "@/model/ball";
import Circle from "@/model/circle";
import Flipper from "@/model/flipper";
import Popper from "@/model/popper";
import Rect from "@/model/rect";
import { createEngine } from "@/model/physics/engine";
import type { IPhysicsEngine, CollisionEvent } from "@/model/physics/engine";
import BallRenderer from "@/renderers/ball-renderer";
import BumperRenderer from "@/renderers/bumper-renderer";
import FlipperRenderer from "@/renderers/flipper-renderer";
import RectRenderer from "@/renderers/rect-renderer";
import SpriteCache from "@/utils/sprite-cache";

const { cos, sin, min, round } = Math;

export const BALL_WIDTH  = 40;
export const BALL_HEIGHT = BALL_WIDTH;
const MIN_BALL_SPEED     = 0.35; // the speed at which gravity pulls the ball down instantly
const MAX_BALL_SPEED     = 10;   // maximum ball speed

let engine: IPhysicsEngine;
let engineStep: number = 1000 / 60;
const balls: Ball[] = [];
let bumpers: Circle[] = [];
let flippers: Flipper[] = [];
let ball: Ball;
let bumper: Circle;
let flipper: Flipper;
let otherBall: Ball;
let rects: Rect[];
let rect: Rect;
let table: TableDef;
let score = 0;

let leftFlipperUp = false;
let rightFlipperUp = false;

let canvas: zCanvas;
let backgroundRenderer: sprite;
let renderer: sprite;
const renderers: sprite[] = [];
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

    engine = await createEngine( table, () => {
        for ( const ball of balls ) {
            engine.capSpeed( ball.body );
            if ( ball.bounds.top > table.height ) {
                disposeActor( ball, balls );
                if ( balls.length === 0 ) {
                    if ( --game.balls === 0 ) {
                        game.active = false;
                    } else {
                        setTimeout(() => createBall( engine, table.popper.left, table.popper.top ), 2500 );
                    }
                }
            }
        }
    }, ( event: CollisionEvent ) => {
	    event.pairs.forEach( pair => {
    		if ( pair.bodyB.label !== "ball" ) {
                return;
            }
			switch ( pair.bodyA.label ) {
				case "circle":
                    game.score += 100;
					break;
                case "popper":
                    engine.launchBall( pair.bodyB );
                    break;
			}
		})
    });

    // 2. clear previous canvas contents
    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }
    renderers.length = 0;

    // 3. generate background assets
    SpriteCache.BACKGROUND.src = table.background;
    backgroundRenderer = new sprite({ width, height, bitmap: SpriteCache.BACKGROUND });
    renderers.push( backgroundRenderer );

    // 4. generate Actors
    new Popper( engine, table.popper );

    flippers = table.flippers.map( flipperOpts => {
        return new Flipper( engine, flipperOpts );
    });

    bumpers = table.bumpers.map( bumperOpts => {
        return new Circle( engine, bumperOpts );
    });

    createBall( engine, table.popper.left, table.popper.top );

    // 5. generate sprites for Actors

    flippers.forEach( flipper => renderers.push( new FlipperRenderer( flipper )));

    for ( bumper of bumpers ) {
        bumper.renderer = new BumperRenderer( bumper );
        renderers.push( bumper.renderer );
    }

    for ( const rectDef of table.rects ) {
        rect = new Rect( engine, rectDef );
        rect.renderer = new RectRenderer( rect );
        renderers.push( rect.renderer );
    }

    for ( const renderer of renderers ) {
        canvas.addChild( renderer );
    }
};

export const scaleCanvas = ( clientWidth: number, clientHeight: number ): void => {
    // TODO here we assume all tables are taller than wide
    const ratio  = table.height / table.width;
    const width  = min( table.width, clientWidth );
    const height = min( clientHeight, round( width * ratio ));

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
        engine.applyForce( ball.body, Math.random() * force, Math.random() * 4 );
    }
    console.warn( "TODO: not too much bumpin'!" );
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = ( timestamp: DOMHighResTimeStamp ): void => {
    ball = balls[ 0 ];

    if ( !ball ) {
        return; // no ball means no game, keep last screen contents indefinitely
    }

    // update physics engine
    engine.update( engineStep );

    // render content
    for ( renderer of renderers ) {
        renderer.update( timestamp, 0 );
    }

    // keep main ball within view
    const { top } = ball.bounds;
    const { underworld } = table;
    const y = top - panOffset;

    canvas.panViewport( 0, y > underworldOffset && top < underworld ? underworld - viewportHeight : y );
};

/* internal methods */

function disposeActor( actor: Actor, actorList: Actor[] ): void {
    // TODO: maintain linked lists instead for higher performance
    let index = actorList.indexOf( actor );
    if ( index >= 0 ) {
        actorList.splice( index, 1 );
    }
    index = renderers.indexOf( actor.renderer );
    if ( index >= 0 ) {
        renderers.splice( index, 1 );
    }
    actor.renderer.dispose();
    actor.unregister( engine );
}

function createBall( engine: IPhysicsEngine, left: number, top: number ): Ball {
    const ball = new Ball( engine, { left, top, width: BALL_WIDTH, height: BALL_HEIGHT });
    ball.renderer = new BallRenderer( ball );

    balls.push( ball );
    renderers.push( ball.renderer );

    canvas.addChild( ball.renderer );

    return ball;
}

function createMultiball( engine: IPhysicsEngine, amount = 5, left = 0, top = 0 ): void {
    for ( let i = 0; i < amount; ++i ) {
        const m = ( i + 1 ) * BALL_WIDTH;
        createBall( engine, left - m, top - m );
    }
}
