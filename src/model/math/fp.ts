/**
 * This table is created using base of e.
 *
 * (defun fixedpoint (z) (round (* z (lsh 1 16))))
 *
 * (loop for k from 0 to 16 do (setq z (log (+ 1 (expt 2.0 (- (+ k 1))))))
 * (insert (format "%d\n" (fixedpoint z))))
 */
const log2arr = [ 26573, 14624, 7719, 3973, 2017, 1016, 510, 256,
          128, 64, 32, 16, 8, 4, 2, 1, 0, 0, 0 ];

const lnscale = [ 0, 45426, 90852, 136278, 181704, 227130, 272557,
          317983, 363409, 408835, 454261, 499687, 545113, 590539, 635965,
          681391, 726817 ];

function fromInt( x: number ): number {
    return x << 16;
}

function fromFloat(x: number): number {
    return Math.round(x * (1 << 16));
}

export const MAX_VALUE = fromInt(32767);
export const HALF_VALUE = fromInt(16383);
export const ONE = fromInt(1);
export const TWO = fromInt(2);
export const SMALL = fromFloat(0.00001);

const PI = 205887;
const PI_OVER_2 = PI/2;
const PI_OVER_4 = PI/4;
const E = 178145;
const HALF = 2 << 15;

const SK1 = 498;
const SK2 = 10882;
const CK1 = 2328;
const CK2 = 32551;
const TK1 = 13323;
const TK2 = 20810;

const AS1 = -1228;
const AS2 = 4866;
const AS3 = 13901;
const AS4 = 102939;

