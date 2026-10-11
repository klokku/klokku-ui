import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {DateTimePicker} from "@/components/datetime/DateTimePicker.tsx";

describe("timezone-aware date/time editing", () => {
    it("edits time on the profile's calendar date rather than the browser's date", () => {
        const onChange = vi.fn();
        render(<DateTimePicker value={new Date("2026-10-19T00:30:00Z")} onChange={onChange} timezone="America/New_York" label="Start"/>);
        const input = screen.getByLabelText("Start time");
        expect(input).toHaveValue("20:30");
        fireEvent.change(input, {target: {value: "21:15"}});
        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange.mock.calls[0][0].toISOString()).toBe("2026-10-19T01:15:00.000Z");
    });

    it("reflects externally changed values and timezones instead of retaining stale editor state", () => {
        const {rerender} = render(<DateTimePicker value={new Date("2026-10-19T00:30:00Z")} onChange={vi.fn()} timezone="America/New_York" label="Start"/>);
        rerender(<DateTimePicker value={new Date("2026-10-19T01:15:00Z")} onChange={vi.fn()} timezone="UTC" label="Start"/>);
        expect(screen.getByLabelText("Start time")).toHaveValue("01:15");
    });

    it("keeps the later occurrence of a repeated autumn hour when its minutes are edited", () => {
        const onChange = vi.fn();
        render(<DateTimePicker value={new Date("2026-10-25T01:45:00Z")} onChange={onChange} timezone="Europe/Warsaw" label="Start"/>);
        fireEvent.change(screen.getByLabelText("Start time"), {target: {value: "02:30"}});
        expect(onChange.mock.calls[0][0].toISOString()).toBe("2026-10-25T01:30:00.000Z");
    });

    it("rejects a nonexistent spring time and accepts a valid time after the transition", () => {
        const onChange = vi.fn();
        render(<DateTimePicker value={new Date("2026-03-08T06:30:00Z")} onChange={onChange} timezone="America/New_York" label="Start"/>);
        const input = screen.getByLabelText("Start time");
        fireEvent.change(input, {target: {value: "02:30"}});
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent("This time does not exist");
        expect(input).toHaveValue("02:30");
        expect(input).toBeInvalid();
        fireEvent.change(input, {target: {value: "03:30"}});
        expect(onChange.mock.calls[0][0].toISOString()).toBe("2026-03-08T07:30:00.000Z");
        expect(input).toBeValid();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("displays a valid profile wall time even when that wall time is in the browser's DST gap", () => {
        const onChange = vi.fn();
        render(<DateTimePicker value={new Date("2026-03-08T02:30:00Z")} onChange={onChange} timezone="UTC" label="Start"/>);
        const input = screen.getByLabelText("Start time");
        expect(input).toHaveValue("02:30");
        fireEvent.change(input, {target: {value: "02:45"}});
        expect(onChange.mock.calls[0][0].toISOString()).toBe("2026-03-08T02:45:00.000Z");
    });
});
