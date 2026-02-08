# Testing Guide

This project includes comprehensive testing to ensure reliability and robustness.

## Test Structure

```
tests/
├── setup.ts              # Test configuration
├── api/                  # API endpoint tests
│   └── upload.test.ts
├── lib/                  # Library/utility tests
│   └── auth.test.ts
├── components/           # React component tests
│   ├── hero-section.test.tsx
│   └── portfolio-card.test.tsx
├── utils/               # Utility function tests
│   └── date.test.ts
└── e2e/                 # End-to-end tests
    ├── homepage.spec.ts
    ├── portfolio.spec.ts
    ├── navigation.spec.ts
    ├── accessibility.spec.ts
    └── performance.spec.ts
```

## Running Tests

### Unit & Component Tests (Vitest)

```bash
# Run tests in watch mode
bun run test

# Run tests once
bun run test:run

# Run with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
bun run playwright:install

# Run E2E tests
bun run test:e2e

# Run with UI mode (interactive)
bun run test:e2e:ui

# Run in headed mode (see browser)
bun run test:e2e:headed
```

### Run All Tests

```bash
bun run test:all
```

## Test Categories

### 1. API Tests
- Authentication validation
- File upload functionality
- Error handling
- Request validation

### 2. Component Tests
- Component rendering
- Props handling
- User interactions
- Visual elements

### 3. E2E Tests
- **Homepage**: Page loading, hero section, responsive design
- **Portfolio**: Portfolio items, navigation, images
- **Navigation**: Page transitions, theme switching, internal links
- **Accessibility**: Heading hierarchy, alt text, keyboard navigation, ARIA labels
- **Performance**: Load times, image optimization, layout stability

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Component Test Example
```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "~/components/my-component";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from "@playwright/test";

test("should navigate to page", async ({ page }) => {
  await page.goto("/");
  await page.click('a[href="/about"]');
  expect(page.url()).toContain("/about");
});
```

## Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: All user flows tested

## CI/CD Integration

Tests run automatically on:
- Every push to main/develop
- Every pull request
- Before deployment

See `.github/workflows/ci.yml` for CI configuration.

## Best Practices

1. **Write descriptive test names** - Test names should explain what is being tested
2. **Keep tests isolated** - Each test should be independent
3. **Use realistic data** - Test with data similar to production
4. **Test edge cases** - Don't just test happy paths
5. **Keep tests fast** - Slow tests won't be run
6. **Mock external dependencies** - Don't make real API calls in unit tests
7. **Test behavior, not implementation** - Focus on what the code does, not how

## Debugging Tests

### Vitest
```bash
# Run specific test file
bun run test path/to/test.test.ts

# Run in debug mode
bun run test --inspect-brk
```

### Playwright
```bash
# Run with debug mode
bun run test:e2e --debug

# Run specific test
bun run test:e2e tests/e2e/homepage.spec.ts
```

## Continuous Improvement

- Review test failures in CI
- Add tests for bugs before fixing
- Maintain test coverage above 80%
- Update tests when features change
- Remove obsolete tests
