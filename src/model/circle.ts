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
import Actor from "@/model/actor";
import type { ActorOpts } from "@/model/actor";
import FP from "@/model/math/fp";
import { ActorShapes } from "@/model/math/shape";
import type Interval from "@/model/math/interval";
import Vector from "@/model/math/vector";

export default class Circle extends Actor {
    public currTemp: number[] = new Array( 2 );
	public radius: number;

    constructor( opts: ActorOpts ) {
        super( opts );

        this.shape = ActorShapes.CIRCLE;

        /* APE */

		this.setRadius( FP.fromFloat( opts.width / 2 ));
    }

    /* APE */

    public setRadius( radius: number ): void {
        this.radius = radius;
    }

    public getProjection( axis: number[] ): Interval {
		this.currTemp[0] = this.curr[0];
		this.currTemp[1] = this.curr[1];

        const c = Vector.dot( this.currTemp, axis );

        this.interval.min = c - this.radius;
		this.interval.max = c + this.radius;

    	return this.interval;
	}

	public getIntervalX(): Interval {
		this.interval.min = this.curr[0] - this.radius;
		this.interval.max = this.curr[0] + this.radius;

		return this.interval;
	}

	public getIntervalY(): Interval {
		this.interval.min = this.curr[1] - this.radius;
		this.interval.max = this.curr[1] + this.radius;

		return this.interval;
	}
}
