import PhysicsShape, { SHAPE_TYPES } from "./physicsshape";

export default class RectPhys extends PhysicsShape {
    constructor( kHalfExtentsIn ) {
        this.setType( SHAPE_TYPES.AABB );
        this.setHalfExtent( kHalfExtentsIn );
    }

    setHalfExtent( kHalfExtents ) {
        this.halfExtent = kHalfExtents;
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
