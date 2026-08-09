import {useState} from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {
    MAX_EVENT_NOTES_LENGTH,
    OptionalNotesField,
} from "@/components/event/OptionalNotesField.tsx";

function ControlledNotesField({initialValue = "", layout}: {initialValue?: string; layout?: "stacked" | "inline"}) {
    const [value, setValue] = useState(initialValue);
    return <OptionalNotesField value={value} onChange={setValue} layout={layout}/>;
}

describe("OptionalNotesField", () => {
    it("starts collapsed when notes are empty", () => {
        render(<ControlledNotesField/>);

        expect(screen.getByRole("button", {name: "Add note"})).toBeInTheDocument();
        expect(screen.queryByRole("textbox", {name: "Notes"})).not.toBeInTheDocument();
    });

    it("starts expanded with existing notes in the inline layout", () => {
        render(<ControlledNotesField initialValue="Existing context" layout="inline"/>);

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("Existing context");
        expect(screen.queryByRole("button", {name: "Add note"})).not.toBeInTheDocument();
        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveAttribute("maxLength", String(MAX_EVENT_NOTES_LENGTH));
    });

    it("expands and focuses the textarea", () => {
        render(<ControlledNotesField/>);

        fireEvent.click(screen.getByRole("button", {name: "Add note"}));

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveFocus();
    });

    it("edits the controlled value", () => {
        render(<ControlledNotesField initialValue="Old note"/>);

        fireEvent.change(screen.getByRole("textbox", {name: "Notes"}), {target: {value: "New note"}});

        expect(screen.getByRole("textbox", {name: "Notes"})).toHaveValue("New note");
    });

    it("clears and collapses the field", () => {
        render(<ControlledNotesField initialValue="Remove me"/>);

        fireEvent.click(screen.getByRole("button", {name: "Remove note"}));

        expect(screen.getByRole("button", {name: "Add note"})).toBeInTheDocument();
        expect(screen.queryByRole("textbox", {name: "Notes"})).not.toBeInTheDocument();
    });
});
