import Actor from "@/model/actor";

describe( "Actor", () => {
    it( "should be able to retrieve the Actors current bounding box coordinates", () => {
        const actor = new Actor({ x: 10, y: 10, width: 30, height: 30 });
        expect( actor.getBoundingBox() ).toEqual([ 10, 10, 40, 10, 40, 40, 10, 40 ]);
    });
});
