/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2023 - https://www.igorski.nl
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
import type { Point, sprite } from "zcanvas";
import { rectangleToPolygon, areVectorsIntersecting } from "@/utils/math-util";
import { degToRad, radToDeg } from "@/utils/math-util";
import type { ActorShapes } from "@/utils/math/shape";
import FP, { ONE, HALF_VALUE } from "@/model/math/fp";
import { Collision } from "@/model/math/collision";
import Interval from "@/model/math/interval";
import Vector from "@/model/math/vector";

// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
const DEBUG = import.meta.env.MODE !== "production";

type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
    // TODO: do we still need these halves?
    halfWidth: number;
    halfHeight: number;
};

export type ActorOpts = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    angle?: number;
    fixed?: boolean;
    init?: boolean;
};

export default class Actor {
    public bounds: Bounds;
    public renderer: sprite;
    public shape: ActorShapes;

    protected width: number;
    protected height: number;
    protected angle: number;
    protected _outline: number[];

    constructor({ x = 0, y = 0, width = 1, height = 1, angle = 0, fixed = true, init = true }: ActorOpts = {} ) {
        this.width  = width;
        this.height = height;
        this.angle = angle;

        // TODO: do not store width, height separately but read from bounds Object
        this.bounds = {
            x: 0,
            y: 0, // will be updated by cacheCoordinates()
            width,
            height,
            halfWidth  : width  / 2,
            halfHeight : height / 2
        };

        // instance variables used by getters (prevents garbage collector hit)
        // invocation of cacheCoordinates() on position update will set the values properly
        this._outline = [];

        /* APE */

        this.interval = new Interval(0,0);

        this.curr[0] = FP.fromFloat(x);
        this.curr[1] = FP.fromFloat(y);
        this.prev[0] = this.curr[0];
        this.prev[1] = this.curr[1];

        this.collision = new Collision(new Array( 2 ), new Array( 2 ));
        this.isColliding = false;

        this.setMass(FP.fromFloat(0.1));
        this.setElasticity(FP.fromFloat(0));
        this.setFriction(FP.fromFloat(0));
        this.setFixed(fixed);

        this.setCollidable( false );

        /* E.O. APE */

        if ( init ) {
            this.cacheCoordinates();
        }
    }

    cacheBounds(): Bounds {
        this.bounds.x = FP.toFloat( this.curr[0] ) - this.bounds.halfWidth;
        this.bounds.y = FP.toFloat( this.curr[1] ) - this.bounds.halfHeight;

        return this.bounds;
    }

    cacheCoordinates(): void {
        this.cacheBounds();

        if ( DEBUG ) {
            this._outline = rectangleToPolygon( this.cacheBounds() );
        }
    }

    getOutline(): number[] {
        return this._outline;
    }

    update( fTimestep: number ): void { //!< Updates position of body using improved euler
        if ( this.fixed ) {
            return;
        }
        // global forces
        // TODO?
        // this.addForce([0,0]/*APEngine.force*/);
        // apply gravity
        this.addMasslessForce([20, 20]/*APEngine.masslessForce*/ );

        // integrate
        Vector.setToOtherVector( this.curr, this.temp );
    //			temp.setTo( this.curr.x,curr.y);
    //
        this.supply_getVelocity( Actor.nv );
    //			nv.supply_plus(forces.multEquals(dt2),nv);
    //			forces.multEquals(dt2);
        Vector.supply_mult( this.forces, fTimestep, this.forces);
        Vector.supply_plus( Actor.nv, this.forces, Actor.nv );

    //			curr.plusEquals(nv.multEquals(APEngine.damping));
        Vector.supply_mult( Actor.nv, /*APEngine.damping*/ ONE, Actor.nv );
        Vector.supply_plus( this.curr, Actor.nv, this.curr );

        Vector.setToOtherVector( this.temp, this.prev );

        // clear the forces
    //			forces.setTo(0,0);
        this.forces[0] = 0;
        this.forces[1] = 0;

        this.cacheCoordinates(); // can we do this differently?
    }

