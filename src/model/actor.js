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
import { rectangleToVector, areVectorsIntersecting } from "@/utils/math-util";
import Vector from "@/model/math/vector";
import { degToRad, radToDeg } from "@/utils/math-util";

export default class Actor {
    constructor({ x = 0, y = 0, width = 1, height = 1, angle = 0, init = true } = {}) {
        this.width  = width;
        this.height = height;

        // TODO: math related properties
        this.position = new Vector( x, y );
        this.velocity = new Vector( 0, 0 );
        this.acceleration = new Vector( 0, 0 );
        this.setRestitution( 0 );
        this.setMass( 0 );
        this.setAngularVelocity( 0 );
        this.setAngleRad( angle );
        this.setInertia( 0 );
        this.shape = null; // physics shape ("body")
        // E.O. math

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set the values properly
        this._boundingBox = [];

        if ( init ) {
            this.cacheCoordinates();
        }
    }

    cacheCoordinates() {
        const { x, y } = this.position;
        this._boundingBox = rectangleToVector({ x, y, width: this.width, height: this.height });
    }

    getBoundingBox() {
        return this._boundingBox;
    }

    /* math additions, clean up to bare minimum, see if we can do without classes */

    getPosition() {
        return this.position;
    }

    setPosition( vector ) {
        this.position = vector;
        //this.position.setX( vector.x );
        //this.position.setY( vector.y );
        this.cacheCoordinates(); // TODO
    }

    update( fTimestep ) { //!< Updates position of body using improved euler
        /*!< Intergrating using improved euler */
    	//Vector2D newPrimeVelocity(velocity + (acceleration * fTimestep));
        const newPrimeVelocity = this.velocity.add( this.acceleration.multiplyScalar( fTimestep ));
        //position += ((getVelocity() + newPrimeVelocity) / 2) * fTimestep;
        this.getPosition().applyAdd(
            this.velocity.add( newPrimeVelocity ).divideScalar( 2 ).multiplyScalar( fTimestep )
        );
        this.velocity = newPrimeVelocity;
        this.cacheCoordinates();

    	/*!< Intergrating angular velocity */
    	const newAngle = this.fAngle + ( this.fAngularVelocity * fTimestep );
        this.setAngleRad( newAngle );

    	/*!< Cap the velocity at a specified limit*/
        const MAX_VELOCITY_X = 1;
        const MAX_VELOCITY_Y = 1;
    	if( this.velocity.x > MAX_VELOCITY_X ) {
    		this.velocity.setX( MAX_VELOCITY_X );
    	} else if( this.velocity.y > MAX_VELOCITY_Y ) {
    		this.velocity.setY( MAX_VELOCITY_Y );
    	}
    }

    setRestitution(fRestIn) //!< Sets the restitution
    {
        this.fRestitution = fRestIn;
    }

    setMass(kfMassIn) //!< Set the mass and inverse mass
    {
    	/* Checking to see if mass is 0 and preventing division by 0 */
        this.fMass = kfMassIn;
    	if (kfMassIn == 0.0) {
            this.fInverseMass = 0.0;
    	} else {
    		this.fInverseMass = 1.0 /kfMassIn;
    	}
    }

    getRestitution()  //!< Gets the restitution
    {
        return this.fRestitution;
    }

    getInverseMass()  //!< Gets the inverse mass
    {
        return this.fInverseMass;
    }

    getInverseInertia()   //!< Gets the inverse inertia
    {
        return this.fInverseInertia;
    }

    getAngularVelocity()  //!< Gets the angular velocity
    {
        return this.fAngularVelocity;
    }

    setInertia(kInertiaIn) //!< Sets the inertia and inverse inertia
    {
        /* Checking to see if inertia is 0 and preventing division by 0 */
        this.fInertia = kInertiaIn;
        if (this.fInertia == 0.0)
            this.fInverseInertia = 0.0;
        else
    		this.fInverseInertia = 1.0 / this.fInertia;
    }

    setAngularVelocity(kfAngularVelIn)
    {
        this.fAngularVelocity = kfAngularVelIn;
    }

    applyAngularImpulse(kfAngularImpulseIn)
    {
        this.fAngularVelocity += kfAngularImpulseIn;
    }

    getAngleRad()
    {
        return this.fAngle;
    }

    getAngleDeg()
    {
        return radToDeg( this.fAngle );
    }

    setAngleRad(kfAngleIn)
    {
        const fFullRotation = 2 * Math.PI;
        let fNewAngle = kfAngleIn;
        // TODO we ca n optimize this with a modulo, righto ?
        while (Math.abs(fNewAngle) > fFullRotation) {
            if (fNewAngle > 0) {
                fNewAngle -= fFullRotation;
            } else {
                fNewAngle += fFullRotation;
            }
        }
        this.fAngle = fNewAngle;
    }

    setAngleDeg( value ) {
        this.setAngleRad( degToRad( value ));
    }

    setAcceleration(kAccVector) //!< Sets the acceleration of the body
    {
    	this.acceleration = kAccVector;
    }

    setVelocity(kVelVector) //!< Sets the velocity of the body
    {
    	this.velocity = kVelVector;
    }

    getAcceleration()//!< Returns the acceleration of the body
    {
        return this.acceleration;
    }

    getVelocity()//!< Returns the velocity of the body
    {
        return this.velocity;
    }

    applyImpulse( impulseInVector, contactInVector )
    {
        this.velocity.add(impulseInVector.multiplyScalar(this.getInverseMass()));
        this.fAngularVelocity += contactInVector.crossProduct(impulseInVector) * this.getInverseInertia();
        if (this.fAngularVelocity !== 0) {
            console.warn(this.fAngularVelocity);
        }
    }
};
