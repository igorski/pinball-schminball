import PhysicsShape, { SHAPE_TYPES } from "./physicsshape";
import Vector from "./vector";

export default class RectPhys extends PhysicsShape {
    constructor( vectorHalfExtents ) {
        super();

        this.setType( SHAPE_TYPES.AABB );
        this.setHalfExtent( vectorHalfExtents );
    }

    setHalfExtent( vectorHalfExtents ) {
        this.halfExtent = vectorHalfExtents;
    }

    getHalfExtent() {
        return this.halfExtent;
    }

    getWidth() {
        return this.getMax().x - this.getMin().x;
    }

    getHeight() {
        return this.getMax().y - this.getMin().y;
    }

    getMin() {
        return this.halfExtent.invert();
    }

    getMax() {
        return this.halfExtent;
    }
}
