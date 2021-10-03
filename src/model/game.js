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
import BallRenderer from "@/renderers/ball-renderer";
import FlipperRenderer from "@/renderers/flipper-renderer";
import { radToDeg } from "@/utils/math-util";
import { getTransparentPixelsForImage } from "@/utils/canvas-helper";

export const BALL_WIDTH     = 40;
export const BALL_HEIGHT    = 40;
const BALL_COLLISION_RADIUS = 22; // a little over half to provide lookahead
const BALL_COLLISION_BOUNDS = [
    { x: 0, y: -BALL_COLLISION_RADIUS }, { x: BALL_COLLISION_RADIUS,  y: 0 },
    { x: 0, y: BALL_COLLISION_RADIUS },  { x: -BALL_COLLISION_RADIUS, y: 0 }
];
let leftFlipper, rightFlipper, ball, level;
let score = 0, gameActive = false;

let leftFlipperUp = false, rightFlipperUp = false;
let collisionMap = null;

let backgroundRenderer, ballRenderer, flipperLeftRenderer, flipperRightRenderer;
const renderers = [];

export const init = async ( canvas, levelNum = 0 ) => {
    level = Levels[ levelNum ];
    const { background, width, height, ballStartProps, flippers } = level;

    // precache the collision map for this level
    collisionMap = await getTransparentPixelsForImage( background );

    leftFlipper  = new Actor({ ...flippers.left,  width: 132, height: 41, pivotX: 20,  pivotY: 20, angle: -30 });
    rightFlipper = new Actor({ ...flippers.right, width: 132, height: 41, pivotX: 112, pivotY: 20, angle: 30 });
    ball         = new Actor({ ...ballStartProps, width: 40, height: 40 });

    // clear previous contents
    while ( canvas.numChildren() > 0 ) {
        canvas.removeChildAt( 0 );
    }
    renderers.length = 0;

    // generate sprites
    backgroundRenderer = new sprite({ width, height, bitmap: background });
    renderers.push( backgroundRenderer );

    flipperLeftRenderer = new FlipperRenderer( leftFlipper, "left" );
    renderers.push( flipperLeftRenderer );
    flipperRightRenderer = new FlipperRenderer( rightFlipper, "right" );
    renderers.push( flipperRightRenderer );

    ballRenderer = new BallRenderer( ball );
    renderers.push( ballRenderer );

    for ( const renderer of renderers ) {
        canvas.addChild( renderer );
    }
    gameActive = true;
};

export const setFlipperState = ( flipper, up ) => {
    if ( flipper === "left" ) {
        leftFlipperUp = up;
    } else if ( flipper === "right" ) {
        rightFlipperUp = up;
    }
};

/**
 * Should be called when zCanvas invokes update() prior to rendering
 */
export const update = () => {
    if ( !gameActive ) {
        return;
    }
    if ( leftFlipperUp ) {
        leftFlipper.angle = limit( leftFlipper.angle + 20, -30, 30 );
    } else {
        leftFlipper.angle = limit( leftFlipper.angle - 20, -30, 30 );
    }

    if ( rightFlipperUp ) {
        rightFlipper.angle = limit( rightFlipper.angle - 20, -30, 30 );
    } else {
        rightFlipper.angle = limit( rightFlipper.angle + 20, -30, 30 );
    }
    updateBallPosition();
    runPhysics();

    for ( const renderer of renderers ) {
        renderer.update();
    }
};

/* internal methods */

function updateBallPosition() {
    ball.x += ball.speed * Math.sin( ball.dir );
    ball.y += ball.speed * Math.cos( ball.dir );

    if ( ball.x > 570 || ball.y > 760 ) {
        console.warn( "whoops." );
        ball.x = 200;
        ball.y = 200;
    }
}

function runPhysics() {
    const d = radToDeg( ball.dir ) % 360;
    let inc = -1.5;

    if ( d > 90 && d < 270 ) {
        inc = 1.5;
        ball.speed -= 0.03;
        if ( ball.speed < 0 ) {
            ball.dir = 0;
        }
    } else if ( ball.speed < 10 ) {
        ball.speed += 0.04;
    }

    if ( rightFlipper.collidesWith( ball )) {
        console.warn("BALL HIT RIGHT FLIPPER");
        ball.dir = 4 + ( rightFlipper.angle / 50 );
        if ( rightFlipperUp ) {
            ball.speed += 0.3;
            updateBallPosition();
        }
        if ( inc === 1.5 ) {
            ball.dir = 0;
        }
        updateBallPosition();
    }
    if ( leftFlipper.collidesWith( ball )) {
        console.warn("BALL HIT LEFT FLIPPER");
        ball.dir = 3 + ( leftFlipper.angle / 50 );
        if ( leftFlipperUp ) {
            ball.speed += 0.3;
            updateBallPosition();
        }
        if ( inc === 1.5 ) {
            ball.dir = 0;
        }
        updateBallPosition();
    }
    let isColliding = checkBallCollisions();
    let triesLeft   = 1024;
    while ( isColliding ) {
        ball.dir += inc;
        updateBallPosition();
        if ( --triesLeft === 0 ) {
            break;
        }
        isColliding = checkBallCollisions();
    }
}

function checkBallCollisions() {
    const { x, y } = ball.getCenter();
    for ( const cb of BALL_COLLISION_BOUNDS ) {
        const transparent = collisionMap[ coordinateToIndex( x + cb.x, y + cb.y )];
        if ( !transparent ) {
            return true;
        }
    }
    return false;
}

function limit( value, minValue, maxValue ) {
    return Math.max( Math.min( maxValue, value ), minValue );
}

function coordinateToIndex( x, y ) {
    return x + ( level.width * y );
}
