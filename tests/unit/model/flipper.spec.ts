import { describe, it, expect } from "vitest";
import Flipper from "@/model/flipper";

describe( "Flipper", () => {
    describe( "when constructing a new Flipper", () => {
        it( "should by default set the pivot point to the top left coordinates", () => {
            const flipper = new Flipper({ left: 10, top: 10 });
            expect( flipper.pivotX ).toEqual( 0 );
            expect( flipper.pivotY ).toEqual( 0 );
        });

        it( "should set the pivot point to the provided properties, when given", () => {
            const flipper = new Flipper({ left: 10, top: 10, pivotX: 5, pivotY: 5 });
            expect( flipper.pivotX ).toEqual( 5 );
            expect( flipper.pivotY ).toEqual( 5 );
        });
    });

    it( "should be able to calculate the Flippers localized pivot point", () => {
        const flipper = new Flipper({ left: 10, top: 10, pivotX: 5, pivotY: 5 });
        expect( flipper.getPivot() ).toEqual({ x: 15, y: 15 });
    });
});
