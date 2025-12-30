# Migration Guide

Guide for migrating to this feature flag system from other solutions.

## Table of Contents

- [From LaunchDarkly](#from-launchdarkly)
- [From Split.io](#from-splitio)
- [From Unleash](#from-unleash)
- [From Custom Solution](#from-custom-solution)
- [Breaking Changes](#breaking-changes)

---

## From LaunchDarkly

### Before (LaunchDarkly)

```tsx
import { useFlags } from 'launchdarkly-react-client-sdk'

function MyComponent() {
  const { newFeature } = useFlags()

  return newFeature ? <NewUI /> : <OldUI />
}
```

### After (This System)

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

function MyComponent() {
  const newFeature = useFeatureFlag("NEW_FEATURE")

  return newFeature ? <NewUI /> : <OldUI />
}
```

### Configuration Migration

**LaunchDarkly:**
```javascript
// Cloud-based dashboard configuration
```

**This System:**
```typescript
// src/lib/featureFlags.ts
export const FEATURE_FLAGS = {
  NEW_FEATURE: true,
  // or with targeting
  NEW_FEATURE: [
    { userRoles: ["admin"] },
    { percentageOfUsers: 0.25, userRoles: ["user"] }
  ]
}
```

### Key Differences

1. **No SDK Required** - This system is built-in, no external dependencies
2. **Local Configuration** - Flags defined in code, not cloud dashboard
3. **Type-Safe** - Full TypeScript support with autocomplete
4. **Simpler** - No async initialization, no client setup

---

## From Split.io

### Before (Split.io)

```tsx
import { useSplitClient, useSplitTreatments } from '@splitsoftware/splitio-react'

function MyComponent() {
  const { treatments } = useSplitTreatments(['feature-1', 'feature-2'])

  return (
    <div>
      {treatments['feature-1'].treatment === 'on' && <Feature1 />}
      {treatments['feature-2'].treatment === 'on' && <Feature2 />}
    </div>
  )
}
```

### After (This System)

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlag'

function MyComponent() {
  const flags = useFeatureFlags(["FEATURE_1", "FEATURE_2"] as const)

  return (
    <div>
      {flags.FEATURE_1 && <Feature1 />}
      {flags.FEATURE_2 && <Feature2 />}
    </div>
  )
}
```

### Key Differences

1. **Simpler API** - Boolean returns instead of treatment objects
2. **No Async** - Synchronous evaluation
3. **Type Safety** - Compile-time flag name checking
4. **Local Rules** - No external Split.io service needed

---

## From Unleash

### Before (Unleash)

```tsx
import { useFlag } from '@unleash/proxy-client-react'

function MyComponent() {
  const enabled = useFlag('myFeature')

  return enabled ? <NewFeature /> : <OldFeature />
}
```

### After (This System)

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

function MyComponent() {
  const enabled = useFeatureFlag("MY_FEATURE")

  return enabled ? <NewFeature /> : <OldFeature />
}
```

### Server-Side Migration

**Unleash:**
```tsx
import { getDefinitions } from '@unleash/nextjs'

export async function ServerComponent() {
  const definitions = await getDefinitions()
  const enabled = definitions.isEnabled('myFeature')

  return enabled ? <NewFeature /> : <OldFeature />
}
```

**This System:**
```tsx
import { FeatureEnabled } from '@/components/FeatureEnabled'

export function ServerComponent() {
  return (
    <FeatureEnabled featureFlag="MY_FEATURE">
      <NewFeature />
    </FeatureEnabled>
  )
}
```

---

## From Custom Solution

### Common Custom Pattern

```tsx
// Before: Custom env-based flags
const FEATURES = {
  newUI: process.env.NEXT_PUBLIC_ENABLE_NEW_UI === 'true',
  betaFeature: process.env.NEXT_PUBLIC_BETA === 'true'
}

function MyComponent() {
  return FEATURES.newUI ? <NewUI /> : <OldUI />
}
```

### After (This System)

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

// Configuration in src/lib/featureFlags.ts
export const FEATURE_FLAGS = {
  NEW_UI: true,
  BETA_FEATURE: false
}

function MyComponent() {
  const newUI = useFeatureFlag("NEW_UI")
  return newUI ? <NewUI /> : <OldUI />
}
```

### Advantages

1. **Role-Based Access** - Built-in user role support
2. **Percentage Rollouts** - Gradual feature rollouts
3. **Type Safety** - TypeScript autocomplete and validation
4. **Testing** - Easy to mock and test
5. **Environment Overrides** - Still supports env vars when needed

---

## Migration Steps

### 1. Audit Existing Flags

List all current feature flags:

```bash
# LaunchDarkly
# Export from dashboard

# Split.io
# List from Split.io admin

# Custom
grep -r "process.env.NEXT_PUBLIC" .
```

### 2. Define Flags in System

Create in `src/lib/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // Map old flags to new names
  OLD_FLAG_NAME: true,
  ANOTHER_FLAG: false,
  GRADUAL_ROLLOUT: [
    { percentageOfUsers: 0.5, userRoles: ["user"] },
    { userRoles: ["admin"] }
  ]
}
```

### 3. Replace Hook Usage

**Find and replace:**

```bash
# LaunchDarkly
useFlags() → useFeatureFlags()

# Split.io
useSplitTreatments() → useFeatureFlags()

# Unleash
useFlag() → useFeatureFlag()
```

### 4. Update Components

Replace flag checks:

```tsx
// Before
const { myFlag } = useFlags()
if (myFlag) { /* ... */ }

// After
const myFlag = useFeatureFlag("MY_FLAG")
if (myFlag) { /* ... */ }
```

### 5. Update Server Components

```tsx
// Before: Async flag checks
const flags = await getFlags()

// After: Sync server components
<FeatureEnabled featureFlag="MY_FLAG">
  <Feature />
</FeatureEnabled>
```

### 6. Environment Overrides (Optional)

Keep env-based overrides:

```bash
# .env.local
NEXT_PUBLIC_FF_MY_FEATURE=true
```

```typescript
// Flags will respect env overrides automatically
import { getEnvOverride } from '@/lib/envFeatureFlags'
```

### 7. Update Tests

```typescript
// Before: Mock external SDK
jest.mock('launchdarkly-react-client-sdk')

// After: Mock getUser
jest.mock('@/lib/getUser', () => ({
  getUser: jest.fn().mockReturnValue({ id: 'test', role: 'user' })
}))
```

### 8. Remove Old Dependencies

```bash
# Remove old feature flag packages
yarn remove launchdarkly-react-client-sdk
yarn remove @splitsoftware/splitio-react
yarn remove @unleash/proxy-client-react

# Clean up
yarn install
```

---

## Breaking Changes

### v0.1.0

Initial release - no breaking changes.

---

## Gradual Migration

You can run both systems side-by-side:

```tsx
import { useFlags as useLDFlags } from 'launchdarkly-react-client-sdk'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

function MyComponent() {
  // Old system
  const { oldFeature } = useLDFlags()

  // New system
  const newFeature = useFeatureFlag("NEW_FEATURE")

  return (
    <>
      {oldFeature && <OldFeature />}
      {newFeature && <NewFeature />}
    </>
  )
}
```

Gradually migrate flags one at a time.

---

## Need Help?

- Check [API Documentation](./API.md)
- See [Examples](/src/app/examples/page.tsx)
- Open an [Issue](https://github.com/yourusername/Feature-Flag-Testing/issues)

---

## Rollback Plan

If you need to rollback:

1. Keep old package installed during migration
2. Use feature flags to control which system is active
3. Maintain old configuration until migration is complete
4. Test thoroughly in staging before production

```typescript
// Rollback flag
const USE_NEW_SYSTEM = process.env.USE_NEW_FF_SYSTEM === 'true'

function MyComponent() {
  const flag = USE_NEW_SYSTEM
    ? useFeatureFlag("MY_FLAG")
    : useLDFlags().myFlag

  return flag ? <New /> : <Old />
}
```
