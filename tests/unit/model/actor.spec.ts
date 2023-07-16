import { describe, it, expect, afterEach, vi } from "vitest";
import Actor from "@/model/actor";
import { getMockPhysicsEngine } from "../__mocks";

describe( "Actor", () => {
    const engine = getMockPhysicsEngine();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it( "should register its physics body inside the physics engine", () => {
        const engineSpy = vi.spyOn( engine, "addBody" );

        const actor = new Actor( engine );

        expect( engineSpy ).toHaveBeenCalledWith( actor, actor.getLabel() );
    });

    it( "should be able to unregister its body from the physics engine on disposal", () => {
        const engineSpy = vi.spyOn( engine, "removeBody" );

        const actor = new Actor( engine );
        actor.dispose( engine );

        expect( engineSpy ).toHaveBeenCalledWith( actor.body );
    });

    it( "should dispose its renderer on disposal", () => {
        const actor = new Actor( engine );

        actor.renderer = {
            dispose: vi.fn(),
        };
        actor.dispose( engine );

        expect( actor.renderer.dispose ).toHaveBeenCalled();
    });

    it( `when the bounds are cached, it should be able to translate the Actors physics body
         coordinates to the Actors on-screen bounding box coordinates`, () => {
        const actor = new Actor( engine, { left: 50, top: 50, width: 30, height: 30 });
        actor.cacheBounds();

        expect( actor.getOutline() ).toEqual([ 20, 20, 50, 20, 50, 50, 20, 50 ]);
    });
});
