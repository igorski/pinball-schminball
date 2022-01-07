import Vector from "./math/vector";

// TODO: bodyA and bodyB should be actors

/**
 * Collision manifold between two rigid bodies
 */
export default class Manifold {
    // create def for body (should eventually move to Actor)
    constructor( first, second ) {
        this.bodyA = first;
        this.bodyB = second;

        this.fPenetration = 0; // penetration depth
        this.normal = null; // the collision normal (vector)
        this.contact = null; // point of collision (vector)
    }

    /*
    CircleVsCircle() {
    	// Setting up pointers to two circles
        CirclePhys* circleA = (CirclePhys*)bodyA->physicsShape;
        CirclePhys* circleB = (CirclePhys*)bodyB->physicsShape;

        // Calculating vector between the two bodies
        Vector2D difference = bodyB->getPosition() - bodyA->getPosition();

    	// Sum of both radiuses
        float fRadiusSum =  circleA->getRadius() + circleB->getRadius();

        float fMag = difference.dotProduct(difference);

        if ((fRadiusSum*fRadiusSum) < fMag)
            return false;


        fMag = Math.sqrt(fMag);
        // If distance between circles is not 0
        if (fMag != 0)
        {
            this.fPenetration = fMag - fRadiusSum; // Penetration distance
            this.normal = difference/fMag; //
            this.contact = bodyB->getPosition() - (this.normal * circleB->getRadius());
        }
        else
        {
            this.fPenetration = circleA->getRadius();
            this.normal = Vector2D(1,0);
            this.contact = bodyA->getPosition();
        }
        return true;
    }
    */

