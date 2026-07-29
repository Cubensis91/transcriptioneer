import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

describe("Home", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the foundation placeholder immediately, before the health check resolves", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})), // never resolves within this test
    );

    render(<Home />);

    expect(screen.getByText("Transcriptioneer")).toBeInTheDocument();
    expect(screen.getByText("checking…")).toBeInTheDocument();
  });
});
