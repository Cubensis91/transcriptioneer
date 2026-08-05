import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("RegisterPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the brand, all fields, and the Google entry point", () => {
    render(<RegisterPage />);

    expect(screen.getAllByText("Transcriptioneer").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Tu nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de tu espacio de trabajo/)).toBeInTheDocument();
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

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Organization name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
