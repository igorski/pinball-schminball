import PhysicsShape, { SHAPE_TYPES } from "./physicsshape";

export default class CirclePhys extends PhysicsShape {
    constructor( radius = 1 ) {
        super();
        
        this.setType( SHAPE_TYPES.CIRCLE );
        this.setRadius( radius );
    }

    setRadius( radius ) {
        this.fRadius = radius;
    }

    getRadius() {
        return this.fRadius;
    }
};