    getAngleRad(): number {
        return this.angle;
    }

    setAngleRad( angle: number ): void {
        this.angle = angle;
    }

    /* APE */

    public curr: number[] = new Array( 2 ); // TODO to point
    public prev: number[] = new Array( 2 ); // TODO to point

    public isColliding: boolean;

    public interval: Interval | null = null;

    private forces: number[] = new Array( 2 );

    private temp: number[] = new Array( 2 );

    public next: Actor | null = null;

    public kfr: number;
    public mass: number;
    public invMass: number;
    public fixed: boolean;
    public friction: number;
    public collidable: boolean;
    private collision: Collision;

    private static nv: number[] = new Array( 2 );
    private static vel: number[] = new Array( 2 );

    /**
     * The mass of the particle. Valid values are greater than zero. By default, all particles
     * have a mass of 1.
     *
     * <p>
     * The mass property has no relation to the size of the particle. However it can be
     * easily simulated when creating particles. A simple example would be to set the
     * mass and the size of a particle to same value when you instantiate it.
     * </p>
     * @throws flash.errors.Error flash.errors.Error if the mass is set less than zero.
     */
    setMass( m: number ): void {
        if (m <= 0) throw new Error("mass may not be set <= 0");
        this.mass = m;
        this.invMass = FP.div( ONE, this.mass );
    }


    /**
     * The elasticity of the particle. Standard values are between 0 and 1.
     * The higher the value, the greater the elasticity.
     *
     * <p>
     * During collisions the elasticity values are combined. If one particle's
     * elasticity is set to 0.4 and the other is set to 0.4 then the collision will
     * be have a total elasticity of 0.8. The result will be the same if one particle
     * has an elasticity of 0 and the other 0.8.
     * </p>
     *
     * <p>
     * Setting the elasticity to greater than 1 (of a single particle, or in a combined
     * collision) will cause particles to bounce with energy greater than naturally
     * possible. Setting the elasticity to a value less than zero is allowed but may cause
     * unexpected results.
     * </p>
     */
    setElasticity( k: number ): void {
        this.kfr = k;
    }


    /**
     * The surface friction of the particle. Values must be in the range of 0 to 1.
     *
     * <p>
     * 0 is no friction (slippery), 1 is full friction (sticky).
     * </p>
     *
     * <p>
     * During collisions, the friction values are summed, but are clamped between 1 and 0.
     * For example, If two particles have 0.7 as their surface friction, then the resulting
     * friction between the two particles will be 1 (full friction).
     * </p>
     *
     * <p>
     * Note: In the current release, only dynamic friction is calculated. Static friction
     * is planned for a later release.
     * </p>
     *
     * @throws flash.errors.Error flash.errors.Error if the friction is set less than zero or greater than 1
     */
    setFriction( f:number): void {
        if (f < 0 || f > ONE) throw new Error("Legal friction must be >= 0 and <=1");
        this.friction = f;
    }

    /**
     * The fixed state of the particle. If the particle is fixed, it does not move
     * in response to forces or collisions. Fixed particles are good for surfaces.
     */
    setFixed( f: boolean ): void {
        if(f) {
            this.setMass(HALF_VALUE);
        }
        this.fixed = f;
    }

    /**
     * The position of the particle. Getting the position of the particle is useful
     * for drawing it or testing it for some custom purpose.
     *
     * <p>
     * When you get the <code>position</code> of a particle you are given a copy of the current
     * location. Because of this you cannot change the position of a particle by
     * altering the <code>x</code> and <code>y</code> components of the Vector you have retrieved from the position property.
     * You have to do something instead like: <code> position = new Vector(100,100)</code>, or
     * you can use the <code>px</code> and <code>py</code> properties instead.
     * </p>
     *
     * <p>
     * You can alter the position of a particle three ways: change its position, set
     * its velocity, or apply a force to it. Setting the position of a non-fixed particle
     * is not the same as setting its fixed property to true. A particle held in place by
     * its position will behave as if it's attached there by a 0 length sprint constraint.
     * </p>
     */
    //		public final void setPosition(Vector p) {
    //			curr.setTo(p.x,p.y);
    //			prev.setTo(p.x,p.y);
    //		}

