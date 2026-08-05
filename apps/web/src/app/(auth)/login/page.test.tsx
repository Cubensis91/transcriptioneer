import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("LoginPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the brand, both fields, and the Google entry point", () => {
    render(<LoginPage />);

    expect(screen.getAllByText("Transcriptioneer").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Correo electrónico/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar con Google" })).toHaveAttribute(
      "href",
      expect.stringContaining("/api/v1/auth/google"),
    );
  });

  it("shows client-side validation errors instead of submitting an empty form", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
