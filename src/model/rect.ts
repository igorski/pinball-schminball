/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2022-2023 - https://www.igorski.nl
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
import type { Point } from "zcanvas";
import Actor from "@/model/actor";
import type { ActorOpts } from "@/model/actor";
import { ActorShapes } from "@/model/math/shape";
import FP, { TWO } from "@/model/math/fp";
import Interval from "@/model/math/interval";
import Vector from "@/model/math/vector";
import { rectangleToPolygon, rectangleToRotatedPolygon } from "@/utils/math-util";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

export default class Rect extends Actor {
    public pivotX: number;
    public pivotY: number;
    private _pivot: Point; // TODO can this replace _pivotX and _pivotY ?

    /**
     * a Rect is an Actor that can adjust its angle and
     * rotate around a custom pivot point
     */
    constructor( opts: ActorOpts ) {
        super({ ...opts, init: false });

        this.shape = ActorShapes.RECT;

        this.setElasticity( 0.5 );

        // this.shape = new RectPhys( new Vector( opts.width / 2, opts.height / 2 ));

        if ( opts.angle !== 0 ) {
        //    this.shape.type = SHAPE_TYPES.OBB;
        }
        this.pivotX = opts.width / 2;
        this.pivotY = opts.height / 2;

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set the values properly
        this._pivot = { x: 0, y: 0 };

        if ( opts.init ) {
            this.cacheCoordinates();
        }

        /* APE */

        this.extents[0] = FP.div(FP.fromFloat(this.width),TWO);
        this.extents[1] = FP.div(FP.fromFloat(this.height),TWO);
        this.setRotation(FP.fromFloat(this.rotation));
        this.show = true;

        this.initCornerPositions();

        this.cacheCoordinates();
    }

    getPivot(): Point {
        return this._pivot;
    }

    cacheCoordinates(): void {
        const { x, y } = this.cacheBounds();

        this._pivot.x = x + this.pivotX;
        this._pivot.y = y + this.pivotY;

        if ( DEBUG ) {
            if ( this.angle === 0 ) {
                this._outline = rectangleToPolygon( this.bounds );
            } else {
                this._outline = rectangleToRotatedPolygon( this.bounds, this.angle, this._pivot.x, this._pivot.y );
            }
        }
    }

    /* APE */

    public currTemp: number[] = new Array( 2 );
    public cornerPositions: Vector[] = new Array( 4 );
    public extents: number[] = new Array( 2 );
    public axes0: number[] = new Array( 2 );
    public axes1: number[] = new Array( 2 );
    private rotation: number;
    private show: boolean;

    public getRotation(): number {
		return this.rotation;
	}

	public setRotation( t: number ): void {
		this.rotation = t;
		this.setAxes(t);
	}

    /**
     * An Array of <code>Vector</code> objects storing the location of the 4
     * corners of this RectangleParticle. This method would usually be called
     * in a painting method if the locations of the corners were needed. If the
     * RectangleParticle is being drawn using its position and angle properties
     * then you don't need to access this property.
     */
    private initCornerPositions(): void {
        this.cornerPositions[0] = Vector.getNew(0,0);
        this.cornerPositions[1] = Vector.getNew(0,0);
        this.cornerPositions[2] = Vector.getNew(0,0);
        this.cornerPositions[3] = Vector.getNew(0,0);

        this.updateCornerPositions();
    }

    public update( fTimestep: number ): void {
        super.update( fTimestep );
        this.updateCornerPositions();
    }

//		// TODO REVIEW FOR ANY POSSIBILITY OF PRECOMPUTING
//		@Override
//		public final Interval getProjection(Vector axis) {
//
//			int radius =
//				FP.mul(extents[0],FP.abs(axis.dot(this.axes0)))+
//				FP.mul(extents[1],FP.abs(axis.dot(this.axes1)));
//
//			int c = curr.dot(axis);
//
//			interval.min = c - radius;
//			interval.max = c + radius;
//			return interval;
//		}
// TODO REVIEW FOR ANY POSSIBILITY OF PRECOMPUTING

    public getProjection( axis: number[] ): Interval {

        const radius =
            FP.mul( this.extents[0], FP.abs(Vector.dot( axis, this.axes0 )))+
            FP.mul( this.extents[1], FP.abs(Vector.dot( axis, this.axes1 )));

        this.currTemp[0] = this.curr[0];
        this.currTemp[1] = this.curr[1];

        const c = Vector.dot( this.currTemp, axis );

        this.interval.min = c - radius;
        this.interval.max = c + radius;

        return this.interval;
    }

    public updateCornerPositions(): void {
        const ae0_x = FP.mul(this.axes0[0], this.extents[0]);
        const ae0_y = FP.mul(this.axes0[1], this.extents[0]);
        const ae1_x = FP.mul(this.axes1[0], this.extents[1]);
        const ae1_y = FP.mul(this.axes1[1], this.extents[1]);

        const emx = ae0_x - ae1_x;
        const emy = ae0_y - ae1_y;
        const epx = ae0_x + ae1_x;
        const epy = ae0_y + ae1_y;

        //MvdA TODO optimized to reuse the old Vectors but could be notated faster I think
        const [
            cornerPosition1, cornerPosition2, cornerPosition3, cornerPosition4
        ] = this.cornerPositions;

        cornerPosition1.x = this.curr[0] - epx;
        cornerPosition1.y = this.curr[1] - epy;
        //this.cornerPositions[0] = cornerPosition1;

        cornerPosition2.x = this.curr[0] + emx;
        cornerPosition2.y = this.curr[1] + emy;
        //this.cornerPositions[1] = cornerPosition2;

        cornerPosition3.x = this.curr[0] + epx;
        cornerPosition3.y = this.curr[1] + epy;
        //this.cornerPositions[2] = cornerPosition3;

        cornerPosition4.x = this.curr[0] - emx;
        cornerPosition4.y = this.curr[1] - emy;
        //this.cornerPositions[3] = cornerPosition4;
    }

    private setAxes( t: number ): void {
        const s = FP.sin(t);
        const c = FP.cos(t);

        this.axes0[0] = c;
        this.axes0[1] = s;
        this.axes1[0] = -s;
        this.axes1[1] = c;
    }
};
