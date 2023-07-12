import Actor from "@/model/actor";
import type Circle from "@/model/circle";
import type Rect from "@/model/rect";
import { ActorShapes } from "./shape";
import Vector from "./vector";
import type Interval from "./interval";
import FP, { ONE, MAX_VALUE } from "./fp";

export class Collision {
    constructor( public vn: number[], public vt: number[] ) {}
}

export class CollisionDetector {
	static collisionNormal: number[] = new Array( 2 );
	static mult_temp: number[]  = new Array( 2 );
	static d: number[]  = new Array( 2 );
	static dTemp: number[]  = new Array( 2 );
	static vertex: number[]  = new Array( 2 );

	/**
	 * Tests the collision between two objects. If there is a collision it is passed off
	 * to the CollisionResolver class to resolve the collision.
	 */
	static test( objA: Actor, objB: Actor ): void {
		if (( objA.fixed && objB.fixed ) || ( objA.collidable === false || objB.collidable === false )) {
            return;
        }
console.warn('teest');
		//MvdA TODO faster or not?
		if ( objA.shape === ActorShapes.CIRCLE ) {
			if ( objB.shape === ActorShapes.CIRCLE ) {
    			CollisionDetector.testCirclevsCircle( objA as Circle, objB as Circle );
			} else {
    			CollisionDetector.testOBBvsCircle( objB as Rect, objA as Circle );
			}
		}
		else {
			if ( objB.shape === ActorShapes.CIRCLE ) {
    			CollisionDetector.testOBBvsCircle( objA as Rect, objB as Circle );
			} else {
    			CollisionDetector.testOBBvsOBB( objA as Rect, objB as Rect);
			}
		}
	}

	/**
	 * Tests the collision between two RectangleParticles (aka OBBs). If there is a collision it
	 * determines its axis and depth, and then passes it off to the CollisionResolver for handling.
	 */
	static testOBBvsOBB(ra: Rect, rb: Rect): void {
		let collisionDepth = MAX_VALUE;

//			for (int i = 0; i < 2; i++) {

//				final Vector axisA = ra.axes[i];
			const axisA = ra.axes0;
			const depthA = CollisionDetector.testIntervals(ra.getProjection(axisA), rb.getProjection(axisA));
		    if (depthA == 0) {
		    	return;
		    }

		    const axisB = rb.axes0;
		    const depthB = CollisionDetector.testIntervals(ra.getProjection(axisB), rb.getProjection(axisB));
		    if (depthB == 0) {
		    	return;
		    }

		    const absA = FP.abs(depthA);
		    const absB = FP.abs(depthB);

		    if (absA < FP.abs(collisionDepth) || absB < FP.abs(collisionDepth)) {
		    	if(absA < absB) {
		    		Vector.setToOtherVector(axisA, CollisionDetector.collisionNormal);
//			    		collisionNormal.setTo(axisA[0],axisA[1]);
		    		collisionDepth = depthA;
		    	}
		    	else {
		    		Vector.setToOtherVector(axisB, CollisionDetector.collisionNormal);
//			    		collisionNormal.setTo(axisB[0],axisB[1]);
		    		collisionDepth = depthB;
		    	}
		    }

		    //REPEAT
			const axisC = ra.axes1;
			const depthC = CollisionDetector.testIntervals(ra.getProjection(axisC), rb.getProjection(axisC));
		    if (depthC == 0) {
		    	return;
		    }

		    const axisD = rb.axes0;
		    const depthD = CollisionDetector.testIntervals(ra.getProjection(axisD), rb.getProjection(axisD));
		    if (depthD == 0) {
		    	return;
		    }

		    const absC = FP.abs(depthC);
		    const absD = FP.abs(depthD);

		    if (absC < FP.abs(collisionDepth) || absD < FP.abs(collisionDepth)) {
		    	if(absC < absD) {
		    		Vector.setToOtherVector( axisC, CollisionDetector.collisionNormal);
//			    		collisionNormal.setTo(axisC[0],axisC[1]);
		    		collisionDepth = depthC;
		    	}
		    	else {
		    		Vector.setToOtherVector( axisD, CollisionDetector.collisionNormal);
//			    		collisionNormal.setTo(axisD[0],axisD[1]);
		    		collisionDepth = depthD;
		    	}
		    }
//			}
		CollisionResolver.resolveParticleParticle(ra, rb, CollisionDetector.collisionNormal, collisionDepth);
	}

