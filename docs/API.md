# API Documentation

Complete API reference for the Feature Flag System.

## Table of Contents

- [Core Functions](#core-functions)
- [Components](#components)
- [Hooks](#hooks)
- [Helper Utilities](#helper-utilities)
- [Environment Overrides](#environment-overrides)
- [Debug Utilities](#debug-utilities)
- [Types](#types)

---

## Core Functions

### `canViewFeature(featureName, user)`

Checks if a user can view a specific feature based on feature flag rules.

**Parameters:**
- `featureName` (FeatureFlagName): The name of the feature flag to check
- `user` (User): The user object containing id and role

**Returns:** `boolean` - true if the user can access the feature

**Example:**
```typescript
import { canViewFeature } from "@/lib/featureFlags"

const user = { id: "123", role: "user" }
const canView = canViewFeature("ADVANCED_ANALYTICS", user)
```

---

## Components

### `<FeatureEnabled>`

Server-side component for conditional rendering based on feature flags.

**Props:**
- `featureFlag` (FeatureFlagName): The feature flag to check
- `children` (ReactNode): Content to render when feature is enabled
- `fallback?` (ReactNode): Content to render when feature is disabled
- `invert?` (boolean): If true, renders children when feature is disabled

**Example:**
```tsx
<FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
  <AdvancedDashboard />
</FeatureEnabled>

<FeatureEnabled
  featureFlag="EXPERIMENTAL_FEATURE"
  fallback={<ComingSoon />}
>
  <NewFeature />
</FeatureEnabled>

<FeatureEnabled featureFlag="NEW_UI" invert>
  <LegacyUI />
</FeatureEnabled>
```

### `<FeatureToggle>`

Client-side component for toggling between two states based on feature flags.

**Props:**
- `featureFlag` (FeatureFlagName): The feature flag to check
- `whenEnabled` (ReactNode): Content when feature is enabled
- `whenDisabled` (ReactNode): Content when feature is disabled

**Example:**
```tsx
"use client"

<FeatureToggle
  featureFlag="ADVANCED_ANALYTICS"
  whenEnabled={<NewDashboard />}
  whenDisabled={<BasicDashboard />}
/>
```

---

## Hooks

### `useFeatureFlag(featureFlag)`

React hook for checking a single feature flag.

**Parameters:**
- `featureFlag` (FeatureFlagName): The feature flag to check

**Returns:** `boolean` - true if feature is enabled

**Example:**
```tsx
"use client"

function MyComponent() {
  const hasAnalytics = useFeatureFlag("ADVANCED_ANALYTICS")

  return <div>{hasAnalytics && <Analytics />}</div>
}
```

### `useFeatureFlags(featureFlags)`

React hook for checking multiple feature flags at once.

**Parameters:**
- `featureFlags` (readonly FeatureFlagName[]): Array of feature flags to check

**Returns:** `Record<FeatureFlagName, boolean>` - Object with flag states

**Example:**
```tsx
"use client"

function MyComponent() {
  const flags = useFeatureFlags([
    "ADVANCED_ANALYTICS",
    "EXPERIMENTAL_FEATURE"
  ] as const)

  return (
    <div>
      {flags.ADVANCED_ANALYTICS && <Analytics />}
      {flags.EXPERIMENTAL_FEATURE && <ExperimentalUI />}
    </div>
  )
}
```

---

## Helper Utilities

### `getEnabledFeatures(user)`

Gets all feature flags that are enabled for a user.

**Parameters:**
- `user` (User): The user to check flags for

**Returns:** `FeatureFlagName[]` - Array of enabled flag names

**Example:**
```typescript
import { getEnabledFeatures } from "@/lib/featureFlagHelpers"

const user = { id: "123", role: "admin" }
const enabled = getEnabledFeatures(user)
// ["ADVANCED_ANALYTICS", "TEST_NEW_PRODUCTS_QUERY", ...]
```

### `getDisabledFeatures(user)`

Gets all feature flags that are disabled for a user.

**Parameters:**
- `user` (User): The user to check flags for

**Returns:** `FeatureFlagName[]` - Array of disabled flag names

### `getFeatureFlagSummary(user)`

Gets a complete summary of all feature flags and their status.

**Parameters:**
- `user` (User): The user to check flags for

**Returns:** `Record<FeatureFlagName, boolean>` - Object with all flag states

**Example:**
```typescript
const summary = getFeatureFlagSummary(user)
// {
//   ADVANCED_ANALYTICS: true,
//   EXPERIMENTAL_FEATURE: false,
//   ...
// }
```

### `areAllFeaturesEnabled(user, flags)`

Checks if all specified feature flags are enabled.

**Parameters:**
- `user` (User): The user to check flags for
- `flags` (FeatureFlagName[]): Flags to check

**Returns:** `boolean` - true if all are enabled

### `areAnyFeaturesEnabled(user, flags)`

Checks if any of the specified feature flags are enabled.

**Parameters:**
- `user` (User): The user to check flags for
- `flags` (FeatureFlagName[]): Flags to check

**Returns:** `boolean` - true if at least one is enabled

---

## Environment Overrides

### `getEnvOverride(flagName)`

Checks if a feature flag is overridden by environment variables.

**Parameters:**
- `flagName` (FeatureFlagName): The flag to check

**Returns:** `boolean | undefined` - Override value or undefined if not set

**Example:**
```typescript
// With NEXT_PUBLIC_FF_ADVANCED_ANALYTICS=true in .env.local
const override = getEnvOverride("ADVANCED_ANALYTICS") // true
```

### `isDevMode()`

Checks if development mode is enabled.

**Returns:** `boolean` - true if dev mode is enabled

### `getAllEnvOverrides()`

Gets all environment-based feature flag overrides.

**Returns:** `Partial<Record<FeatureFlagName, boolean>>` - All overrides

---

## Debug Utilities

### `debugFeatureFlags(user)`

Logs all feature flags to console (development only).

**Parameters:**
- `user` (User): The user to display flags for

**Example:**
```typescript
import { debugFeatureFlags } from "@/lib/featureFlagDebug"

debugFeatureFlags(getUser())
```

### `createDebugPanel(user)`

Creates an HTML debug panel with feature flag information.

**Parameters:**
- `user` (User): The user to display flags for

**Returns:** `string` - HTML string for debug panel

### `getFeatureFlagReason(flagName, user)`

Gets an explanation of why a feature flag has a particular value.

**Parameters:**
- `flagName` (FeatureFlagName): The flag to explain
- `user` (User): The user context

**Returns:** `string` - Explanation text

---

## Types

### `FeatureFlagName`

Union type of all available feature flag names.

```typescript
type FeatureFlagName =
  | "ADVANCED_ANALYTICS"
  | "TEST_NEW_PRODUCTS_QUERY"
  | "DISABLED_FEATURE"
  | "EXPERIMENTAL_FEATURE"
  | "MULTIPLE_ALLOWANCES"
```

### `User`

User object with role information.

```typescript
type User = {
  id: string
  role: UserRole
}
```

### `UserRole`

Available user roles.

```typescript
type UserRole = "admin" | "tester" | "user"
```

### `FeatureFlagRule`

Rule definition for feature flag access control.

```typescript
type FeatureFlagRule = {
  percentageOfUsers?: number
  userRoles?: UserRole[]
} & (
  | { percentageOfUsers: number }
  | { userRoles: UserRole[] }
)
```

---

## Configuration

### Defining Feature Flags

Edit `src/lib/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // Simple boolean
  ADVANCED_ANALYTICS: true,

  // Role-based
  ADMIN_PANEL: [
    { userRoles: ["admin"] }
  ],

  // Percentage-based rollout
  BETA_FEATURE: [
    { percentageOfUsers: 0.25, userRoles: ["user"] },
    { userRoles: ["admin", "tester"] }
  ]
} as const satisfies Record<string, FeatureFlagRule[] | boolean>
```

---

## Best Practices

1. **Server vs Client Components**
   - Use `<FeatureEnabled>` for server components
   - Use `<FeatureToggle>` or hooks for client components

2. **Performance**
   - Hooks are memoized for performance
   - Use `useFeatureFlags` for multiple flags instead of multiple `useFeatureFlag` calls

3. **Testing**
   - Mock `getUser()` to control user context in tests
   - Use test helpers from `@/__tests__/utils/testHelpers`

4. **Security**
   - Never use feature flags to hide sensitive data
   - Always verify permissions server-side
   - Feature flag names are visible to clients

---

## Migration

See [MIGRATION.md](./MIGRATION.md) for upgrading from other feature flag systems.
