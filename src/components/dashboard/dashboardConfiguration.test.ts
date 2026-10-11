import {describe, expect, it} from "vitest";
import {getDashboardCards, resolveDashboardConfiguration} from "./dashboardConfiguration";

describe("dashboard configuration", () => {
    it("uses the original dashboard order when no customization is saved", () => {
        expect(resolveDashboardConfiguration(null).cards).toEqual([
            {id: "weekly-completion", visible: true}, {id: "budget-balance", visible: true},
            {id: "plan-realism", visible: true}, {id: "weekly-allocation", visible: true},
            {id: "time-today", visible: true}, {id: "weekly-rhythm", visible: true},
            {id: "recent-trends", visible: true},
        ]);
    });
    it("keeps hidden positions and unknown cards, appending missing cards with their defaults", () => {
        const configuration = resolveDashboardConfiguration({cards: [
            {id: "time-today", visible: false},
            {id: "future-card", visible: true},
            {id: "budget-balance", visible: true},
        ]});
        expect(configuration.cards.slice(0, 4)).toEqual([
            {id: "time-today", visible: false},
            {id: "future-card", visible: true},
            {id: "budget-balance", visible: true},
            {id: "weekly-completion", visible: true},
        ]);
        expect(getDashboardCards(configuration).slice(0, 3).map(card => card.id)).toEqual([
            "time-today", "budget-balance", "weekly-completion",
        ]);
    });
});
