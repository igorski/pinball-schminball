import Ball from "@/model/ball";

describe( "Ball", () => {
    it( "should be able to retrieve the Balls current center coordinate", () => {
        const ball = new Ball({ x: 10, y: 10, width: 30, height: 30 });
        expect( ball.getCenter() ).toEqual(({ x: 25, y: 25 }));
    });
});