	/**
	 * Tests the collision between a RectangleParticle (aka an OBB) and a CircleParticle.
	 * If there is a collision it determines its axis and depth, and then passes it off
	 * to the CollisionResolver for handling.
	 */
	static testOBBvsCircle( ra: Rect, ca: Circle ): void {
		let collisionDepth = MAX_VALUE;

		let depth1;
		let depth2;

//			Vector boxAxis = ra.axes[0];
		const boxAxis0 = ra.axes0;
		let depth = CollisionDetector.testIntervals(ra.getProjection(boxAxis0), ca.getProjection(boxAxis0));
		if (depth == 0) {
            console.warn("no col A");
			return;
		}

		if (FP.abs(depth) < FP.abs(collisionDepth)) {
			Vector.setToOtherVector(boxAxis0, CollisionDetector.collisionNormal);
//				collisionNormal.setTo(boxAxis0[0],boxAxis0[1]);
			collisionDepth = depth;
        //    console.warn('urg');
		}
		depth1 = depth;

		const boxAxis1 = ra.axes1;
		depth = CollisionDetector.testIntervals(ra.getProjection(boxAxis1), ca.getProjection(boxAxis1));
		if (depth == 0) {
            console.warn("no col B");
			return;
		}

		if (FP.abs(depth) < FP.abs(collisionDepth)) {
			Vector.setToOtherVector(boxAxis1, CollisionDetector.collisionNormal);
//				collisionNormal.setTo(boxAxis1[0],boxAxis1[1]);
			collisionDepth = depth;
		}
		depth2 = depth;

		// determine if the circle's center is in a vertex region
		const r = ca.radius;
		if (FP.abs(depth1) < r && FP.abs(depth2) < r) {

			CollisionDetector.closestVertexOnOBB(ca.curr,ra);

			// get the distance from the closest vertex on rect to circle center
//				vertex.supply_minus(ca.curr,collisionNormal);
			Vector.supply_minus( CollisionDetector.vertex, ca.curr, CollisionDetector.collisionNormal);

			const mag = Vector.magnitude( CollisionDetector.collisionNormal );
			collisionDepth = r - mag;

			if (collisionDepth > 0) {
				// there is a collision in one of the vertex regions
//					collisionNormal.divEquals(mag);
				Vector.supply_div( CollisionDetector.collisionNormal, mag, CollisionDetector.collisionNormal );
			} else {
				// ra is in vertex region, but is not colliding
                console.warn("no col C");
				return;
			}
		}
		CollisionResolver.resolveParticleParticle( ra, ca, CollisionDetector.collisionNormal, collisionDepth );
	}

	/**
	 * Tests the collision between two CircleParticles. If there is a collision it
	 * determines its axis and depth, and then passes it off to the CollisionResolver
	 * for handling.
	 */
	static testCirclevsCircle( ca: Circle, cb: Circle ): void {
		const depthX = CollisionDetector.testIntervals(ca.getIntervalX(), cb.getIntervalX());
		if (depthX == 0) return;

		const depthY = CollisionDetector.testIntervals(ca.getIntervalY(), cb.getIntervalY());
		if (depthY == 0) return;
		Vector.supply_minus( ca.curr, cb.curr, CollisionDetector.collisionNormal );
//			ca.curr.supply_minus(cb.curr,collisionNormal);


		const mag = Vector.magnitude( CollisionDetector.collisionNormal );
		const collisionDepth = ( ca.radius + cb.radius ) - mag;

		if (collisionDepth > 0) {
//				collisionNormal.divEquals(mag);
			Vector.supply_div( CollisionDetector.collisionNormal, mag, CollisionDetector.collisionNormal );

			CollisionResolver.resolveParticleParticle( ca, cb, CollisionDetector.collisionNormal, collisionDepth );
		}
	}

	/**
	 * Returns 0 if intervals do not overlap. Returns smallest depth if they do.
	 */
	static testIntervals( intervalA: Interval, intervalB: Interval ): number {
		if (intervalA.max < intervalB.min) return 0;
		if (intervalB.max < intervalA.min) return 0;

		const lenA = intervalB.max - intervalA.min;
		const lenB = intervalB.min - intervalA.max;

		return (FP.abs(lenA) < FP.abs(lenB)) ? lenA : lenB;
	}

