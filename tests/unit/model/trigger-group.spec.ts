import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TriggerTarget, TriggerTypes, TRIGGER_EXPIRY } from "@/definitions/game";
import TriggerGroup from "@/model/trigger-group";
import { getMockCanvas, getMockPhysicsEngine } from "../__mocks";

vi.mock( "zcanvas", () => ({
    sprite: class {
        dispose() {}
    },
    collision: {
        isInsideViewport: vi.fn(() => true ),
    },
}));

describe( "Trigger Group", () => {
    const engine = getMockPhysicsEngine();
    const canvas = getMockCanvas();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const TRIGGER_DEF = {
        target: TriggerTarget.MULTIPLIER,
        type: TriggerTypes.BOOL,
        triggers: [
            { left: 0, top: 0, width: 10, height: 10 },
            { left: 10, top: 10, width: 10, height: 10 },
        ]
    };

    const TRIGGER_DEF_LARGE_GROUP = {
        ...TRIGGER_DEF,
        triggers: [
            { left: 0, top: 0, width: 10, height: 10 },
            { left: 10, top: 0, width: 10, height: 10 },
            { left: 20, top: 0, width: 10, height: 10 },
            { left: 30, top: 0, width: 10, height: 10 },
        ]
    };

    it( "should store the trigger groups target and type upon construction", () => {
        const triggerGroup = new TriggerGroup( TRIGGER_DEF, engine, canvas );

        expect( triggerGroup.triggerTarget ).toEqual( TRIGGER_DEF.target );
        expect( triggerGroup.triggerType ).toEqual( TRIGGER_DEF.type );
    });

    it( "should not have any active triggers upon construction", () => {
        const triggerGroup = new TriggerGroup( TRIGGER_DEF, engine, canvas );

        expect( triggerGroup.activeTriggers ).toHaveLength( 0 );
    });

    it( "should register the groups individual triggers upon construction", () => {
        const triggerGroup = new TriggerGroup( TRIGGER_DEF, engine, canvas );

        expect( triggerGroup.triggers ).toHaveLength( 2 );
    });

    it( "should dispose all the individual Triggers upon disposal", () => {
        const triggerGroup = new TriggerGroup( TRIGGER_DEF, engine, canvas );

        const trigger1dispose = vi.spyOn( triggerGroup.triggers[ 0 ], "dispose" );
        const trigger2dispose = vi.spyOn( triggerGroup.triggers[ 0 ], "dispose" );

        triggerGroup.dispose( engine );

        expect( trigger1dispose ).toHaveBeenCalled();
        expect( trigger2dispose ).toHaveBeenCalled();

        expect( triggerGroup.triggers ).toHaveLength( 0 );
    });

    describe( "when one of the triggers within the group is triggered", () => {
        let triggerGroup: TriggerGroup;

        const FIRST_TRIGGER_BODY_ID = 1;
        const SECOND_TRIGGER_BODY_ID = 2;

        beforeEach(() => {
            triggerGroup = new TriggerGroup( TRIGGER_DEF, engine, canvas );

            triggerGroup.triggers[0].body.id = FIRST_TRIGGER_BODY_ID;
            triggerGroup.triggers[1].body.id = SECOND_TRIGGER_BODY_ID;
        });

        it( "should add the Trigger id to the active Triggers list and set the Trigger as active", () => {
            const trigger1setActiveSpy = vi.spyOn( triggerGroup.triggers[ 0 ], "setActive" );
            const trigger2setActiveSpy = vi.spyOn( triggerGroup.triggers[ 1 ], "setActive" );

            triggerGroup.trigger( FIRST_TRIGGER_BODY_ID );

            expect( triggerGroup.activeTriggers ).toHaveLength( 1 );
            expect( triggerGroup.activeTriggers.has( FIRST_TRIGGER_BODY_ID )).toBe( true );

            expect( trigger1setActiveSpy ).toHaveBeenCalledWith( true );
            expect( trigger2setActiveSpy ).not.toHaveBeenCalled();
        });

        it( "should return false as long as not all triggers have been triggered", () => {
            const result = triggerGroup.trigger( FIRST_TRIGGER_BODY_ID );
            expect( result ).toBe( false );
        });

        it( "should return true when all triggers in the group have been triggered", () => {
            triggerGroup.trigger( FIRST_TRIGGER_BODY_ID );
            const result = triggerGroup.trigger( SECOND_TRIGGER_BODY_ID );

            expect( result ).toBe( true );
        });

        it( "should be able to unset the active state of all triggers and clear the active triggers", () => {
            triggerGroup.trigger( FIRST_TRIGGER_BODY_ID );
            triggerGroup.trigger( SECOND_TRIGGER_BODY_ID );

            const trigger1setActiveSpy = vi.spyOn( triggerGroup.triggers[ 0 ], "setActive" );
            const trigger2setActiveSpy = vi.spyOn( triggerGroup.triggers[ 1 ], "setActive" );

            triggerGroup.unsetTriggers();

            expect( triggerGroup.activeTriggers ).toHaveLength( 0 );

            expect( trigger1setActiveSpy ).toHaveBeenCalledWith( false );
            expect( trigger2setActiveSpy ).toHaveBeenCalledWith( false );
        });
    });

    describe( "when updating the Trigger Group", () => {
        describe( "and the group has the SERIES trigger type", () => {
            const FIRST_TIMESTAMP = 1000;
            let triggerGroup: TriggerGroup;
            let unsetTriggerSpy;

            beforeEach(() => {
                triggerGroup = new TriggerGroup({ ...TRIGGER_DEF, type: TriggerTypes.SERIES }, engine, canvas );
                unsetTriggerSpy = vi.spyOn( triggerGroup, "unsetTriggers" );
            });

            it( "should not do anything if there are no active triggers", () => {
                expect( triggerGroup.triggerTimeoutStart ).toEqual( 0 );

                triggerGroup.update( FIRST_TIMESTAMP );

                expect( triggerGroup.triggerTimeoutStart ).toEqual( 0 );
                expect( unsetTriggerSpy ).not.toHaveBeenCalled();
            });

            it( "should store the timeout timestamp only on the first trigger, when the timeout is still pending", () => {
                triggerGroup.activeTriggers.add( triggerGroup.triggers[ 0 ].body.id );
                triggerGroup.update( FIRST_TIMESTAMP );

                expect( triggerGroup.triggerTimeoutStart ).toEqual( FIRST_TIMESTAMP );

                triggerGroup.update( FIRST_TIMESTAMP + ( TRIGGER_EXPIRY - 1 ));

                expect( triggerGroup.triggerTimeoutStart ).toEqual( FIRST_TIMESTAMP );
                expect( unsetTriggerSpy ).not.toHaveBeenCalled();
            });

            it( "should unset the triggers once more time has expired since the first timestamp than allowed", () => {
                triggerGroup.activeTriggers.add( triggerGroup.triggers[ 0 ].body.id );
                triggerGroup.update( FIRST_TIMESTAMP );
                triggerGroup.update( FIRST_TIMESTAMP + TRIGGER_EXPIRY );

                expect( unsetTriggerSpy ).toHaveBeenCalled();
                expect( triggerGroup.triggerTimeoutStart ).toEqual( 0 );
            });
        });
    });

    describe( "when moving the active trigger states left/right when the flippers are up", () => {
        const FIRST_TRIGGER_BODY_ID = 1;
        const SECOND_TRIGGER_BODY_ID = 2;
        const THIRD_TRIGGER_BODY_ID = 3;
        const FOURTH_TRIGGER_BODY_ID = 4;

        let triggerGroup: TriggerGroup;
        let first: Trigger;
        let second: Trigger;
        let third: Trigger;
        let fourth: Trigger;

        beforeEach(() => {
            triggerGroup = new TriggerGroup({
                ...TRIGGER_DEF_LARGE_GROUP, type: TriggerTypes.BOOL
            }, engine, canvas );

            [ first, second, third, fourth ] = triggerGroup.triggers;

            first.body.id = FIRST_TRIGGER_BODY_ID;
            second.body.id = SECOND_TRIGGER_BODY_ID;
            third.body.id = THIRD_TRIGGER_BODY_ID;
            fourth.body.id = FOURTH_TRIGGER_BODY_ID;

            // triggers are now configured as XXX-

            triggerGroup.trigger( FIRST_TRIGGER_BODY_ID );
            triggerGroup.trigger( SECOND_TRIGGER_BODY_ID );
            triggerGroup.trigger( THIRD_TRIGGER_BODY_ID );
        });

        it( "should be able to move the active triggers state left inside the group", () => {
            triggerGroup.moveTriggersLeft();

            // expected triggers to be configured as XX-X

            expect( first.active ).toBe( true );
            expect( second.active ).toBe( true );
            expect( third.active ).toBe( false );
            expect( fourth.active ).toBe( true );

            expect( Array.from( triggerGroup.activeTriggers )).toEqual([
                FIRST_TRIGGER_BODY_ID, SECOND_TRIGGER_BODY_ID, FOURTH_TRIGGER_BODY_ID
            ]);
        });

        it( "should be able to move the active triggers state right inside the group", () => {
            triggerGroup.moveTriggersRight();

            // expected triggers to be configured as -XXX

            expect( first.active ).toBe( false );
            expect( second.active ).toBe( true );
            expect( third.active ).toBe( true );
            expect( fourth.active ).toBe( true );

            expect( Array.from( triggerGroup.activeTriggers )).toEqual([
                SECOND_TRIGGER_BODY_ID, THIRD_TRIGGER_BODY_ID, FOURTH_TRIGGER_BODY_ID
            ]);
        });
    });
});
