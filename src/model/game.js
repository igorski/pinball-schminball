/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2022 - https://www.igorski.nl
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
import Levels from "@/definitions/levels";
import Actor from "@/model/actor";
import Ball from "@/model/ball";
import Flipper from "@/model/flipper";
import Rect from "@/model/rect";
import BallRenderer from "@/renderers/ball-renderer";
import FlipperRenderer from "@/renderers/flipper-renderer";
import RectRenderer from "@/renderers/rect-renderer";
import Collision from "@/model/math/collision";
import { radToDeg, degToRad } from "@/utils/math-util";
import { getTransparentPixelsForImage } from "@/utils/canvas-helper";
const { cos, sin, min, round } = Math;

export const BALL_WIDTH     = 40;
export const BALL_HEIGHT    = 40;
const MIN_BALL_SPEED    = 0.35; // the speed at which gravity pulls the ball down instantly
const MAX_BALL_SPEED    = 10;   // maximum ball speed

let flippers, flipper, balls, ball, rects, rect, otherBall, col, level;
let score = 0, gameActive = false;
let runTicks = 0;

let leftFlipperUp = false, rightFlipperUp = false;
let collisionMap = null;

let canvas, backgroundRenderer, renderer;
const renderers = [];
let panOffset = 0, viewportWidth = 0, viewportHeight = 0; // cached in scaleCanvas()

export const init = async ( canvasRef, levelNum = 0 ) => {
    canvas = canvasRef;

    level = Levels[ levelNum ];
    const { background, width, height, ballStartProps } = level;

    // precache the collision map for this level
    collisionMap = await getTransparentPixelsForImage( background );

    // generate Actors
    flippers = level.flippers.reduce(( acc, flipperOpts ) => {
        acc.push( new Flipper( flipperOpts ) );
        return acc;
    }, [] );
    balls = [ new Ball({ ...ballStartProps, width: BALL_WIDTH, height: BALL_HEIGHT }) ];

    // clear previous canvas contents
    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }
    renderers.length = 0;

    // generate sprites
    backgroundRenderer = new sprite({ width, height, bitmap: background });
    renderers.push( backgroundRenderer );

    flippers.forEach( flipper => renderers.push( new FlipperRenderer( flipper )));

    for ( ball of balls ) {
        ball.renderer = new BallRenderer( ball );
        renderers.push( ball.renderer );
    }

    // QQQ
    rects = [ new Rect({ x: 10, y: ballStartProps.y + 200, width: 700, height: 20, angle: degToRad( 20 ) }) ];
    for ( rect of rects ) {
        rect.renderer = new RectRenderer( rect );
        renderers.push( rect.renderer );
    }

    for ( const renderer of renderers ) {
        canvas.addChild( renderer );
    }
    gameActive = true;

    runTicks = 0;
};

export const scaleCanvas = ( clientWidth, clientHeight ) => {
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

export const setFlipperState = ( flipper, up ) => {
    if ( flipper === "left" ) {
        leftFlipperUp = up;
    } else if ( flipper === "right" ) {
        rightFlipperUp = up;
    }
};

export const bumpTable = () => {
    //if ( !isBallColliding() ) {
    //    return; // TODO this is always false outside of runPhysics()
    //}
    for ( ball of balls ) {
        ball.setVelocity( ball.getVelocity().invert());
        console.warn("bump");
    }
};

export const setBallSpeed = speed => {
    ball = balls[ 0 ]; // TODO
    const d = radToDeg( ball.dir );
    const isMovingUp = d > 90 && d < 270;
    if ( speed < 0.75 && isMovingUp ) {
        ball.dir = degToRad( 180 - d );
    }
    ball.speed = speed;
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = timestamp => {
    if ( !gameActive ) {
        return;
    }
    ++runTicks;

    for ( flipper of flippers ) {
        if ( flipper.type === "left" ) {
            flipper.setAngle( leftFlipperUp  ? flipper.getAngleDeg() - 20 : flipper.getAngleDeg() + 20 );
        } else {
            flipper.setAngle( rightFlipperUp ? flipper.getAngleDeg() + 20 : flipper.getAngleDeg() - 20 );
        }
    }
    runPhysics( runTicks );

    for ( renderer of renderers ) {
        renderer.update();
    }
    // keep main ball within view
    canvas.panViewport( 0, balls[ 0 ].getPosition().y - panOffset );
};

/* internal methods */

let logger;//QQQ
function runPhysics( gameTick ) {
    for ( ball of balls ) {

        // 1. collision with other balls

        for ( otherBall of balls ) {
            if ( ball !== otherBall ) {
                col = new Collision( ball, otherBall );
                if ( col.CircleVsCircle()) {
                    col.correctPosition();
                    col.applyRotationalImpulse();
                }
            }
        }

        // 2. collision with rectangles

        for ( rect of rects ) {
            col = new Collision( rect, ball );
            if ( rect.fAngle === 0 ? col.CircleVsRect() : col.CircleVsOBB() ) {
                col.correctPosition();
                col.applyRotationalImpulse();
            }
        }

        // 3. collision with flippers

        for ( flipper of flippers ) {
            col = new Collision( flipper, ball );
            if ( col.CircleVsOBB()) {
                col.correctPosition();
                col.applyRotationalImpulse();
            }
        }
        // 4. update ball actor
        ball.update( gameTick );
    }

    // 5. update remaining actors

    for ( rect of rects ) {
        rect.update( gameTick );
    }

    for ( flipper of flippers ) {
        flipper.update( gameTick );
    }

if(!logger) {
    logger = document.createElement('div');
    logger.style.position = 'fixed';
    logger.style.right = '16px';
    logger.style.bottom ='16px';
    logger.style.color = 'red';
    document.body.appendChild(logger);
}
logger.innerHTML = /*d.toFixed(0) + ' @ ' +*/ Math.round(ball.getPosition().x)  + ' x ' + Math.round(ball.getPosition().y) + ' @ ' + ball.getAngleDeg();
}
