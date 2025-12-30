import { User, UserRole } from "./getUser"
import { murmurhash } from "./murmurhash"

/**
 * Union type of all available feature flag names
 */
export type FeatureFlagName = keyof typeof FEATURE_FLAGS

/**
 * Rule definition for feature flag access control
 * Must specify either percentageOfUsers, userRoles, or both
 */
type FeatureFlagRule = {
  percentageOfUsers?: number
  userRoles?: UserRole[]
} & (
  | {
      percentageOfUsers: number
    }
  | { userRoles: UserRole[] }
)

/**
 * Feature flags configuration
 *
 * Supports three types of values:
 * - boolean: Simple on/off toggle
 * - FeatureFlagRule[]: Array of rules for granular control
 *
 * @example
 * ```ts
 * ADVANCED_ANALYTICS: true  // Always enabled
 * DISABLED_FEATURE: false   // Always disabled
 * MULTIPLE_ALLOWANCES: [
 *   { percentageOfUsers: 0.25, userRoles: ["user"] },  // 25% of users
 *   { userRoles: ["admin", "tester"] }  // All admins and testers
 * ]
 * ```
 */
export const FEATURE_FLAGS = {
  TEST_NEW_PRODUCTS_QUERY: true,
  ADVANCED_ANALYTICS: true,
  DISABLED_FEATURE: false,
  EXPERIMENTAL_FEATURE: false,
  MULTIPLE_ALLOWANCES: [
    { percentageOfUsers: 0.25, userRoles: ["user"] },
    { userRoles: ["admin", "tester"] },
  ],
} as const satisfies Record<string, FeatureFlagRule[] | boolean>

/**
 * Checks if a user can view a specific feature based on feature flag rules
 *
 * @param featureName - The name of the feature flag to check
 * @param user - The user object containing id and role
 * @returns true if the user can access the feature, false otherwise
 *
 * @example
 * ```ts
 * const user = { id: "123", role: "user" }
 * const canView = canViewFeature("ADVANCED_ANALYTICS", user)
 * ```
 */
export function canViewFeature(featureName: FeatureFlagName, user: User) {
  const rules = FEATURE_FLAGS[featureName]
  if (typeof rules === "boolean") return rules
  return rules.some(rule => checkRule(rule, featureName, user))
}

/**
 * Checks if a user passes a specific feature flag rule
 *
 * @param rule - The feature flag rule to check
 * @param featureName - The name of the feature flag
 * @param user - The user to check against
 * @returns true if the user passes all conditions in the rule
 */
function checkRule(
  { userRoles, percentageOfUsers }: FeatureFlagRule,
  featureName: FeatureFlagName,
  user: User
) {
  return (
    userHasValidRole(userRoles, user.role) &&
    userIsWithinPercentage(featureName, percentageOfUsers, user.id)
  )
}

/**
 * Checks if a user's role is in the list of allowed roles
 *
 * @param allowedRoles - Array of allowed roles, or undefined for any role
 * @param userRole - The user's current role
 * @returns true if role is allowed or no role restriction exists
 */
function userHasValidRole(
  allowedRoles: UserRole[] | undefined,
  userRole: UserRole
) {
  return allowedRoles == null || allowedRoles.includes(userRole)
}

/**
 * Maximum value for 32-bit unsigned integer (used for percentage calculations)
 */
const MAX_UINT_32 = 4294967295

/**
 * Determines if a user falls within the allowed percentage using consistent hashing
 *
 * Uses MurmurHash to ensure users consistently see the same feature state
 *
 * @param featureName - The feature flag name (used in hash)
 * @param allowedPercent - Percentage of users who should see the feature (0-1)
 * @param flagId - Unique user identifier (used in hash)
 * @returns true if user is within the allowed percentage
 */
function userIsWithinPercentage(
  featureName: FeatureFlagName,
  allowedPercent: number | undefined,
  flagId: string
) {
  if (allowedPercent == null) return true

  return murmurhash(`${featureName}-${flagId}`) / MAX_UINT_32 < allowedPercent
}
