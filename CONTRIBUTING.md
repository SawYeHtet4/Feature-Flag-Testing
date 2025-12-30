# Contributing to Feature Flag System

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Feature-Flag-Testing.git`
3. Install dependencies: `yarn install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running the Development Server

```bash
yarn dev
```

### Code Quality

We use several tools to maintain code quality:

- **TypeScript** - Strict type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **EditorConfig** - Consistent editor settings

### Before Committing

1. **Format your code:**
   ```bash
   yarn format
   ```

2. **Lint your code:**
   ```bash
   yarn lint
   ```

3. **Type check:**
   ```bash
   yarn type-check
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Provide explicit types for function parameters and return values
- Use type inference where it improves readability
- Avoid `any` - use `unknown` if type is truly unknown

### React Components

- Use functional components with hooks
- Mark client components with `"use client"` directive
- Server components should not have the directive
- Add JSDoc comments to all exported components

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `use*.ts`
- Types: Include in relevant files or `types.ts`

### Documentation

- Add JSDoc comments to all exported functions
- Include `@param` and `@returns` tags
- Provide usage examples in `@example` blocks
- Update README.md when adding new features

## Commit Message Format

Follow the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `perf`: Performance improvements

### Examples

```
feat: add useFeatureFlag hook for client components

docs: update README with hook usage examples

fix: correct type inference in useFeatureFlags
```

## Adding New Feature Flags

1. Add the flag to `FEATURE_FLAGS` in `src/lib/featureFlags.ts`
2. Update type exports if needed
3. Add tests for the new flag
4. Document the flag in README.md

## Pull Request Process

1. Update documentation for any changed functionality
2. Ensure all tests pass and linting succeeds
3. Update CHANGELOG.md with your changes
4. Request review from maintainers
5. Address any feedback
6. Squash commits if requested

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about contributing
- General discussion

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
