//
//  Vector2D.cpp
//  Pinball
//
//  Created by Dinis Marques Firmino on 23/01/2015.
//  Copyright (c) 2015 Dinis Marques Firmino. All rights reserved.
//

export default class Vector {
    constructor( x = 0, y = 0 ) {
        this.x = x;
        this.y = y;
    }

    setX( x ) {
        this.x = x;
    }

    setY( y ) {
        this.y = y;
    }

    setXY( x, y ) {
        this.x = x;
        this.y = y;
    }

    unitVector() {
        const fMag = this.magnitude();
        return new Vector( this.x / fMag, this.y / fMag );
    }

    dotProduct( otherVector ) {
        return ( this.x * otherVector.x ) + ( this.y * otherVector.y );
    }

    crossProduct( otherVector ) {
        return ( this.x * otherVector.y ) - ( this.y * otherVector.x );
    }

    scalarCrossVector( kfScalar ) {
        return new Vector( -kfScalar * this.y, kfScalar * this.x );
    }

    vectorCrossScalar( kfScalar ) {
        return new Vector( this.y * kfScalar, -kfScalar * this.x );
    }

    angle( otherVector ) {
        const magV1 = this.magnitude();
        const magV2 = otherVector.magnitude();

        return ( this.x * otherVector.x + this.y * otherVector.y ) / ( magV1 * magV2 );
    }

    magnitude() {
        return Math.sqrt( this.x * this.x + this.y * this.y );
    }

    // operator+
    add( otherVector ) {
        return new Vector( this.x + otherVector.x, this.y + otherVector.y );
    }

    subtract( otherVector ) {
        this.setXY( this.x - otherVector.x, this.y - otherVector.y );
        return this;
    }

    divide( otherVector ) {
        return new Vector( this.x / otherVector.x, this.y / otherVector.y );
    }

    divideScalar( kfScalar ) {
        return new Vector( this.x / kfScalar, this.y / kfScalar );
    }

    multiply( otherVector ) {
        return new Vector( this.x * otherVector.x, this.y * otherVector.y );
    }

    multiplyScalar( kfScalar ) {
        return new Vector( this.x * kfScalar, this.y * kfScalar );
    }

    // operator-()
    invert() {
        return new Vector( -this.x, -this.y );
    }
}

/*




Vector2D& Vector2D::operator+=(const Vector2D& otherVector)
{
    set(x()+otherVector.x(), y()+otherVector.y());
    return *this;
}

Vector2D& Vector2D::operator= (const Vector2D& otherVector)
{
    set(otherVector.x(), otherVector.y());
    return *this;
}

bool Vector2D::operator==(const Vector2D& otherVector) const
{
    return ((x() == otherVector.x()) && (y() == otherVector.y()));
}
*/
