# Backend Tests

This directory contains tests for the Foodin backend API.

## Test Structure

- `unit/` - Unit tests for individual modules and services
- `integration/` - Integration tests for API endpoints
- `utils/` - Test utilities and setup files

## Running Tests

### Prerequisites

Make sure you have the required dependencies installed:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Categories

### Unit Tests

Unit tests focus on individual modules and services, mocking dependencies to test functionality in isolation.

### Integration Tests

Integration tests verify that different parts of the application work together correctly, including API endpoints and database interactions.

## Test Environment

Tests use a separate test database configured in `src/config/config.js`. Make sure the test database is set up and accessible.

## Writing Tests

### Test Utilities

The `utils/testUtils.js` file provides helper functions for creating test data:

- `createTestUser()` - Create a test user
- `createTestProfile()` - Create a test profile
- `createTestNaturalPerson()` - Create a test natural person
- `createTestLegalPerson()` - Create a test legal person
- `generateToken()` - Generate a JWT token for authentication

### Test Setup

The `utils/setup.js` file handles:

- Database connection before tests
- Cleanup after each test (truncating tables)
- Closing database connection after all tests

## Test Coverage

Test coverage reports are generated in the `coverage/` directory when running tests with coverage.