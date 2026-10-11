import {act, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {onlineManager, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {BudgetPlan, BudgetPlanItem} from "@/api/types.ts";
import {BudgetPlansPage} from "./BudgetPlansPage";

const {fetchMock} = vi.hoisted(() => ({fetchMock: vi.fn()}));
vi.mock("@/api/fetchWithProfileUid.ts", () => ({useFetchWithProfileUid: () => fetchMock}));
vi.mock("./BudgetPlanChooser.tsx", () => ({
    BudgetPlanChooser: ({setSelectedPlanId}: {setSelectedPlanId: (id: number) => void}) => <>
        <button onClick={() => setSelectedPlanId(1)}>Select plan one</button>
        <button onClick={() => setSelectedPlanId(2)}>Select plan two</button>
    </>,
}));
vi.mock("@/components/budgetPlanItem/AddBudgetPlanItemDialog.tsx", () => ({
    AddBudgetPlanItemDialog: ({open, budgetPlanItem, onSave}: {
        open: boolean; budgetPlanItem: BudgetPlanItem | null; onSave: (item: BudgetPlanItem) => Promise<void>;
    }) => open ? <div role="dialog">
        {budgetPlanItem ? `Edit ${budgetPlanItem.name}` : "Add budget item"}
        <button onClick={() => { void onSave(budgetPlanItem ? {...budgetPlanItem, name: `${budgetPlanItem.name} updated`}
            : {name: "New item", weeklyDuration: 0, weeklyOccurrences: 0, icon: "", color: ""}); }}>Save item</button>
    </div> : null,
}));
vi.mock("./wizard/BudgetPlanWizardDialog.tsx", () => ({default: () => null}));
vi.mock("@/components/budgetPlan/BudgetPlanEdit.tsx", () => ({BudgetPlanEdit: () => null}));

const items: BudgetPlanItem[] = ["Work", "Sleep", "Leisure", "Exercise"].map((name, index) => ({
    id: index + 11, name, weeklyDuration: 42 * 3600, weeklyOccurrences: 7, icon: "", color: "#123456",
}));
let plans: BudgetPlan[];
let finishSave: (response: Response) => void;
let finishRefresh: (() => void) | undefined;
let holdRefresh: boolean;
let client: QueryClient;

function names() {
    return within(screen.getByRole("table")).getAllByRole("row").slice(1).map(row => within(row).getAllByRole("cell")[0].textContent);
}

async function selectPlan() {
    client = new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}});
    render(<QueryClientProvider client={client}><BudgetPlansPage/></QueryClientProvider>);
    fireEvent.click(await screen.findByRole("button", {name: "Select plan one"}));
    await screen.findByRole("button", {name: "Drag Work to reorder"});
}

async function dragWithKeyboard(name: string, directions: string[], end = "Space", start = "Space") {
    const handle = screen.getByRole("button", {name: `Drag ${name} to reorder`});
    handle.focus();
    fireEvent.keyDown(handle, {code: start, key: start === "Space" ? " " : start});
    await waitFor(() => expect(handle).toHaveAttribute("aria-pressed", "true"));
    // The keyboard sensor attaches document listeners on the next task.
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    for (const direction of directions) {
        fireEvent.keyDown(document, {code: direction, key: direction});
    }
    fireEvent.keyDown(document, {code: end, key: end === "Space" ? " " : end});
}

function writes() {
    return fetchMock.mock.calls.filter(([, options]) => options?.method === "PUT");
}

async function saveSuccessfully() {
    const [url, options] = writes()[0];
    const match = url.match(/budgetplan\/(\d+)\/item\/(\d+)\/position/);
    const plan = plans.find(plan => plan.id === Number(match[1]))!;
    const moved = plan.items.find(item => item.id === Number(match[2]))!;
    const remaining = plan.items.filter(item => item.id !== moved.id);
    const precedingId = JSON.parse(options.body).precedingId;
    remaining.splice(precedingId === 0 ? 0 : remaining.findIndex(item => item.id === precedingId) + 1, 0, moved);
    plan.items = remaining;
    await act(async () => { finishSave(new Response(null, {status: 204})); });
}