    /**
     * Checks collision of circle and AABB (e.g. ball versus table)
     * bodyA = rect Actor, bodyB = ball Actor
     */
    CircleVsRect( bodyA, bodyB ) {
        /*!< Setting up pointers to a rectangle and a circle */
        const rect = bodyA.physicsShape; // rectphys
        const circle = bodyB.physicsShape; // circlephys

        // Vector between A and B
        const difference = bodyB.getPosition().subtract( bodyA.getPosition() );

        // Clamping closest point to nearest edge
        const closest = getClampVector( rect.getHalfExtent(), difference );

        let bInside = false;

        // Clamp circle to the closest edge
        if ( difference === closest ) {
    		bInside = true;

            // Find closest axis
            if ( Math.abs( difference.x ) > Math.abs( difference.y )){

                // Clamp to closest extent
                if ( closest.x > 0 ) {
                    closest.setX( rect.getHalfExtent().x );
                } else{
                    closest.setX( -rect.getHalfExtent().x );
                }
            } else {
                if ( closest.y > 0 ){
                    closest.setY( rect.getHalfExtent().y );
                } else {
                    closest.setY( -rect.getHalfExtent().y );
                }
            }

        }
    	const n = difference.subtract( closest );
        const fDistance = n.dotProduct( n );
        const fRadius = circle.getRadius();

        // if circle isn't inside AABB
    	if ( fDistance > fRadius * fRadius && !bInside ) {
            return false;
        }

        fDistance = Math.sqrt( fDistance );
        n = n / fDistance;

        // if circle is inside AABB
    	if ( bInside ) {
            this.normal = n.invert();
            contact = bodyB.getPosition().subtract( this.normal.multiply( circle.getRadius()));
    		this.fPenetration = fDistance - fRadius;
        } else {
            this.normal = n;
            contact = bodyB.getPosition().subtract( this.normal.multiply( circle.getRadius()));
    		this.fPenetration = fDistance - fRadius;
        }
        return true;
    }
    /*
    bool Manifold::CircleVsOBB()
    {
        ObbPhys* obb = (ObbPhys*)bodyA->physicsShape;
        CirclePhys* circle = (CirclePhys*)bodyB->physicsShape;

        // Vector between A and B
        Vector2D difference = bodyB->getPosition() - bodyA->getPosition();

        RotationMat matrix = RotationMat(bodyA->getAngleRad());

        Vector2D transform = matrix.inverseRotateVector(difference);

        // Closest point on A to B
        Vector2D closest = getClampVector(obb->getHalfExtent(), transform);

        bool bInside = false;

        // Clamp circle to the closest edge
        if (transform == closest){
            bInside = true;
            if (Math.abs(transform.x) >= Math.abs(transform.y)){
                if (closest.x > 0){
                    closest.setX(obb->getHalfExtent().x);
                } else{
                    closest.setX(-obb->getHalfExtent().x);
                }
            }   else{
                if (closest.y > 0){
                    closest.setY(obb->getHalfExtent().y);
                }else{
                    closest.setY(-obb->getHalfExtent().y);
                }
            }
        }

        Vector2D n = transform - closest;
        float fDistance = n.dotProduct(n);
        float fRadius = circle->getRadius();

        if (fDistance > fRadius * fRadius && !bInside){
            return false;
        }

        fDistance = Math.sqrt(fDistance);
        n = n/fDistance;

        // if circle is inside AABB
        if (bInside){
            this.normal = -n;
            this.contact = bodyB->getPosition() - matrix.rotateVector(this.normal * circle->getRadius());
            this.fPenetration = fDistance - fRadius;
        }else {
            this.normal = n;
            this.contact = bodyB->getPosition() - matrix.rotateVector(this.normal * circle->getRadius());
            this.fPenetration = fDistance - fRadius;
        }
        return true;
    }
    */
    correctPosition() {
        const kfPercent = 0.2;
        const kfSlop =  0.01;
    	const kfInvMassSum = bodyA.getInverseMass() + bodyB.getInverseMass();
    	const kFScalarNum = Math.max( Math.abs( this.fPenetration ) - kfSlop, 0.0 ) / kfInvMassSum;
    	const correction = this.normal.multiplyScalar( kFScalarNum * kfPercent );
        // watch the operator magic here
    	//bodyA.position -= correction * bodyA->getInverseMass();
    	//bodyB.position += correction * bodyB->getInverseMass();
        bodyA.position.subtract( correction.multiplayScalar( bodyA.getInverseMass() );
    	bodyB.position.add( correction.multiplyScalar( bodyB.getInverseMass());
    }

    applyRotationalImpulse() {
    	/*!< Calculating contact points*/
        const kBodyAContact = this.contact.subtract( bodyA.getPosition() );
        const kBodyBContact = this.contact.subtract( bodyB.getPosition() );

    	/*!< Calculate the relative velocity */
        // watch the operator magic here

        //Vector2D rv = (bodyB->getVelocity() + kBodyBContact.vectorCrossScalar(-bodyB->getAngularVelocity())) - (bodyA->getVelocity() + kBodyAContact.vectorCrossScalar(-bodyA->getAngularVelocity()));
        const rv = bodyB.getVelocity()
            .add(kBodyBContact.vectorCrossScalar(-bodyB.getAngularVelocity()))
            .subtract(bodyA.getVelocity().add(kBodyAContact.vectorCrossScalar(-bodyA.getAngularVelocity()));

    	/*!< Calculate relative velocity along the normal*/
        const fVelAlongNormal = rv.dotProduct( this.normal );

    	/*!< Do not apply impulse if velocities are separating*/
    	if (fVelAlongNormal > 0){
             return;
        }

        /*!< Calculate restitution */
        const fRestitution = Math.min( bodyA.getRestitution(), bodyB.getRestitution() );

        const kfContactACrossNormal = kBodyAContact.crossProduct( this.normal ); // float
        const kfContactBCrossNormal = kBodyBContact.crossProduct( this.normal ); // float

        /*!< Calculate impulse scalar */
    	const fImpulseScalar = -(1 + fRestitution) * fVelAlongNormal;
        fImpulseScalar /= bodyA.getInverseMass() + bodyB.getInverseMass() + (kfContactACrossNormal * kfContactACrossNormal) * bodyA.getInverseInertia() + (kfContactBCrossNormal * kfContactBCrossNormal) * bodyB.getInverseInertia();

        /*!< Apply rotational impulse */
        const impulse = this.normal.multiplyScalar( fImpulseScalar );
    	bodyA.applyImpulse( impulse.invert(), kBodyAContact );
        bodyB.applyImpulse( impulse, kBodyBContact );
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
