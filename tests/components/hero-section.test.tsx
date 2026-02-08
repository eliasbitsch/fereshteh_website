import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "~/app/_components/hero-section";

describe("HeroSection Component", () => {
  it("should render the hero section", () => {
    render(<HeroSection />);

    // Check if main heading exists
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should display the name", () => {
    render(<HeroSection />);

    // Check if the name is visible
    expect(screen.getByText(/Fereshteh/i)).toBeInTheDocument();
  });
});
