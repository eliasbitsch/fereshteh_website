import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioCard } from "~/app/_components/portfolio-card";

describe("PortfolioCard Component", () => {
  const mockProject = {
    title: "Test Project",
    slug: "test-project",
    description: "A test project description",
    thumbnail: "/test-thumbnail.jpg",
  };

  it("should render project title", () => {
    render(<PortfolioCard {...mockProject} />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("should render project description", () => {
    render(<PortfolioCard {...mockProject} />);

    expect(screen.getByText("A test project description")).toBeInTheDocument();
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
