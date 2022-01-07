export const SHAPE_TYPES = {
    CIRCLE : 0,
    AABB   : 1,
    OBB    : 2
};

export default class PhysicsShape {
    setType( type ) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
};