beforeEach(() => {
    plans = [{id: 1, name: "First", isCurrent: true, items: [...items]}, {id: 2, name: "Second", isCurrent: false, items: [...items].reverse()}];
    holdRefresh = false;
    finishRefresh = undefined;
    fetchMock.mockReset().mockImplementation(async (url: string, options?: RequestInit) => {
        if (options?.method === "PUT" && url.endsWith("/position")) return new Promise<Response>(resolve => { finishSave = resolve; });
        if (options?.method === "PUT") {
            const edited = JSON.parse(options.body as string);
            plans[0].items = plans[0].items.map(item => item.id === edited.id ? edited : item);
            return Response.json(edited);
        }
        if (options?.method === "POST") {
            const added = {...JSON.parse(options.body as string), id: 99};
            plans[0].items.push(added);
            return Response.json(added);
        }
        if (url === "/api/budgetplan") return Response.json(plans);
        if (holdRefresh) await new Promise<void>(resolve => { finishRefresh = resolve; });
        return Response.json(plans.find(plan => url === `/api/budgetplan/${plan.id}`));
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        const row = this.closest("tbody tr");
        const index = row ? [...row.parentElement!.children].indexOf(row) : 0;
        return {x: 0, y: index * 50, top: index * 50, bottom: (index + 1) * 50, left: 0, right: 500, width: 500, height: 50, toJSON: () => ({})};
    });
});

afterEach(() => { client?.clear(); onlineManager.setOnline(true); vi.restoreAllMocks(); });

