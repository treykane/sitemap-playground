# Testing Guide

## Overview

This project uses Node.js built-in test runner (available in Node 18+). Tests are located in the `test/` directory.

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with detailed output:
```bash
npm test -- --reporter=spec
```

Run a specific test file:
```bash
node --test test/utils.test.js
```

## Test Structure

Tests are organized by module:

- `test/utils.test.js` - Tests for utility functions (link extraction, URL validation)
- `test/http.test.js` - Tests for HTTP fetch functionality and redirect handling
- `test/sitemap.test.js` - Tests for sitemap XML generation
- `test/crawler.test.js` - Tests for crawler core logic (URL normalization, entry building)

## Test Coverage

The test suite covers:

### Utils Module
- HTML content type detection
- Asset URL filtering
- AMP URL detection
- Link extraction from HTML
- Handling of various URL formats

### HTTP Module
- Basic HTTP requests
- Redirect following (up to 5 hops)
- Error handling (404, etc.)
- Response structure validation

### Sitemap Module
- Valid XML generation
- XML special character escaping
- Optional lastmod inclusion
- Empty sitemap handling

### Crawler Module
- URL normalization and filtering
- Same-origin enforcement
- Query string handling
- Hash fragment removal
- Custom ignore rules
- Priority calculation by depth
- Lastmod extraction from headers
- Event emitter functionality

## Writing New Tests

Follow the existing patterns:

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('my module', () => {
  describe('my function', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = myFunction(input);
      
      // Assert
      assert.strictEqual(result, 'expected');
    });
  });
});
```

## Testing Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Clean up any resources (temp files, servers) in test code
3. **Descriptive names**: Test names should clearly describe what they validate
4. **Minimal scope**: Each test should validate one specific behavior
5. **No external dependencies**: Use mock servers for HTTP tests rather than real URLs

## Continuous Integration

The test suite is designed to run in CI environments without any external dependencies or network access.