const FP = {
/**
*
* 16:16 fixed point math routines, for IAppli/CLDC platform.
* A fixed point number is a 32 bit int containing 16 bits of integer and 16 bits of fraction.
*<p>
* (C) 2001 Beartronics
* Author: Henry Minsky (hqm@alum.mit.edu)
*<p>
* Licensed under terms "Artistic License"<br>
* <a href="http://www.opensource.org/licenses/artistic-license.html">http://www.opensource.org/licenses/artistic-license.html</a><br>
*
*<p>
* Numerical algorithms based on
* http://www.cs.clemson.edu/html_docs/SUNWspro/common-tools/numerical_comp_guide/ncg_examples.doc.html
* <p>
* Trig routines based on numerical algorithms described in
* http://www.magic-software.com/MgcNumerics.html
*
* http://www.dattalo.com/technical/theory/logs.html
*
* @version $Id: FP.java,v 1.6 2001/04/05 07:40:17 hqm Exp $
*/
     // The x,y point where two lines intersect
     xIntersect: 0,
     yIntersect: 0,

     toInt( x: number ): number {
          return x >> 16;
     },

     fromInt,
     fromFloat,

     fromDouble(x: number): number {
          return Math.round(x * (1 << 16));
     },

     toDouble(x: number ): number {
          return x / (1 << 16);
     },

     toFloat(x: number ): number {
          return x / (1 << 16);
     },

     /** Multiply two fixed-point numbers */
     mul( x: number, y: number ): number {
          const z = Math.round( x ) * Math.round( y );
          return z >> 16;
     },

     /** Divides two fixed-point numbers */
     div( x: number, y: number ): number {
          const z = Math.round( x ) << 32;
          return Math.round( z / y ) >> 16;
     },

     /** Compute square-root of a 16:16 fixed point number */
     sqrt(n: number): number {
         debugger;
          let s = (n + 65536) >> 1;
          for (let i = 0; i < 8; i++) {
               s = (s + FP.div(n, s)) >> 1;
          }
          return s;
     },

     /** Round to nearest fixed point integer */
     round(n: number): number {
         debugger;
          if (n > 0) {
               if ((n & 0x8000) != 0) {
                    return (((n + 0x10000) >> 16) << 16);
               } else {
                    return (((n) >> 16) << 16);
               }
          } else {
               let k;
               n = -n;
               if ((n & 0x8000) != 0) {
                    k = (((n + 0x10000) >> 16) << 16);
               } else {
                    k = (((n) >> 16) << 16);
               }
               return -k;
          }
     },

     /** Round to nearest fixed point integer */
     abs(n: number): number {
    	 if(n < 0) {
    		 return -n;
    	 }
    	 else {
    		 return n;
    	 }
     },

     /**
      * USED
      * Computes SIN(f), f is a fixed point number in radians. 0 <= f <= 2PI
      */
     sin(f: number): number {
    	  return FP.fromDouble(Math.sin(FP.toFloat(f)));
     },

     /**
      * Computes cos(f), f is a fixed point number in radians. 0 <= f <= PI/2
      */
     cos(f: number): number {
    	  return FP.fromDouble(Math.cos(FP.toFloat(f)));
     },

     /**
      * Computes tan(f), f is a fixed point number in radians. 0 <= f <= PI/4
      */
     tan(f: number): number {
         debugger;
          const sqr = FP.mul(f, f);
          let result = FP.mul(TK1, sqr);
          result += TK2;
          result = FP.mul(result, sqr);
          result += (1 << 16);
          result = FP.mul(result, f);
          return result;
     },

     /**
      * Computes atan(f), f is a fixed point number |f| <= 1
      * <p>
      * For the inverse tangent calls, all approximations are valid for |t| <= 1.
      * To compute ATAN(t) for t > 1, use ATAN(t) = PI/2 - ATAN(1/t). For t < -1,
      * use ATAN(t) = -PI/2 - ATAN(1/t).
      */
     atan(f: number): number {
         debugger;
          const sqr = FP.mul(f, f);
          let result = FP.mul(1365, sqr);
          result -= 5579;
          result = FP.mul(result, sqr);
          result += 11805;
          result = FP.mul(result, sqr);
          result -= 21646;
          result = FP.mul(result, sqr);
          result += 65527;
          result = FP.mul(result, f);
          return result;
     },

     /**
      * Compute asin(f), 0 <= f <= 1
      */

     asin(f: number): number {
         debugger;
          const fRoot = FP.sqrt((1 << 16) - f);
          let result = FP.mul(AS1, f);
          result += AS2;
          result = FP.mul(result, f);
          result -= AS3;
          result = FP.mul(result, f);
          result += AS4;
          result = PI_OVER_2 - (FP.mul(fRoot, result));
          return result;
     },

     /**
      * Compute acos(f), 0 <= f <= 1
      */
     acos(f: number): number {
         debugger;
          const fRoot = FP.sqrt((1 << 16) - f);
          let result = FP.mul(AS1, f);
          result += AS2;
          result = FP.mul(result, f);
          result -= AS3;
          result = FP.mul(result, f);
          result += AS4;
          result = FP.mul(fRoot, result);
          return result;
     },

     /**
      * Exponential
      * /** Logarithms:
      *
      * (2) Knuth, Donald E., "The Art of Computer Programming Vol 1",
      * Addison-Wesley Publishing Company, ISBN 0-201-03822-6 ( this comes from
      * Knuth (2), section 1.2.3, exercise 25).
      *
      * http://www.dattalo.com/technical/theory/logs.html
      *
      */

     ln(x: number ): number {
         debugger;
          // prescale so x is between 1 and 2
          let shift = 0;

          while (x > 1 << 17) {
               shift++;
               x >>= 1;
          }

          let g = 0;
          let d = HALF;
          for (let i = 1; i < 16; i++) {
               if (x > ((1 << 16) + d)) {
                    x = FP.div(x, ((1 << 16) + d));
                    g += log2arr[i - 1]; // log2arr[i-1] = log2(1+d);
               }
               d >>= 1;
          }
          return g + lnscale[shift];
     },

     /**
      * Does line segment A intersection line segment B?
      *
      * Assumes 16 bit fixed point numbers with 16 bits of fraction.
      *
      * For debugging, side effect xint, yint, the intersection point.
      *
      */
      /*
    intersects (ax0: number, ay0: number, ax1: number, ay1: number,
 			bx0: number, by0: number, bx1: number, by1: number): boolean {

 	ax0 <<= 16;
 	ay0 <<= 16;
 	ax1 <<= 16;
 	ay1 <<= 16;

 	bx0 <<= 16;
 	by0 <<= 16;
 	bx1 <<= 16;
 	by1 <<= 16;

 	let adx = (ax1 - ax0);
 	let ady = (ay1 - ay0);
 	let bdx = (bx1 - bx0);
 	let bdy = (by1 - by0);

 	let xma;
 	let xba;

 	let xmb;
 	let xbb;
 	let TWO = (2 << 16);

 	if ((adx == 0) && (bdx == 0)) { // both vertical lines
 	    const dist = Math.abs(FP.div((ax0+ax1)-(bx0+bx1), TWO));
 	    return (dist == 0);
 	} else if (adx == 0) { // A  vertical
 	    let xa = FP.div((ax0 + ax1), TWO);
 	    xmb = FP.div(bdy,bdx);           // slope segment B
 	    xbb = by0 - mul(bx0, xmb); // y intercept of segment B
 	    xIntersect = xa;
 	    yIntersect = (FP.mul(xmb,xIntersect)) + xbb;
 	} else if ( bdx == 0) { // B vertical
 	    let xb = FP.div((bx0+bx1), TWO);
 	    xma = FP.div(ady,adx);           // slope segment A
 	    xba = ay0 - (FP.mul(ax0,xma)); // y intercept of segment A
 	    xIntersect = xb;
 	    yIntersect = (FP.mul(xma,xIntersect)) + xba;
 	} else {
 	     xma = FP.div(ady,adx);           // slope segment A
 	     xba = ay0 - (FP.mul(ax0, xma)); // y intercept of segment A

 	     xmb = FP.div(bdy,bdx);           // slope segment B
 	     xbb = by0 - (FP.mul(bx0,xmb)); // y intercept of segment B

 	     // parallel lines?
 	     if (xma == xmb) {
     		 // Need trig functions
     		 const dist = Math.abs(FP.mul((xba-xbb),
     					   (cos(atan(div((xma+xmb), TWO))))));
     		 if (dist < (1<<16) ) {
     		     return true;
     		 } else {
     		     return false;
     		 }
 	     } else {
     		 // Calculate points of intersection
     		 // At the intersection of line segment A and B, XA=XB=XINT and YA=YB=YINT
     		 if ((xma-xmb) == 0) {
     		     return false;
     		 }
     		 FP.xIntersect = FP.div((xbb-xba),(xma-xmb));
     		 FP.yIntersect = (FP.mul(xma,xIntersect)) + xba;
 	     }
 	}

 	// After the point or points of intersection are calculated, each
 	// solution must be checked to ensure that the point of intersection lies
 	// on line segment A and B.

 	const minxa = Math.min(ax0, ax1);
 	const maxxa = Math.max(ax0, ax1);

 	const minya = Math.min(ay0, ay1);
 	const maxya = Math.max(ay0, ay1);

 	const minxb = Math.min(bx0, bx1);
 	const maxxb = Math.max(bx0, bx1);

 	const minyb = Math.min(by0, by1);
 	const maxyb = Math.max(by0, by1);

 	return ((xIntersect >= minxa) && (xIntersect <= maxxa) && (yIntersect >= minya) && (yIntersect <= maxya)
 		&&
 		(xIntersect >= minxb) && (xIntersect <= maxxb) && (yIntersect >= minyb) && (yIntersect <= maxyb));
    },*/

     atan2(y: number, x: number ): number {
         debugger;
    	 return FP.fromDouble(Math.atan2(FP.toFloat(y),FP.toFloat(x)));
//		 int r;
//		 int angle;
//	     int coeff_1 = PI_OVER_4;
//	     int coeff_2 = FP.mul(3, coeff_1);
//	     int abs_y = Math.abs(y)+1;      // kludge to prevent 0/0 condition
//		 if (x>=0)
//		 {
//		    r = FP.div(x - abs_y, x + abs_y);
//		    angle = coeff_1 - FP.mul(coeff_1, r);
//		 }
//		 else
//		 {
//		    r = FP.div(x + abs_y, abs_y - x);
//		    angle = coeff_2 - FP.mul(coeff_1, r);
//		 }
//		 if (y < 0)
//		 	return(-angle);     // negate if in quad III or IV
//		 else
//			return(angle);
	  }
};
export default FP;
