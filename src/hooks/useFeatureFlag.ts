import { canViewFeature, FeatureFlagName } from "@/lib/featureFlags"
import { getUser } from "@/lib/getUser"
import { useMemo } from "react"

/**
 * Custom hook for checking feature flag status
 *
 * @param featureFlag - The feature flag to check
 * @returns Boolean indicating if the feature is enabled for the current user
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasAdvancedAnalytics = useFeatureFlag("ADVANCED_ANALYTICS")
 *
 *   return (
 *     <div>
 *       {hasAdvancedAnalytics && <AdvancedDashboard />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeatureFlag(featureFlag: FeatureFlagName): boolean {
  const user = getUser()

  return useMemo(
    () => canViewFeature(featureFlag, user),
    [featureFlag, user]
  )
}

/**
 * Custom hook for checking multiple feature flags at once
 *
 * @param featureFlags - Array of feature flags to check
 * @returns Object mapping feature flag names to their enabled status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const flags = useFeatureFlags(["ADVANCED_ANALYTICS", "EXPERIMENTAL_FEATURE"])
 *
 *   return (
 *     <div>
 *       {flags.ADVANCED_ANALYTICS && <Analytics />}
 *       {flags.EXPERIMENTAL_FEATURE && <ExperimentalUI />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeatureFlags<T extends readonly FeatureFlagName[]>(
  featureFlags: T
): Record<T[number], boolean> {
  const user = getUser()

  return useMemo(() => {
    const result = {} as Record<T[number], boolean>
    featureFlags.forEach((flag) => {
      result[flag] = canViewFeature(flag, user)
    })
    return result
  }, [featureFlags, user])
}
