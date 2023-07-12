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
import Levels from "@/definitions/levels";
import type { LevelDef } from "@/definitions/levels";
import Actor from "@/model/actor";
import Ball from "@/model/ball";
import Flipper from "@/model/flipper";
import Rect from "@/model/rect";
import { createEngine } from "@/model/physics/engine";
import type { IPhysicsEngine } from "@/model/physics/engine";
import BallRenderer from "@/renderers/ball-renderer";
import FlipperRenderer from "@/renderers/flipper-renderer";
import RectRenderer from "@/renderers/rect-renderer";
import { radToDeg, degToRad } from "@/utils/math-util";
const { cos, sin, min, round } = Math;

export const BALL_WIDTH  = 40;
export const BALL_HEIGHT = BALL_WIDTH;
const MIN_BALL_SPEED     = 0.35; // the speed at which gravity pulls the ball down instantly
const MAX_BALL_SPEED     = 10;   // maximum ball speed

let engine: IPhysicsEngine;
let engineStep: number = 1000 / 60;
let flippers: Flipper[];
let flipper: Flipper;
let balls: Ball[];
let ball: Ball;
let otherBall: Ball;
let rects: Rect[];
let rect: Rect;
let level: LevelDef;
let score = 0;
let gameActive = false;

let leftFlipperUp = false;
let rightFlipperUp = false;

let canvas: zCanvas;
let backgroundRenderer: sprite;
let renderer: sprite;
const renderers: sprite[] = [];
let panOffset = 0;
let viewportWidth = 0;
let viewportHeight = 0; // cached in scaleCanvas()

export const init = async ( canvasRef: zCanvas, levelNum = 0 ): Promise<void> => {
    canvas = canvasRef;
    engineStep = 1000 / canvas.getFrameRate();

    level = Levels[ levelNum ];
    const { background, width, height, ballStartProps } = level;

    engine = createEngine( level.width, level.height );

    // generate Actors
    flippers = level.flippers.reduce(( acc, flipperOpts ) => {
        acc.push( new Flipper( engine, flipperOpts ) );
        return acc;
    }, [] );
    balls = [ new Ball( engine, { ...ballStartProps, width: BALL_WIDTH, height: BALL_HEIGHT }) ];
    // QQQ multi ball
    for (let i = 0; i < 5; ++i) {
        const m = ( i + 1 ) * BALL_WIDTH;
        balls.push(new Ball( engine, { speed: -0.4, left: ballStartProps.left - m, top: ballStartProps.top - m, width: BALL_WIDTH, height: BALL_HEIGHT }));
    }
    // clear previous canvas contents
    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }
    renderers.length = 0;

    // generate sprites
    backgroundRenderer = new sprite({ width, height, bitmap: background });
    //renderers.push( backgroundRenderer ); // QQQ

    flippers.forEach( flipper => renderers.push( new FlipperRenderer( flipper )));

    for ( ball of balls ) {
        ball.renderer = new BallRenderer( ball );
        renderers.push( ball.renderer );
    }

    // QQQ
    rects = [ new Rect( engine, { left: 475, top: ballStartProps.top + 200, width: 300, height: 20, angle: degToRad( 40 ) }) ];
    rects.push( new Rect( engine, { left: 770, top: 350, width: 100, height: 20, angle: degToRad( 45 ) }));
    rects.push( new Rect( engine, { left: 20, top: 350, width: 20, height: 1916 })); // left wall
    rects.push( new Rect( engine, { left: 780, top: 350, width: 20, height: 1916 })); // right wall
    rects.push( new Rect( engine, { left: 700, top: 900, width: 200, height: 20, angle: degToRad( -45 ) })); // by right flipper

    for ( rect of rects ) {
        rect.renderer = new RectRenderer( rect );
        renderers.push( rect.renderer );
    }

    for ( const renderer of renderers ) {
        canvas.addChild( renderer );
    }
    gameActive = true;
};

export const scaleCanvas = ( clientWidth: number, clientHeight: number ): void => {
    // TODO here we assume all levels are taller than wide
    const ratio  = level.height / level.width;
    const width  = min( level.width, clientWidth );
    const height = min( clientHeight, round( width * ratio ));

    // by setting the dimensions we have set the "world size"
    canvas.setDimensions( level.width, level.height );

    // take into account that certain resolutions are lower than the level width
    const zoom = clientWidth < level.width ? clientWidth / level.width : 1;

    // the viewport however is local to the client window size
    viewportWidth  = width / zoom;
    viewportHeight = height / zoom;
    canvas.setViewport( viewportWidth, viewportHeight );
    // scale canvas to fit in the width
    canvas.scale( zoom );

    // the vertical offset at which the viewport should pan to follow the ball
    panOffset = ( viewportHeight / 2 ) - ( BALL_WIDTH / 2 );
};

export const setFlipperState = ( type: string, up: boolean ): void => {
    flippers.forEach( flipper => {
        if ( flipper.type === type ) {
            flipper.trigger( up );
        }
    });
};

export const bumpTable = (): void => {
    for ( ball of balls ) {
        engine.applyForce( ball.body, Math.random() * 0.5, 10 );
    }
    console.warn( "TODO: not too much bumpin'!" );
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = ( timestamp: DOMHighResTimeStamp ): void => {
    if ( !gameActive ) {
        return;
    }

    // update physics engine
    engine.update( engineStep );

    // render content
    for ( renderer of renderers ) {
        renderer.update( timestamp, 0 );
    }

    // update ball actors

    for ( const ball of balls ) {
        if ( ball.bounds.top > level.height ) {
            console.warn( `DAG BAL ! ( ${ball.bounds.top} vs ${level.height} )` );
            disposeActor( ball, balls );
        }
    }

    // keep main ball within view
    ball = balls[ 0 ];
    if ( ball ) {
       canvas.panViewport( 0, balls[ 0 ].bounds.top - panOffset );
    }
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
