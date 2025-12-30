# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-12-30

### Added

- Initial feature flag system implementation
- `FeatureEnabled` server component for conditional rendering
- `FeatureToggle` client component for dynamic toggles
- `useFeatureFlag` and `useFeatureFlags` React hooks
- Role-based access control (admin, tester, user)
- Percentage-based feature rollouts using MurmurHash
- Environment variable overrides for feature flags
- Comprehensive debugging utilities
  - `debugFeatureFlags` for console logging
  - `createDebugPanel` for visual debug overlay
  - `getFeatureFlagReason` for explaining flag values
- Helper utilities for batch flag operations
  - `getEnabledFeatures`
  - `getDisabledFeatures`
  - `getFeatureFlagSummary`
  - `areAllFeaturesEnabled`
  - `areAnyFeaturesEnabled`
- Central export index (`src/index.ts`)
- TypeScript strict mode configuration with additional safety checks
- Prettier configuration for code formatting
- EditorConfig for cross-editor consistency
- VS Code workspace settings and recommended extensions
- Comprehensive documentation
  - README with usage examples
  - CONTRIBUTING guidelines
  - JSDoc comments throughout codebase
- Development npm scripts
  - `lint:fix` - Auto-fix linting issues
  - `format` - Format code with Prettier
  - `format:check` - Check formatting
  - `type-check` - Validate TypeScript
  - `validate` - Run all checks

### Changed

- Upgraded Next.js to 15.1.9 (security patch for CVE-2025-66478)
- Upgraded React to 19.0.0
- Updated all dependencies to latest versions
- Enhanced TypeScript target to ES2022

### Security

- Fixed CVE-2025-66478 by upgrading Next.js to patched version
- Added security-focused TypeScript compiler options

## [0.0.1] - 2025-12-XX

### Added

- Initial project setup with Next.js
- Basic feature flag testing implementation

[Unreleased]: https://github.com/yourusername/Feature-Flag-Testing/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/Feature-Flag-Testing/releases/tag/v0.1.0
[0.0.1]: https://github.com/yourusername/Feature-Flag-Testing/releases/tag/v0.0.1
