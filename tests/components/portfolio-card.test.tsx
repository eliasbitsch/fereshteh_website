import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioCard } from "~/app/_components/portfolio-card";

describe("PortfolioCard Component", () => {
  const mockProject = {
    title: "Test Project",
    slug: "test-project",
    subtitle: "A test project subtitle",
    thumbnailPath: "/test-thumbnail.jpg",
  };

  it("should render project title", () => {
    render(<PortfolioCard {...mockProject} />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("should render project subtitle", () => {
    render(<PortfolioCard {...mockProject} />);

    expect(screen.getByText("A test project subtitle")).toBeInTheDocument();
  });

  it("should have correct link", () => {
    render(<PortfolioCard {...mockProject} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("test-project")
    );
  });
});
