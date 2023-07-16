import { describe, it, expect } from "vitest";
import Actor from "@/model/actor";
import { getMockPhysicsEngine } from "../__mocks";

describe( "Actor", () => {
    const engine = getMockPhysicsEngine();

    it( "should be able to retrieve the Actors current bounding box coordinates", () => {
        const actor = new Actor( engine, { left: 10, top: 10, width: 30, height: 30 });
        expect( actor.getOutline() ).toEqual([ 10, 10, 40, 10, 40, 40, 10, 40 ]);
    });
});
