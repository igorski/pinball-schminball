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
import Rect from "@/model/rect";
import RectPhys from "@/model/math/rectphys";
import Vector from "@/model/math/vector";
import { degToRad, clamp } from "@/utils/math-util";

const FLIP_SPEED = 0.0008; // TODO to constants along with ball speed
const MIN_ANGLE  = -30;
const MAX_ANGLE  = 30;

export default class Flipper extends Rect {
    constructor( opts ) {
        super({ ...opts, width: 132, height: 41, init: false });

        this.isUp   = false;
        this.type   = opts.type;
        this.pivotX = this.type === "left" ? 20 : 112;
        this.pivotY = 20;

        this.setAngleDeg( this.type === "left" ? MIN_ANGLE : MAX_ANGLE );
        this.cacheCoordinates();

        /* math */

        this.setRestitution( 0.2 );
    }

    trigger( up ) {
        if ( up === this.isUp ) {
            return;
        }
        if ( up && !this.isUp ) {
            this.applyAngularImpulse( this.type === "left" ? FLIP_SPEED : -FLIP_SPEED );
            //this.setAngleDeg( clamp( this.type === "left" ? this.getAngleDeg() - 20 : this.getAngleDeg() + 20, MIN_ANGLE, MAX_ANGLE ));
        } else if ( !up && this.isUp ) {
            this.applyAngularImpulse( this.type === "left" ? -FLIP_SPEED : FLIP_SPEED );
        }
        this.isUp = up;
        console.warn("trigger, up:" + up);
    }

    clamp() {
        const angle = this.getAngleDeg();
        if (this.type === "left") {
            if ( angle > MAX_ANGLE ) {
                this.setAngleDeg( MAX_ANGLE );
                this.setAngularVelocity( 0 );
            }
            if ( angle < MIN_ANGLE ) {
                this.setAngleDeg( MIN_ANGLE );
                this.setAngularVelocity( 0 );
            }
        } else {
            if ( angle < -MAX_ANGLE) {
                this.setAngleDeg( -MAX_ANGLE );
                this.setAngularVelocity( 0 );
            }
            if ( angle > -MIN_ANGLE ) {
                this.setAngleDeg( -MIN_ANGLE );
                this.setAngularVelocity( 0 );
            }
        }
    }

    updatePosition() {
        const currentAngle = this.getAngleDeg();
        const angle = clamp( this.isUp ? currentAngle - 2 : currentAngle /*+ 2*/, MIN_ANGLE, MAX_ANGLE );
if (angle !== 30) {
    //    console.warn(angle);
    }
        const angleRad = degToRad( angle );
        if ( this.fAngle === angleRad ) {
            return;
        }
        this.setAngleRad( angleRad );
        if ( angleRad !== 0 ) {
            this.cacheCoordinates();
        }
    }
};
