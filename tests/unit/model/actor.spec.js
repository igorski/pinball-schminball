import Actor from "@/model/actor";

describe( "Actor", () => {
    it( "should be able to retrieve the Actors current center coordinate", () => {
        const actor = new Actor({ x: 10, y: 10, width: 30, height: 30 });
        expect( actor.getCenter() ).toEqual(({ x: 25, y: 25 }));
    });

    it( "should be able to retrieve the Actors current vector coordinates", () => {
        const actor = new Actor({ x: 10, y: 10, width: 30, height: 30 });
        expect( actor.getVector() ).toEqual([ 10, 10, 40, 10, 40, 40, 10, 40 ]);
    });
});
