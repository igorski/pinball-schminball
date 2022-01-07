import Vector from "./vector";

export default class RotationMatrix {
    constructor( fRads = 0 ) {
        this.fData = [ 0, 0, 0, 0 ];
        this.setAngleRadians( fRads );
    }

    setAngleRadians( fRads ) {
        const fCos = Math.cos( fRads );
        const fSin = Math.sin( fRads );
        this.fData[0] = fCos;
    	this.fData[1] = -fSin;
    	this.fData[2] = fSin;
        this.fData[3] = fCos;
    }

    rotateVector( kVec ) {
        const row1 = new Vector(this.fData[0], this.fData[1]);
        const row2 = new Vector(this.fData[2], this.fData[3]);
        return new Vector(kVec.dotProduct(row1), kVec.dotProduct(row2));
    }

    inverseRotateVector( kVec ) {
        const column1 = new Vector(this.fData[0], this.fData[2]);
        const column2 = new Vector(this.fData[1], this.fData[3]);
        return new Vector(kVec.dotProduct(column1), kVec.dotProduct(column2));
    }
}
