import { vi } from "vitest";
import type { Actor } from "@/model/actor";
import type { IPhysicsEngine } from "@/model/physics/engine";

export const getMockPhysicsEngine = (): IPhysicsEngine => ({
    engine: {},
    update: vi.fn(),
    applyForce: vi.fn(),
    addBody: vi.fn(( actor: Actor, label: string ) => ({
        label,
        position: {
            // matter-js corrects offset from actor center (centre of mass)
            x: actor.bounds.left - actor.bounds.width / 2,
            y: actor.bounds.top  - actor.bounds.height / 2,
        },
        velocity: {
            x: 0,
            y: 0
        },
    })),
    removeBody: vi.fn(),
    triggerFlipper: vi.fn(),
});
