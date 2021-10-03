import Actor from "@/model/actor";

describe( "Actor", () => {
    describe( "when constructing a new Actor", () => {
        it( "should by default set the pivot point to the top left coordinates", () => {
            const actor = new Actor({ x: 10, y: 10 });
            expect( actor.pivotX ).toEqual( 0 );
            expect( actor.pivotY ).toEqual( 0 );
        });

        it( "should set the pivot point to the provided properties, when given", () => {
            const actor = new Actor({ x: 10, y: 10, pivotX: 5, pivotY: 5 });
            expect( actor.pivotX ).toEqual( 5 );
            expect( actor.pivotY ).toEqual( 5 );
        });
    });

    it( "should be able to calculate the Actors localized pivot point", () => {
        const actor = new Actor({ x: 10, y: 10, pivotX: 5, pivotY: 5 });
        expect( actor.getPivot() ).toEqual({ x: 15, y: 15 });
    });

    it( "it should be able to calculate the Actors current center coordinate", () => {
        const actor = new Actor({ x: 10, y: 10, width: 30, height: 30 });
        expect( actor.getCenter() ).toEqual(({ x: 25, y: 25 }));
    });
});
