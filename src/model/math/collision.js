import RotationMatrix from "./rotationmat";
import Vector from "./vector";

/**
 * Collision manifold between two rigid bodies
 */
export default class Collision {
    // create def for body (should eventually move to Actor)
    constructor( firstActor, secondActor ) {
        this.bodyA = firstActor;
        this.bodyB = secondActor;

        this.fPenetration = 0; // penetration depth
        this.normal = new Vector(); // the collision normal (vector)
        this.contact = new Vector(); // point of collision (vector)
    }

    CircleVsCircle() {
    	// Setting up pointers to two circles
        const circleA = this.bodyA.shape; // CirclePhys
        const circleB = this.bodyB.shape; // CirclePhys

        // Calculating vector between the two bodies
        const difference = this.bodyB.getPosition().subtract( this.bodyA.getPosition()); // vector

    	// Sum of both radiuses
        const fRadiusSum = circleA.getRadius() + circleB.getRadius();

        let fMag = difference.dotProduct(difference);

        if (( fRadiusSum * fRadiusSum) < fMag ) {
            return false;
        }
        fMag = Math.sqrt(fMag);
        // If distance between circles is not 0
        if (fMag != 0)
        {
            this.fPenetration = fMag - fRadiusSum; // Penetration distance
            this.normal = difference.divideScalar( fMag );
            this.contact = this.bodyB.getPosition().subtract(this.normal.multiplyScalar(circleB.getRadius()));
        }
        else
        {
            this.fPenetration = circleA.getRadius();
            this.normal = new Vector( 1, 0 );
            this.contact = this.bodyA.getPosition();
        }
        return true;
    }

    /**
     * Checks collision of circle and AABB (e.g. ball versus table)
     */
    CircleVsRect() {
        /*!< Setting up pointers to a rectangle and a circle */
        const rect = this.bodyA.shape; // rectphys
        const circle = this.bodyB.shape; // circlephys

        // Vector between A and B
        const difference = this.bodyB.getPosition().subtract( this.bodyA.getPosition() );

        // Clamping closest point to nearest edge
        const closest = getClampVector( rect.getHalfExtent(), difference );

        let bInside = false;

        // Clamp circle to the closest edge
        if ( difference.equals( closest )) {
    		bInside = true;

            const { x, y } = rect.getHalfExtent();

            // Find closest axis
            if ( Math.abs( difference.x ) > Math.abs( difference.y )) {

                // Clamp to closest extent
                if ( closest.x > 0 ) {
                    closest.setX( x );
                } else{
                    closest.setX( -x );
                }
            } else {
                if ( closest.y > 0 ){
                    closest.setY( y );
                } else {
                    closest.setY( -y );
                }
            }

        }
    	let n = difference.subtract( closest ); // vector
        let fDistance = n.dotProduct( n );
        const fRadius = circle.getRadius();

        // if circle isn't inside AABB
    	if ( fDistance > fRadius * fRadius && !bInside ) {
            return false;
        }

        fDistance = Math.sqrt( fDistance );
        n = n.divideScalar( fDistance );

        // if circle is inside AABB
    	if ( bInside ) {
            this.normal = n.invert();
        } else {
            this.normal = n;
        }
        // contact = bodyB->getPosition() - (normal * circle->getRadius());
        this.contact = this.bodyB.getPosition().subtract( this.normal.multiplyScalar( fRadius ));
        this.fPenetration = fDistance - fRadius;
        return true;
    }

    CircleVsOBB()
    {
        const obb = this.bodyA.shape; // ObbPhys
        const circle = this.bodyB.shape; // CirclePhys

        // Vector between A and B
        const difference = this.bodyB.getPosition().subtract( this.bodyA.getPosition());

        const matrix = new RotationMatrix( this.bodyA.getAngleRad());

        const transform = matrix.inverseRotateVector( difference ); // Vector

        // Closest point on A to B
        const closest = getClampVector( obb.getHalfExtent(), transform );

        let bInside = false;

        // Clamp circle to the closest edge
        if ( transform.equals( closest )) {
            bInside = true;
            if ( Math.abs( transform.x ) >= Math.abs( transform.y )){
                if ( closest.x > 0 ) {
                    closest.setX( obb.getHalfExtent().x );
                } else{
                    closest.setX( -obb.getHalfExtent().x );
                }
            } else {
                if ( closest.y > 0 ) {
                    closest.setY( obb.getHalfExtent().y );
                } else {
                    closest.setY( -obb.getHalfExtent().y );
                }
            }
        }

        let n = transform.subtract( closest ); // Vector
        let fDistance = n.dotProduct( n );
        const fRadius = circle.getRadius();

        if ( fDistance > fRadius * fRadius && !bInside ){
            return false;
        }

        fDistance = Math.sqrt( fDistance );
        n = n.divideScalar( fDistance );

        // if circle is inside AABB
        if ( bInside ) {
            this.normal = n.invert();
        } else {
            this.normal = n;
        }
        // contact = bodyB->getPosition() - matrix.rotateVector(normal * circle->getRadius());
        this.contact = this.bodyB.getPosition()
            .subtract(
                matrix.rotateVector( this.normal.multiplyScalar( fRadius ))
            );
        this.fPenetration = fDistance - fRadius;

        return true;
    }