	/**
	 * Returns the location of the closest vertex on r to point p
	 */
	static closestVertexOnOBB( p: number[], r: Rect ): void {

//			p.supply_minus(r.curr,d);
		Vector.supply_minus( p, r.curr, CollisionDetector.d );

		Vector.setToOtherVector(r.curr, CollisionDetector.vertex);

//			for (int i = 0; i < 2; i++) {
			CollisionDetector.dTemp[0] = CollisionDetector.d[0];
			CollisionDetector.dTemp[1] = CollisionDetector.d[1];
			let dist = Vector.dot( CollisionDetector.dTemp,r.axes0);

			if (dist >= 0) dist = r.extents[0];
			else if (dist < 0) dist = -r.extents[0];

//				vertex.plusEquals(Vector.supply_mult(r.axes0,dist, mult_temp));

			Vector.supply_mult( r.axes0, dist, CollisionDetector.mult_temp);
			Vector.supply_plus( CollisionDetector.vertex, CollisionDetector.mult_temp, CollisionDetector.vertex);

			CollisionDetector.dTemp[0] = CollisionDetector.d[0];
			CollisionDetector.dTemp[1] = CollisionDetector.d[1];
			dist = Vector.dot( CollisionDetector.dTemp, r.axes1);

			if (dist >= 0) dist = r.extents[1];
			else if (dist < 0) dist = -r.extents[1];

//				vertex.plusEquals(Vector.supply_mult(r.axes1,dist, mult_temp));

			Vector.supply_mult( r.axes1, dist, CollisionDetector.mult_temp );
			Vector.supply_plus( CollisionDetector.vertex, CollisionDetector.mult_temp, CollisionDetector.vertex);
//			}
//			return vertex;
	}
}


export default class CollisionResolver {
	public static tmp1: number[] = new Array( 2 );
	public static tmp2: number[] = new Array( 2 );
	public static mtd: number[] = new Array( 2 );
	public static mtdA: number[] = new Array( 2 );
	public static mtdB: number[] = new Array( 2 );
	public static vnA: number[] = new Array( 2 );
	public static vnB: number[] = new Array( 2 );

	static resolveParticleParticle( pa: Actor, pb: Actor, normal: number[], depth: number ): void {
		Vector.supply_mult(normal,depth,this.mtd);

		let te = pa.kfr + pb.kfr;

		// the total friction in a collision is combined but clamped to [0,1]
		let tf = ONE - (pa.friction + pb.friction);
		if (tf > ONE) {
			tf = ONE;
		}
		else if (tf < 0) {
			tf = 0;
		}

		// get the total mass
		let ma = pa.mass;
		let mb = pb.mass;
		let tm = pa.mass + pb.mass;
		//MvdA have assigned a large mass to fixed particles in setFixed(boolean)

		// get the collision components, vn and vt
		const ca = pa.getComponents(normal);
		const cb = pb.getComponents(normal);

	 	// calculate the coefficient of restitution based on the mass

		Vector.supply_mult(cb.vn,FP.mul((te + ONE),mb), CollisionResolver.tmp1);
		Vector.supply_mult(ca.vn,FP.mul(ma - te,mb), CollisionResolver.tmp2);
		Vector.supply_plus(CollisionResolver.tmp1,CollisionResolver.tmp2,CollisionResolver.vnA);
		Vector.supply_div(CollisionResolver.tmp1,tm,CollisionResolver.vnA);

		Vector.supply_mult(ca.vn,FP.mul((te + ONE),ma), CollisionResolver.tmp1);
		Vector.supply_mult(cb.vn,FP.mul(mb - te,ma), CollisionResolver.tmp2);
		Vector.supply_plus(CollisionResolver.tmp1,CollisionResolver.tmp2,CollisionResolver.vnB);
		Vector.supply_div(CollisionResolver.tmp1,tm,CollisionResolver.vnB);

		// scale the mtd by the ratio of the masses. heavier particles move less
//			mtd.supply_mult(FP.div(mb,tm),mtdA);
		Vector.supply_mult(this.mtd,FP.div(mb,tm),CollisionResolver.mtdA);

		Vector.supply_mult(this.mtd,-FP.div(ma,tm),CollisionResolver.mtdB);


		// TODO: Igor hacking away to get fixed AudioParticles to sound upon collision
		//if (! pa.fixed) {
			Vector.supply_plus(CollisionResolver.vnA,ca.vt,CollisionResolver.vnA);
			pa.resolveCollision(CollisionResolver.mtdA, CollisionResolver.vnA, normal, depth, -ONE);
		//}
		//if (! pb.fixed) {
			Vector.supply_plus(CollisionResolver.vnB,cb.vt,CollisionResolver.vnB);
			pb.resolveCollision(CollisionResolver.mtdB, CollisionResolver.vnB, normal, depth, ONE);
		//}
//			if (! pa.fixed) pa.resolveCollision(mtdA, vnA.plusEquals(ca.vt), normal, depth, -FP.ONE);
//			if (! pb.fixed) pb.resolveCollision(mtdB, vnB.plusEquals(cb.vt), normal, depth, FP.ONE);
	}
}
