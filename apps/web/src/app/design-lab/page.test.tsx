import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DesignLabPage from "./page";

describe("DesignLabPage", () => {
  it("renders the page heading and every section", () => {
    render(<DesignLabPage />);

    expect(screen.getByRole("heading", { name: "Design Lab", level: 1 })).toBeInTheDocument();

    const sectionHeadings = [
      "Brand",
      "Typography",
      "Buttons",
      "Form elements",
      "Cards",
      "File states",
      "AI result components",
      "Navigation",
      "Feedback",
      "Modals and overlays",
      "Upload experience",
      "Responsive design",
      "Light and dark mode",
    ];

    for (const name of sectionHeadings) {
      expect(screen.getByRole("heading", { name, level: 2 })).toBeInTheDocument();
    }
  });
});
