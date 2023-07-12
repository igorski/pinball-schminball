import FP, { SMALL } from "./fp";

let available: Vector | null = null;

export default class Vector
{
    private tmp: number[] = new Array( 2 );
    public next: Vector | null = null;

    constructor( public x = 0, public y = 0 ) {}

	static getNew( px: number, py: number ): Vector {
		if ( available !== null ) {
//				poolCreationCount++;
			const newVec = available;
			newVec.setTo( px, py );
			available = newVec.next;

			return newVec;
		} else {
//				poolUnavailableCount++;
			return new Vector( px, py );
		}
	}

	release( v: Vector ): void {
//			poolReleaseCount++;
//			pool.offer(v);
		v.next = available;
		available = v;
//			System.out.println("RELEASED VECTOR, POOL AFTER: "+pool.size());
	}

	setTo( px: number, py: number ): void {
		this.x = px;
		this.y = py;
	}

    static setToOtherVector( other: number[], result: number[] ): void {
        result[0] = other[0];
        result[1] = other[1];
    }

//		public final int dot(Vector v) {
////			return x * v.x + y * v.y;
//			return FP.mul(x,v.x)+FP.mul(y,v.y);
//		}
	static dot( v0: number[], v1: number[] ): number {
//			return x * v.x + y * v.y;
		return (FP.mul(v0[0],v1[0])+FP.mul(v0[1],v1[1]));
	}

	static supply_plus( v0: number[], v1: number[], v2: number[] ): void {
//			supplied.setTo(x + v.x, y + v.y);
		v2[0] = v0[0]+v1[0];
		v2[1] = v0[1]+v1[1];
//			return supplied;
	}

	static supply_minus( v0: number[], v1: number[], result: number[] ): void {
//			supplied.setTo(x - v.x, y - v.y);
		result[0] = v0[0] - v1[0];
		result[1] = v0[1] - v1[1];
//			return result;
	}

	static supply_mult( v0: number[], i: number, v1: number[] ): void {
//			toReturn.setTo(FP.mul(v[0],s),FP.mul(v[1],s));
		v1[0] = FP.mul(v0[0],i);
		v1[1] = FP.mul(v0[1],i);
	}

	static supply_div( toDiv: number[], s: number, result: number[] ): void {
		if (s == 0) s -= SMALL;
//			x = FP.div(x,s);
//			y = FP.div(y,s);
		result[0] = FP.div(toDiv[0],s);
		result[1] = FP.div(toDiv[1],s);
//			x /= s;
//			y /= s;

	}

	static magnitude( v: number[] ): number {
		return FP.sqrt(FP.mul(v[0],v[0])+FP.mul(v[1],v[1]));
		//MvdA TODO look if this affect behaviour much
//			return Math.sqrt(x * x + y * y);
	}

    distance( v0: number[], v1: number[] ): number {
		Vector.supply_minus(v0,v1,this.tmp);
		return Vector.magnitude(this.tmp);
	}

	static getPoolSize(): number {
		if(available !== null) {
			let i = 1;
			let v = available;
			while(v.next != null) {
				i++;
				v = v.next;
			}
			return i;
		}
		else {
			return 0;
		}
	}
}
