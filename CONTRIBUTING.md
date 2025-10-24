# Contributing to binance-api-node

Thank you for your interest in contributing to binance-api-node! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/binance-api-node.git`
3. Install dependencies: `npm install`
4. Create a new branch for your feature or fix: `git checkout -b feature/your-feature-name`

## Development Setup

This project uses:
- **Babel** for transpiling ES6+ code to CommonJS
- **AVA** for testing
- **ESLint** for linting
- **Prettier** for code formatting

## Available Scripts

The following npm scripts are available for development and testing:

### Building

- `npm run build` - Removes the `dist` folder and transpiles the `src` directory to `dist` using Babel
- `npm run prepare` - Automatically runs the build script (triggered on npm install)

### Testing

- `npm test` - Runs all tests (AVA tests + browser tests)
- `npm run test:ava` - Runs AVA tests with a 10-second timeout and verbose output
- `npm run test:browser` - Runs all browser tests (signature, crypto, and WebSocket tests)
- `npm run test:browser:signature` - Runs browser signature tests specifically
- `npm run test:browser:websocket` - Runs WebSocket tests in the browser environment
- `npm run test:browser:crypto` - Runs cryptography tests in the browser environment
- `npm run static-tests` - Runs static tests only

### Code Quality

- `npm run lint` - Lints the `src` directory using ESLint
- `npm run prettier` - Formats code in `src` and `test` directories
- `npm run prettier:check` - Checks code formatting without making changes
- `npm run typecheck` - Runs TypeScript type checking without emitting files

### Coverage

- `npm run cover` - Runs tests with coverage using nyc
- `npm run report` - Generates coverage report and sends it to Coveralls

### CI

- `npm run ci` - Runs the full CI pipeline (lint, prettier check, and all tests)

## Making Changes

1. Make your changes in the `src` directory
2. Add tests for any new functionality in the `test` directory
3. Run `npm run lint` to ensure code quality
4. Run `npm run prettier` to format your code
5. Run `npm test` to ensure all tests pass
6. Commit your changes with a clear commit message

## Code Style

This project uses ESLint and Prettier to maintain consistent code style. Before submitting a PR:

1. Run `npm run prettier` to format your code
2. Run `npm run lint` to check for linting errors
3. Fix any issues that arise

## Testing Guidelines

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting a PR
- Tests should be placed in the `test` directory
- Browser-specific tests go in `test/browser`
- Use AVA's timeout option for tests that make API calls

## Pull Request Process

1. Update the README.md if you're adding new features or changing functionality
2. Ensure all tests pass and code is properly formatted
3. Update the documentation if necessary
4. Submit a pull request with a clear description of your changes
5. Reference any related issues in your PR description

## Testing with API Keys

Some tests require Binance API keys. You can:
- Create a `.env` file in the root directory
- Add your API keys:
  ```
  BINANCE_API_KEY=your_api_key_here
  BINANCE_API_SECRET=your_api_secret_here
  ```
- Never commit your `.env` file or API keys to the repository

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Check existing issues and pull requests for similar topics
- Review the [README](README.md) for API documentation and usage examples

## License

By contributing to binance-api-node, you agree that your contributions will be licensed under the MIT License.
