# Test Environment Setup

## Mock Data for Testing

This directory contains mock data and fixtures for testing.

### Creating Test Fixtures

Example:
```typescript
// tests/fixtures/projects.ts
export const mockProjects = [
  {
    title: "Test Project",
    slug: "test-project",
    description: "Test description",
  }
];
```

### Environment Variables

Create a `.env.test` file for test-specific environment variables:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
