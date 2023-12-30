import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "vitest-canvas-mock";
import { Sprite } from "zcanvas";
import Actor from "@/model/actor";
import { rectangleToPolygon } from "@/utils/math-util";
import { getMockCanvas, getMockPhysicsEngine } from "../__mocks";

describe( "Actor", () => {
    const engine = getMockPhysicsEngine();
    const canvas = getMockCanvas();

    const ACTOR_OPTS = { left: 50, top: 50, width: 30, height: 30 };

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

            new Actor({}, engine, canvas );

            expect( canvasSpy ).not.toHaveBeenCalled();
        });

        it( "should add a renderer to the provided canvas when the renderer class is provided", () => {
            const canvasSpy = vi.spyOn( canvas, "addChild" );

            const getRendererClassMock = vi.spyOn( Actor.prototype, "getRendererClass" )
                .mockImplementation( function() { return Sprite; });

            new Actor({}, engine, canvas );

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

        const renderer = { dispose: vi.fn() } as never as Sprite;
        actor.renderer = renderer;

        actor.dispose( engine );

        expect( renderer.dispose ).toHaveBeenCalled();
        expect( actor.renderer ).toBeNull();
    });

    describe( "when updating its bounds to reflect changes in its MatterJS body", () => {
        beforeEach(() => {
            vi.spyOn( Actor.prototype, "getRendererClass" ).mockImplementation( function() {
                return Sprite;
            });
        });

        it( "should transform the initial bounds given in the constructor to on-screen coordinates relative to the physics Body", () => {
            const actor = new Actor( ACTOR_OPTS, engine, canvas );
            actor.cacheBounds();

            const { left, top, width, height } = ACTOR_OPTS;
            expect( actor.bounds ).toEqual({ left: left - width / 2, top: top - height / 2, width, height });
        });

        it( "should sync the update with its renderer", () => {
            const actor = new Actor({ ...ACTOR_OPTS, fixed: false }, engine, canvas );

            const rendererRect = { left: 0, top: 0, width: ACTOR_OPTS.width, height: ACTOR_OPTS.height };
            vi.spyOn( actor.renderer, "getBounds" ).mockImplementation(() => rendererRect );

            actor.cacheBounds();

            expect( rendererRect ).toEqual( actor.bounds );
        });

        it( `when the bounds are cached, it should be able to translate the Actors physics body
            coordinates to the Actors on-screen bounding box coordinates`, () => {
            const actor = new Actor({ ...ACTOR_OPTS, fixed: false }, engine, canvas, );

            const rendererRect = { left: 0, top: 0, width: ACTOR_OPTS.width, height: ACTOR_OPTS.height };
            vi.spyOn( actor.renderer, "getBounds" ).mockImplementation(() => rendererRect );

            actor.cacheBounds();

            expect( rectangleToPolygon( actor.renderer.getBounds() )).toEqual([ 35, 35, 65, 35, 65, 65, 35, 65 ]);
        });

        it( "should not sync when the bounds are cached due to the Actor having a fixed position", () => {
            const actor = new Actor({ ...ACTOR_OPTS, fixed: true }, engine, canvas );

            const updateSpy = vi.spyOn( actor.renderer, "getBounds" );

            actor.cacheBounds();

            expect( updateSpy ).not.toHaveBeenCalled();
        });
    });
});
