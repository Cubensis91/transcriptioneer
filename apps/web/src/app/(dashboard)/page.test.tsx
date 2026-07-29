import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

describe("Home", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the entrance — brand, intake threshold, and a not-yet-resolved API status — immediately", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})), // never resolves within this test
    );

    render(<Home />);

    expect(screen.getAllByText("Transcriptioneer").length).toBeGreaterThan(0);
    expect(screen.getByText("Bring me something to understand")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "checking…" })).toBeInTheDocument();
  });
});
