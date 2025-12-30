# Feature Flag System for Next.js

A comprehensive feature flag system for Next.js applications with support for role-based access control, percentage-based rollouts, environment overrides, and debugging tools.

## Features

- **Simple Boolean Flags** - Enable/disable features globally
- **Role-Based Access** - Control access by user roles (admin, tester, user)
- **Percentage-Based Rollouts** - Gradually roll out features to a percentage of users
- **Environment Overrides** - Override flags via environment variables
- **React Hooks** - Custom hooks for easy flag checking in components
- **Server & Client Components** - Support for both rendering strategies
- **Debug Tools** - Development utilities for testing and debugging flags
- **Type-Safe** - Full TypeScript support with type inference

## Getting Started

### Installation

```bash
yarn install
# or
npm install
```

### Running the Development Server

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Usage

### Basic Server-Side Component

```tsx
import { FeatureEnabled } from "@/components/FeatureEnabled"

export default function Page() {
  return (
    <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
      <AdvancedDashboard />
    </FeatureEnabled>
  )
}
```

### With Fallback Content

```tsx
<FeatureEnabled
  featureFlag="EXPERIMENTAL_FEATURE"
  fallback={<div>Coming soon!</div>}
>
  <ExperimentalFeature />
</FeatureEnabled>
```

### Client-Side with Hooks

```tsx
"use client"

import { useFeatureFlag } from "@/hooks/useFeatureFlag"

export function MyComponent() {
  const hasAnalytics = useFeatureFlag("ADVANCED_ANALYTICS")

  return (
    <div>
      {hasAnalytics && <Analytics />}
    </div>
  )
}
```

### Toggle Component

```tsx
import { FeatureToggle } from "@/components/FeatureToggle"

<FeatureToggle
  featureFlag="ADVANCED_ANALYTICS"
  whenEnabled={<NewDashboard />}
  whenDisabled={<BasicDashboard />}
/>
```

### Checking Multiple Flags

```tsx
const flags = useFeatureFlags([
  "ADVANCED_ANALYTICS",
  "EXPERIMENTAL_FEATURE"
])

if (flags.ADVANCED_ANALYTICS) {
  // ...
}
```

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
    { percentageOfUsers: 0.25, userRoles: ["user"] },  // 25% of users
    { userRoles: ["admin", "tester"] }  // All admins and testers
  ]
}
```

### Environment Overrides

Create `.env.local`:

```bash
# Override specific flags
NEXT_PUBLIC_FF_ADVANCED_ANALYTICS=true
NEXT_PUBLIC_FF_EXPERIMENTAL_FEATURE=false

# Enable dev mode
NEXT_PUBLIC_DEV_MODE=true
```

## Debugging

### Console Logging (Development Only)

```typescript
import { debugFeatureFlags } from "@/lib/featureFlagDebug"
import { getUser } from "@/lib/getUser"

debugFeatureFlags(getUser())
```

### Get Flag Reasoning

```typescript
import { getFeatureFlagReason } from "@/lib/featureFlagDebug"

const reason = getFeatureFlagReason("ADVANCED_ANALYTICS", user)
console.log(reason)
```

## API Reference

### Components

- `<FeatureEnabled>` - Server-side conditional rendering
- `<FeatureToggle>` - Client-side toggle between two states

### Hooks

- `useFeatureFlag(flag)` - Check single flag
- `useFeatureFlags(flags[])` - Check multiple flags

### Utilities

- `canViewFeature(flag, user)` - Core flag checking function
- `getEnabledFeatures(user)` - List all enabled flags
- `getFeatureFlagSummary(user)` - Get all flags with status
- `areAllFeaturesEnabled(user, flags[])` - Check if all flags are enabled
- `areAnyFeaturesEnabled(user, flags[])` - Check if any flag is enabled

## Project Structure

```
src/
├── components/
│   ├── FeatureEnabled.tsx    # Server component
│   └── FeatureToggle.tsx     # Client component
├── hooks/
│   └── useFeatureFlag.ts     # React hooks
├── lib/
│   ├── featureFlags.ts       # Core flag logic
│   ├── featureFlagHelpers.ts # Utility functions
│   ├── featureFlagDebug.ts   # Debug tools
│   ├── envFeatureFlags.ts    # Environment overrides
│   └── getUser.ts            # User context
└── index.ts                  # Main exports
```

## License

See [LICENSE](./LICENSE) file for details.
