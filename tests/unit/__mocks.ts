import { vi } from "vitest";
import type { IPhysicsEngine } from "@/model/physics/engine";

export const getMockPhysicsEngine = (): IPhysicsEngine => ({
    engine: {},
    update: vi.fn(),
    applyForce: vi.fn(),
    addBody: vi.fn(() => ({
        position: { x: 0, y: 0 },
    })),
    removeBody: vi.fn(),
    triggerFlipper: vi.fn(),
});