    getPosition(): Point {
        return { x: this.bounds.x, y: this.bounds.y };
    }

    setPosition( x: number, y: number ): void {
        this.curr[0] = x;
        this.curr[1] = y;
        this.prev[0] = x;
        this.prev[1] = y;
    }

    /**
     * The x position of this particle
     */
    setpx( x: number ): void {
        this.curr[0] = x;
        this.prev[0] = x;
    }

    /**
     * The y position of this particle
     */
    setpy( y: number ): void {
        this.curr[1] = y;
        this.prev[1] = y;
    }

    /**
     * The velocity of the particle. If you need to change the motion of a particle,
     * you should either use this property, or one of the addForce methods. Generally,
     * the addForce methods are best for slowly altering the motion. The velocity property
     * is good for instantaneously setting the velocity, e.g., for projectiles.
     *
     */
    //		public final Vector getVelocity() {
    //			return curr.minus(prev);
    //		}

    protected supply_getVelocity( result: number[] ): void {
        Vector.supply_minus( this.curr, this.prev, result );
    }

    protected setVelocity( v: number[] ): void {
        this.prev[0] = this.curr[0] - v[0];
        this.prev[1] = this.curr[1] - v[1];
    }

    /**
     * Determines if the particle can collide with other particles or constraints.
     * The default state is true.
     */
    setCollidable( value: boolean ): void {
        this.collidable = value;
    }

    /**
     * Adds a force to the particle. The mass of the particle is taken into
     * account when using this method, so it is useful for adding forces
     * that simulate effects like wind. Particles with larger masses will
     * not be affected as greatly as those with smaller masses. Note that the
     * size (not to be confused with mass) of the particle has no effect
     * on its physical behavior.
     *
     * @param force A Vector representing the force added.
     */
     addForce( force: number[] ): void  {
        Vector.supply_mult(force, this.invMass, force);
        Vector.supply_plus(this.forces, force, this.forces);
    }


    /**
     * Adds a 'massless' force to the particle. The mass of the particle is
     * not taken into account when using this method, so it is useful for
     * adding forces that simulate effects like gravity. Particles with
     * larger masses will be affected the same as those with smaller masses.
     *
     * @param force A Vector representing the force added.
     */
    addMasslessForce( force: number[] ): void {
    //			forces.plusEquals(f);
        Vector.supply_plus( this.forces, force, this.forces );
    }

    getComponents( collisionNormal: number[] ): Collision {
        this.supply_getVelocity( Actor.vel );

        const vdotn = Vector.dot( collisionNormal, Actor.vel );

        Vector.supply_mult( collisionNormal, vdotn, this.collision.vn );
        Vector.supply_minus( Actor.vel, this. collision.vn, this.collision.vt );

        return this.collision;
    }

    // @ts-expect-error unused arguments
    resolveCollision( mtd: number[], vel: number[], n: number[], d: number, o: number ): void {
    //			curr.plusEquals(mtd);
        Vector.supply_plus( this.curr, mtd, this.curr);
/*
        switch (APEngine.collisionResponseMode) {
            case APEngine.STANDARD:
                this.setVelocity(vel);
                break;

            case APEngine.SELECTIVE:
*/
                if (!this.isColliding) this.setVelocity(vel);
                this.isColliding = true;
/*
                break;

            case APEngine.SIMPLE:
                break;
        }
*/
    }
    //
    //		public abstract Interval getProjection(Vector axis);

    remove( p: Actor, previous: Actor ): void {
        if( p === this ) {
            if ( this.next !== null ) {
                previous.next = this.next;
            }
        } else if ( this.next !== null ) {
            this.next.remove( p, this );
        }
    }
};