    correctPosition() {
        //const float kfPercent = 0.2;
        //const float kfSlop =  0.01;
        const kfPercent = 0.2;
        const kfSlop = 0.01;
        const kfInvMassSum = this.bodyA.getInverseMass() + this.bodyB.getInverseMass();
    	const kFScalarNum = Math.max( Math.abs( this.fPenetration ) - kfSlop, 0 ) / kfInvMassSum;
        // Vector2D correction = normal * kFScalarNum * kfPercent;
    	const correction = this.normal.multiplyScalar( kFScalarNum * kfPercent ); // Vector
        //bodyA->position -= correction * bodyA->getInverseMass();
        //bodyB->position += correction * bodyB->getInverseMass();
        this.bodyA.position.applySubtraction( correction.multiplyScalar( this.bodyA.getInverseMass() ) );
    	this.bodyB.position.applyAdd( correction.multiplyScalar( this.bodyB.getInverseMass() ) );
    }

    applyRotationalImpulse() {
    	/*!< Calculating contact points*/
        /*
        const Vector2D kBodyAContact(contact - bodyA->getPosition());
        const Vector2D kBodyBContact(contact - bodyB->getPosition());
        */
        const kBodyAContact = this.contact.subtract( this.bodyA.getPosition() );
        const kBodyBContact = this.contact.subtract( this.bodyB.getPosition() );

    	/*!< Calculate the relative velocity */

        /*
        Vector2D rv =
            (bodyB->getVelocity() + kBodyBContact.vectorCrossScalar(-bodyB->getAngularVelocity())) -
            (bodyA->getVelocity() + kBodyAContact.vectorCrossScalar(-bodyA->getAngularVelocity()));
        */
        const rv =
            this.bodyB.getVelocity().add( kBodyBContact.vectorCrossScalar( -this.bodyB.getAngularVelocity() ))
            .subtract(
                this.bodyA.getVelocity().add( kBodyAContact.vectorCrossScalar( -this.bodyA.getAngularVelocity() ))
            );

    	/*!< Calculate relative velocity along the normal*/
        const fVelAlongNormal = rv.dotProduct( this.normal );

    	/*!< Do not apply impulse if velocities are separating*/
    	if ( fVelAlongNormal > 0 ) {
             return;
        }

        /*!< Calculate restitution */
        const fRestitution = Math.min( this.bodyA.getRestitution(), this.bodyB.getRestitution() );

        const kfContactACrossNormal = kBodyAContact.crossProduct( this.normal ); // float
        const kfContactBCrossNormal = kBodyBContact.crossProduct( this.normal ); // float

        /*!< Calculate impulse scalar */
    	let fImpulseScalar = -( 1 + fRestitution ) * fVelAlongNormal;
        fImpulseScalar /= this.bodyA.getInverseMass() + this.bodyB.getInverseMass() + (kfContactACrossNormal * kfContactACrossNormal) * this.bodyA.getInverseInertia() + (kfContactBCrossNormal * kfContactBCrossNormal) * this.bodyB.getInverseInertia();

        /*!< Apply rotational impulse */
        const impulse = this.normal.multiplyScalar( fImpulseScalar );
    	this.bodyA.applyImpulse( impulse.invert(), kBodyAContact );
        this.bodyB.applyImpulse( impulse, kBodyBContact );
    }
};

/* internal methods */

function getClampVector( rectExtents, circlePos ) { //!< Determining closest point to closest edge of AABB
    const clamp = new Vector();
    if ( circlePos.x >= 0 ) {
        clamp.setX( Math.min( circlePos.x, rectExtents.x ));
   } else {
        clamp.setX( Math.max( circlePos.x, -rectExtents.x ));
   }

    if ( circlePos.y >= 0 ) {
        clamp.setY( Math.min( circlePos.y, rectExtents.y ));
    } else {
        clamp.setY( Math.max( circlePos.y, -rectExtents.y ));
    }
    return clamp;
}
