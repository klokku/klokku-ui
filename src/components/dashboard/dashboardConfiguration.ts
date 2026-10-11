import {z} from "zod";

type DataRequirement = "weekly-stats" | "calendar-week" | "history";

export const dashboardCardDefinitions = [
    {id: "weekly-completion", title: "Weekly completion", wide: false, defaultVisible: true, requirements: ["weekly-stats", "calendar-week"]},
    {id: "budget-balance", title: "Budget balance", wide: false, defaultVisible: true, requirements: ["weekly-stats"]},
    {id: "plan-realism", title: "Plan realism", wide: false, defaultVisible: true, requirements: ["history"]},
    {id: "weekly-allocation", title: "Weekly allocation", wide: true, defaultVisible: true, requirements: ["weekly-stats"]},
    {id: "time-today", title: "Time today", wide: false, defaultVisible: true, requirements: ["weekly-stats"]},
    {id: "weekly-rhythm", title: "This week's rhythm", wide: false, defaultVisible: true, requirements: ["weekly-stats"]},
    {id: "recent-trends", title: "Recent trends", wide: true, defaultVisible: true, requirements: ["history"]},
] as const satisfies readonly {id: string; title: string; wide: boolean; defaultVisible: boolean; requirements: readonly DataRequirement[]}[];

export type DashboardCardId = typeof dashboardCardDefinitions[number]["id"];

const cardSchema = z.object({
    id: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/).refine(id => id !== "tracking-now"),
    visible: z.boolean(),
});
export const dashboardConfigurationSchema = z.object({cards: z.array(cardSchema).max(100)})
    .refine(configuration => new Set(configuration.cards.map(card => card.id)).size === configuration.cards.length)
    .nullable();
export type DashboardConfiguration = Exclude<z.infer<typeof dashboardConfigurationSchema>, null>;

export function resolveDashboardConfiguration(configuration: DashboardConfiguration | null): DashboardConfiguration {
    const cards = configuration?.cards.map(card => ({...card})) ?? [];
    for (const definition of dashboardCardDefinitions) {
        if (!cards.some(card => card.id === definition.id)) {
            cards.push({id: definition.id, visible: definition.defaultVisible});
        }
    }
    return {cards};
}

export function getDashboardCards(configuration: DashboardConfiguration) {
    return configuration.cards.flatMap(card => {
        const definition = dashboardCardDefinitions.find(definition => definition.id === card.id);
        return definition ? [{...card, ...definition}] : [];
    });
}

export function needsDashboardData(configuration: DashboardConfiguration, requirement: DataRequirement) {
    return getDashboardCards(configuration).some(card => card.visible && (card.requirements as readonly DataRequirement[]).includes(requirement));
}