describe("budget plan drag and drop", () => {
    it.each([
        ["Exercise", ["ArrowUp", "ArrowUp", "ArrowUp"], 14, 0, ["Exercise", "Work", "Sleep", "Leisure"]],
        ["Work", ["ArrowDown", "ArrowDown", "ArrowDown"], 11, 14, ["Sleep", "Leisure", "Exercise", "Work"]],
        ["Leisure", ["ArrowUp"], 13, 11, ["Work", "Leisure", "Sleep", "Exercise"]],
        ["Sleep", ["ArrowDown"], 12, 13, ["Work", "Leisure", "Sleep", "Exercise"]],
    ])("saves %s in its dropped position using the final preceding item", async (name, directions, id, precedingId, expected) => {
        await selectPlan();
        await dragWithKeyboard(name as string, directions as string[]);
        await waitFor(() => expect(writes()).toHaveLength(1));
        expect(writes()[0]).toEqual([`/api/budgetplan/1/item/${id}/position`, {method: "PUT", body: JSON.stringify({precedingId})}]);
        await waitFor(() => expect(names()).toEqual([...expected, "Add new item"]));
        expect(screen.getByRole("button", {name: `Drag ${name} to reorder`})).toHaveAttribute("aria-disabled", "true");
        await saveSuccessfully();
        await waitFor(() => expect(screen.getByRole("button", {name: `Drag ${name} to reorder`})).toHaveAttribute("aria-disabled", "false"));
        expect(screen.getByRole("button", {name: `Drag ${name} to reorder`})).toHaveFocus();
        expect(names()).toEqual([...expected, "Add new item"]);
        expect(client.getQueryData<BudgetPlan>(["budgetPlanDetails", 2])).toBeUndefined();
    });

    it.each([[["ArrowDown"], "Escape"], [[], "Space"]])("does not save cancelled or unchanged drags", async (directions, end) => {
        await selectPlan();
        await dragWithKeyboard("Work", directions as string[], end as string);
        expect(writes()).toHaveLength(0);
        expect(names()).toEqual(["Work", "Sleep", "Leisure", "Exercise", "Add new item"]);
    });

    it("keeps handles disabled until the saved order has been refreshed", async () => {
        await selectPlan();
        holdRefresh = true;
        await dragWithKeyboard("Work", ["ArrowDown"]);
        await waitFor(() => expect(writes()).toHaveLength(1));
        await saveSuccessfully();
        await waitFor(() => expect(finishRefresh).toBeDefined());
        expect(screen.getByRole("button", {name: "Drag Work to reorder"})).toHaveAttribute("aria-disabled", "true");
        fireEvent.keyDown(screen.getByRole("button", {name: "Drag Work to reorder"}), {code: "Space", key: " "});
        expect(screen.getByRole("button", {name: "Drag Work to reorder"})).not.toHaveAttribute("aria-pressed", "true");
        expect(writes()).toHaveLength(1);
        await act(async () => { finishRefresh!(); });
        await waitFor(() => expect(screen.getByRole("button", {name: "Drag Work to reorder"})).toHaveAttribute("aria-disabled", "false"));
    });

    it("rolls back a failed save, announces the error, and permits retry", async () => {
        await selectPlan();
        await dragWithKeyboard("Work", ["ArrowDown"]);
        await waitFor(() => expect(names()[0]).toBe("Sleep"));
        await act(async () => { finishSave(new Response(null, {status: 500})); });
        expect(await screen.findByRole("alert")).toHaveTextContent("Could not save the item order");
        expect(names()).toEqual(["Work", "Sleep", "Leisure", "Exercise", "Add new item"]);
        expect(screen.getByRole("button", {name: "Drag Work to reorder"})).toHaveAttribute("aria-disabled", "false");
        await dragWithKeyboard("Work", ["ArrowDown"]);
        await waitFor(() => expect(writes()).toHaveLength(2));
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        await saveSuccessfully();
    });

    it("releases the handles after a failed offline save even when the refresh is paused", async () => {
        await selectPlan();
        await dragWithKeyboard("Work", ["ArrowDown"]);
        await waitFor(() => expect(writes()).toHaveLength(1));
        act(() => onlineManager.setOnline(false));
        await act(async () => { finishSave(new Response(null, {status: 503})); });
        expect(await screen.findByRole("alert")).toHaveTextContent("Could not save the item order");
        expect(screen.getByRole("button", {name: "Drag Work to reorder"})).toHaveAttribute("aria-disabled", "false");
        expect(names()).toEqual(["Work", "Sleep", "Leisure", "Exercise", "Add new item"]);
    });

    it("preserves saved edits and additions when a concurrent reorder fails", async () => {
        await selectPlan();
        await dragWithKeyboard("Work", ["ArrowDown"]);
        await waitFor(() => expect(writes()).toHaveLength(1));
        fireEvent.click(screen.getByText("Work", {exact: true}));
        fireEvent.click(screen.getByRole("button", {name: "Save item"}));
        await screen.findByText("Work updated", {exact: true});
        fireEvent.click(screen.getByText("Add new item"));
        fireEvent.click(screen.getByRole("button", {name: "Save item"}));
        await screen.findByText("New item", {exact: true});
        holdRefresh = true;
        await act(async () => { finishSave(new Response(null, {status: 500})); });
        expect(await screen.findByRole("alert")).toHaveTextContent("Could not save the item order");
        expect(names()).toEqual(["Work updated", "Sleep", "Leisure", "Exercise", "New item", "Add new item"]);
        await act(async () => { finishRefresh!(); });
    });

    it("supports Enter pickup and drop and announces the item's name and destination", async () => {
        await selectPlan();
        await dragWithKeyboard("Work", ["ArrowDown"], "Enter", "Enter");
        await waitFor(() => expect(writes()).toHaveLength(1));
        expect(screen.getByRole("status")).toHaveTextContent("Work dropped at position 2.");
        await saveSuccessfully();
    });

    it("keeps another plan's order and errors isolated when switching during a save", async () => {
        await selectPlan();
        await dragWithKeyboard("Work", ["ArrowDown"]);
        await waitFor(() => expect(writes()).toHaveLength(1));
        fireEvent.click(screen.getByRole("button", {name: "Select plan two"}));
        await waitFor(() => expect(names()[0]).toBe("Exercise"));
        await act(async () => { finishSave(new Response(null, {status: 500})); });
        await waitFor(() => expect(screen.getByRole("button", {name: "Drag Work to reorder"})).toHaveAttribute("aria-disabled", "false"));
        expect(names()).toEqual(["Exercise", "Leisure", "Sleep", "Work", "Add new item"]);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(client.getQueryData<BudgetPlan>(["budgetPlanDetails", 1])?.items).toEqual(items);
    });

    it("labels the handles with keyboard instructions and preserves edit and add actions", async () => {
        await selectPlan();
        const handle = screen.getByRole("button", {name: "Drag Work to reorder"});
        expect(document.getElementById(handle.getAttribute("aria-describedby")!)).toHaveTextContent("Press Escape to cancel");
        fireEvent.click(handle);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByText("Work", {exact: true}));
        expect(screen.getByRole("dialog")).toHaveTextContent("Edit Work");
        fireEvent.click(screen.getByText("Add new item"));
        expect(screen.getByRole("dialog")).toHaveTextContent("Add budget item");
        expect(writes()).toHaveLength(0);
    });
});
