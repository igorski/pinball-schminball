import { describe, it, expect, afterEach, vi } from "vitest";
import type { sprite } from "zcanvas";
import Actor from "@/model/actor";
import { getMockCanvas, getMockPhysicsEngine } from "../__mocks";

describe( "Actor", () => {
    const engine = getMockPhysicsEngine();
    const canvas = getMockCanvas();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe( "on construction", () => {
        it( "should register its physics body inside the physics engine", () => {
            const engineSpy = vi.spyOn( engine, "addBody" );

            const actor = new Actor({}, engine, canvas );

            expect( engineSpy ).toHaveBeenCalledWith( actor, actor.getLabel() );
        });

        it( "should not add a renderer to the provided canvas when no renderer class is provided", () => {
            const canvasSpy = vi.spyOn( canvas, "addChild" );

            const actor = new Actor({}, engine, canvas );

            expect( canvasSpy ).not.toHaveBeenCalled();
        });

        it( "should add a renderer to the provided canvas when the renderer class is provided", () => {
            const canvasSpy = vi.spyOn( canvas, "addChild" );
            const mockSprite = vi.fn() as never as typeof sprite;

            const getRendererClassMock = vi.spyOn( Actor.prototype, "getRendererClass" )
                .mockImplementation( function() { return mockSprite; });

            const actor = new Actor({}, engine, canvas );

            expect( canvasSpy ).toHaveBeenCalled();
        });
    });

    it( "should be able to unregister its body from the physics engine on disposal", () => {
        const engineSpy = vi.spyOn( engine, "removeBody" );

        const actor = new Actor({}, engine, canvas );
        actor.dispose( engine );

        expect( engineSpy ).toHaveBeenCalledWith( actor.body );
    });

    it( "should also dispose its renderer on disposal", () => {
        const actor = new Actor({}, engine, canvas );

        const renderer = { dispose: vi.fn() } as never as sprite;
        actor.renderer = renderer;

        actor.dispose( engine );

        expect( renderer.dispose ).toHaveBeenCalled();
        expect( actor.renderer ).toBeNull();
    });

    it( `when the bounds are cached, it should be able to translate the Actors physics body
         coordinates to the Actors on-screen bounding box coordinates`, () => {
        const actor = new Actor({ left: 50, top: 50, width: 30, height: 30 }, engine, canvas );
        actor.cacheBounds();

        expect( actor.getOutline() ).toEqual([ 20, 20, 50, 20, 50, 50, 20, 50 ]);
    });
});
