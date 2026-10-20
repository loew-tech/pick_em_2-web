import { useState } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tier, type BulkAddActivityInput } from "../../../models/Activity";
import BulkAddForm from "../BulkAddForm";
import { createBulkAddRow } from "../bulkAddUtils";

afterEach(() => {
  cleanup();
});

const Harness = ({
  onSubmit,
  submitting = false,
}: {
  onSubmit: (activities: BulkAddActivityInput[]) => void;
  submitting?: boolean;
}) => {
  const [rows, setRows] = useState<BulkAddActivityInput[]>([
    createBulkAddRow(),
  ]);

  return (
    <BulkAddForm
      rows={rows}
      onRowsChange={setRows}
      onSubmit={onSubmit}
      submitting={submitting}
    />
  );
};

const nameFields = () => screen.getAllByLabelText("Activity name");

const selectTier = (comboboxIndex: number, option: string) => {
  fireEvent.mouseDown(screen.getAllByRole("combobox")[comboboxIndex]);
  fireEvent.click(screen.getByRole("option", { name: option }));
};

describe("BulkAddForm", () => {
  it("starts with one empty LOW/LOW row", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(nameFields()).toHaveLength(1);
    expect(nameFields()[0]).toHaveValue("");
    expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("Low");
    expect(screen.getAllByRole("combobox")[1]).toHaveTextContent("Low");
  });

  it("adds a row with LOW/LOW defaults", () => {
    render(<Harness onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Add row" }));

    expect(nameFields()).toHaveLength(2);
    expect(screen.getAllByRole("combobox")[2]).toHaveTextContent("Low");
    expect(screen.getAllByRole("combobox")[3]).toHaveTextContent("Low");
  });

  it("removes a row", () => {
    render(<Harness onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Add row" }));
    fireEvent.change(nameFields()[0], { target: { value: "Alpha" } });
    fireEvent.change(nameFields()[1], { target: { value: "Bravo" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Remove activity 1" }),
    );

    expect(nameFields()).toHaveLength(1);
    expect(nameFields()[0]).toHaveValue("Bravo");
  });

  it("disables Submit with no rows", () => {
    render(<Harness onSubmit={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove activity 1" }),
    );

    expect(screen.queryAllByLabelText("Activity name")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("disables Submit while any row has an empty name", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    fireEvent.change(nameFields()[0], { target: { value: "Alpha" } });
    expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Add row" }));
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("disables Submit while submitting", () => {
    render(<Harness onSubmit={vi.fn()} submitting />);

    fireEvent.change(nameFields()[0], { target: { value: "Alpha" } });

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("submits trimmed names with the selected tiers", () => {
    const onSubmit = vi.fn();

    render(<Harness onSubmit={onSubmit} />);

    fireEvent.change(nameFields()[0], { target: { value: "  Alpha  " } });
    selectTier(0, "High");
    selectTier(1, "Medium");

    fireEvent.click(screen.getByRole("button", { name: "Add row" }));
    fireEvent.change(nameFields()[1], { target: { value: "Bravo" } });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith([
      { name: "Alpha", interest: Tier.HIGH, effort: Tier.MEDIUM },
      { name: "Bravo", interest: Tier.LOW, effort: Tier.LOW },
    ]);
  });
});
