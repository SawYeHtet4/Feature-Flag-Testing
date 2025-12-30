import { FEATURE_FLAGS, FeatureFlagName } from "./featureFlags"
import { User } from "./getUser"

/**
 * Gets all feature flags that are enabled for a given user
 *
 * @param user - The user to check flags for
 * @returns Array of enabled feature flag names
 *
 * @example
 * ```ts
 * const user = { id: "123", role: "admin" }
 * const enabledFlags = getEnabledFeatures(user)
 * console.log(enabledFlags) // ["ADVANCED_ANALYTICS", "TEST_NEW_PRODUCTS_QUERY", ...]
 * ```
 */
export function getEnabledFeatures(user: User): FeatureFlagName[] {
  const { canViewFeature } = require("./featureFlags")

  return (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).filter((flag) =>
    canViewFeature(flag, user)
  )
}

/**
 * Gets all feature flags that are disabled for a given user
 *
 * @param user - The user to check flags for
 * @returns Array of disabled feature flag names
 */
export function getDisabledFeatures(user: User): FeatureFlagName[] {
  const { canViewFeature } = require("./featureFlags")

  return (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).filter(
    (flag) => !canViewFeature(flag, user)
  )
}

/**
 * Gets a summary of all feature flags and their status for a user
 *
 * @param user - The user to check flags for
 * @returns Object mapping feature flag names to their enabled status
 *
 * @example
 * ```ts
 * const user = { id: "123", role: "user" }
 * const summary = getFeatureFlagSummary(user)
 * // { ADVANCED_ANALYTICS: true, EXPERIMENTAL_FEATURE: false, ... }
 * ```
 */
export function getFeatureFlagSummary(
  user: User
): Record<FeatureFlagName, boolean> {
  const { canViewFeature } = require("./featureFlags")

  const summary = {} as Record<FeatureFlagName, boolean>

  ;(Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).forEach((flag) => {
    summary[flag] = canViewFeature(flag, user)
  })

  return summary
}

/**
 * Checks if all specified feature flags are enabled for a user
 *
 * @param user - The user to check flags for
 * @param flags - Array of feature flag names to check
 * @returns true if all flags are enabled, false otherwise
 *
 * @example
 * ```ts
 * const canUseAll = areAllFeaturesEnabled(user, [
 *   "ADVANCED_ANALYTICS",
 *   "EXPERIMENTAL_FEATURE"
 * ])
 * ```
 */
export function areAllFeaturesEnabled(
  user: User,
  flags: FeatureFlagName[]
): boolean {
  const { canViewFeature } = require("./featureFlags")

  return flags.every((flag) => canViewFeature(flag, user))
}

/**
 * Checks if any of the specified feature flags are enabled for a user
 *
 * @param user - The user to check flags for
 * @param flags - Array of feature flag names to check
 * @returns true if at least one flag is enabled, false otherwise
 *
 * @example
 * ```ts
 * const canUseAny = areAnyFeaturesEnabled(user, [
 *   "ADVANCED_ANALYTICS",
 *   "EXPERIMENTAL_FEATURE"
 * ])
 * ```
 */
export function areAnyFeaturesEnabled(
  user: User,
  flags: FeatureFlagName[]
): boolean {
  const { canViewFeature } = require("./featureFlags")

  return flags.some((flag) => canViewFeature(flag, user))
}
