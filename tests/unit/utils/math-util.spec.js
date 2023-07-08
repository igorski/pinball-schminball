import { describe, it, expect } from "vitest";
import { radToDeg, degToRad, clamp, rectangleToRotatedPolygon, rectangleToPolygon } from "@/utils/math-util";

describe( "Math utilities", () => {
    describe( "when converting radians to degrees", () => {
        it( "should cap values at 360 degrees", () => {
            expect( radToDeg( 6.981317007977318 )).toEqual( 40 );
        });

        it( "should sanitize negative values", () => {
            expect( radToDeg( -1.5707963267948966 )).toEqual( 270 );
        });
    });

    describe( "when clamping a value to remain within range", () => {
        it( "should return the requested value if it is within the range", () => {
            expect( clamp( 5, 2, 10 )).toEqual( 5 );
        });

        it( "should return the min value if the requested value is below the given min", () => {
            expect( clamp( 1, 2, 10 )).toEqual( 2 );
        });

        it( "should return the max value if the requested value is above the given max", () => {
            expect( clamp( 20, 2, 10 )).toEqual( 10 );
        });
    });

    it( "should be able to rotate a rectangle into a polygon vector", () => {
        const rect  = { x: 0, y: 0, width: 20, height: 20 };
        const angle = degToRad( 45 );
        expect( rectangleToRotatedPolygon( rect, angle ).map( Math.round )).toEqual([
            9, -5, 24, 9, 10, 24, -5, 10
        ]);
    });

    it( "should be able to convert a rectangle to a point vector", () => {
        const rect = { x: 10, y: 15, width: 20, height: 20 };
        expect( rectangleToPolygon( rect )).toEqual([
            10, 15, // top left coordinate
            30, 15, // top right coordinate
            30, 35, // bottom right coordinate
            10, 35  // bottom left coordinate
        ]);
    });
});
