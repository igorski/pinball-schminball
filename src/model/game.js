/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021 - https://www.igorski.nl
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
import BallRenderer from "@/renderers/ball-renderer";
import FlipperRenderer from "@/renderers/flipper-renderer";
import { radToDeg, degToRad } from "@/utils/math-util";
import { getTransparentPixelsForImage } from "@/utils/canvas-helper";
const { cos, sin, min, round } = Math;

export const BALL_WIDTH     = 40;
export const BALL_HEIGHT    = 40;
const BALL_COLLISION_RADIUS = 22; // a little over half to provide lookahead
const BALL_COLLISION_BOUNDS = [
    { x: 0, y: -BALL_COLLISION_RADIUS }, { x: BALL_COLLISION_RADIUS,  y: 0 },
    { x: 0, y: BALL_COLLISION_RADIUS },  { x: -BALL_COLLISION_RADIUS, y: 0 }
];
const MIN_BALL_SPEED = 0.35; // the speed at which gravity pulls harder than the ball moves
const MAX_BALL_SPEED = 10;   // maximum ball speed
const BALL_DIR_DOWN  = 0;

let flippers, flipper, ball, level;
let score = 0, gameActive = false;

let leftFlipperUp = false, rightFlipperUp = false;
let collisionMap = null;

let canvas, backgroundRenderer, ballRenderer, renderer;
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
    ball = new Ball({ ...ballStartProps, width: 40, height: 40 });

    // clear previous canvas contents
    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }
    renderers.length = 0;

    // generate sprites
    backgroundRenderer = new sprite({ width, height, bitmap: background });
    renderers.push( backgroundRenderer );

    flippers.forEach( flipper => renderers.push( new FlipperRenderer( flipper )));

    ballRenderer = new BallRenderer( ball );
    renderers.push( ballRenderer );

    for ( const renderer of renderers ) {
        canvas.addChild( renderer );
    }
    gameActive = true;
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

export const setBallSpeed = speed => {
    const d = radToDeg( ball.dir ) % 360;
    const isMovingUp = d > 90 && d < 270;
    if ( speed < 0.75 && isMovingUp ) {
        ball.dir = degToRad( 180 - d );
    }
    ball.speed = speed;
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = () => {
    if ( !gameActive ) {
        return;
    }

    for ( flipper of flippers ) {
        if ( flipper.type === "left" ) {
            flipper.setAngle( leftFlipperUp  ? flipper.angle - 20 : flipper.angle + 20 );
        } else {
            flipper.setAngle( rightFlipperUp ? flipper.angle + 20 : flipper.angle - 20 );
        }
    }
    updateBallPosition();
    runPhysics();

    for ( renderer of renderers ) {
        renderer.update();
    }
    // keep ball within view
    canvas.panViewport( 0, ball.y - panOffset );
};

/* internal methods */

function updateBallPosition() {
    ball.x += ball.speed * sin( ball.dir );
    ball.y += ball.speed * cos( ball.dir );

    if ( ball.y > level.chute.top && ball.x > level.chute.left && ball.x < level.chute.right ) {
        console.warn( "whoops." );
        ball.x = 200;
        ball.y = 200;
    }
    ball.cacheCoordinates();
}

function runPhysics() {
    const d = radToDeg( ball.dir ) % 360;
    let inc = -1.5;

    // moving upwards
    if ( d > 90 && d < 270 ) {
        inc = 1.5;
        ball.speed -= 0.03;
        /*if ( ball.speed < 0 ) {
            ball.dir = BALL_DIR_DOWN;
        }*/
    // moving downwards
    } else if ( ball.speed < MAX_BALL_SPEED ) {
        ball.speed += 0.04;
    }

    if ( ball.speed < MIN_BALL_SPEED ) {
        ball.dir = BALL_DIR_DOWN;
    }

    for ( flipper of flippers ) {
        if ( flipper.collidesWith( ball )) {
            console.warn( `BALL HIT ${flipper.type === "left" ? "left" : "right"} FLIPPER` );
            // left
            if ( flipper.type === "left" ) {
                ball.dir = 3 + ( flipper.angle / 50 );
                if ( leftFlipperUp ) {
                    ball.speed += 0.3;
                    updateBallPosition();
                }
            } else {
                ball.dir = 4 + ( flipper.angle / 50 );
                if ( rightFlipperUp ) {
                    ball.speed += 0.3;
                    updateBallPosition();
                }
            }
            if ( inc === 1.5 ) {
                ball.dir = BALL_DIR_DOWN;
            }
            updateBallPosition();
        }
    }

    let isColliding = isBallColliding();
    let triesLeft   = 256;
    while ( isColliding ) {
        ball.dir += inc;
        updateBallPosition();
        if ( --triesLeft === 0 ) {
            break;
        }
        isColliding = isBallColliding();
    }
}

function isBallColliding() {
    const { x, y } = ball.getCenter();
    for ( const cb of BALL_COLLISION_BOUNDS ) {
        const transparent = collisionMap[ coordinateToIndex( x + cb.x, y + cb.y )];
        if ( !transparent ) {
            return true;
        }
    }
    return false;
}

function coordinateToIndex( x, y ) {
    return x + ( level.width * y );
}
