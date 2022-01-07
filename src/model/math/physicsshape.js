export const SHAPE_TYPES = {
    CIRCLE : 0,
    AABB   : 1,
    OBB    : 2
};

export default class PhysicsShape {
    constructor( type ) {
        this.setType( type );
    }
    
    setType( type ) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
};
